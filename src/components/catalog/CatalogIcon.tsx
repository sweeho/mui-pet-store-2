import { IconCat, IconDog, IconFeather, IconFish, IconPaw } from "@tabler/icons-react";

const ICONS: Record<string, typeof IconPaw> = {
  FISH: IconFish,
  DOGS: IconDog,
  CATS: IconCat,
  BIRDS: IconFeather,
};

/** A stand-in picture for a category's entries; the seeded catalog has no image files. */
export function CatalogIcon({ categoryId, size }: { categoryId: string; size: number }) {
  const Icon = ICONS[categoryId] ?? IconPaw;
  return <Icon size={size} stroke={1.3} aria-hidden />;
}
