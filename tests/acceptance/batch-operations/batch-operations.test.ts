/**
 * @jest-environment node
 *
 * Acceptance tests for capability batch-operations.
 *
 * Contract the product must provide: `@/lib/batch` exports `createBatchRuntime(opts)`:
 *   opts: { now: Date, env?: Record<string,string>, dir: string (root for logs, backups, extracts),
 *           mailer?: { sent: Mail[] }, http?: (module) => Promise<{status:number}|"timeout">,
 *           user?: string, host?: string }
 *   runtime.seed(data)                 seed categories/products/items/inventory/orders (see SeedData)
 *   runtime.runJob(name)               -> { exitCode: 0|4|8, output: string, requests: string[] }
 *   runtime.advanceTo(date)            fire the scheduler up to date -> [{ job, exitCode }] that ran
 *   runtime.failJob(name)              force the next run of the job to fail
 *   runtime.log(job, message)          shared logging helper
 *   runtime.limits                     effective operating limits
 *   runtime.paths.{log,backups,extract(yyyymmdd)}
 *   runtime.orderExists(id), runtime.explain(query), runtime.orderSummaryView()
 *   runtime.mail                       sent mails: { to, subject, body }[]
 *   runtime.lastRun(job)               -> { user, host } of the last execution
 * Jobs: backup, extract, aging-report, inventory-report, purge, catalog-check, health-check.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createBatchRuntime } from "@/lib/batch";

type Status = "PENDING" | "APPROVED" | "COMPLETED" | "DENIED";
const HOUR = 3600_000;
const DAY = 24 * HOUR;
const NOW = new Date("2026-11-22T00:30:00Z"); // a Sunday
const SUNDAY = (h: number, m = 0) => new Date(`2026-11-22T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`);

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "batch-"));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

async function rt(opts: Record<string, unknown> = {}) {
  return createBatchRuntime({ now: NOW, dir, ...opts });
}

function order(id: number, status: Status, ageMs: number, extra: Record<string, unknown> = {}) {
  return { id, userName: "j2ee", orderDate: new Date(NOW.getTime() - ageMs), locale: "en_US", total: 10 * id, lineCount: 1, status, ...extra };
}

describe("batch-operations", () => {
  // case: SWHM3-C-0237@v1
  it("SWHM3-C-0237 COMPLETED supplier order vs APPROVED order listed MISMATCH", async () => {
    const r = await rt();
    await r.seed({ orders: [order(1, "APPROVED", HOUR, { supplierStatus: "COMPLETED" })] });
    const res = await r.runJob("aging-report");
    expect(res.output).toMatch(/MISMATCH[^\n]*\b1\b|\b1\b[^\n]*MISMATCH/);
  });

  // case: SWHM3-C-0238@v1
  it("SWHM3-C-0238 default settings: order retention 180 days purges a 200-day-old order, keeps a 170-day-old one", async () => {
    const r = await rt();
    await r.seed({ orders: [order(1, "COMPLETED", 200 * DAY), order(2, "COMPLETED", 170 * DAY)] });
    await r.runJob("purge");
    expect(r.orderExists(1)).toBe(false);
    expect(r.orderExists(2)).toBe(true);
  });

  // case: SWHM3-C-0238@v1
  it("SWHM3-C-0238 default settings: backup retention 7 days deletes a 8-day-old backup, keeps a 6-day-old one", async () => {
    const r = await rt();
    const make = (name: string, days: number) => {
      const p = path.join(r.paths.backups, name);
      fs.mkdirSync(p, { recursive: true });
      const t = new Date(NOW.getTime() - days * DAY);
      fs.utimesSync(p, t, t);
      return p;
    };
    const old = make("PetStoreDB_20261114", 8);
    const recent = make("PetStoreDB_20261116", 6);
    await r.runJob("backup");
    expect(fs.existsSync(old)).toBe(false);
    expect(fs.existsSync(recent)).toBe(true);
  });

  // case: SWHM3-C-0238@v1
  it("SWHM3-C-0238 default settings: stuck order threshold 24 hours flags a 25-hour-old order, not a 23-hour-old one", async () => {
    const r = await rt();
    await r.seed({ orders: [order(2, "PENDING", 25 * HOUR), order(3, "PENDING", 23 * HOUR)] });
    const out = (await r.runJob("aging-report")).output;
    expect(out).toMatch(/STUCK[^\n]*\b2\b|\b2\b[^\n]*STUCK/);
    expect(out).not.toMatch(/STUCK[^\n]*\b3\b|\b3\b[^\n]*STUCK/);
  });

  // case: SWHM3-C-0238@v1
  it("SWHM3-C-0238 default settings: low stock threshold 500 units lists item at 499, not item at 500", async () => {
    const r = await rt();
    await r.seed({ inventory: [{ itemId: "ITEM-LOW", quantity: 499 }, { itemId: "ITEM-OK", quantity: 500 }] });
    const out = (await r.runJob("inventory-report")).output;
    expect(out).toContain("ITEM-LOW");
    expect(out).not.toContain("ITEM-OK");
  });

  // case: SWHM3-C-0239@v1
  it("SWHM3-C-0239 purge deletes old COMPLETED order, keeps old PENDING", async () => {
    const r = await rt();
    await r.seed({ orders: [order(1, "COMPLETED", 200 * DAY, { lineCount: 2 }), order(2, "PENDING", 200 * DAY)] });
    await r.runJob("extract");
    const res = await r.runJob("purge");
    expect(res.exitCode).toBe(0);
    expect(r.orderExists(1)).toBe(false);
    expect(r.orderExists(2)).toBe(true);
    expect(r.dependantCount(1)).toBe(0);
  });

  // case: SWHM3-C-0240@v1
  it("SWHM3-C-0240 purge runs Sunday 02:00 after successful extract only", async () => {
    const r = await rt({ now: new Date("2026-11-22T00:00:00Z") });
    await r.advanceTo(SUNDAY(1, 59));
    const sunday = await r.advanceTo(SUNDAY(2));
    expect(sunday.map((x: { job: string }) => x.job)).toContain("purge");
    const monday = await rt({ now: new Date("2026-11-23T00:00:00Z") });
    const ran = await monday.advanceTo(new Date("2026-11-23T02:00:00Z"));
    expect(ran.map((x: { job: string }) => x.job)).not.toContain("purge");
    const failed = await rt({ now: new Date("2026-11-22T00:00:00Z") });
    failed.failJob("extract");
    const ranFailed = await failed.advanceTo(SUNDAY(2));
    expect(ranFailed.map((x: { job: string }) => x.job)).not.toContain("purge");
  });

  // case: SWHM3-C-0241@v1
  it("SWHM3-C-0241 batch log helper appends timestamped, tagged line", async () => {
    const r = await rt();
    r.log("PS_TEST", "hello batch");
    const lines = fs.readFileSync(r.paths.log, "utf8").trim().split("\n");
    const last = lines[lines.length - 1];
    expect(last).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(last).toContain("PS_TEST");
    expect(last).toContain("hello batch");
  });

  // case: SWHM3-C-0242@v1
  it("SWHM3-C-0242 product without item reported, exit code 4", async () => {
    const r = await rt();
    await r.seed({ categories: [{ id: "FISH" }], products: [{ id: "FI-ORPHAN", categoryId: "FISH" }], items: [] });
    const res = await r.runJob("catalog-check");
    expect(res.output).toContain("FI-ORPHAN");
    expect(res.exitCode).toBe(4);
  });

  // case: SWHM3-C-0243@v1
  it("SWHM3-C-0243 APPROVED order 30 hours old listed STUCK", async () => {
    const r = await rt();
    await r.seed({ orders: [order(7, "APPROVED", 30 * HOUR)] });
    const res = await r.runJob("aging-report");
    expect(res.output).toMatch(/STUCK[^\n]*\b7\b|\b7\b[^\n]*STUCK/);
  });

  // case: SWHM3-C-0244@v1
  it("SWHM3-C-0244 online backup creates dated folder, database stays up", async () => {
    const r = await rt();
    const during = r.runJob("backup");
    expect(await r.queryDb("select 1 as ok")).toEqual([{ ok: 1 }]);
    const res = await during;
    expect(res.exitCode).toBe(0);
    expect(fs.existsSync(path.join(r.paths.backups, "PetStoreDB_20261122"))).toBe(true);
    expect(await r.queryDb("select 1 as ok")).toEqual([{ ok: 1 }]);
  });

  // case: SWHM3-C-0245@v1
  it("SWHM3-C-0245 order indexes and one-row-per-order view", async () => {
    const r = await rt();
    await r.seed({ orders: [order(1, "PENDING", HOUR), order(2, "APPROVED", HOUR)] });
    for (const q of ["ordersByUserAndDate", "ordersByStatus"]) {
      expect(await r.explain(q)).toMatch(/INDEX/i);
    }
    const rows = await r.orderSummaryView();
    expect(rows).toHaveLength(2);
    expect(Object.keys(rows[0])).toEqual(expect.arrayContaining(["userName", "orderDate", "total", "status"]));
  });

  // case: SWHM3-C-0246@v1
  it("SWHM3-C-0246 low-stock report lists item with quantity 120", async () => {
    const r = await rt({ now: SUNDAY(1, 50) });
    await r.seed({ inventory: [{ itemId: "EST-7", quantity: 120 }] });
    await r.runJob("extract");
    const res = await r.runJob("inventory-report");
    expect(res.output).toContain("EST-7");
  });

  // case: SWHM3-C-0247@v1
  it("SWHM3-C-0247 06:00 runs five catalog checks independent of nightly chain", async () => {
    const r = await rt({ now: new Date("2026-11-22T05:00:00Z") });
    r.failJob("backup");
    const ran = await r.advanceTo(new Date("2026-11-22T06:00:00Z"));
    const check = ran.find((x: { job: string }) => x.job === "catalog-check");
    expect(check).toBeDefined();
    const out = (await r.runJob("catalog-check")).output;
    for (const c of ["C1", "C2", "C3", "C4", "C5"]) expect(out).toContain(c);
  });

  // case: SWHM3-C-0248@v1
  it("SWHM3-C-0248 scheduled job runs as service account on application node", async () => {
    const r = await rt({ user: "petstore", host: "app-node-1" });
    await r.runJob("health-check");
    expect(r.lastRun("health-check")).toEqual({ user: "petstore", host: "app-node-1" });
  });

  // case: SWHM3-C-0249@v1
  it("SWHM3-C-0249 defaults apply without overrides; override changes limit", async () => {
    expect((await rt()).limits.orderRetentionDays).toBe(180);
    const r = await rt({ env: { PS_PURGE_KEEP_DAYS: "30" } });
    expect(r.limits.orderRetentionDays).toBe(30);
  });

  // case: SWHM3-C-0250@v1
  it("SWHM3-C-0250 report job with stuck order exits 4 and logs start/end", async () => {
    const r = await rt();
    await r.seed({ orders: [order(3, "PENDING", 30 * HOUR)] });
    const res = await r.runJob("aging-report");
    expect(res.exitCode).toBe(4);
    const log = fs.readFileSync(r.paths.log, "utf8");
    expect(log).toMatch(/aging-report[^\n]*start/i);
    expect(log).toMatch(/aging-report[^\n]*end/i);
  });

  // case: SWHM3-C-0251@v1
  it("SWHM3-C-0251 failed backup holds the extract at 01:30", async () => {
    const r = await rt({ now: SUNDAY(1, 0) });
    r.failJob("backup");
    const ran = await r.advanceTo(SUNDAY(1, 30));
    expect(ran.map((x: { job: string }) => x.job)).not.toContain("extract");
  });

  // case: SWHM3-C-0252@v1
  it("SWHM3-C-0252 low-stock report orders item 10 before 300, with totals", async () => {
    const r = await rt();
    await r.seed({ inventory: [{ itemId: "EST-300", quantity: 300 }, { itemId: "EST-10", quantity: 10 }] });
    const out = (await r.runJob("inventory-report")).output;
    expect(out.indexOf("EST-10")).toBeGreaterThanOrEqual(0);
    expect(out.indexOf("EST-10")).toBeLessThan(out.indexOf("EST-300"));
    expect(out).toMatch(/total items[^\n]*2/i);
    expect(out).toMatch(/units in stock[^\n]*310/i);
  });

  // case: SWHM3-C-0253@v1
  it("SWHM3-C-0253 backup job deletes 9-day-old backup folder", async () => {
    const r = await rt();
    const old = path.join(r.paths.backups, "PetStoreDB_20261113");
    fs.mkdirSync(old, { recursive: true });
    const t = new Date(NOW.getTime() - 9 * DAY);
    fs.utimesSync(old, t, t);
    await r.runJob("backup");
    expect(fs.existsSync(old)).toBe(false);
  });

  // case: SWHM3-C-0254@v1
  it("SWHM3-C-0254 extract failure (code 8) mails Finance", async () => {
    const r = await rt();
    r.failJob("extract");
    const res = await r.runJob("extract");
    expect(res.exitCode).toBe(8);
    const mail = r.mail.find((m: { to: string }) => /finance/i.test(m.to));
    expect(mail).toBeDefined();
    expect(`${mail.subject} ${mail.body}`).toMatch(/extract.*not produced|not produced/i);
  });

  // case: SWHM3-C-0255@v1
  it("SWHM3-C-0255 supplier module silent 20s logged DOWN, exit 8, ops mailed", async () => {
    const http = async (module: string) => (module === "supplier" ? "timeout" : { status: 200 });
    const r = await rt({ http });
    const res = await r.runJob("health-check");
    expect(res.exitCode).toBe(8);
    expect(fs.readFileSync(r.paths.log, "utf8")).toMatch(/supplier[^\n]*DOWN|DOWN[^\n]*supplier/);
    expect(r.mail.some((m: { to: string }) => /ops|operations/i.test(m.to))).toBe(true);
  });

  // case: SWHM3-C-0256@v1
  it("SWHM3-C-0256 successful backup lets extract start at 01:30", async () => {
    const r = await rt({ now: SUNDAY(1, 0) });
    const ran = await r.advanceTo(SUNDAY(1, 30));
    expect(ran.map((x: { job: string }) => x.job)).toEqual(expect.arrayContaining(["backup", "extract"]));
  });

  // case: SWHM3-C-0257@v1
  it("SWHM3-C-0257 Sunday purge does not start without today's extract", async () => {
    const r = await rt({ now: SUNDAY(1, 0) });
    r.failJob("extract");
    const ran = await r.advanceTo(SUNDAY(2, 0));
    expect(ran.map((x: { job: string }) => x.job)).not.toContain("purge");
  });

  // case: SWHM3-C-0258@v1
  it("SWHM3-C-0258 user and date range lookup uses index", async () => {
    const r = await rt();
    await r.seed({ orders: [order(1, "PENDING", HOUR)] });
    const plan = await r.explain("ordersByUserAndDate");
    expect(plan).toMatch(/USING (COVERING )?INDEX/i);
    expect(plan).not.toMatch(/SCAN/i);
  });

  // case: SWHM3-C-0259@v1
  it("SWHM3-C-0259 extract writes only yesterday's orders ordered by id", async () => {
    const r = await rt({ now: new Date("2026-11-21T01:30:00Z") });
    await r.seed({
      orders: [
        order(9, "COMPLETED", 20 * HOUR), order(4, "COMPLETED", 22 * HOUR), order(5, "COMPLETED", 1 * HOUR),
      ],
    });
    await r.runJob("extract");
    const rows = fs.readFileSync(r.paths.extract("20261120"), "utf8").trim().split("\n").filter((l: string) => !l.startsWith("TRAILER"));
    expect(rows.map((l: string) => l.split(",")[0].replace(/"/g, ""))).toEqual(["4", "9"]);
  });

  // case: SWHM3-C-0260@v1
  it("SWHM3-C-0260 nightly extract produced for previous day after good backup", async () => {
    const r = await rt({ now: SUNDAY(1, 0) });
    await r.advanceTo(SUNDAY(1, 30));
    expect(fs.existsSync(r.paths.extract("20261121"))).toBe(true);
  });

  // case: SWHM3-C-0261@v1
  it("SWHM3-C-0261 extract file has 3 rows, no header, TRAILER line", async () => {
    const r = await rt({ now: new Date("2026-11-21T01:30:00Z") });
    await r.seed({ orders: [1, 2, 3].map((i) => order(i, "COMPLETED", 12 * HOUR + i * HOUR)) });
    await r.runJob("extract");
    const lines = fs.readFileSync(r.paths.extract("20261120"), "utf8").trim().split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).not.toMatch(/order/i);
    expect(lines[3]).toBe("TRAILER,20261120,3");
  });

  // case: SWHM3-C-0262@v1
  it("SWHM3-C-0262 missing catalog tables request first load; exit 8 on failure", async () => {
    const r = await rt({ catalogTablesMissing: true });
    const res = await r.runJob("catalog-check");
    expect(res.requests).toEqual([expect.stringMatching(/populate/i)]);
    expect(res.requests[0]).not.toMatch(/force/i);
    const failing = await rt({ catalogTablesMissing: true, populateFails: true });
    expect((await failing.runJob("catalog-check")).exitCode).toBe(8);
  });

  // case: SWHM3-C-0263@v1
  it("SWHM3-C-0263 extract on date D exports only D-1 orders", async () => {
    const r = await rt({ now: new Date("2026-11-21T01:30:00Z") });
    await r.seed({ orders: [order(1, "COMPLETED", 40 * HOUR), order(2, "COMPLETED", 20 * HOUR), order(3, "COMPLETED", HOUR)] });
    await r.runJob("extract");
    const body = fs.readFileSync(r.paths.extract("20261120"), "utf8");
    const lines = body.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/(^|,)2(,|$)/);
    expect(lines[0]).not.toMatch(/(^|,)[13](,|$)/);
    expect(lines[1]).toBe("TRAILER,20261120,1");
  });
});
