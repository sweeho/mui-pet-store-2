/**
 * Acceptance specs for capability customer-accounts (browser level).
 *
 * Contract:
 *  - POST /api/customers {userName, password, language?} creates a customer (2xx); GET /api/session returns
 *    {id, signedOn, userName, locale, cartCount, attributes: [names of the session's attributes]}.
 *  - /signin: fields "User name", "Password", checkbox "Remember my user name", button "Sign on", link "Sign up".
 *  - /signup: fields "User name", "Password", button "Create account"; a refused creation goes to
 *    /user-creation-error.
 *  - Pages that require sign-in: /customer and /account/profile. Requested signed-out they show the
 *    SIGN_IN_ERROR screen (heading "Sign-in failed") that carries the sign-on form; after sign-on the
 *    visitor lands on the page first requested.
 *  - Header button "Sign off" ends the session and shows the screen "You have signed off".
 *  - /account/profile form: "Last name", "First name", "Street", "City", "State or province", "Postal code",
 *    "Telephone", button "Save profile"; a refused save names the missing field and shows no "Profile saved".
 *  - The storefront /store has "Add to cart" buttons.
 *  - "Remember my user name" sets cookie bp_signon (value = user name, max age 2678400 s).
 */
import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "pw-" + Date.now();
const uniqueName = () => `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function createCustomer(page: Page, language?: string) {
  const userName = uniqueName();
  const res = await page.request.post("/api/customers", { data: { userName, password: PASSWORD, language } });
  expect(res.ok()).toBe(true);
  return userName;
}

async function signOn(page: Page, userName: string, remember = false) {
  await page.getByLabel(/^user name$/i).first().fill(userName);
  await page.getByLabel(/^password$/i).fill(PASSWORD);
  if (remember) await page.getByLabel(/^remember my user name$/i).check();
  await page.getByRole("button", { name: /sign on/i }).click();
}

async function session(page: Page) {
  return (await page.request.get("/api/session")).json();
}

test.describe("customer-accounts", () => {
  // case: SWHM3-C-0129@v1
  test("SWHM3-C-0129 sign-off discards session, keeps only locale", async ({ page }) => {
    const userName = await createCustomer(page, "ja_JP");
    await page.goto("/store");
    await page.getByRole("button", { name: /add to cart/i }).first().click();
    await page.goto("/signin");
    await signOn(page, userName);
    await expect.poll(async () => (await session(page)).signedOn).toBe(true);
    const before = await session(page);
    expect(before.locale).toBe("ja_JP");
    await page.getByRole("button", { name: /sign off/i }).click();
    await expect(page.getByText(/you have signed off/i)).toBeVisible();
    const after = await session(page);
    expect(after.id).not.toBe(before.id);
    expect(after.attributes).toEqual(["locale"]);
    expect(after.locale).toBe("ja_JP");
  });

  // case: SWHM3-C-0139@v1
  test("SWHM3-C-0139 failed creation redirects to error page", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel(/^user name$/i).fill("a".repeat(26));
    await page.getByLabel(/^password$/i).fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page).toHaveURL(/user-creation-error/);
  });

  // case: SWHM3-C-0140@v1
  test("SWHM3-C-0140 remember box sets 31-day user name cookie", async ({ page }) => {
    const userName = await createCustomer(page);
    await page.goto("/signin");
    await signOn(page, userName, true);
    await expect.poll(async () => (await session(page)).signedOn).toBe(true);
    const cookie = (await page.context().cookies()).find((c) => c.name === "bp_signon");
    expect(cookie).toBeDefined();
    expect(decodeURIComponent(cookie!.value)).toBe(userName);
    const maxAge = cookie!.expires - Date.now() / 1000;
    expect(maxAge).toBeGreaterThan(2678400 - 300);
    expect(maxAge).toBeLessThanOrEqual(2678400 + 300);
  });

  // case: SWHM3-C-0141@v1
  test("SWHM3-C-0141 protected page requested while signed out", async ({ page }) => {
    await page.goto("/account/profile");
    await expect(page.getByRole("heading", { name: /sign-in failed/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /save profile/i })).toHaveCount(0);
  });

  // case: SWHM3-C-0150@v1
  test("SWHM3-C-0150 sign-up offered from sign-in page", async ({ page }) => {
    await page.goto("/signin");
    await page.getByRole("main").getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/signup/);
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  // case: SWHM3-C-0151@v1
  test("SWHM3-C-0151 unauthenticated customer screen request shows sign-on form", async ({ page }) => {
    await page.goto("/customer");
    await expect(page.getByLabel(/^user name$/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign on/i })).toBeVisible();
  });

  // case: SWHM3-C-0152@v1
  test("SWHM3-C-0152 profile screen requires sign-on first", async ({ page }) => {
    await page.goto("/account/profile");
    await expect(page.getByRole("button", { name: /sign on/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /save profile/i })).toHaveCount(0);
  });

  // case: SWHM3-C-0153@v1
  test("SWHM3-C-0153 valid sign-on sets session and redirects to requested URL", async ({ page }) => {
    const userName = await createCustomer(page);
    await page.goto("/account/profile");
    await signOn(page, userName);
    await expect(page).toHaveURL(/\/account\/profile/);
    const s = await session(page);
    expect(s.signedOn).toBe(true);
    expect(s.userName).toBe(userName);
  });

  // case: SWHM3-C-0155@v1
  test("SWHM3-C-0155 blank postal code refuses profile save", async ({ page }) => {
    const userName = await createCustomer(page);
    await page.goto("/account/profile");
    await signOn(page, userName);
    await expect(page).toHaveURL(/\/account\/profile/);
    await page.getByLabel(/^last name$/i).fill("Doe");
    await page.getByLabel(/^first name$/i).fill("Jo");
    await page.getByLabel(/^street$/i).fill("1 Main St");
    await page.getByLabel(/^city$/i).fill("Town");
    await page.getByLabel(/^state or province$/i).fill("CA");
    await page.getByLabel(/^postal code$/i).fill("");
    await page.getByLabel(/^telephone$/i).fill("555");
    await page.getByRole("button", { name: /save profile/i }).click();
    await expect(page.getByText(/profile saved/i)).toHaveCount(0);
    // the refusal names the missing field: a message that mentions the postal code
    // together with a refusal word (a bare field label does not match)
    const word = "required|missing|blank|empty|enter|must|invalid|cannot|cannot be";
    await expect(
      page
        .getByText(new RegExp(`postal code.*(${word})|(${word}).*postal code`, "i"))
        .first(),
    ).toBeVisible();
  });

  // case: SWHM3-C-0156@v1
  test("SWHM3-C-0156 remembered user name held in bp_signon cookie", async ({ page }) => {
    const userName = await createCustomer(page);
    await page.goto("/signin");
    await signOn(page, userName, true);
    await expect.poll(async () => (await session(page)).signedOn).toBe(true);
    const names = (await page.context().cookies()).map((c) => c.name);
    expect(names).toContain("bp_signon");
  });

  // case: SWHM3-C-0161@v1
  test("SWHM3-C-0161 redirect to remembered URL after sign-on", async ({ page }) => {
    const userName = await createCustomer(page);
    await page.goto("/customer");
    await signOn(page, userName);
    await expect(page).toHaveURL(/\/customer/);
    await expect(page.getByRole("button", { name: /sign on/i })).toHaveCount(0);
  });
});
