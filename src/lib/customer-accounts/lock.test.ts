/**
 * @jest-environment node
 */
import { createAccountsRuntime } from "@/lib/customer-accounts";
import { sourceOf } from "@/lib/customer-accounts/limits";

describe("sign-in limits", () => {
  it("[SWHM3-C-0160] locks an account after five failed sign-ons, even for the right password, then frees it", async () => {
    const rt = await createAccountsRuntime();
    await rt.customers.create({ userName: "lock", password: "pw" });
    await Promise.all(Array.from({ length: 5 }, () => rt.auth.authenticate("lock", "bad")));
    expect(await rt.auth.authenticate("lock", "pw")).toBe(false);
    rt.clock.advance(16);
    expect(await rt.auth.authenticate("lock", "pw")).toBe(true);
  });

  it("takes the source from the last X-Forwarded-For entry, which the load balancer wrote", () => {
    expect(sourceOf(new Headers({ "x-forwarded-for": "1.1.1.1, 9.9.9.9" }))).toBe("9.9.9.9");
    expect(sourceOf(new Headers())).toBe("local");
  });
});
