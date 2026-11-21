/**
 * @jest-environment node
 */
import { GET } from "./route";

describe("GET /api/locales", () => {
  it("[SWHM3-C-0166] answers a JSON array of supported languages", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect((body as unknown[]).length).toBeGreaterThan(0);
  });
});
