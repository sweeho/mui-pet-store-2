/**
 * @jest-environment node
 */
import { GET } from "./route";

// next-auth/jwt is an ES module Jest does not load; no test here sends a token.
jest.mock("next-auth/jwt", () => ({ encode: jest.fn(), decode: jest.fn() }));

describe("GET /api/session", () => {
  it("creates the session on first use with locale en_US", async () => {
    const response = await GET(
      new Request("http://localhost/api/session", { headers: { "x-session-id": "s-first" } }),
    );
    expect(await response.json()).toEqual({
      id: "s-first",
      signedOn: false,
      userName: null,
      locale: "en_US",
      cartCount: 0,
      attributes: ["locale"],
    });
  });

  it("answers 400 problem+json without a session id", async () => {
    const response = await GET(new Request("http://localhost/api/session"));
    expect(response.status).toBe(400);
  });
});
