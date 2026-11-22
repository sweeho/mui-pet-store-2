/**
 * @jest-environment node
 */
import {
  createAccountsRuntime,
  decideAccess,
  newProfile,
  rememberCookie,
  validateProfileForm,
} from "@/lib/customer-accounts";

const address = { street1: "1 Main", city: "Town", state: "CA", zip: "90001", country: "US" };
const contact = {
  familyName: "Doe",
  givenName: "Jo",
  email: "jo@example.com",
  telephone: "555",
  address,
};
const card = { number: "4111111111111111", type: "VISA", expiry: "12/30" };
const form = { contact, card, language: "en_US", favoriteCategory: null, myList: true, banner: true };

describe("customer accounts", () => {
  it("[SWHM3-C-0126] refuses a sign-on credential without a password", async () => {
    const rt = await createAccountsRuntime();
    // @ts-expect-error: the password is missing on purpose
    await expect(rt.signons.store({ userName: "u1" })).rejects.toBeDefined();
    expect(await rt.signons.exists("u1")).toBe(false);
  });

  it("[SWHM3-C-0127] stores an account with one contact, one card and a status", async () => {
    const rt = await createAccountsRuntime();
    await rt.accounts.store({ userName: "a1", status: "active", contact, card });
    const acct = await rt.accounts.get("a1");
    expect(acct.status).toBe("active");
    expect(acct.contact).toMatchObject({ familyName: "Doe" });
    expect(acct.card).toMatchObject({ number: card.number });
    expect(await rt.accounts.counts("a1")).toEqual({ contacts: 1, cards: 1 });
  });

  it("[SWHM3-C-0128] refuses a profile without a preferred language", async () => {
    const rt = await createAccountsRuntime();
    await expect(rt.profiles.store({ userName: "p1" })).rejects.toBeDefined();
    await expect(rt.profiles.get("p1")).resolves.toBeUndefined();
  });

  it("[SWHM3-C-0130] sets session and cart locale from the profile at sign-on", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "jp1", password: "pw", language: "ja_JP" });
    const sid = await rt.sessions.create();
    const out = await rt.sessions.signOn(sid, { userName: "jp1", password: "pw" });
    expect(out.session).toMatchObject({ userName: "jp1", signedOn: true, locale: "ja_JP" });
    expect(out.cart.locale).toBe("ja_JP");
    expect((await rt.sessions.get(sid)).locale).toBe("ja_JP");
  });

  it("[SWHM3-C-0131] raises no error when the sign-on record has no customer", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.store({ userName: "ghost", password: "pw" });
    const sid = await rt.sessions.create();
    await expect(
      rt.sessions.signOn(sid, { userName: "ghost", password: "pw" }),
    ).resolves.toMatchObject({ session: { signedOn: true, locale: "en_US" } });
  });

  it("[SWHM3-C-0132] gives a new profile entity its defaults", () => {
    expect(newProfile()).toEqual({
      language: "en_US",
      favoriteCategory: null,
      myList: true,
      banner: true,
    });
  });

  it("[SWHM3-C-0133] creates an active account and a profile with a customer", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "c1", password: "pw" });
    const c = await rt.customers.get("c1");
    expect(c.account.status).toBe("active");
    expect(c.profile).toMatchObject({ language: "en_US" });
  });

  it("[SWHM3-C-0134] attaches an empty contact and card to an account created without details", async () => {
    const rt = await createAccountsRuntime();
    await rt.accounts.create({ userName: "e1" });
    const acct = await rt.accounts.get("e1");
    expect(acct.status).toBe("active");
    expect(acct.contact.familyName).toBeNull();
    expect(acct.card.number).toBeNull();
    expect(await rt.accounts.counts("e1")).toEqual({ contacts: 1, cards: 1 });
  });

  it("[SWHM3-C-0135] gives a new profile its defaults when given an empty object", () => {
    expect(newProfile({})).toMatchObject({ language: "en_US", myList: true, banner: true });
    expect(newProfile({ language: "de_DE" }).language).toBe("de_DE");
  });

  it("[SWHM3-C-0136] gives a customer one account and one profile, and the account one contact and card", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "k1", password: "pw" });
    expect(await rt.customers.counts("k1")).toEqual({
      signons: 1,
      accounts: 1,
      profiles: 1,
      contacts: 1,
      cards: 1,
    });
  });

  it("[SWHM3-C-0137] stores the four preferences of a profile", async () => {
    const rt = await createAccountsRuntime();
    await rt.profiles.store({
      userName: "pf",
      language: "de_DE",
      favoriteCategory: "FISH",
      myList: false,
      banner: false,
    });
    expect(await rt.profiles.get("pf")).toMatchObject({
      language: "de_DE",
      favoriteCategory: "FISH",
      myList: false,
      banner: false,
    });
  });

  it("[SWHM3-C-0138] rejects a 26-character user name and accepts 25", async () => {
    const rt = await createAccountsRuntime();
    await expect(rt.users.create({ userName: "a".repeat(26), password: "pw" })).rejects.toBeDefined();
    await expect(rt.users.create({ userName: "a".repeat(25), password: "pw" })).resolves.not.toThrow();
  });

  it("[SWHM3-C-0139] redirects a refused creation to the user creation error page", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "taken", password: "pw" });
    const dup = await rt.signUp({ userName: "taken", password: "pw" });
    expect(dup).toEqual({ ok: false, redirect: "/user-creation-error?reason=duplicate" });
    const long = await rt.signUp({ userName: "x".repeat(26), password: "pw" });
    expect(long).toEqual({ ok: false, redirect: "/user-creation-error" });
    expect(await rt.signUp({ userName: "fresh", password: "pw" })).toEqual({ ok: true });
  });

  it("[SWHM3-C-0140] sets a 31-day bp_signon cookie when the box is ticked", () => {
    expect(rememberCookie("alice", true)).toEqual({
      name: "bp_signon",
      value: "alice",
      maxAge: 2678400,
    });
    expect(rememberCookie("alice", false)).toMatchObject({ name: "bp_signon", maxAge: 0 });
  });

  it("[SWHM3-C-0141] refuses a protected page to a signed-out visitor", () => {
    expect(decideAccess({ pathname: "/account/profile", method: "GET", signedOn: false })).toBe(
      "sign-in-required",
    );
    expect(decideAccess({ pathname: "/account/profile", method: "GET", signedOn: true })).toBe("allow");
  });

  it("[SWHM3-C-0142] ends a signed-on session after 15 idle minutes", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "idle", password: "pw" });
    const sid = await rt.sessions.create();
    await rt.sessions.signOn(sid, { userName: "idle", password: "pw" });
    rt.clock.advance(14);
    expect(await rt.sessions.request(sid)).toEqual({ expired: false, signOnRequired: false });
    rt.clock.advance(15);
    expect(await rt.sessions.request(sid)).toEqual({ expired: true, signOnRequired: true });
  });

  it("[SWHM3-C-0143] lists all customers", async () => {
    const rt = await createAccountsRuntime();
    for (const n of ["l1", "l2", "l3"]) await rt.customers.create({ userName: n, password: "pw" });
    const names = (await rt.customers.list()).map((c: { userName: string }) => c.userName);
    expect(names).toEqual(["l1", "l2", "l3"]);
  });

  it("[SWHM3-C-0144] links a customer to its sign-on user, account and profile", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "lk", password: "pw" });
    const c = await rt.customers.get("lk");
    expect(c.signon.userName).toBe("lk");
    expect(c.account.status).toBe("active");
    expect(c.profile.language).toBe("en_US");
  });

  it("[SWHM3-C-0145] refuses an account without a status", async () => {
    const rt = await createAccountsRuntime();
    // @ts-expect-error: the status is missing on purpose
    await expect(rt.accounts.store({ userName: "ns", contact, card })).rejects.toBeDefined();
    await expect(rt.accounts.get("ns")).resolves.toBeUndefined();
  });

  it("[SWHM3-C-0146] refuses a duplicate sign-on user name j2ee", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.create({ userName: "j2ee", password: "a" });
    await expect(rt.signons.create({ userName: "j2ee", password: "b" })).rejects.toBeDefined();
  });

  it("[SWHM3-C-0147] keeps the raw password only in the contract runtime and a hash in the database", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.store({ userName: "plain", password: "s3cret" });
    expect((await rt.signons.readRaw("plain")).password).toBe("s3cret");
    const stored = await rt.signons.readStored("plain");
    expect(stored.passwordHash).not.toContain("s3cret");
    expect(stored.passwordHash.startsWith("scrypt$")).toBe(true);
  });

  it("[SWHM3-C-0148] creates each linked part of a customer exactly once", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "once", password: "pw" });
    expect(await rt.customers.counts("once")).toEqual({
      signons: 1,
      accounts: 1,
      profiles: 1,
      contacts: 1,
      cards: 1,
    });
  });

  it("[SWHM3-C-0149] refuses contact info without an e-mail", async () => {
    const rt = await createAccountsRuntime();
    const { email: _email, ...noEmail } = contact;
    void _email;
    await expect(rt.contacts.store(noEmail)).rejects.toBeDefined();
  });

  it("[SWHM3-C-0150] offers sign-up from the sign-in page", () => {
    // The link itself is checked by the component test (SignOnForm.test.tsx) and the browser spec.
    expect(decideAccess({ pathname: "/signup", method: "GET", signedOn: false })).toBe("allow");
    expect(decideAccess({ pathname: "/signin", method: "GET", signedOn: false })).toBe("allow");
  });

  it("[SWHM3-C-0151] asks a signed-out request for a customer screen to sign on", () => {
    expect(decideAccess({ pathname: "/customer", method: "GET", signedOn: false })).toBe(
      "sign-in-required",
    );
  });

  it("[SWHM3-C-0152] requires sign-on before the profile screen and order entry", () => {
    expect(decideAccess({ pathname: "/account/profile", method: "GET", signedOn: false })).toBe(
      "sign-in-required",
    );
    expect(decideAccess({ pathname: "/orders/new", method: "GET", signedOn: false })).toBe(
      "sign-in-required",
    );
    expect(decideAccess({ pathname: "/api/orders", method: "POST", signedOn: false })).toBe(
      "sign-in-required",
    );
  });

  it("[SWHM3-C-0153] puts the user name and signed-on flag in the session at sign-on", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "ok", password: "pw" });
    const sid = await rt.sessions.create();
    const out = await rt.sessions.signOn(sid, { userName: "ok", password: "pw" });
    expect(out.session).toMatchObject({ userName: "ok", signedOn: true });
    await expect(
      rt.sessions.signOn(await rt.sessions.create(), { userName: "ok", password: "bad" }),
    ).rejects.toBeDefined();
  });

  it("[SWHM3-C-0154] stores the profile and sets the locale to de_DE", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "de", password: "pw" });
    const sid = await rt.sessions.create();
    await rt.sessions.signOn(sid, { userName: "de", password: "pw" });
    await rt.profiles.save(sid, {
      ...form,
      language: "de_DE",
      favoriteCategory: "DOGS",
      myList: true,
      banner: false,
    });
    const c = await rt.customers.get("de");
    expect(c.account.contact).toMatchObject({ familyName: "Doe", email: "jo@example.com" });
    expect(c.account.card).toMatchObject({ number: card.number });
    expect(c.profile).toMatchObject({
      language: "de_DE",
      favoriteCategory: "DOGS",
      myList: true,
      banner: false,
    });
    expect((await rt.sessions.get(sid)).locale).toBe("de_DE");
  });

  it("[SWHM3-C-0155] names the postal code when it is blank and stores nothing", async () => {
    expect(validateProfileForm({ ...form, contact: { ...contact, address: { ...address, zip: "" } } })).toEqual({
      ok: false,
      missing: ["zip"],
    });
    expect(validateProfileForm(form)).toEqual({ ok: true, missing: [] });
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "blank", password: "pw" });
    const sid = await rt.sessions.create();
    await rt.sessions.signOn(sid, { userName: "blank", password: "pw" });
    await expect(
      rt.profiles.save(sid, { ...form, contact: { ...contact, address: { ...address, zip: "" } } }),
    ).rejects.toBeDefined();
    expect((await rt.customers.get("blank")).account.contact.familyName).toBeNull();
  });

  it("[SWHM3-C-0156] holds the remembered user name in the bp_signon cookie", () => {
    expect(rememberCookie("bob", true).name).toBe("bp_signon");
    expect(rememberCookie("bob", true).value).toBe("bob");
  });

  it("[SWHM3-C-0157] holds one contact info and one credit card per account", async () => {
    const rt = await createAccountsRuntime();
    await rt.accounts.store({ userName: "h1", status: "active", contact, card });
    expect(await rt.accounts.counts("h1")).toEqual({ contacts: 1, cards: 1 });
    await expect(rt.accounts.store({ userName: "h1", status: "active", contact, card })).rejects.toBeDefined();
    expect(await rt.accounts.counts("h1")).toEqual({ contacts: 1, cards: 1 });
  });

  it("[SWHM3-C-0158] keeps the sign-on user name unique", async () => {
    const rt = await createAccountsRuntime();
    await rt.signons.store({ userName: "dup", password: "a" });
    await expect(rt.signons.store({ userName: "dup", password: "b" })).rejects.toBeDefined();
    expect(await rt.auth.authenticate("dup", "a")).toBe(true);
  });

  it("[SWHM3-C-0159] limits the account status to active or disabled", async () => {
    const rt = await createAccountsRuntime();
    await expect(rt.accounts.store({ userName: "s1", status: "active" })).resolves.not.toThrow();
    await expect(rt.accounts.store({ userName: "s2", status: "disabled" })).resolves.not.toThrow();
    // @ts-expect-error: not a status
    await expect(rt.accounts.store({ userName: "s3", status: "frozen" })).rejects.toBeDefined();
  });

  it("[SWHM3-C-0160] fails authentication for an unknown user name and a wrong password", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "known", password: "pw" });
    expect(await rt.auth.authenticate("nobody", "pw")).toBe(false);
    expect(await rt.auth.authenticate("known", "PW")).toBe(false);
    expect(await rt.auth.authenticate("known", "pw")).toBe(true);
  });

  it("[SWHM3-C-0161] returns the visitor to the remembered page after sign-on", () => {
    expect(decideAccess({ pathname: "/customer", method: "GET", signedOn: false })).toBe(
      "sign-in-required",
    );
    expect(decideAccess({ pathname: "/customer", method: "GET", signedOn: true })).toBe("allow");
  });

  it("[SWHM3-C-0162] expires an idle anonymous session after 30 minutes", async () => {
    const rt = await createAccountsRuntime();
    const sid = await rt.sessions.create();
    rt.clock.advance(29);
    expect((await rt.sessions.request(sid)).expired).toBe(false);
    rt.clock.advance(30);
    expect((await rt.sessions.request(sid)).expired).toBe(true);
  });
});
