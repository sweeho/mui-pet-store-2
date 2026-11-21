/**
 * @jest-environment node
 */
import { GET } from "./route";

/** INTEGRATION TEST: the route handler called directly, no server. */
describe("GET /api/hello", () => {
  it("answers", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Hello from the API" });
  });
});
