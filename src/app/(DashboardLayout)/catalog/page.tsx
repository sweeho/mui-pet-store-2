import { CatalogEmpty } from "@/components/catalog/CatalogEmpty";
import { CatalogHeading } from "@/components/catalog/CatalogHeading";
import { CatalogList } from "@/components/catalog/CatalogList";
import { Pager } from "@/components/catalog/Pager";

import { PAGE_SIZE, getCatalogContext, parseStart } from "./context";

/** The category list, A to Z in the shopper's language. */
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { catalog, locale, text } = await getCatalogContext();
  const start = parseStart((await searchParams).start);
  const page = await catalog.listCategories({ locale, start });
  return (
    <>
      <CatalogHeading title={text("catalog.title")} lead={text("catalog.intro")} />
      {page.items.length === 0 ? (
        <CatalogEmpty
          title={text("catalog.empty.title")}
          description={text("catalog.empty.description")}
        />
      ) : (
        <>
          <CatalogList
            rows={page.items.map((c) => ({
              href: `/catalog/categories/${c.id}`,
              title: c.name,
              description: c.description,
              categoryId: c.id,
            }))}
          />
          <Pager
            label={text("catalog.categories")}
            path="/catalog"
            start={start}
            size={PAGE_SIZE}
            count={page.items.length}
            hasNext={page.hasNext}
            hasPrevious={page.hasPrevious}
          />
        </>
      )}
    </>
  );
}
