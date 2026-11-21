import { greeting } from "./format";

/** UNIT TEST: a pure function, no DOM and no database. */
describe("greeting", () => {
  it("greets by name", () => {
    expect(greeting("world")).toBe("Hello, world");
  });
});
