// A proving test: it measures the built artefact and reports the value to Vortex, which owns the
// target and judges it (Vortex PRD 112 FR-NF-77). It never asserts the target itself, so a slow run
// is read as "not met" by Vortex, not a red test. It runs in CI's non-gating `proving` job against
// the standalone server `npm run build` produces, never against the development server (QA-105).
//
// Each value reaches Vortex as JUnit properties: `nfr_key` names the requirement, `nfr_value` and
// `nfr_unit` carry the measurement. Playwright's JUnit reporter writes every test annotation as a
// `<property name="type" value="description">`. It uses the `request` fixture only, so no browser.
import { expect, test } from "@playwright/test";

const SAMPLES = 50;

function p95(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
}

test("PERF-001: the p95 response time of GET /api/hello on the built artefact", async ({
  request,
}) => {
  // Warm the server first: the first requests load the route, which a user does not see.
  for (let i = 0; i < 5; i++) await request.get("/api/hello");
  const times: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const started = performance.now();
    const res = await request.get("/api/hello");
    await res.body();
    expect(res.ok()).toBe(true);
    times.push(performance.now() - started);
  }
  test
    .info()
    .annotations.push(
      { type: "nfr_key", description: "PERF-001" },
      { type: "nfr_value", description: p95(times).toFixed(1) },
      { type: "nfr_unit", description: "ms" },
    );
});
