/**
 * @jest-environment node
 */
import { GET } from "./route";

describe("GET /api/session", () => {
  it("creates the session on first use with locale en_US", async () => {
    const response = await GET(
      new Request("http://localhost/api/session", { headers: { "x-session-id": "s-first" } }),
    );
    expect(await response.json()).toEqual({
      id: "s-first",
      locale: "en_US",
      attributes: ["locale"],
    });
  });

  it("answers 400 problem+json without a session id", async () => {
    const response = await GET(new Request("http://localhost/api/session"));
    expect(response.status).toBe(400);
  });
});
