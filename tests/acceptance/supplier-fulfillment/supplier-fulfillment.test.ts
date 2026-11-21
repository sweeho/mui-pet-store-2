/**
 * @jest-environment node
 *
 * Acceptance tests for capability supplier-fulfillment.
 *
 * Contract the product must provide: `@/lib/supplier-fulfillment` exports `createSupplierRuntime(opts?)`
 * (async or sync; always awaited here), opts: { now?: Date }. It returns:
 *   rt.contacts.add({name}) -> contactId
 *   rt.inventory.store({itemId, quantity?}) Promise, rejects when quantity is missing/negative/non-integer
 *   rt.inventory.get(itemId) -> Promise<number|undefined>; rt.inventory.count(itemId) -> Promise<number> records held
 *   rt.inventory.populate(xml) Promise; xml: <Inventory><Item><ItemId>..</ItemId><Quantity>..</Quantity></Item>...</Inventory>
 *   rt.supplierOrders.record({status?, contactId, date?}) -> Promise<{id,date,status,contactId}>; rejects unknown contact
 *   rt.supplierOrders.get(id) -> {id,date,status,contactId}
 *   rt.supplierOrders.addLine(orderId, line) Promise; rejects unknown order. line: {categoryId,productId,itemId,lineNumber,quantity,unitPrice,quantityShipped?}
 *   rt.supplierOrders.lines(orderId) -> line[] (all seven fields)
 *   rt.supplierOrders.setQuantityShipped(orderId, lineNumber, n) Promise; rejects n > quantity
 *   rt.supplierOrders.createFromIncoming({contactId, lines}) -> Promise<{id}>; copies contact; lines get quantityShipped 0
 *   rt.supplierOrders.findByStatus(status) -> Promise<{id,status}[]>
 *   rt.supplierOrders.process(orderId) -> Promise<{status, invoice?: string}>; ships a line only when its whole quantity is in stock
 *       (reducing stock), never errors for items without inventory, order COMPLETED only when every line fully shipped, else stays PENDING
 *   rt.supplierOrders.changeStatus(orderId, status) Promise; rejects values outside the set or against the progression
 *   rt.supplierOrders.receiveInvoice(poId, invoiceXml) -> Promise<{complete: boolean}>; updates quantityShipped of the matching line
 *   rt.lineItems.create(values) -> line (stored as given, no validation); rt.lineItems.createFrom(source, shipped) -> line
 *   rt.lineItems.toData(line) -> { categoryId, productId, itemId, lineNumber, quantity, unitPrice } (no quantityShipped)
 *   rt.lineItems.invoke(caller:{roles:string[]}, op, ...args) -> { ok: true, transactional: true, roleChecked: false }
 *   rt.purchaseOrders.persist({id?, date, status}) -> Promise<{id,date,status}>; rt.purchaseOrders.get(id)
 *   rt.approval.complete(orders:{id,status:"APPROVED"|"DENIED"}[]) -> Promise<{sent: string[]}>
 *       sent = ordered log of events, e.g. "supplier-po:<orderId>" and "customer-mail:<orderId>"; supplier PO precedes customer mail
 *   rt.documents.invoice({orderId,userId,orderDate,shippingDate,lines}) -> XML string (tags OrderId, UserId, OrderDate, ShippingDate, LineItem)
 *   rt.documents.supplierOrder({id,date,address,lines}) -> XML string (tags OrderId, OrderDate, ShippingAddress with Address1, City, State, Zip, Country; LineItem)
 *   rt.documents.validateSupplierOrder(xml) throws when it has no LineItem; rt.documents.readPurchaseOrder(xml) throws when no LineItem
 *   rt.documents.buildSupplierOrderElement(order) throws when order.date is null
 *   rt.documents.builder({validation:"xsd"}).produce(order) -> { text, schemaLocation }
 *   rt.documents.editorFor(schemaUri) throws when the URI has no catalog mapping; catalog maps "urn:petstore:supplier-order" and "urn:petstore:invoice"
 *   rt.documents.validateLineItemXsd({quantity,...}) -> { valid: boolean }
 *   rt.messaging.receiveSupplierOrder(xml) -> Promise<{accepted: boolean, wellFormed: boolean, xsdValidated: boolean}>
 *   rt.statuses -> readonly string[]
 */
import { createSupplierRuntime } from "@/lib/supplier-fulfillment";

const LINE = { categoryId: "FISH", productId: "FI-SW-01", itemId: "EST-1", lineNumber: 1, quantity: 5, unitPrice: 16.5 };
const ADDRESS = { address1: "1 Main St", city: "Santa Clara", state: "CA", zip: "95054", country: "USA" };
const rtFactory = async (opts = {}) => createSupplierRuntime(opts);

describe("supplier-fulfillment", () => {
  // case: SWHM3-C-0168@v1
  it("SWHM3-C-0168 invoice XML carries order id, user id, dates and a line item", async () => {
    const rt = await rtFactory();
    const xml = rt.documents.invoice({ orderId: 7, userId: "j2ee", orderDate: "2026-01-02", shippingDate: "2026-01-05", lines: [LINE] });
    for (const tag of ["OrderId", "UserId", "OrderDate", "ShippingDate", "LineItem"]) expect(xml).toMatch(new RegExp(`<${tag}[ >]`));
  });

  // case: SWHM3-C-0169@v1
  it("SWHM3-C-0169 inventory without quantity is refused", async () => {
    const rt = await rtFactory();
    await expect(rt.inventory.store({ itemId: "EST-1" })).rejects.toThrow();
  });

  // case: SWHM3-C-0170@v1
  it("SWHM3-C-0170 supplier order is recorded with id, date, status and the existing contact", async () => {
    const rt = await rtFactory();
    const contactId = await rt.contacts.add({ name: "Acme" });
    const rec = await rt.supplierOrders.record({ status: "PENDING", contactId });
    const back = await rt.supplierOrders.get(rec.id);
    expect(back.id).toBeDefined();
    expect(back.date).toBeDefined();
    expect(back.status).toBe("PENDING");
    expect(back.contactId).toBe(contactId);
  });

  // case: SWHM3-C-0171@v1
  it("SWHM3-C-0171 line for unknown supplier order is refused", async () => {
    const rt = await rtFactory();
    await expect(rt.supplierOrders.addLine(999999, LINE)).rejects.toThrow();
  });

  // case: SWHM3-C-0172@v1
  it("SWHM3-C-0172 supplier order XML has id, date, full address and a line", async () => {
    const rt = await rtFactory();
    const xml = rt.documents.supplierOrder({ id: 11, date: "2026-02-01", address: ADDRESS, lines: [LINE] });
    for (const tag of ["OrderId", "OrderDate", "ShippingAddress", "Address1", "City", "State", "Zip", "Country", "LineItem"]) {
      expect(xml).toMatch(new RegExp(`<${tag}[ >]`));
    }
  });

  // case: SWHM3-C-0173@v1
  it("SWHM3-C-0173 SupplierOrder message is validated but not against XSD", async () => {
    const rt = await rtFactory();
    const wellFormedButInvalid = `<SupplierOrder><OrderId>1</OrderId><LineItem><Quantity>0</Quantity></LineItem></SupplierOrder>`;
    const res = await rt.messaging.receiveSupplierOrder(wellFormedButInvalid);
    expect(res.wellFormed).toBe(true);
    expect(res.accepted).toBe(true);
    expect(res.xsdValidated).toBe(false);
  });

  // case: SWHM3-C-0174@v1
  it("SWHM3-C-0174 line item with quantity 0 fails XSD validation", async () => {
    const rt = await rtFactory();
    expect(rt.documents.validateLineItemXsd({ ...LINE, quantity: 0 }).valid).toBe(false);
  });

  // case: SWHM3-C-0175@v1
  it("SWHM3-C-0175 order line stores all seven fields", async () => {
    const rt = await rtFactory();
    const contactId = await rt.contacts.add({ name: "Acme" });
    const { id } = await rt.supplierOrders.record({ status: "PENDING", contactId });
    await rt.supplierOrders.addLine(id, { ...LINE, quantityShipped: 0 });
    const [line] = await rt.supplierOrders.lines(id);
    expect(line).toMatchObject({ ...LINE, quantityShipped: 0 });
  });

  // case: SWHM3-C-0176@v1
  it("SWHM3-C-0176 shipped quantity above ordered is rejected", async () => {
    const rt = await rtFactory();
    const contactId = await rt.contacts.add({ name: "Acme" });
    const { id } = await rt.supplierOrders.record({ status: "PENDING", contactId });
    await rt.supplierOrders.addLine(id, { ...LINE, quantity: 5, quantityShipped: 0 });
    await expect(rt.supplierOrders.setQuantityShipped(id, 1, 6)).rejects.toThrow();
  });

  // case: SWHM3-C-0177@v1
  it("SWHM3-C-0177 negative inventory quantity is rejected by the store", async () => {
    const rt = await rtFactory();
    await expect(rt.inventory.store({ itemId: "EST-1", quantity: -1 })).rejects.toThrow();
  });

  // case: SWHM3-C-0178@v1
  it("SWHM3-C-0178 purchase order document missing lines is rejected", async () => {
    const rt = await rtFactory();
    expect(() => rt.documents.readPurchaseOrder(`<PurchaseOrder><OrderId>1</OrderId></PurchaseOrder>`)).toThrow();
  });

  // case: SWHM3-C-0179@v1
  it("SWHM3-C-0179 null order date refuses element build", async () => {
    const rt = await rtFactory();
    expect(() => rt.documents.buildSupplierOrderElement({ id: 1, date: null, address: ADDRESS, lines: [LINE] })).toThrow();
  });

  // case: SWHM3-C-0180@v1
  it("SWHM3-C-0180 XSD builder writes no DOCTYPE and resolves the XSD location", async () => {
    const rt = await rtFactory();
    const out = rt.documents.builder({ validation: "xsd" }).produce({ id: 1, date: "2026-02-01", address: ADDRESS, lines: [LINE] });
    expect(out.text).not.toMatch(/<!DOCTYPE/i);
    expect(typeof out.schemaLocation).toBe("string");
    expect(out.schemaLocation.length).toBeGreaterThan(0);
  });

  // case: SWHM3-C-0181@v1
  it("SWHM3-C-0181 unmapped schema URI raises an error", async () => {
    const rt = await rtFactory();
    expect(() => rt.documents.editorFor("urn:unmapped:nothing")).toThrow();
  });

  // case: SWHM3-C-0182@v1
  it("SWHM3-C-0182 supplier order creation copies contact and three lines with shipped 0", async () => {
    const rt = await rtFactory();
    const contactId = await rt.contacts.add({ name: "Acme" });
    const lines = [1, 2, 3].map((n) => ({ ...LINE, itemId: `EST-${n}`, lineNumber: n }));
    const { id } = await rt.supplierOrders.createFromIncoming({ contactId, lines });
    expect((await rt.supplierOrders.get(id)).contactId).toBe(contactId);
    const stored = await rt.supplierOrders.lines(id);
    expect(stored).toHaveLength(3);
    for (const l of stored) expect(l.quantityShipped).toBe(0);
  });

  // case: SWHM3-C-0183@v1
  it("SWHM3-C-0183 search supplier orders by PENDING returns only PENDING", async () => {
    const rt = await rtFactory();
    const contactId = await rt.contacts.add({ name: "Acme" });
    await rt.supplierOrders.record({ status: "PENDING", contactId });
    await rt.supplierOrders.record({ status: "COMPLETED", contactId });
    const found = await rt.supplierOrders.findByStatus("PENDING");
    expect(found.length).toBeGreaterThan(0);
    for (const o of found) expect(o.status).toBe("PENDING");
  });

  // case: SWHM3-C-0184@v1
  it("SWHM3-C-0184 one integer quantity per item", async () => {
    const rt = await rtFactory();
    await rt.inventory.store({ itemId: "EST-9", quantity: 12 });
    expect(Number.isInteger(await rt.inventory.get("EST-9"))).toBe(true);
    expect(await rt.inventory.get("EST-9")).toBe(12);
    expect(await rt.inventory.count("EST-9")).toBe(1);
  });

  // case: SWHM3-C-0185@v1
  it("SWHM3-C-0185 supplier order document without lines is rejected", async () => {
    const rt = await rtFactory();
    expect(() => rt.documents.validateSupplierOrder(`<SupplierOrder><OrderId>1</OrderId></SupplierOrder>`)).toThrow();
  });

  // case: SWHM3-C-0186@v1
  it("SWHM3-C-0186 item without inventory stays unshipped without error", async () => {
    const rt = await rtFactory();
    const contactId = await rt.contacts.add({ name: "Acme" });
    const { id } = await rt.supplierOrders.createFromIncoming({ contactId, lines: [{ ...LINE, itemId: "NO-STOCK-ITEM" }] });
    await expect(rt.supplierOrders.process(id)).resolves.toBeDefined();
    expect((await rt.supplierOrders.lines(id))[0].quantityShipped).toBe(0);
  });

  // case: SWHM3-C-0187@v1
  it("SWHM3-C-0187 order with unstocked second line remains PENDING", async () => {
    const rt = await rtFactory();
    await rt.inventory.store({ itemId: "S-1", quantity: 10 });
    const contactId = await rt.contacts.add({ name: "Acme" });
    const lines = [
      { ...LINE, itemId: "S-1", lineNumber: 1 },
      { ...LINE, itemId: "S-2-UNSTOCKED", lineNumber: 2 },
    ];
    const { id } = await rt.supplierOrders.createFromIncoming({ contactId, lines });
    const res = await rt.supplierOrders.process(id);
    expect(res.status).toBe("PENDING");
    expect((await rt.supplierOrders.get(id)).status).toBe("PENDING");
  });

  // case: SWHM3-C-0189@v1
  it("SWHM3-C-0189 line copy keeps source fields and shipped quantity 2", async () => {
    const rt = await rtFactory();
    const copy = rt.lineItems.createFrom({ ...LINE, quantityShipped: 0 }, 2);
    expect(copy).toMatchObject({ ...LINE, quantityShipped: 2 });
  });

  // case: SWHM3-C-0190@v1
  it("SWHM3-C-0190 line item operations are transactional with no role check", async () => {
    const rt = await rtFactory();
    const res = await rt.lineItems.invoke({ roles: [] }, "create", LINE);
    expect(res.ok).toBe(true);
    expect(res.transactional).toBe(true);
    expect(res.roleChecked).toBe(false);
  });

  // case: SWHM3-C-0191@v1
  it("SWHM3-C-0191 supplier purchase order persists id, date and status", async () => {
    const rt = await rtFactory();
    const saved = await rt.purchaseOrders.persist({ date: "2026-03-01", status: "PENDING" });
    const back = await rt.purchaseOrders.get(saved.id);
    expect(back).toMatchObject({ id: saved.id, status: "PENDING" });
    expect(back.date).toBeDefined();
  });

  // case: SWHM3-C-0192@v1
  it("SWHM3-C-0192 supplier PO is sent only for the approved order, before the customer mail", async () => {
    const rt = await rtFactory();
    const { sent } = await rt.approval.complete([
      { id: "A1", status: "APPROVED" },
      { id: "D1", status: "DENIED" },
    ]);
    expect(sent.filter((e) => e.startsWith("supplier-po:"))).toEqual(["supplier-po:A1"]);
    expect(sent.indexOf("supplier-po:A1")).toBeLessThan(sent.indexOf("customer-mail:A1"));
  });

  // case: SWHM3-C-0193@v1
  it("SWHM3-C-0193 line item data object has six fields and no shipped quantity", async () => {
    const rt = await rtFactory();
    const data = rt.lineItems.toData({ ...LINE, quantityShipped: 2 });
    expect(Object.keys(data).sort()).toEqual(["categoryId", "itemId", "lineNumber", "productId", "quantity", "unitPrice"]);
    expect(data).not.toHaveProperty("quantityShipped");
  });

  // case: SWHM3-C-0194@v1
  it("SWHM3-C-0194 invoice for one of two lines updates that line and order is not complete", async () => {
    const rt = await rtFactory();
    const contactId = await rt.contacts.add({ name: "Acme" });
    const lines = [
      { ...LINE, itemId: "I-1", lineNumber: 1, quantity: 4 },
      { ...LINE, itemId: "I-2", lineNumber: 2, quantity: 4 },
    ];
    const { id } = await rt.supplierOrders.createFromIncoming({ contactId, lines });
    const invoice = rt.documents.invoice({ orderId: id, userId: "j2ee", orderDate: "2026-01-02", shippingDate: "2026-01-05", lines: [{ ...lines[0], quantity: 4 }] });
    const res = await rt.supplierOrders.receiveInvoice(id, invoice);
    expect(res.complete).toBe(false);
    const stored = await rt.supplierOrders.lines(id);
    expect(stored.find((l) => l.itemId === "I-1")!.quantityShipped).toBe(4);
    expect(stored.find((l) => l.itemId === "I-2")!.quantityShipped).toBe(0);
  });

  // case: SWHM3-C-0195@v1
  it("SWHM3-C-0195 supplier order status values and progression", async () => {
    const rt = await rtFactory();
    expect([...rt.statuses].sort()).toEqual(["APPROVED", "COMPLETED", "DENIED", "PENDING"]);
    const contactId = await rt.contacts.add({ name: "Acme" });
    const a = (await rt.supplierOrders.record({ status: "PENDING", contactId })).id;
    await rt.supplierOrders.changeStatus(a, "APPROVED");
    await rt.supplierOrders.changeStatus(a, "COMPLETED");
    expect((await rt.supplierOrders.get(a)).status).toBe("COMPLETED");
    const b = (await rt.supplierOrders.record({ status: "PENDING", contactId })).id;
    await rt.supplierOrders.changeStatus(b, "DENIED");
    expect((await rt.supplierOrders.get(b)).status).toBe("DENIED");
    const c = (await rt.supplierOrders.record({ status: "PENDING", contactId })).id;
    await expect(rt.supplierOrders.changeStatus(c, "SHIPPED_PART")).rejects.toThrow();
  });

  // case: SWHM3-C-0196@v1
  it("SWHM3-C-0196 line item is created with given values, unvalidated", async () => {
    const rt = await rtFactory();
    const odd = { ...LINE, quantity: -4, unitPrice: 0, quantityShipped: 99 };
    expect(rt.lineItems.create(odd)).toMatchObject(odd);
    expect(rt.lineItems.createFrom({ ...LINE, quantityShipped: 3 }, 3)).toMatchObject({ ...LINE, quantityShipped: 3 });
  });

  // case: SWHM3-C-0197@v1
  it("SWHM3-C-0197 line of 5 with stock 3 is not shipped", async () => {
    const rt = await rtFactory();
    await rt.inventory.store({ itemId: "P-1", quantity: 3 });
    const contactId = await rt.contacts.add({ name: "Acme" });
    const { id } = await rt.supplierOrders.createFromIncoming({ contactId, lines: [{ ...LINE, itemId: "P-1", quantity: 5 }] });
    await rt.supplierOrders.process(id);
    expect((await rt.supplierOrders.lines(id))[0].quantityShipped).toBe(0);
    expect(await rt.inventory.get("P-1")).toBe(3);
  });

  // case: SWHM3-C-0198@v1
  it("SWHM3-C-0198 invoice contains only the shipped line, dated today, with the greeting", async () => {
    const now = new Date("2026-06-15T10:00:00Z");
    const rt = await rtFactory({ now });
    await rt.inventory.store({ itemId: "Q-1", quantity: 10 });
    const contactId = await rt.contacts.add({ name: "Acme" });
    const lines = [
      { ...LINE, itemId: "Q-1", lineNumber: 1, quantity: 2 },
      { ...LINE, itemId: "Q-2-UNSTOCKED", lineNumber: 2, quantity: 2 },
    ];
    const { id } = await rt.supplierOrders.createFromIncoming({ contactId, lines });
    const res = await rt.supplierOrders.process(id);
    const invoice = res.invoice as string;
    expect(invoice).toContain("Dear PetStore Customer");
    expect(invoice).toContain("Q-1");
    expect(invoice).not.toContain("Q-2-UNSTOCKED");
    expect(invoice).toContain("2026-06-15");
  });

  // case: SWHM3-C-0200@v1
  it("SWHM3-C-0200 populate loads inventory from an XML file", async () => {
    const rt = await rtFactory();
    await rt.inventory.populate(
      `<Inventory><Item><ItemId>POP-1</ItemId><Quantity>10000</Quantity></Item><Item><ItemId>POP-2</ItemId><Quantity>7</Quantity></Item></Inventory>`,
    );
    expect(await rt.inventory.get("POP-1")).toBe(10000);
    expect(await rt.inventory.get("POP-2")).toBe(7);
  });
});
