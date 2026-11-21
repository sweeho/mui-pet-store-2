/**
 * @jest-environment node
 *
 * Acceptance tests for capability order-administration (integration level).
 *
 * Contract the product must provide: `@/lib/order-admin` exports `createOrderAdmin(opts)`:
 *   opts: { now: Date }
 *   admin.seed({ orders?, categories? })  orders: { id, userId, date: Date, status, lines?: { item, category, quantity, unitPrice }[], amount? }
 *   admin.signIn(role: "administrator" | "user") -> sessionId
 *   admin.advanceTo(date)                 moves the clock
 *   admin.findOrdersByStatus(status)      -> orders[] (all matches, unpaged)
 *   admin.handle(xml, sessionId?)         processes a client XML request -> response XML string
 * Request XML: <Request><Type>GETORDERS|UPDATESTATUS|REVENUE|ORDERS</Type> with <Status>, <StartDate>,
 * <EndDate> (mm/dd/yyyy), <Category>. Responses carry <Error> on failure, <Count>, <Order> with
 * <Id>, <UserId>, <Date>, <Amount>, <Status>; charts carry <Category name> / <Item name> with <Value>
 * and a <Total>.
 */
import { createOrderAdmin } from "@/lib/order-admin";

const NOW = new Date("2026-11-22T10:00:00Z");
const MIN = 60_000;
type Status = "PENDING" | "APPROVED" | "DENIED" | "COMPLETED";

function order(id: number, status: Status, extra: Record<string, unknown> = {}) {
  return { id, userId: `user${id}`, date: new Date("2026-03-05T12:00:00Z"), status, amount: 10 * id, ...extra };
}
const req = (type: string, inner = "") => `<Request><Type>${type}</Type>${inner}</Request>`;
const valueOf = (xml: string, name: string) =>
  Number(new RegExp(`name="${name}"[^>]*>[\\s\\S]*?<Value>([\\d.]+)</Value>`).exec(xml)?.[1]);

const LINES = [
  { item: "Bulldog", category: "DOGS", quantity: 2, unitPrice: 10 },
  { item: "Poodle", category: "DOGS", quantity: 1, unitPrice: 30 },
  { item: "Persian", category: "CATS", quantity: 3, unitPrice: 5 },
];
const RANGE = "<StartDate>03/01/2026</StartDate><EndDate>03/31/2026</EndDate>";

async function fresh() {
  const admin = await createOrderAdmin({ now: NOW });
  const sid = await admin.signIn("administrator");
  return { admin, sid };
}

describe("order-administration", () => {
  // case: SWHM3-C-0096@v1
  it("SWHM3-C-0096 find orders by exact status PENDING returns only PENDING, unpaged", async () => {
    const { admin } = await fresh();
    const pend = Array.from({ length: 30 }, (_, i) => order(100 + i, "PENDING"));
    await admin.seed({ orders: [...pend, order(1, "APPROVED"), order(2, "DENIED"), order(3, "COMPLETED")] });
    const found = await admin.findOrdersByStatus("PENDING");
    expect(found).toHaveLength(30);
    expect(found.every((o: { status: string }) => o.status === "PENDING")).toBe(true);
  });

  // case: SWHM3-C-0099@v1
  it("SWHM3-C-0099 unknown request Type returns Error", async () => {
    const { admin, sid } = await fresh();
    const xml = await admin.handle(req("DELETEEVERYTHING"), sid);
    expect(xml).toMatch(/<Error>/);
  });

  // case: SWHM3-C-0100@v1
  it("SWHM3-C-0100 idle 54-minute session times out", async () => {
    const { admin, sid } = await fresh();
    admin.advanceTo(new Date(NOW.getTime() + 54 * MIN));
    const xml = await admin.handle(req("GETORDERS", "<Status>PENDING</Status>"), sid);
    expect(xml).toMatch(/<Error>/);
    expect(xml).toMatch(/timed out/i);
    expect(xml).toMatch(/log in again/i);
  });

  // case: SWHM3-C-0101@v1
  it("SWHM3-C-0101 PENDING list returns count and orders", async () => {
    const { admin, sid } = await fresh();
    await admin.seed({ orders: [order(1, "PENDING"), order(2, "PENDING"), order(3, "PENDING"), order(4, "APPROVED")] });
    const xml = await admin.handle(req("GETORDERS", "<Status>PENDING</Status>"), sid);
    expect(xml).toMatch(/<Count>3<\/Count>/);
    expect(xml.match(/<Order>/g)).toHaveLength(3);
    for (const tag of ["Id", "UserId", "Date", "Amount", "Status"]) {
      expect(xml.match(new RegExp(`<${tag}>`, "g"))).toHaveLength(3);
    }
    expect(xml).not.toMatch(/<Status>APPROVED<\/Status>/);
  });

  // case: SWHM3-C-0104@v1
  it("SWHM3-C-0104 revenue summed per category with no category filter", async () => {
    const { admin, sid } = await fresh();
    await admin.seed({ orders: [order(1, "COMPLETED", { lines: LINES })] });
    const xml = await admin.handle(req("REVENUE", `${RANGE}<Category></Category>`), sid);
    expect(valueOf(xml, "DOGS")).toBe(50); // 2*10 + 1*30
    expect(valueOf(xml, "CATS")).toBe(15); // 3*5
  });

  // case: SWHM3-C-0105@v1
  it("SWHM3-C-0105 quantity summed per item for one category", async () => {
    const { admin, sid } = await fresh();
    await admin.seed({ orders: [order(1, "COMPLETED", { lines: LINES }), order(2, "COMPLETED", { lines: [LINES[0]] })] });
    const xml = await admin.handle(req("ORDERS", `${RANGE}<Category>DOGS</Category>`), sid);
    expect(valueOf(xml, "Bulldog")).toBe(4);
    expect(valueOf(xml, "Poodle")).toBe(1);
    expect(xml).not.toMatch(/Persian/);
  });

  // case: SWHM3-C-0108@v1
  it("SWHM3-C-0108 REVENUE and ORDERS chart for date range", async () => {
    const { admin, sid } = await fresh();
    await admin.seed({ orders: [order(1, "COMPLETED", { lines: LINES })] });
    const rev = await admin.handle(req("REVENUE", RANGE), sid);
    expect(valueOf(rev, "DOGS")).toBe(50);
    expect(valueOf(rev, "CATS")).toBe(15);
    expect(Number(/<Total>([\d.]+)<\/Total>/.exec(rev)?.[1])).toBe(65);
    const qty = await admin.handle(req("ORDERS", RANGE), sid);
    expect(valueOf(qty, "DOGS")).toBe(3);
    expect(valueOf(qty, "CATS")).toBe(3);
    expect(Number(/<Total>([\d.]+)<\/Total>/.exec(qty)?.[1])).toBe(6);
  });
});
