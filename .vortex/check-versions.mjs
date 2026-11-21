#!/usr/bin/env node
/**
 * The version check (Vortex PRD 110 FR-GP-32). `stack.versions.yaml` is the one place this
 * project's component versions are declared; this fails when package.json, package-lock.json, the
 * Dockerfile, Compose or a CI file says otherwise. A package that is not listed is ignored.
 *
 * Bound to the `check-versions` command, and called directly by the `verify` command in
 * `.vortex/config.yaml`, so it runs with no Vortex present. Change a version in
 * `stack.versions.yaml` and in every file that follows from it, in one change.
 */
import { existsSync, readFileSync } from "node:fs";

const problems = [];

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

/** `components:` of stack.versions.yaml: `  name: version` lines, quotes allowed. */
function declared() {
  const text = read("stack.versions.yaml");
  if (text === null) {
    problems.push("stack.versions.yaml is missing");
    return new Map();
  }
  const out = new Map();
  let inComponents = false;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+#.*$/, "");
    if (/^components:\s*$/.test(line)) {
      inComponents = true;
      continue;
    }
    if (/^\S/.test(line)) inComponents = false;
    const m = inComponents ? /^\s{2}(['"]?)([^'":]+)\1:\s*(['"]?)(.+?)\3\s*$/.exec(line) : null;
    if (m) out.set(m[2].trim(), m[4].trim());
  }
  return out;
}

const versions = declared();
if (versions.size === 0) {
  problems.push("stack.versions.yaml lists no components under `components:` (one per line)");
}
for (const required of ["package.json", "package-lock.json", "Dockerfile"]) {
  if (read(required) === null) problems.push(`${required} is missing`);
}
const pkg = JSON.parse(read("package.json") ?? "{}");
const lock = JSON.parse(read("package-lock.json") ?? "{}");
const dockerfile = read("Dockerfile") ?? "";
const ciFiles = [
  ".github/workflows/ci.yml",
  ".github/workflows/helm.yml",
  ".gitlab-ci.yml",
  ".gitlab/ci/helm.yml",
]
  .map((path) => ({ path, text: read(path) }))
  .filter((f) => f.text !== null);

for (const [name, version] of versions) {
  if (/^\^|^~|^>|^<|\*|\.x(\.|$)/.test(version)) {
    problems.push(`${name}: "${version}" in stack.versions.yaml is a range; give one version`);
    continue;
  }
  if (name.endsWith("-image")) {
    // An image: every reference to that repository (a Dockerfile FROM, a Compose or CI `image:`, a
    // GitLab service `name:`) is exactly this one, and at least one file uses it.
    const repo = version.split(":")[0];
    const refs = [];
    for (const m of dockerfile.matchAll(/^\s*from\s+(?:--\S+\s+)*(\S+)/gim)) {
      refs.push({ where: "the Dockerfile", ref: m[1] });
    }
    for (const f of [{ path: "compose.yaml", text: read("compose.yaml") ?? "" }, ...ciFiles]) {
      for (const m of f.text.matchAll(/^\s*(?:-\s*)?(?:image|name):\s*["']?(\S+?)["']?\s*$/gm)) {
        refs.push({ where: f.path, ref: m[1] });
      }
    }
    const uses = refs.filter((r) => r.ref.split(":")[0] === repo);
    if (uses.length === 0) problems.push(`${name}: nothing uses ${repo}`);
    for (const u of uses) {
      if (u.ref !== version)
        problems.push(`${name}: ${u.where} uses ${u.ref}, stack.versions.yaml says ${version}`);
    }
    continue;
  }
  if (name === "node") {
    // CI sets Node up at this version; the images use it (checked through node-image).
    let seen = 0;
    for (const f of ciFiles) {
      for (const m of f.text.matchAll(/node-version:\s*["']?([\w.-]+)/g)) {
        seen += 1;
        if (m[1] !== version)
          problems.push(`node: ${f.path} sets ${m[1]}, stack.versions.yaml says ${version}`);
      }
    }
    if (seen === 0) problems.push("node: no CI file sets node-version");
    const image = versions.get("node-image");
    if (image && !image.startsWith(`node:${version}-`)) {
      problems.push(`node: node-image is ${image}, stack.versions.yaml says node ${version}`);
    }
    continue;
  }
  if (name === "modernize") {
    // The admin shell's edition (FR-GP-122): free-<commit> or pro-<version>, as src/shell/EDITION says.
    if (!/^(free|pro)-[\w.]+$/.test(String(version))) {
      problems.push(`modernize: "${version}" is neither free-<commit> nor pro-<version>`);
    }
    const edition = (read("src/shell/EDITION") ?? "").trim();
    if (edition !== String(version)) {
      problems.push(
        `modernize: src/shell/EDITION says "${edition}", stack.versions.yaml says ${version}`,
      );
    }
    continue;
  }
  if (name === "npm") {
    const m = /^npm@(.+)$/.exec(pkg.packageManager ?? "");
    if (!m) problems.push('npm: package.json has no "packageManager": "npm@<version>"');
    else if (m[1] !== version)
      problems.push(
        `npm: package.json's packageManager is npm@${m[1]}, stack.versions.yaml says ${version}`,
      );
    continue;
  }
  if (name === "helm" || name === "kubeconform") {
    // Pinned in the Helm CI files. A project without the Helm option does not list them.
    const pattern =
      name === "helm"
        ? /(?:version:\s*v|alpine\/helm:)([\d.]+)/g
        : /kubeconform\/releases\/download\/v([\d.]+)/g;
    let seen = 0;
    for (const f of ciFiles) {
      for (const m of f.text.matchAll(pattern)) {
        seen += 1;
        if (m[1] !== version)
          problems.push(`${name}: ${f.path} uses ${m[1]}, stack.versions.yaml says ${version}`);
      }
    }
    if (seen === 0) problems.push(`${name}: no CI file pins it`);
    continue;
  }
  if (name === "postgresql") {
    // The major the project's database runs: every postgres image in Compose and the CI files.
    // The local cluster uses the programs on PATH, which the Vortex images pin to the same major.
    const compose = read("compose.yaml") ?? "";
    const refs = [compose, ...ciFiles.map((f) => f.text)].flatMap((t) =>
      [...t.matchAll(/postgres:([\w.-]+)/g)].map((m) => m[1]),
    );
    if (refs.length === 0) problems.push("postgresql: no Compose or CI image pins it");
    for (const ref of refs) {
      if (ref.split(/[.-]/)[0] !== String(version).split(".")[0]) {
        problems.push(
          `postgresql: an image uses postgres:${ref}, stack.versions.yaml says ${version}`,
        );
      }
    }
    continue;
  }
  const wanted = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
  if (wanted === undefined) {
    problems.push(`${name}: stack.versions.yaml lists it, and nothing in the project pins it`);
    continue;
  }
  if (wanted !== version) {
    problems.push(`${name}: package.json says ${wanted}, stack.versions.yaml says ${version}`);
  }
  const locked = lock.packages?.[`node_modules/${name}`]?.version;
  if (locked === undefined) {
    problems.push(`${name}: package-lock.json does not resolve it; run npm install`);
  } else if (locked !== version) {
    problems.push(
      `${name}: package-lock.json resolves ${locked}, stack.versions.yaml says ${version}`,
    );
  }
}

if (problems.length > 0) {
  console.error("check-versions: the project's files disagree with stack.versions.yaml:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`check-versions: ${versions.size} components agree with stack.versions.yaml`);
