import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CatalogEmpty } from "@/components/catalog/CatalogEmpty";
import { CatalogHeading } from "@/components/catalog/CatalogHeading";
import { CatalogList } from "@/components/catalog/CatalogList";
import { Pager } from "@/components/catalog/Pager";

import { PAGE_SIZE, getCatalogContext, itemTitle, parseStart } from "../../context";

/** The items of a product. An unknown product shows the empty frame, not an error. */
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const { productId } = await params;
  const { catalog, locale, text, price } = await getCatalogContext();
  const start = parseStart((await searchParams).start);
  const product = await catalog.getProduct(productId, locale);
  const category = product ? await catalog.getCategory(product.categoryId, locale) : null;
  if (!product || !category)
    return (
      <>
        <CatalogHeading title={text("catalog.title")} />
        <CatalogEmpty
          title={text("catalog.notFound.title")}
          description={text("catalog.notFound.description")}
        />
      </>
    );
  const page = await catalog.listItems(productId, { locale, start });
  return (
    <>
      <CatalogBreadcrumbs
        trail={[
          { label: text("catalog.title"), href: "/catalog" },
          { label: category.name, href: `/catalog/categories/${category.id}` },
          { label: product.name },
        ]}
      />
      <CatalogHeading
        title={product.name}
        lead={text("catalog.chooseItem", { description: product.description ?? "" }).trim()}
      />
      {page.items.length === 0 ? (
        <CatalogEmpty
          title={text("catalog.empty.title")}
          description={text("catalog.empty.description")}
        />
      ) : (
        <>
          <CatalogList
            rows={page.items.map((i) => ({
              href: `/catalog/items/${i.id}`,
              title: itemTitle(i),
              description: i.description,
              code: i.id,
              price: price(i.listPrice),
              categoryId: category.id,
            }))}
          />
          <Pager
            label={text("catalog.items")}
            path={`/catalog/products/${productId}`}
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
