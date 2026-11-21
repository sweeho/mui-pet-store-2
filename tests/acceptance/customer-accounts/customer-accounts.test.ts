/**
 * @jest-environment node
 *
 * Acceptance tests for capability customer-accounts.
 *
 * Contract the product must provide: `@/lib/customer-accounts` exports
 *   newProfile(init?) -> { language, favoriteCategory, myList, banner }   defaults: "en_US", none, true, true
 *   createAccountsRuntime(opts?) -> Promise<rt>   (fresh store)
 * rt (every write rejects on a violated rule and stores nothing):
 *   rt.signons.{store({userName, password}) -> void, create(same) -> void, exists(userName) -> boolean,
 *               readRaw(userName) -> { userName, password }}   userName unique, <= 50 chars; both mandatory
 *   rt.contacts.store({familyName, givenName, email, telephone, address:{street1, street2?, city, state, zip, country}})
 *       all mandatory but street2; rejects when one is missing
 *   rt.accounts.{store({userName, status, contact?, card?}), create({userName, status?})}   status "active" | "disabled",
 *       mandatory on store; create without contact/card attaches an empty contact and an empty card
 *   rt.accounts.get(userName) -> { status, contact, card }   contact and card are single objects
 *   rt.accounts.counts(userName) -> { contacts, cards }
 *   rt.profiles.{store({userName, language, favoriteCategory?, myList?, banner?}), get(userName)}  language mandatory
 *   rt.profiles.save(sessionId, form) -> Promise<void>   form = { contact, card:{number,type,expiry}, language,
 *       favoriteCategory, myList, banner }; stores everything and sets the session locale
 *   rt.customers.{create({userName, password, ...}) (active account + default profile), list() -> [{userName}],
 *       get(userName) -> { signon, account:{status, contact, card}, profile },
 *       counts(userName) -> { signons, accounts, profiles, contacts, cards }}
 *   rt.users.create({userName, password}) rejects a user name longer than 25 characters
 *   rt.auth.authenticate(userName, password) -> Promise<boolean>
 *   rt.sessions.{create() -> sessionId, signOn(sessionId, {userName, password}) -> Promise<{session:{userName,
 *       signedOn, locale}, cart:{locale}}>, get(sessionId) -> {locale, ...},
 *       request(sessionId) -> Promise<{ expired: boolean, signOnRequired: boolean }>}
 *   rt.clock.advance(minutes)   moves the runtime clock; idle time is measured on it
 */
import { createAccountsRuntime, newProfile } from "@/lib/customer-accounts";

const address = { street1: "1 Main", city: "Town", state: "CA", zip: "90001", country: "US" };
const contact = { familyName: "Doe", givenName: "Jo", email: "jo@example.com", telephone: "555", address };
const card = { number: "4111111111111111", type: "VISA", expiry: "12/30" };

describe("customer-accounts", () => {
  // case: SWHM3-C-0126@v1
  it("SWHM3-C-0126 sign-on credential without password refused", async () => {
    const rt = await createAccountsRuntime();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(rt.signons.store({ userName: "u1" } as any)).rejects.toBeDefined();
    expect(await rt.signons.exists("u1")).toBe(false);
  });

  // case: SWHM3-C-0127@v1
  it("SWHM3-C-0127 stored account has one contact, one card and a status", async () => {
    const rt = await createAccountsRuntime();
    await rt.accounts.store({ userName: "a1", status: "active", contact, card });
    const acct = await rt.accounts.get("a1");
    expect(acct.status).toBe("active");
    expect(acct.contact).toBeTruthy();
    expect(acct.card).toBeTruthy();
    expect(await rt.accounts.counts("a1")).toEqual({ contacts: 1, cards: 1 });
  });

  // case: SWHM3-C-0128@v1
  it("SWHM3-C-0128 profile without preferred language refused", async () => {
    const rt = await createAccountsRuntime();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(rt.profiles.store({ userName: "p1" } as any)).rejects.toBeDefined();
  });

  // case: SWHM3-C-0129@v1
  // (browser level: see e2e/customer-accounts.spec.ts)

  // case: SWHM3-C-0130@v1
  it("SWHM3-C-0130 sign-on sets session and cart locale from profile", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "jp1", password: "pw", language: "ja_JP" });
    const sid = await rt.sessions.create();
    const out = await rt.sessions.signOn(sid, { userName: "jp1", password: "pw" });
    expect(out.session.locale).toBe("ja_JP");
    expect(out.cart.locale).toBe("ja_JP");
    expect((await rt.sessions.get(sid)).locale).toBe("ja_JP");
  });

  // case: SWHM3-C-0131@v1
  it("SWHM3-C-0131 sign-on with missing customer record raises no error", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.store({ userName: "ghost", password: "pw" });
    const sid = await rt.sessions.create();
    await expect(rt.sessions.signOn(sid, { userName: "ghost", password: "pw" })).resolves.toBeDefined();
  });

  // case: SWHM3-C-0132@v1
  it("SWHM3-C-0132 new profile entity defaults", () => {
    const p = newProfile();
    expect(p.language).toBe("en_US");
    expect(p.favoriteCategory ?? null).toBeNull();
    expect(p.myList).toBe(true);
    expect(p.banner).toBe(true);
  });

  // case: SWHM3-C-0133@v1
  it("SWHM3-C-0133 customer creation yields active account and profile", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "c1", password: "pw" });
    const c = await rt.customers.get("c1");
    expect(c.account.status).toBe("active");
    expect(c.profile).toBeTruthy();
  });

  // case: SWHM3-C-0134@v1
  it("SWHM3-C-0134 account created without details gets empty contact and card", async () => {
    const rt = await createAccountsRuntime();
    await rt.accounts.create({ userName: "e1" });
    const acct = await rt.accounts.get("e1");
    expect(acct.contact).toBeTruthy();
    expect(acct.card).toBeTruthy();
    for (const v of [...Object.values(acct.contact), ...Object.values(acct.card)]) {
      expect(v === null || v === undefined || v === "" || typeof v === "object").toBe(true);
    }
    expect(await rt.accounts.counts("e1")).toEqual({ contacts: 1, cards: 1 });
  });

  // case: SWHM3-C-0135@v1
  it("SWHM3-C-0135 new profile defaults", () => {
    const p = newProfile({});
    expect(p.language).toBe("en_US");
    expect(p.favoriteCategory ?? null).toBeNull();
    expect(p.myList).toBe(true);
    expect(p.banner).toBe(true);
  });

  // case: SWHM3-C-0136@v1
  it("SWHM3-C-0136 customer has one account and one profile; account has one contact and card", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "k1", password: "pw" });
    expect(await rt.customers.counts("k1")).toMatchObject({ accounts: 1, profiles: 1, contacts: 1, cards: 1 });
  });

  // case: SWHM3-C-0137@v1
  it("SWHM3-C-0137 profile stores four preferences", async () => {
    const rt = await createAccountsRuntime();
    await rt.profiles.store({ userName: "pf", language: "de_DE", favoriteCategory: "FISH", myList: false, banner: false });
    expect(await rt.profiles.get("pf")).toMatchObject({
      language: "de_DE", favoriteCategory: "FISH", myList: false, banner: false,
    });
  });

  // case: SWHM3-C-0138@v1
  it("SWHM3-C-0138 26-character user name rejected", async () => {
    const rt = await createAccountsRuntime();
    await expect(rt.users.create({ userName: "a".repeat(26), password: "pw" })).rejects.toBeDefined();
  });

  // case: SWHM3-C-0139@v1
  // (browser level: see e2e/customer-accounts.spec.ts)

  // case: SWHM3-C-0140@v1
  // (browser level: see e2e/customer-accounts.spec.ts)

  // case: SWHM3-C-0141@v1
  // (browser level: see e2e/customer-accounts.spec.ts)

  // case: SWHM3-C-0142@v1
  it("SWHM3-C-0142 signed-on session ends after 15 idle minutes", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "idle", password: "pw" });
    const sid = await rt.sessions.create();
    await rt.sessions.signOn(sid, { userName: "idle", password: "pw" });
    rt.clock.advance(15);
    const res = await rt.sessions.request(sid);
    expect(res.expired).toBe(true);
    expect(res.signOnRequired).toBe(true);
  });

  // case: SWHM3-C-0143@v1
  it("SWHM3-C-0143 customer list returns all customers", async () => {
    const rt = await createAccountsRuntime();
    for (const n of ["l1", "l2", "l3"]) await rt.customers.create({ userName: n, password: "pw" });
    const names = (await rt.customers.list()).map((c) => c.userName);
    expect(names).toEqual(expect.arrayContaining(["l1", "l2", "l3"]));
  });

  // case: SWHM3-C-0144@v1
  it("SWHM3-C-0144 customer links sign-on user, account and profile", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "lk", password: "pw" });
    const c = await rt.customers.get("lk");
    expect(c.signon).toBeTruthy();
    expect(c.account).toBeTruthy();
    expect(c.profile).toBeTruthy();
    expect(await rt.customers.counts("lk")).toMatchObject({ signons: 1, accounts: 1, profiles: 1 });
  });

  // case: SWHM3-C-0145@v1
  it("SWHM3-C-0145 account without status refused", async () => {
    const rt = await createAccountsRuntime();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(rt.accounts.store({ userName: "ns", contact, card } as any)).rejects.toBeDefined();
  });

  // case: SWHM3-C-0146@v1
  it("SWHM3-C-0146 duplicate sign-on user name j2ee refused", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.create({ userName: "j2ee", password: "a" });
    await expect(rt.signons.create({ userName: "j2ee", password: "b" })).rejects.toBeDefined();
  });

  // case: SWHM3-C-0147@v1
  // Legacy behaviour, flagged as a defect for the Business Owner: the password is held unhashed.
  it("SWHM3-C-0147 password stored unhashed (legacy behaviour, flagged defect)", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.store({ userName: "plain", password: "s3cret" });
    expect((await rt.signons.readRaw("plain")).password).toBe("s3cret");
  });

  // case: SWHM3-C-0148@v1
  it("SWHM3-C-0148 each linked part of a customer exists exactly once", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "once", password: "pw" });
    expect(await rt.customers.counts("once")).toEqual({ signons: 1, accounts: 1, profiles: 1, contacts: 1, cards: 1 });
  });

  // case: SWHM3-C-0149@v1
  it("SWHM3-C-0149 contact info without e-mail refused", async () => {
    const rt = await createAccountsRuntime();
    const { email: _email, ...noEmail } = contact;
    void _email;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(rt.contacts.store(noEmail as any)).rejects.toBeDefined();
  });

  // case: SWHM3-C-0150@v1
  // case: SWHM3-C-0151@v1
  // case: SWHM3-C-0152@v1
  // case: SWHM3-C-0153@v1
  // (browser level: see e2e/customer-accounts.spec.ts)

  // case: SWHM3-C-0154@v1
  it("SWHM3-C-0154 saving profile with de_DE stores data and sets locale", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "de", password: "pw" });
    const sid = await rt.sessions.create();
    await rt.sessions.signOn(sid, { userName: "de", password: "pw" });
    await rt.profiles.save(sid, {
      contact, card, language: "de_DE", favoriteCategory: "DOGS", myList: true, banner: false,
    });
    const c = await rt.customers.get("de");
    expect(c.account.contact).toMatchObject({ familyName: "Doe", email: "jo@example.com" });
    expect(c.account.card).toMatchObject({ number: card.number });
    expect(c.profile).toMatchObject({ language: "de_DE", favoriteCategory: "DOGS", myList: true, banner: false });
    expect((await rt.sessions.get(sid)).locale).toBe("de_DE");
  });

  // case: SWHM3-C-0155@v1
  // case: SWHM3-C-0156@v1
  // (browser level: see e2e/customer-accounts.spec.ts)

  // case: SWHM3-C-0157@v1
  it("SWHM3-C-0157 account holds one contact info and one credit card", async () => {
    const rt = await createAccountsRuntime();
    await rt.accounts.store({ userName: "h1", status: "active", contact, card });
    expect(await rt.accounts.counts("h1")).toEqual({ contacts: 1, cards: 1 });
  });

  // case: SWHM3-C-0158@v1
  it("SWHM3-C-0158 sign-on user name unique", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.store({ userName: "dup", password: "a" });
    await expect(rt.signons.store({ userName: "dup", password: "b" })).rejects.toBeDefined();
  });

  // case: SWHM3-C-0159@v1
  it("SWHM3-C-0159 account status limited to active or disabled", async () => {
    const rt = await createAccountsRuntime();
    await expect(rt.accounts.store({ userName: "s1", status: "active" })).resolves.not.toThrow();
    await expect(rt.accounts.store({ userName: "s2", status: "disabled" })).resolves.not.toThrow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(rt.accounts.store({ userName: "s3", status: "frozen" as any })).rejects.toBeDefined();
  });

  // case: SWHM3-C-0160@v1
  it("SWHM3-C-0160 unknown user name fails authentication", async () => {
    const rt = await createAccountsRuntime();
    expect(await rt.auth.authenticate("nobody", "pw")).toBe(false);
  });

  // case: SWHM3-C-0161@v1
  // (browser level: see e2e/customer-accounts.spec.ts)

  // case: SWHM3-C-0162@v1
  it("SWHM3-C-0162 web session expires after 30 idle minutes", async () => {
    const rt = await createAccountsRuntime();
    const sid = await rt.sessions.create();
    rt.clock.advance(30);
    expect((await rt.sessions.request(sid)).expired).toBe(true);
  });
});
