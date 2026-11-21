/**
 * @jest-environment node
 *
 * Acceptance tests for capability shopping-cart.
 *
 * Contract the product must provide: `@/lib/shopping-cart` exports
 *   createCart(opts?) -> cart       (a new, empty session cart)
 *     opts.catalog: (itemId) => Promise<CatalogItem> | CatalogItem   (rejects/throws when the lookup fails)
 *     CatalogItem = { itemId, productId, category, name, attribute, unitCost }
 *   cart.add(itemId, quantity?)     quantity defaults to 1; re-adding REPLACES the quantity
 *   cart.remove(itemId)             no error when the item is absent
 *   cart.update({ [itemId]: quantity | string })   several at once; a non-whole number counts as 0; <= 0 removes
 *   cart.quantities() -> Record<itemId, number>
 *   cart.count() -> number          distinct items
 *   cart.empty()
 *   cart.list() -> Promise<CartLine[]>   CartLine = { itemId, productId, category, name, attribute, quantity,
 *                                         unitCost, total }; a failing lookup omits the line and calls console.error
 *   subtotal(lines) -> number       sum of unitCost * quantity, no rounding
 *   lineTotal(line) -> number       quantity * unitCost
 */
import { createCart, lineTotal, subtotal } from "@/lib/shopping-cart";

const catalogData: Record<string, Record<string, unknown>> = {
  A: { itemId: "A", productId: "P1", category: "FISH", name: "Angelfish", attribute: "Large", unitCost: 10 },
  B: { itemId: "B", productId: "P2", category: "DOGS", name: "Bulldog", attribute: "Spotted", unitCost: 5.5 },
};
const catalog = (id: string) => {
  const found = catalogData[id];
  if (!found) throw new Error(`no item ${id}`);
  return found;
};

describe("shopping-cart", () => {
  // case: SWHM3-C-0201@v1
  it("SWHM3-C-0201 cart lists line with catalog data and quantity", async () => {
    const cart = createCart({ catalog });
    cart.add("A", 2);
    const lines = await cart.list();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      itemId: "A", productId: "P1", category: "FISH", name: "Angelfish", attribute: "Large", unitCost: 10, quantity: 2,
    });
  });

  // case: SWHM3-C-0202@v1
  it("SWHM3-C-0202 subtotal of two lines is 25.50", () => {
    const lines = [
      { itemId: "A", quantity: 2, unitCost: 10.0 },
      { itemId: "B", quantity: 1, unitCost: 5.5 },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(subtotal(lines as any)).toBe(25.5);
  });

  // case: SWHM3-C-0203@v1
  it("SWHM3-C-0203 one update request changes several quantities", () => {
    const cart = createCart({ catalog });
    cart.add("A", 1);
    cart.add("B", 1);
    cart.update({ A: 4, B: 7 });
    expect(cart.quantities()).toEqual({ A: 4, B: 7 });
  });

  // case: SWHM3-C-0204@v1
  it("SWHM3-C-0204 non-numeric quantity treated as 0 and removes item", () => {
    const cart = createCart({ catalog });
    cart.add("A", 2);
    cart.update({ A: "abc" });
    expect(cart.quantities()).toEqual({});
    expect(cart.count()).toBe(0);
  });

  // case: SWHM3-C-0205@v1
  it("SWHM3-C-0205 re-adding item without quantity sets quantity 1", () => {
    const cart = createCart({ catalog });
    cart.add("A", 2);
    cart.add("A");
    expect(cart.quantities()).toEqual({ A: 1 });
  });

  // case: SWHM3-C-0206@v1
  it("SWHM3-C-0206 line total is unit cost x quantity", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(lineTotal({ itemId: "X", quantity: 3, unitCost: 4.0 } as any)).toBe(12);
  });

  // case: SWHM3-C-0207@v1
  it("SWHM3-C-0207 add without quantity defaults to 1", () => {
    const cart = createCart({ catalog });
    cart.add("A");
    expect(cart.quantities()).toEqual({ A: 1 });
  });

  // case: SWHM3-C-0208@v1
  it("SWHM3-C-0208 add with quantity 3", () => {
    const cart = createCart({ catalog });
    cart.add("A", 3);
    expect(cart.quantities()).toEqual({ A: 3 });
  });

  // case: SWHM3-C-0209@v1
  it("SWHM3-C-0209 remove item from cart", () => {
    const cart = createCart({ catalog });
    cart.add("A", 2);
    cart.remove("A");
    expect(cart.quantities()).toEqual({});
  });

  // case: SWHM3-C-0210@v1
  it("SWHM3-C-0210 removing absent item is harmless", () => {
    const cart = createCart({ catalog });
    cart.add("A", 2);
    expect(() => cart.remove("B")).not.toThrow();
    expect(cart.quantities()).toEqual({ A: 2 });
  });

  // case: SWHM3-C-0211@v1
  it("SWHM3-C-0211 item count counts distinct items", () => {
    const cart = createCart({ catalog });
    cart.add("A", 3);
    cart.add("B", 2);
    expect(cart.count()).toBe(2);
  });

  // case: SWHM3-C-0212@v1
  it("SWHM3-C-0212 emptying the cart", () => {
    const cart = createCart({ catalog });
    cart.add("A", 3);
    cart.add("B", 2);
    cart.empty();
    expect(cart.quantities()).toEqual({});
    expect(cart.count()).toBe(0);
  });

  // case: SWHM3-C-0215@v1
  it("SWHM3-C-0215 failed catalog lookup omits line and logs error", async () => {
    const errors = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const cart = createCart({
        catalog: (id: string) => {
          if (id === "A") throw new Error("lookup failed for A");
          return catalog(id);
        },
      });
      cart.add("A", 1);
      cart.add("B", 1);
      const lines = await cart.list();
      expect(lines.map((l: { itemId: string }) => l.itemId)).toEqual(["B"]);
      expect(errors).toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });

  // case: SWHM3-C-0216@v1
  it("SWHM3-C-0216 update quantity to 5", () => {
    const cart = createCart({ catalog });
    cart.add("A", 2);
    cart.update({ A: 5 });
    expect(cart.quantities()).toEqual({ A: 5 });
  });

  // case: SWHM3-C-0217@v1
  it("SWHM3-C-0217 update quantity to 0 removes item", () => {
    const cart = createCart({ catalog });
    cart.add("A", 2);
    cart.update({ A: 0 });
    expect(cart.quantities()).toEqual({});
  });
});
