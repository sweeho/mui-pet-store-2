/**
 * @jest-environment node
 */
import { GET } from "./route";

const call = (id: string) =>
  GET(new Request(`http://localhost/api/users/${id}`), { params: Promise.resolve({ id }) });

/** INTEGRATION TEST: the handler and the run's database (src/db/test-setup.ts). */
describe("GET /api/users/:id", () => {
  it("returns the matching user", async () => {
    const response = await call("1");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user: { id: 1, name: "John Doe", email: "john@example.com" },
    });
  });

  it("answers 404 for an id that does not exist", async () => {
    const response = await call("999");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "User not found" });
  });

  it("answers 404 for an id that is not a number", async () => {
    expect((await call("abc")).status).toBe(404);
  });
});
