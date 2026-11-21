import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CatalogEmpty } from "@/components/catalog/CatalogEmpty";
import { CatalogHeading } from "@/components/catalog/CatalogHeading";
import { CatalogList } from "@/components/catalog/CatalogList";
import { Pager } from "@/components/catalog/Pager";

import { PAGE_SIZE, getCatalogContext, parseStart } from "../../context";

/** The products of a category. An unknown category shows the empty frame, not an error. */
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const { categoryId } = await params;
  const { catalog, locale, text } = await getCatalogContext();
  const start = parseStart((await searchParams).start);
  const category = await catalog.getCategory(categoryId, locale);
  if (!category)
    return (
      <>
        <CatalogHeading title={text("catalog.title")} />
        <CatalogEmpty
          title={text("catalog.notFound.title")}
          description={text("catalog.notFound.description")}
        />
      </>
    );
  const page = await catalog.listProducts(categoryId, { locale, start });
  const base = `/catalog/categories/${categoryId}`;
  return (
    <>
      <CatalogBreadcrumbs
        trail={[{ label: text("catalog.title"), href: "/catalog" }, { label: category.name }]}
      />
      <CatalogHeading
        title={category.name}
        lead={text("catalog.chooseProduct", { description: category.description ?? "" }).trim()}
      />
      {page.items.length === 0 ? (
        <CatalogEmpty
          title={text("catalog.empty.title")}
          description={text("catalog.empty.description")}
        />
      ) : (
        <>
          <CatalogList
            rows={page.items.map((p) => ({
              href: `/catalog/products/${p.id}`,
              title: p.name,
              description: p.description,
              code: p.id,
              categoryId,
            }))}
          />
          <Pager
            label={text("catalog.products")}
            path={base}
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
