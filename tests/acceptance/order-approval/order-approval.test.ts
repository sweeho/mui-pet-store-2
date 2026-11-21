/**
 * @jest-environment node
 *
 * Acceptance tests for capability order-approval.
 *
 * Contract the product must provide: `@/lib/order-approval` exports `createOrderApprovalRuntime(opts?)`
 * (async or sync; always awaited here). It returns:
 *   rt.statuses -> readonly string[]            the allowed order status set
 *   rt.orders.add({id, locale?, total?, status?, lines?: {lineNumber, quantity}[], statusRecord?: boolean})
 *       Promise<order>; registers the order (default status PENDING) and, unless statusRecord is false, its status record
 *   rt.orders.receive({id, locale, total}) -> Promise<{status}>   OPC receipt: auto-approval by locale limit
 *   rt.approvalState.store({orderId, status?}) Promise, rejects when status is missing
 *   rt.approvalState.count(orderId) -> Promise<number>             records held
 *   rt.status.read(orderId) -> Promise<string>                      rejects with an order-not-found error (name or message /not.?found/i)
 *   rt.status.store(orderId, status) Promise
 *   rt.statusListing.read() -> Promise<{orderId}[]>                 only orders that have a status record
 *   rt.workflow.create(orderId) Promise, rejects when a record already exists; rt.workflow.count(orderId) -> Promise<number>
 *   rt.decisions.submit(orderId, "APPROVED"|"DENIED") Promise       ignored silently unless the order is PENDING
 *   rt.documents.parseOrderApproval(xml) -> { orders: {orderId, status}[] }; throws a validation error when invalid
 *   rt.outbox.approvalMessages -> messages emitted to the order-approval path (array)
 *   rt.autoApproval.evaluate(orderId) Promise                       emits an approval message only when auto-approved
 *   rt.storefront.submit(order) -> Promise<{decision?: string}>     hands the order to the OPC; sets no decision itself
 *   rt.opc.inbox -> orders delivered to the Order Processing Center (array of {id})
 *   rt.shipping.ship(orderId, lineNumbers: number[]) Promise
 *   rt.approval.process({orders:{id,status}[]}) -> Promise<{noticeBatch: unknown[], supplierOrders: unknown[]}>
 *   rt.notices.queue -> customer notices queued (array)
 */
import { createOrderApprovalRuntime } from "@/lib/order-approval";

const rtFactory = async () => createOrderApprovalRuntime();

describe("order-approval", () => {
  // case: SWHM3-C-0264@v1
  it("SWHM3-C-0264 approval-state record without status is rejected", async () => {
    const rt = await rtFactory();
    await rt.orders.add({ id: 1, total: 10 });
    await expect(rt.approvalState.store({ orderId: 1 })).rejects.toThrow();
    // the pre-existing record, if any, is not replaced by a status-less one
    await expect(rt.approvalState.store({ orderId: 1, status: undefined })).rejects.toThrow();
  });

  // case: SWHM3-C-0265@v1
  it("SWHM3-C-0265 order lacking a status record is absent from listing", async () => {
    const rt = await rtFactory();
    await rt.orders.add({ id: 11, total: 10 });
    await rt.orders.add({ id: 12, total: 10, statusRecord: false });
    const ids = (await rt.statusListing.read()).map((r) => r.orderId);
    expect(ids).toContain(11);
    expect(ids).not.toContain(12);
  });

  // case: SWHM3-C-0266@v1
  it("SWHM3-C-0266 denial on COMPLETED order is ignored silently", async () => {
    const rt = await rtFactory();
    await rt.orders.add({ id: 21, status: "COMPLETED" });
    await expect(rt.decisions.submit(21, "DENIED")).resolves.not.toThrow();
    expect(await rt.status.read(21)).toBe("COMPLETED");
  });

  // case: SWHM3-C-0267@v1
  it("SWHM3-C-0267 en_US order of 499.99 auto-approved", async () => {
    const rt = await rtFactory();
    const res = await rt.orders.receive({ id: 31, locale: "en_US", total: 499.99 });
    expect(res.status).toBe("APPROVED");
  });

  // case: SWHM3-C-0268@v1
  it("SWHM3-C-0268 ja_JP order of 50000 stays PENDING", async () => {
    const rt = await rtFactory();
    const res = await rt.orders.receive({ id: 41, locale: "ja_JP", total: 50000 });
    expect(res.status).toBe("PENDING");
  });

  // case: SWHM3-C-0269@v1
  it("SWHM3-C-0269 partly shipped order status set reconciled with SHIPPED_PART", async () => {
    const rt = await rtFactory();
    await rt.orders.add({ id: 51, status: "APPROVED" });
    await rt.status.store(51, "SHIPPED_PART");
    expect(await rt.status.read(51)).toBe("SHIPPED_PART");
    expect(rt.statuses).toContain("SHIPPED_PART");
  });

  // case: SWHM3-C-0270@v1
  it("SWHM3-C-0270 status read for unknown order raises not-found", async () => {
    const rt = await rtFactory();
    await expect(rt.status.read(987654)).rejects.toThrow(/not.?found/i);
  });

  // case: SWHM3-C-0271@v1
  it("SWHM3-C-0271 document with wrong root element is rejected", async () => {
    const rt = await rtFactory();
    expect(() => rt.documents.parseOrderApproval("<Foo><Order><OrderId>1</OrderId><OrderStatus>APPROVED</OrderStatus></Order></Foo>")).toThrow();
  });

  // case: SWHM3-C-0272@v1
  it("SWHM3-C-0272 no approval message for PENDING order", async () => {
    const rt = await rtFactory();
    await rt.orders.add({ id: 61, locale: "en_US", total: 600 });
    await rt.autoApproval.evaluate(61);
    expect(await rt.status.read(61)).toBe("PENDING");
    expect(rt.outbox.approvalMessages).toHaveLength(0);
  });

  // case: SWHM3-C-0273@v1
  it("SWHM3-C-0273 second workflow record for same order refused", async () => {
    const rt = await rtFactory();
    await rt.workflow.create(71);
    await expect(rt.workflow.create(71)).rejects.toThrow();
    expect(await rt.workflow.count(71)).toBe(1);
  });

  // case: SWHM3-C-0274@v1
  it("SWHM3-C-0274 document with two orders exposes both", async () => {
    const rt = await rtFactory();
    const xml = `<OrderApproval><Order><OrderId>81</OrderId><OrderStatus>APPROVED</OrderStatus></Order><Order><OrderId>82</OrderId><OrderStatus>DENIED</OrderStatus></Order></OrderApproval>`;
    const doc = rt.documents.parseOrderApproval(xml);
    expect(doc.orders.map((o) => ({ orderId: String(o.orderId), status: o.status }))).toEqual([
      { orderId: "81", status: "APPROVED" },
      { orderId: "82", status: "DENIED" },
    ]);
  });

  // case: SWHM3-C-0275@v1
  it("SWHM3-C-0275 storefront submission handed to Order Processing Center", async () => {
    const rt = await rtFactory();
    const res = await rt.storefront.submit({ id: 91, locale: "en_US", total: 20 });
    expect(rt.opc.inbox.map((o) => o.id)).toContain(91);
    expect(res.decision).toBeUndefined();
  });

  // case: SWHM3-C-0276@v1
  it("SWHM3-C-0276 partial then full shipment moves status to SHIPPED_PART then COMPLETED", async () => {
    const rt = await rtFactory();
    await rt.orders.add({
      id: 101,
      status: "APPROVED",
      lines: [
        { lineNumber: 1, quantity: 1 },
        { lineNumber: 2, quantity: 2 },
        { lineNumber: 3, quantity: 3 },
      ],
    });
    await rt.shipping.ship(101, [1]);
    expect(await rt.status.read(101)).toBe("SHIPPED_PART");
    await rt.shipping.ship(101, [2, 3]);
    expect(await rt.status.read(101)).toBe("COMPLETED");
  });

  // case: SWHM3-C-0277@v1
  it("SWHM3-C-0277 APPROVED decision on PENDING order queues customer notice", async () => {
    const rt = await rtFactory();
    await rt.orders.add({ id: 111, locale: "en_US", total: 600 });
    await rt.decisions.submit(111, "APPROVED");
    expect(await rt.status.read(111)).toBe("APPROVED");
    expect(rt.notices.queue).toHaveLength(1);
  });

  // case: SWHM3-C-0278@v1
  it("SWHM3-C-0278 message with only decided orders forwards empty notice batch", async () => {
    const rt = await rtFactory();
    await rt.orders.add({ id: 121, status: "APPROVED" });
    await rt.orders.add({ id: 122, status: "DENIED" });
    const res = await rt.approval.process({
      orders: [
        { id: 121, status: "APPROVED" },
        { id: 122, status: "DENIED" },
      ],
    });
    expect(res.noticeBatch).toEqual([]);
    expect(res.supplierOrders).toEqual([]);
  });

  // case: SWHM3-C-0280@v1
  it("SWHM3-C-0280 order of 600 awaits administrator approval", async () => {
    const rt = await rtFactory();
    const res = await rt.orders.receive({ id: 131, locale: "en_US", total: 600 });
    expect(res.status).toBe("PENDING");
  });

  // case: SWHM3-C-0281@v1
  it("SWHM3-C-0281 zh_CN order of 10 stays PENDING", async () => {
    const rt = await rtFactory();
    const res = await rt.orders.receive({ id: 141, locale: "zh_CN", total: 10 });
    expect(res.status).toBe("PENDING");
  });
});
