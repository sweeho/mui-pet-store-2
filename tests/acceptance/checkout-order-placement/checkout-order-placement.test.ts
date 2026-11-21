/**
 * @jest-environment node
 *
 * Acceptance tests for capability checkout-order-placement.
 *
 * Contract the product must provide: `@/lib/checkout-order-placement` exports
 *   createCheckoutRuntime(opts?) -> Promise<rt>   (fresh store; `opts.store` reuses a persisted one)
 *   createEjbServiceLocator(naming) -> { lookup(name) }          naming = { lookup(name) }
 *   loadWebServiceLocator(naming: () => naming) -> { getInstance() }   writes init failures to console.error
 *   createEnvEntryReader(naming) -> { getString(name), getUrl(name) }
 *   expiryMonth(card) / expiryYear(card) -> string               card = { number?, type?, expiry? }
 * rt:
 *   rt.contacts.create({familyName, givenName, email, phone, address?}) -> {id, addressId}
 *   rt.contacts.remove(id); rt.addresses.{create(a) -> {id}, read(id), exists(id), remove(id), list()}
 *   rt.cards.{store({number,type,expiry}) -> {id}, read(id), update(id, patch), exists(id)}  rejects on a missing field
 *   rt.orders.record({userId,email,locale,total,orderDate?,contactId,cardId,status?}) -> order {id,...}
 *   rt.orders.create({userId,email,locale,total,lines:[{quantity}]}) -> order; builds contact, card, lines
 *   rt.orders.{get(id), count(), remove(id), status(id), registeredIds()}; rt.orders.receive(xml) persists as PENDING
 *   rt.orderLines.{record({orderId,lineNumber,quantity}) -> {orderId,lineNumber}, list(orderId)}
 *   rt.ids.{next(prefix) -> string, counter(prefix) -> number|undefined}; rt.counters.{create(name,value?), countNamed(name), read(name)}
 *   rt.asCaller(caller|null) -> rt view with that caller (`{roles: []}` roleless, null anonymous)
 *   rt.faults.failNext("lookup"); rt.restart() -> Promise<rt> on the same persisted store; rt.store
 *   rt.purge.run({now}); rt.checkout.place({email, items}) -> Promise<{orderId, email}>; rt.cart.{add(item), items()}
 *   rt.opc.queue -> [{format: "xml", body, async: boolean}]
 *   rt.xml.{cardToXml, cardFromXml, addressToXml, addressFromXml, contactToXml, contactFromXml,
 *           validatePurchaseOrder(xml) (well-formedness only), purchaseOrderFromXml(xml)}
 * XML elements: CreditCard{CardNumber,CardType,ExpiryDate}; Address{StreetName+,City,State,Zipcode,Country};
 * ContactInfo{FamilyName,GivenName,Address,Email,Telephone}; PurchaseOrder{OrderId,UserId,EmailId,OrderDate,Locale?,
 * TotalPrice,CreditCard,LineItem+}.
 */
import {
  createCheckoutRuntime,
  createEjbServiceLocator,
  createEnvEntryReader,
  expiryMonth,
  expiryYear,
  loadWebServiceLocator,
} from "@/lib/checkout-order-placement";

const addr = { street1: "1 Main", street2: "", city: "Town", state: "CA", zip: "90001", country: "US" };
const card = { number: "1234-2334", type: "Duke Express", expiry: "10/2001" };
const DAY = 24 * 3600 * 1000;

async function seedParts(rt: Awaited<ReturnType<typeof createCheckoutRuntime>>) {
  const contact = await rt.contacts.create({
    familyName: "Doe", givenName: "Jo", email: "jo@example.com", phone: "555", address: addr,
  });
  const c = await rt.cards.store(card);
  return { contactId: contact.id, cardId: c.id };
}
const orderBase = { userId: "u1", email: "jo@example.com", locale: "en_US", total: 12.5 };
const inOrder = (xml: string, tags: string[]) => {
  const pos = tags.map((t) => xml.indexOf(`<${t}`));
  return pos.every((p) => p >= 0) && pos.every((p, i) => i === 0 || p > pos[i - 1]);
};
const count = (xml: string, tag: string) => (xml.match(new RegExp(`<${tag}[ >]`, "g")) ?? []).length;
const poXml = (opts: { locale?: string; lines?: number } = {}) =>
  `<PurchaseOrder><OrderId>PO1</OrderId><UserId>u1</UserId><EmailId>a@b.c</EmailId><OrderDate>1</OrderDate>` +
  (opts.locale ? `<Locale>${opts.locale}</Locale>` : "") +
  `<TotalPrice>5</TotalPrice><CreditCard><CardNumber>1</CardNumber><CardType>V</CardType><ExpiryDate>01/2030</ExpiryDate></CreditCard>` +
  Array.from({ length: opts.lines ?? 1 }, (_, i) => `<LineItem><LineNumber>${i + 1}</LineNumber><Quantity>1</Quantity></LineItem>`).join("") +
  `</PurchaseOrder>`;

describe("checkout-order-placement", () => {
  // case: SWHM3-C-0028@v1
  it("SWHM3-C-0028 order with stored contact and card is recorded", async () => {
    const rt = await createCheckoutRuntime();
    const parts = await seedParts(rt);
    const o = await rt.orders.record({ ...orderBase, orderDate: 1700000000000, ...parts });
    const read = await rt.orders.get(o.id);
    expect(read).toMatchObject({ id: o.id, userId: "u1", email: "jo@example.com", locale: "en_US", total: 12.5 });
    expect(read.orderDate).toBeDefined();
  });

  // case: SWHM3-C-0029@v1
  it("SWHM3-C-0029 order without contact or card is rejected", async () => {
    const rt = await createCheckoutRuntime();
    await expect(rt.orders.record({ ...orderBase, contactId: 9999, cardId: 9999 })).rejects.toThrow();
    expect(await rt.orders.count()).toBe(0);
  });

  // case: SWHM3-C-0030@v1
  it("SWHM3-C-0030 card with number, type and expiry is accepted unchecked", async () => {
    const rt = await createCheckoutRuntime();
    const c = await rt.cards.store({ number: "not-a-number", type: "Whatever", expiry: "01/1999" });
    expect(await rt.cards.read(c.id)).toMatchObject({ number: "not-a-number", type: "Whatever", expiry: "01/1999" });
  });

  // case: SWHM3-C-0031@v1
  it("SWHM3-C-0031 card missing expiry date is rejected", async () => {
    const rt = await createCheckoutRuntime();
    await expect(rt.cards.store({ number: "1", type: "V" } as never)).rejects.toThrow();
    expect(await rt.cards.exists(1)).toBe(false);
  });

  // case: SWHM3-C-0032@v1
  it("SWHM3-C-0032 placed order sends async XML purchase order to OPC", async () => {
    const rt = await createCheckoutRuntime();
    await rt.cart.add({ itemId: "EST-1", quantity: 1 });
    await rt.checkout.place({ email: "jo@example.com", items: await rt.cart.items() });
    expect(rt.opc.queue).toHaveLength(1);
    expect(rt.opc.queue[0].format).toBe("xml");
    expect(rt.opc.queue[0].async).toBe(true);
    expect(rt.opc.queue[0].body).toContain("<PurchaseOrder");
  });

  // case: SWHM3-C-0034@v1
  it("SWHM3-C-0034 payment card writes CardNumber, CardType, ExpiryDate in order", async () => {
    const rt = await createCheckoutRuntime();
    const xml = rt.xml.cardToXml(card);
    expect(inOrder(xml, ["CardNumber", "CardType", "ExpiryDate"])).toBe(true);
  });

  // case: SWHM3-C-0035@v1
  it("SWHM3-C-0035 card document is read in element order", async () => {
    const rt = await createCheckoutRuntime();
    const c = rt.xml.cardFromXml(
      "<CreditCard><CardNumber>111</CardNumber><CardType>Visa</CardType><ExpiryDate>02/2031</ExpiryDate></CreditCard>",
    );
    expect(c).toMatchObject({ number: "111", type: "Visa", expiry: "02/2031" });
  });

  // case: SWHM3-C-0036@v1
  it("SWHM3-C-0036 persisted order holds all fields with epoch-ms date", async () => {
    const rt = await createCheckoutRuntime();
    const parts = await seedParts(rt);
    const o = await rt.orders.record({ ...orderBase, orderDate: 1700000000123, ...parts });
    const read = await rt.orders.get(o.id);
    expect(read.orderDate).toBe(1700000000123);
    expect(read).toMatchObject({ userId: "u1", email: "jo@example.com", locale: "en_US", total: 12.5 });
    expect(read.id).toBeTruthy();
  });

  // case: SWHM3-C-0037@v1
  it("SWHM3-C-0037 two orders get distinct ids", async () => {
    const rt = await createCheckoutRuntime();
    const a = await rt.orders.record({ ...orderBase, ...(await seedParts(rt)) });
    const b = await rt.orders.record({ ...orderBase, ...(await seedParts(rt)) });
    expect(a.id).not.toEqual(b.id);
  });

  // case: SWHM3-C-0038@v1
  it("SWHM3-C-0038 first id for new prefix PO is PO1", async () => {
    const rt = await createCheckoutRuntime();
    expect(await rt.ids.counter("PO")).toBeUndefined();
    expect(await rt.ids.next("PO")).toBe("PO1");
    expect(await rt.ids.counter("PO")).toBe(1);
  });

  // case: SWHM3-C-0039@v1
  it("SWHM3-C-0039 second id for prefix is PO2", async () => {
    const rt = await createCheckoutRuntime();
    await rt.ids.next("PO");
    expect(await rt.ids.next("PO")).toBe("PO2");
  });

  // case: SWHM3-C-0040@v1
  it("SWHM3-C-0040 counter holds last issued value", async () => {
    const rt = await createCheckoutRuntime();
    for (let i = 0; i < 5; i++) await rt.ids.next("X");
    expect(await rt.ids.counter("X")).toBe(5);
  });

  // case: SWHM3-C-0041@v1
  it("SWHM3-C-0041 each prefix has its own counter", async () => {
    const rt = await createCheckoutRuntime();
    await rt.ids.next("A"); await rt.ids.next("B"); await rt.ids.next("A"); await rt.ids.next("A");
    expect(await rt.ids.counter("A")).toBe(3);
    expect(await rt.ids.counter("B")).toBe(1);
  });

  // case: SWHM3-C-0042@v1
  it("SWHM3-C-0042 next id after 7 is prefix+8", async () => {
    const rt = await createCheckoutRuntime();
    await rt.counters.create("Q", 7);
    expect(await rt.ids.next("Q")).toBe("Q8");
  });

  // case: SWHM3-C-0043@v1
  it("SWHM3-C-0043 sequential requests give different ids", async () => {
    const rt = await createCheckoutRuntime();
    const a = await rt.ids.next("S");
    const b = await rt.ids.next("S");
    expect(a).not.toEqual(b);
  });

  // case: SWHM3-C-0044@v1
  it("SWHM3-C-0044 concurrent requests get different ids", async () => {
    const rt = await createCheckoutRuntime();
    const [a, b] = await Promise.all([rt.ids.next("C"), rt.ids.next("C")]);
    expect(a).not.toEqual(b);
  });

  // case: SWHM3-C-0045@v1
  it("SWHM3-C-0045 identifier generation needs no role", async () => {
    const rt = await createCheckoutRuntime();
    const anon = rt.asCaller({ roles: [] });
    await expect(anon.ids.next("R")).resolves.toBe("R1");
  });

  // case: SWHM3-C-0046@v1
  it("SWHM3-C-0046 EJB-tier lookup performs naming lookup each time", () => {
    const naming = { lookup: jest.fn(() => ({})) };
    const locator = createEjbServiceLocator(naming);
    locator.lookup("jdbc/x");
    locator.lookup("jdbc/x");
    expect(naming.lookup).toHaveBeenCalledTimes(2);
  });

  // case: SWHM3-C-0047@v1
  it("SWHM3-C-0047 callers create own lookup service instance", () => {
    const naming = { lookup: jest.fn(() => ({})) };
    const a = createEjbServiceLocator(naming);
    const b = createEjbServiceLocator(naming);
    expect(a).not.toBe(b);
  });

  // case: SWHM3-C-0048@v1
  it("SWHM3-C-0048 web locator init failure printed to stderr", () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
    loadWebServiceLocator(() => { throw new Error("naming down"); });
    expect(err).toHaveBeenCalled();
    expect(JSON.stringify(err.mock.calls)).toContain("naming down");
    err.mockRestore();
  });

  // case: SWHM3-C-0049@v1
  it("SWHM3-C-0049 getInstance returns null after init failure", () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const loc = loadWebServiceLocator(() => { throw new Error("naming down"); });
    expect(loc.getInstance()).toBeNull();
    err.mockRestore();
  });

  // case: SWHM3-C-0050@v1
  it("SWHM3-C-0050 string env entry read from naming directory twice", () => {
    const naming = { lookup: jest.fn(() => "v") };
    const reader = createEnvEntryReader(naming);
    reader.getString("env/name");
    reader.getString("env/name");
    expect(naming.lookup).toHaveBeenCalledTimes(2);
  });

  // case: SWHM3-C-0051@v1
  it("SWHM3-C-0051 URL entry read from naming directory", () => {
    const naming = { lookup: jest.fn(() => "http://example.com/x") };
    const reader = createEnvEntryReader(naming);
    expect(String(reader.getUrl("url/x"))).toContain("http://example.com/x");
    expect(naming.lookup).toHaveBeenCalledWith("url/x");
  });

  // case: SWHM3-C-0052@v1
  it("SWHM3-C-0052 contact creation copies address data into new address", async () => {
    const rt = await createCheckoutRuntime();
    const c = await rt.contacts.create({ familyName: "D", givenName: "J", email: "e@x.y", phone: "1", address: addr });
    const stored = await rt.addresses.read(c.addressId);
    expect(stored).toMatchObject({ city: "Town", state: "CA", zip: "90001", country: "US" });
  });

  // case: SWHM3-C-0053@v1
  it("SWHM3-C-0053 contact with no address gets empty address", async () => {
    const rt = await createCheckoutRuntime();
    const c = await rt.contacts.create({ familyName: "D", givenName: "J", email: "e@x.y", phone: "1" });
    expect(await rt.addresses.exists(c.addressId)).toBe(true);
  });

  // case: SWHM3-C-0054@v1
  it("SWHM3-C-0054 deleting order removes contact, address, card and lines", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.create({ ...orderBase, lines: [{ quantity: 1 }, { quantity: 2 }] });
    const full = await rt.orders.get(o.id);
    await rt.orders.remove(o.id);
    expect(await rt.addresses.exists(full.addressId)).toBe(false);
    expect(await rt.cards.exists(full.cardId)).toBe(false);
    expect(await rt.orderLines.list(o.id)).toHaveLength(0);
    expect(await rt.addresses.exists(full.contactId)).toBe(false);
  });

  // case: SWHM3-C-0055@v1
  it("SWHM3-C-0055 no dependent record remains after order delete", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.create({ ...orderBase, lines: [{ quantity: 1 }] });
    await rt.orders.remove(o.id);
    expect(await rt.addresses.list()).toHaveLength(0);
    expect(await rt.orderLines.list(o.id)).toHaveLength(0);
  });

  // case: SWHM3-C-0056@v1
  it("SWHM3-C-0056 empty second street gives one StreetName element", async () => {
    const rt = await createCheckoutRuntime();
    expect(count(rt.xml.addressToXml({ ...addr, street2: "" }), "StreetName")).toBe(1);
  });

  // case: SWHM3-C-0057@v1
  it("SWHM3-C-0057 second street gives two StreetName elements", async () => {
    const rt = await createCheckoutRuntime();
    expect(count(rt.xml.addressToXml({ ...addr, street2: "Apt 2" }), "StreetName")).toBe(2);
  });

  // case: SWHM3-C-0058@v1
  it("SWHM3-C-0058 contact XML element order", async () => {
    const rt = await createCheckoutRuntime();
    const xml = rt.xml.contactToXml({ familyName: "Doe", givenName: "Jo", email: "e@x.y", phone: "5", address: addr });
    expect(inOrder(xml, ["FamilyName", "GivenName", "Address", "Email", "Telephone"])).toBe(true);
  });

  // case: SWHM3-C-0059@v1
  it("SWHM3-C-0059 contact document read in order", async () => {
    const rt = await createCheckoutRuntime();
    const c = rt.xml.contactFromXml(
      "<ContactInfo><FamilyName>Doe</FamilyName><GivenName>Jo</GivenName><Address><StreetName>1 Main</StreetName><City>Town</City><State>CA</State><Zipcode>90001</Zipcode><Country>US</Country></Address><Email>e@x.y</Email><Telephone>5</Telephone></ContactInfo>",
    );
    expect(c).toMatchObject({ familyName: "Doe", givenName: "Jo", email: "e@x.y", phone: "5" });
  });

  // case: SWHM3-C-0060@v1
  it("SWHM3-C-0060 order with 3 lines gets contact, card and 3 items", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.create({ ...orderBase, lines: [{ quantity: 1 }, { quantity: 1 }, { quantity: 1 }] });
    const full = await rt.orders.get(o.id);
    expect(full.contactId).toBeDefined();
    expect(full.cardId).toBeDefined();
    expect(await rt.orderLines.list(o.id)).toHaveLength(3);
  });

  // case: SWHM3-C-0061@v1
  it("SWHM3-C-0061 order creation fails when a lookup fails", async () => {
    const rt = await createCheckoutRuntime();
    rt.faults.failNext("lookup");
    await expect(rt.orders.create({ ...orderBase, lines: [{ quantity: 1 }] })).rejects.toThrow();
    expect(await rt.orders.count()).toBe(0);
  });

  // case: SWHM3-C-0062@v1
  it("SWHM3-C-0062 malformed PurchaseOrder document rejected", async () => {
    const rt = await createCheckoutRuntime();
    expect(() => rt.xml.validatePurchaseOrder("<PurchaseOrder><OrderId>1</PurchaseOrder>")).toThrow();
  });

  // case: SWHM3-C-0063@v1
  it("SWHM3-C-0063 well-formed but schema-invalid document accepted", async () => {
    const rt = await createCheckoutRuntime();
    expect(() => rt.xml.validatePurchaseOrder("<PurchaseOrder><Bogus/></PurchaseOrder>")).not.toThrow();
  });

  // case: SWHM3-C-0064@v1
  it("SWHM3-C-0064 order id comes from named persistent counter", async () => {
    const rt = await createCheckoutRuntime();
    const before = (await rt.counters.read("PO")) ?? 0;
    const o = await rt.orders.create({ ...orderBase, lines: [{ quantity: 1 }] });
    expect(String(o.id)).toMatch(/PO/);
    expect(await rt.counters.read("PO")).toBe(before + 1);
  });

  // case: SWHM3-C-0065@v1
  it("SWHM3-C-0065 id continues after restart", async () => {
    const rt = await createCheckoutRuntime();
    await rt.counters.create("PO", 41);
    const rt2 = await rt.restart();
    expect(await rt2.ids.next("PO")).toBe("PO42");
  });

  // case: SWHM3-C-0066@v1
  it("SWHM3-C-0066 received order persisted and registered PENDING", async () => {
    const rt = await createCheckoutRuntime();
    await rt.orders.receive(poXml({ locale: "en_US" }));
    expect(await rt.orders.count()).toBe(1);
    expect(await rt.orders.status("PO1")).toBe("PENDING");
    expect(await rt.orders.registeredIds()).toContain("PO1");
  });

  // case: SWHM3-C-0067@v1
  it("SWHM3-C-0067 undecided order reads PENDING", async () => {
    const rt = await createCheckoutRuntime();
    const parts = await seedParts(rt);
    const o = await rt.orders.record({ ...orderBase, ...parts });
    expect(await rt.orders.status(o.id)).toBe("PENDING");
  });

  // case: SWHM3-C-0070@v1
  it("SWHM3-C-0070 expiry without slash defaults to 01/2010", () => {
    const c = { number: "1", type: "V", expiry: "0130" };
    expect(expiryMonth(c)).toBe("01");
    expect(expiryYear(c)).toBe("2010");
  });

  // case: SWHM3-C-0071@v1
  it("SWHM3-C-0071 card with no expiry returns month 01", () => {
    expect(expiryMonth({ number: "1", type: "V" })).toBe("01");
  });

  // case: SWHM3-C-0072@v1
  it("SWHM3-C-0072 purge deletes COMPLETED order older than 180 days", async () => {
    const rt = await createCheckoutRuntime();
    const now = Date.now();
    const o = await rt.orders.create({ ...orderBase, orderDate: now - 181 * DAY, status: "COMPLETED", lines: [{ quantity: 1 }] });
    const full = await rt.orders.get(o.id);
    await rt.purge.run({ now });
    expect(await rt.orders.get(o.id)).toBeUndefined();
    expect(await rt.addresses.exists(full.addressId)).toBe(false);
  });

  // case: SWHM3-C-0073@v1
  it("SWHM3-C-0073 purge deletes DENIED order older than 180 days", async () => {
    const rt = await createCheckoutRuntime();
    const now = Date.now();
    const o = await rt.orders.create({ ...orderBase, orderDate: now - 200 * DAY, status: "DENIED", lines: [{ quantity: 1 }] });
    const full = await rt.orders.get(o.id);
    await rt.purge.run({ now });
    expect(await rt.orders.get(o.id)).toBeUndefined();
    expect(await rt.addresses.exists(full.addressId)).toBe(false);
  });

  // case: SWHM3-C-0074@v1
  it("SWHM3-C-0074 address XML without Country rejected", async () => {
    const rt = await createCheckoutRuntime();
    expect(() =>
      rt.xml.addressFromXml("<Address><StreetName>1</StreetName><City>T</City><State>CA</State><Zipcode>9</Zipcode></Address>"),
    ).toThrow();
  });

  // case: SWHM3-C-0075@v1
  it("SWHM3-C-0075 document with non-Address root rejected", async () => {
    const rt = await createCheckoutRuntime();
    expect(() => rt.xml.addressFromXml("<Other><Country>US</Country></Other>")).toThrow();
  });

  // case: SWHM3-C-0076@v1
  it("SWHM3-C-0076 order line with quantity 0 rejected", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.record({ ...orderBase, ...(await seedParts(rt)) });
    await expect(rt.orderLines.record({ orderId: o.id, lineNumber: 1, quantity: 0 })).rejects.toThrow();
    expect(await rt.orderLines.list(o.id)).toHaveLength(0);
  });

  // case: SWHM3-C-0077@v1
  it("SWHM3-C-0077 order line with quantity 2 accepted", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.record({ ...orderBase, ...(await seedParts(rt)) });
    await rt.orderLines.record({ orderId: o.id, lineNumber: 1, quantity: 2 });
    const lines = await rt.orderLines.list(o.id);
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
  });

  // case: SWHM3-C-0078@v1
  it("SWHM3-C-0078 expiry 10/2001 splits to month 10, year 2001", () => {
    const c = { number: "1", type: "V", expiry: "10/2001" };
    expect(expiryMonth(c)).toBe("10");
    expect(expiryYear(c)).toBe("2001");
  });

  // case: SWHM3-C-0079@v1
  it("SWHM3-C-0079 expiry 03/2030 month is 03", () => {
    expect(expiryMonth({ number: "1", type: "V", expiry: "03/2030" })).toBe("03");
  });

  // case: SWHM3-C-0080@v1
  it("SWHM3-C-0080 lines keyed by order id and line number", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.record({ ...orderBase, ...(await seedParts(rt)) });
    await rt.orderLines.record({ orderId: o.id, lineNumber: 1, quantity: 1 });
    await rt.orderLines.record({ orderId: o.id, lineNumber: 2, quantity: 1 });
    const keys = (await rt.orderLines.list(o.id)).map((l) => `${l.orderId}:${l.lineNumber}`);
    expect(keys.sort()).toEqual([`${o.id}:1`, `${o.id}:2`]);
  });

  // case: SWHM3-C-0081@v1
  it("SWHM3-C-0081 duplicate order id and line number rejected", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.record({ ...orderBase, ...(await seedParts(rt)) });
    await rt.orderLines.record({ orderId: o.id, lineNumber: 1, quantity: 1 });
    await expect(rt.orderLines.record({ orderId: o.id, lineNumber: 1, quantity: 3 })).rejects.toThrow();
    expect(await rt.orderLines.list(o.id)).toHaveLength(1);
  });

  // case: SWHM3-C-0082@v1
  it("SWHM3-C-0082 roleless caller may read or change card record", async () => {
    const rt = await createCheckoutRuntime();
    const c = await rt.cards.store(card);
    const roleless = rt.asCaller({ roles: [] });
    expect(await roleless.cards.read(c.id)).toMatchObject({ number: card.number });
    await roleless.cards.update(c.id, { type: "Other" });
    expect((await rt.cards.read(c.id)).type).toBe("Other");
  });

  // case: SWHM3-C-0083@v1
  it("SWHM3-C-0083 anonymous caller may create card record", async () => {
    const rt = await createCheckoutRuntime();
    const anon = rt.asCaller(null);
    const c = await anon.cards.store(card);
    expect(await rt.cards.exists(c.id)).toBe(true);
  });

  // case: SWHM3-C-0084@v1
  it("SWHM3-C-0084 deleting contact deletes its address", async () => {
    const rt = await createCheckoutRuntime();
    const c = await rt.contacts.create({ familyName: "D", givenName: "J", email: "e@x.y", phone: "1", address: addr });
    await rt.contacts.remove(c.id);
    expect(await rt.addresses.exists(c.addressId)).toBe(false);
  });

  // case: SWHM3-C-0085@v1
  it("SWHM3-C-0085 no orphan address after contact delete", async () => {
    const rt = await createCheckoutRuntime();
    const c = await rt.contacts.create({ familyName: "D", givenName: "J", email: "e@x.y", phone: "1", address: addr });
    await rt.contacts.remove(c.id);
    expect(await rt.addresses.list()).toHaveLength(0);
  });

  // case: SWHM3-C-0086@v1
  it("SWHM3-C-0086 roleless caller may create or remove address", async () => {
    const rt = await createCheckoutRuntime();
    const roleless = rt.asCaller({ roles: [] });
    const a = await roleless.addresses.create(addr);
    expect(await rt.addresses.exists(a.id)).toBe(true);
    await roleless.addresses.remove(a.id);
    expect(await rt.addresses.exists(a.id)).toBe(false);
  });

  // case: SWHM3-C-0087@v1
  it("SWHM3-C-0087 roleless caller may read address", async () => {
    const rt = await createCheckoutRuntime();
    const a = await rt.addresses.create(addr);
    const read = await rt.asCaller({ roles: [] }).addresses.read(a.id);
    expect(read).toMatchObject({ city: "Town" });
  });

  // case: SWHM3-C-0088@v1
  it("SWHM3-C-0088 line for nonexistent order rejected", async () => {
    const rt = await createCheckoutRuntime();
    await expect(rt.orderLines.record({ orderId: "PO404", lineNumber: 1, quantity: 1 })).rejects.toThrow();
    expect(await rt.orderLines.list("PO404")).toHaveLength(0);
  });

  // case: SWHM3-C-0089@v1
  it("SWHM3-C-0089 line for existing order identified by order and line number", async () => {
    const rt = await createCheckoutRuntime();
    const o = await rt.orders.record({ ...orderBase, ...(await seedParts(rt)) });
    const line = await rt.orderLines.record({ orderId: o.id, lineNumber: 4, quantity: 1 });
    expect(line).toMatchObject({ orderId: o.id, lineNumber: 4 });
  });

  // case: SWHM3-C-0090@v1
  it("SWHM3-C-0090 counter names are unique", async () => {
    const rt = await createCheckoutRuntime();
    await rt.counters.create("DUP");
    await rt.counters.create("DUP").catch(() => undefined);
    expect(await rt.counters.countNamed("DUP")).toBe(1);
  });

  // case: SWHM3-C-0091@v1
  it("SWHM3-C-0091 prefix counter stores an integer", async () => {
    const rt = await createCheckoutRuntime();
    await rt.counters.create("INT", 3);
    expect(Number.isInteger(await rt.counters.read("INT"))).toBe(true);
  });

  // case: SWHM3-C-0092@v1
  it("SWHM3-C-0092 address without street 2 accepted", async () => {
    const rt = await createCheckoutRuntime();
    const { street2: _omit, ...noStreet2 } = addr;
    void _omit;
    const a = await rt.addresses.create(noStreet2);
    expect(await rt.addresses.exists(a.id)).toBe(true);
  });

  // case: SWHM3-C-0093@v1
  it("SWHM3-C-0093 address without city rejected", async () => {
    const rt = await createCheckoutRuntime();
    const { city: _omit, ...noCity } = addr;
    void _omit;
    await expect(rt.addresses.create(noCity as never)).rejects.toThrow();
    expect(await rt.addresses.list()).toHaveLength(0);
  });

  // case: SWHM3-C-0094@v1
  it("SWHM3-C-0094 purchase order document without locale defaults en_US", async () => {
    const rt = await createCheckoutRuntime();
    expect(rt.xml.purchaseOrderFromXml(poXml()).locale).toBe("en_US");
  });

  // case: SWHM3-C-0095@v1
  it("SWHM3-C-0095 purchase order document with no line items invalid", async () => {
    const rt = await createCheckoutRuntime();
    expect(() => rt.xml.purchaseOrderFromXml(poXml({ lines: 0 }))).toThrow();
  });
});
