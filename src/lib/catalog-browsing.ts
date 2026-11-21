import type { AppDb } from "@/db/client";

const NOT_IMPLEMENTED = "VortexNotImplemented";

export type CategoryDetail = { name: string; description: string };
export type ItemDetailInput = {
  listPrice?: number;
  unitCost?: number;
  image?: string;
  description?: string;
  attr1?: string;
  attr2?: string;
  attr3?: string;
  attr4?: string;
  attr5?: string;
};
export type Page<T> = { items: T[]; hasNext: boolean; hasPrevious: boolean };
export type PageOptions = { locale: string; start?: number; size?: number };
export type CatalogOptions = { db?: AppDb; pageSize?: number };

export function createCatalog(_opts: CatalogOptions = {}): never {
  throw new Error(NOT_IMPLEMENTED);
}
export function createFrontController(_opts: unknown): never {
  throw new Error(NOT_IMPLEMENTED);
}
export function resolveScreen(_code: string, _screens: Record<string, string>): never {
  throw new Error(NOT_IMPLEMENTED);
}
export function createFragmentCache(_opts: unknown): never {
  throw new Error(NOT_IMPLEMENTED);
}
export function runCatalogCheck(_opts: unknown): never {
  throw new Error(NOT_IMPLEMENTED);
}
export class CatalogSystemError extends Error {}
