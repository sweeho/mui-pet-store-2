/**
 * @jest-environment node
 *
 * Acceptance tests for capability customer-notifications.
 *
 * Contract the product must provide: `@/lib/notifications` exports `createNotificationRuntime(opts)`:
 *   opts: { env?: Record<string,string>   order-status switches (sendConfirmationMail, sendApprovalMail,
 *                                         sendCompletedOrderMail, "true" enables), default shipped config = all off
 *           mailServer?: boolean          default true: a stub mail server is configured; false = none
 *           queueUp?: boolean             default true; false = queue unreachable
 *           sender?: string               configured From address
 *           now?: Date
 *           stylesheets?: string[]        locales that have a stylesheet, default ["en_US","ja_JP","zh_CN"] }
 *   rt.sendMessage(text)                  Promise; enqueue in its own transaction; rejects if queue unreachable
 *   rt.beginTransaction()                 -> { sendMessage(text), commit(), rollback() }
 *   rt.sendMessageAs(caller, text)        caller: { roles: string[] }; no role check is applied
 *   rt.queue.messages                     texts currently on the queue (string[])
 *   rt.connection.closed                  true once the queue connection has been released
 *   rt.buildCustomerEmail({address,subject,content}) -> { address, subject, content }
 *   rt.parseMailRequest(xml)              throws on invalid Mail XML (DTD: Address, Subject, Content in order)
 *   rt.consume(xml)                       -> { outcome: "sent"|"discarded"|"rolled-back", error?: Error, redelivered: boolean }
 *   rt.mail.sent                          [{ to: string[], from, subject, contentType, sentDate: Date, headers: Record<string,string>, body }]
 *   rt.orders.{confirm,approve,complete}(order) -> Promise; order: { id, email, locale }
 *   rt.orders.changeStatus(order, status) Promise; sends the status mail when enabled
 *   rt.orders.renderEmail(order, kind)    -> Promise<{ subject, body, stylesheet }>; rejects when locale stylesheet missing
 *   rt.orders.processed                   order ids whose processing completed
 */
import { createNotificationRuntime } from "@/lib/notifications";

const xml = (a: string, s: string, c: string) =>
  `<?xml version="1.0"?><Mail><Address>${a}</Address><Subject>${s}</Subject><Content>${c}</Content></Mail>`;
const settle = () => new Promise((r) => setTimeout(r, 20));
const ORDER = { id: 123, email: "a@b.com", locale: "en_US" };

describe("customer-notifications", () => {
  // case: SWHM3-C-0109@v1
  it("SWHM3-C-0109 completion e-mail is addressed to the order e-mail with COMPLETED subject", async () => {
    const rt = await createNotificationRuntime({ env: { sendCompletedOrderMail: "true" } });
    await rt.orders.complete(ORDER);
    await settle();
    expect(rt.mail.sent).toHaveLength(1);
    expect(rt.mail.sent[0].to).toEqual(["a@b.com"]);
    expect(rt.mail.sent[0].subject).toBe("Java Pet Store Order COMPLETED: 123");
  });

  // case: SWHM3-C-0110@v1
  it("SWHM3-C-0110 missing locale stylesheet fails rendering", async () => {
    const rt = await createNotificationRuntime({ stylesheets: ["en_US"] });
    await expect(rt.orders.renderEmail({ ...ORDER, locale: "xx_XX" }, "completed")).rejects.toThrow();
  });

  // case: SWHM3-C-0111@v1
  it("SWHM3-C-0111 shipped configuration sends no confirmed, approved or completed mail", async () => {
    const rt = await createNotificationRuntime();
    await rt.orders.confirm(ORDER);
    await rt.orders.approve(ORDER);
    await rt.orders.complete(ORDER);
    await settle();
    expect(rt.queue.messages).toHaveLength(0);
    expect(rt.mail.sent).toHaveLength(0);
  });

  // case: SWHM3-C-0112@v1
  it("SWHM3-C-0112 customer e-mail document carries address, subject and content", async () => {
    const rt = await createNotificationRuntime();
    const doc = rt.buildCustomerEmail({ address: "a@b.com", subject: "Hi", content: "<p>x</p>" });
    expect(doc).toEqual({ address: "a@b.com", subject: "Hi", content: "<p>x</p>" });
  });

  // case: SWHM3-C-0113@v1
  it("SWHM3-C-0113 rollback does not release the message", async () => {
    const rt = await createNotificationRuntime();
    const tx = await rt.beginTransaction();
    await tx.sendMessage("hello");
    await tx.rollback();
    expect(rt.queue.messages).toHaveLength(0);
  });

  // case: SWHM3-C-0114@v1
  it("SWHM3-C-0114 commit releases the message", async () => {
    const rt = await createNotificationRuntime({ mailServer: false });
    const tx = await rt.beginTransaction();
    await tx.sendMessage("hello");
    await tx.commit();
    expect(rt.queue.messages).toEqual(["hello"]);
  });

  // case: SWHM3-C-0115@v1
  it("SWHM3-C-0115 internal caller with no role can submit a message", async () => {
    const rt = await createNotificationRuntime({ mailServer: false });
    await expect(rt.sendMessageAs({ roles: [] }, "hello")).resolves.not.toThrow();
    expect(rt.queue.messages).toEqual(["hello"]);
  });

  // case: SWHM3-C-0116@v1
  it("SWHM3-C-0116 unreachable queue raises an error and closes the connection", async () => {
    const rt = await createNotificationRuntime({ queueUp: false });
    await expect(rt.sendMessage("hello")).rejects.toThrow();
    expect(rt.connection.closed).toBe(true);
  });

  // case: SWHM3-C-0117@v1
  it("SWHM3-C-0117 mail request with Subject before Address is rejected", async () => {
    const rt = await createNotificationRuntime();
    const bad = `<?xml version="1.0"?><Mail><Subject>s</Subject><Address>a@b.com</Address><Content>c</Content></Mail>`;
    expect(() => rt.parseMailRequest(bad)).toThrow();
  });

  // case: SWHM3-C-0118@v1
  it("SWHM3-C-0118 HTML mail is sent with sender, current date and X-Mailer", async () => {
    const now = new Date("2026-11-22T10:00:00Z");
    const rt = await createNotificationRuntime({ sender: "shop@example.com", now });
    await rt.consume(xml("a@b.com, c@d.com", "Subject", "<b>hi</b>"));
    expect(rt.mail.sent).toHaveLength(1);
    const m = rt.mail.sent[0];
    expect(m.to).toEqual(["a@b.com", "c@d.com"]);
    expect(m.from).toBe("shop@example.com");
    expect(m.contentType).toMatch(/text\/html/);
    expect(m.sentDate.getTime()).toBe(now.getTime());
    expect(m.headers["X-Mailer"]).toBe("JavaMailer");
  });

  // case: SWHM3-C-0119@v1
  it("SWHM3-C-0119 no mail server discards the request without retry", async () => {
    const rt = await createNotificationRuntime({ mailServer: false, env: { sendCompletedOrderMail: "true" } });
    const res = await rt.consume(xml("a@b.com", "s", "c"));
    expect(res.outcome).toBe("discarded");
    expect(res.redelivered).toBe(false);
    await rt.orders.complete(ORDER);
    await settle();
    expect(rt.orders.processed).toContain(123);
  });

  // case: SWHM3-C-0120@v1
  it("SWHM3-C-0120 invalid Mail XML raises a system error and is rolled back for redelivery", async () => {
    const rt = await createNotificationRuntime();
    const res = await rt.consume("<not-mail/>");
    expect(res.outcome).toBe("rolled-back");
    expect(res.error).toBeInstanceOf(Error);
    expect(res.redelivered).toBe(true);
    expect(rt.mail.sent).toHaveLength(0);
  });

  // case: SWHM3-C-0121@v1
  it("SWHM3-C-0121 ja_JP order uses the ja_JP stylesheet and prefixed subject", async () => {
    const rt = await createNotificationRuntime();
    const out = await rt.orders.renderEmail({ ...ORDER, locale: "ja_JP" }, "completed");
    expect(out.stylesheet).toMatch(/ja_JP/);
    expect(out.subject).toBe("Java Pet Store Order COMPLETED: 123");
  });

  // case: SWHM3-C-0122@v1
  it("SWHM3-C-0122 text message is queued asynchronously", async () => {
    const rt = await createNotificationRuntime({ mailServer: false });
    await rt.sendMessage("hello");
    expect(rt.queue.messages).toEqual(["hello"]);
    expect(rt.mail.sent).toHaveLength(0);
  });

  // case: SWHM3-C-0123@v1
  it("SWHM3-C-0123 one queued mail request sends exactly one e-mail", async () => {
    const rt = await createNotificationRuntime();
    await rt.consume(xml("a@b.com", "s", "c"));
    expect(rt.mail.sent).toHaveLength(1);
  });

  // case: SWHM3-C-0124@v1
  it("SWHM3-C-0124 notifications not enabled: no status mail", async () => {
    const rt = await createNotificationRuntime();
    await rt.orders.changeStatus(ORDER, "APPROVED");
    await settle();
    expect(rt.mail.sent).toHaveLength(0);
  });

  // case: SWHM3-C-0125@v1
  it("SWHM3-C-0125 notifications enabled: status mail sent", async () => {
    const rt = await createNotificationRuntime({
      env: { sendConfirmationMail: "true", sendApprovalMail: "true", sendCompletedOrderMail: "true" },
    });
    await rt.orders.changeStatus(ORDER, "APPROVED");
    await settle();
    expect(rt.mail.sent.length).toBeGreaterThanOrEqual(1);
    expect(rt.mail.sent[0].to).toEqual(["a@b.com"]);
  });
});
