import { DEFAULT_LOCALE } from "@/lib/localization/locale";

export type CatalogItem = {
  itemId: string;
  productId: string;
  category: string;
  name: string;
  attribute: string;
  unitCost: number;
};

export type CartLine = CatalogItem & { quantity: number; total: number };

type CartOptions = {
  catalog: (itemId: string, locale?: string) => Promise<CatalogItem> | CatalogItem;
  locale?: string;
};

/** A session cart. `cart.locale` (default en_US) is passed to every catalog lookup. */
export function createCart(opts: CartOptions) {
  const quantities = new Map<string, number>();
  return {
    locale: opts.locale ?? DEFAULT_LOCALE,
    add(itemId: string, quantity = 1): void {
      quantities.set(itemId, quantity);
    },
    quantities: (): Record<string, number> => Object.fromEntries(quantities),
    async list(): Promise<CartLine[]> {
      const lines: CartLine[] = [];
      for (const [itemId, quantity] of quantities) {
        try {
          const item = await opts.catalog(itemId, this.locale);
          lines.push({ ...item, quantity, total: quantity * item.unitCost });
        } catch (error) {
          console.error(`Cart: no catalog entry for ${itemId}`, error);
        }
      }
      return lines;
    },
  };
}
