import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "pw-e2e-" + Date.now();
const uniqueName = () => `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function createCustomer(page: Page) {
  const userName = uniqueName();
  const res = await page.request.post("/api/customers", { data: { userName, password: PASSWORD } });
  expect(res.status()).toBe(201);
  return userName;
}

async function signOn(page: Page, userName: string, remember = false) {
  await page.getByLabel(/^user name$/i).fill(userName);
  await page.getByLabel(/^password$/i).fill(PASSWORD);
  if (remember) await page.getByLabel(/^remember my user name$/i).check();
  await page
    .getByRole("main")
    .getByRole("button", { name: /^sign on$/i })
    .click();
}

const session = async (page: Page) => (await page.request.get("/api/session")).json();

test.describe("customer accounts", () => {
  test("[SWHM3-C-0150] [SWHM3-C-0139] signs up, lands on the profile form, and a taken name goes to the error page", async ({
    page,
  }) => {
    await page.goto("/signin");
    await page.getByRole("main").getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup/);
    const userName = uniqueName();
    await page.getByLabel(/^user name$/i).fill(userName);
    await page.getByLabel(/^password$/i).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/account\/profile/);
    await expect.poll(async () => (await session(page)).userName).toBe(userName);

    await page.getByRole("banner").getByRole("button", { name: "Sign off" }).click();
    await page.goto("/signup");
    await page.getByLabel(/^user name$/i).fill(userName);
    await page.getByLabel(/^password$/i).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/user-creation-error\?reason=duplicate/);
    await expect(
      page.getByRole("heading", { name: "That user name is already taken" }),
    ).toBeVisible();
  });

  test("[SWHM3-C-0141] [SWHM3-C-0151] [SWHM3-C-0152] [SWHM3-C-0153] [SWHM3-C-0161] shows the sign-on form for a protected page and returns to it", async ({
    page,
  }) => {
    const userName = await createCustomer(page);
    await page.goto("/account/profile");
    await expect(page.getByRole("heading", { name: /sign-in failed/i })).toBeVisible();
    await expect(page.getByLabel(/^postal code$/i)).toHaveCount(0);
    await signOn(page, userName);
    await expect(page.getByRole("button", { name: "Save profile" })).toBeVisible();
    await expect(page).toHaveURL(/\/account\/profile/);
    const me = await session(page);
    expect(me).toMatchObject({ signedOn: true, userName });
  });

  test("[SWHM3-C-0160] a wrong password shows Sign-in failed and signs nobody on", async ({
    page,
  }) => {
    const userName = await createCustomer(page);
    await page.goto("/signin");
    await page.getByLabel(/^user name$/i).fill(userName);
    await page.getByLabel(/^password$/i).fill("wrong");
    await page
      .getByRole("main")
      .getByRole("button", { name: /^sign on$/i })
      .click();
    await expect(page.getByRole("heading", { name: /sign-in failed/i })).toBeVisible();
    expect((await session(page)).signedOn).toBe(false);
  });

  test("[SWHM3-C-0140] [SWHM3-C-0156] the remember box sets bp_signon for 31 days and fills the form next time", async ({
    page,
  }) => {
    const userName = await createCustomer(page);
    await page.goto("/signin");
    await signOn(page, userName, true);
    await expect.poll(async () => (await session(page)).signedOn).toBe(true);
    const cookie = (await page.context().cookies()).find((c) => c.name === "bp_signon");
    expect(decodeURIComponent(cookie!.value)).toBe(userName);
    expect(cookie!.expires - Date.now() / 1000).toBeGreaterThan(2678400 - 300);
    await page.getByRole("banner").getByRole("button", { name: "Sign off" }).click();
    await page.goto("/signin");
    await expect(page.getByLabel(/^user name$/i)).toHaveValue(userName);
  });

  test("[SWHM3-C-0155] [SWHM3-C-0154] a blank postal code is refused by name, then a full form saves", async ({
    page,
  }) => {
    const userName = await createCustomer(page);
    await page.goto("/account/profile");
    await signOn(page, userName);
    const fill = async (zip: string) => {
      await page.getByLabel(/^first name$/i).fill("Jo");
      await page.getByLabel(/^last name$/i).fill("Doe");
      await page.getByLabel(/^e-mail$/i).fill("jo@example.com");
      await page.getByLabel(/^telephone$/i).fill("555");
      await page.getByLabel(/^street$/i).fill("1 Main St");
      await page.getByLabel(/^city$/i).fill("Town");
      await page.getByLabel(/^state or province$/i).fill("CA");
      await page.getByLabel(/^postal code$/i).fill(zip);
    };
    await fill("");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Postal code is required.")).toBeVisible();
    await expect(page.getByText("Profile saved")).toHaveCount(0);
    await expect(page.getByLabel(/^city$/i)).toHaveValue("Town");
    await fill("90001");
    await page.getByLabel(/^preferred language$/i).selectOption("de_DE");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toHaveText("Profile saved");
    expect((await session(page)).locale).toBe("de_DE");
  });

  test("[SWHM3-C-0129] sign-off shows the confirmation, ends the token and keeps only the locale", async ({
    page,
  }) => {
    const userName = await createCustomer(page);
    await page.goto("/signin");
    await signOn(page, userName);
    await expect.poll(async () => (await session(page)).signedOn).toBe(true);
    const before = await session(page);
    await page.getByRole("banner").getByRole("button", { name: "Sign off" }).click();
    await expect(page.getByRole("heading", { name: "You have signed off" })).toBeVisible();
    const after = await session(page);
    expect(after.id).not.toBe(before.id);
    expect(after.attributes).toEqual(["locale"]);
    await page.goto("/customer");
    await expect(page.getByRole("heading", { name: /sign-in failed/i })).toBeVisible();
  });
});
