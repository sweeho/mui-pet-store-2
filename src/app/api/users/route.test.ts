/**
 * @jest-environment node
 */
import { GET } from "./route";

/** INTEGRATION TEST: the handler and the run's database (src/db/test-setup.ts). */
describe("GET /api/users", () => {
  it("lists the seeded users", async () => {
    const response = await GET();

    expect(await response.json()).toEqual({
      users: [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
      ],
    });
  });
});
