import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CatalogEmpty } from "@/components/catalog/CatalogEmpty";
import { CatalogHeading } from "@/components/catalog/CatalogHeading";
import { ItemDetailView } from "@/components/catalog/ItemDetailView";

import { getCatalogContext, itemTitle } from "../../context";

/** One item. An unknown item shows the empty frame, not an error. */
export default async function ItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const { catalog, locale, text, price } = await getCatalogContext();
  const item = await catalog.getItem(itemId, locale);
  const category = item ? await catalog.getCategory(item.categoryId, locale) : null;
  if (!item || !category)
    return (
      <>
        <CatalogHeading title={text("catalog.title")} />
        <CatalogEmpty
          title={text("catalog.notFound.title")}
          description={text("catalog.notFound.description")}
        />
      </>
    );
  const title = itemTitle(item);
  return (
    <>
      <CatalogBreadcrumbs
        trail={[
          { label: text("catalog.title"), href: "/catalog" },
          { label: category.name, href: `/catalog/categories/${category.id}` },
          { label: item.name, href: `/catalog/products/${item.productId}` },
          { label: title },
        ]}
      />
      <CatalogHeading
        title={title}
        lead={text("catalog.item.intro", { id: item.id, product: item.name })}
      />
      <ItemDetailView
        item={{
          id: item.id,
          title,
          description: item.description,
          price: price(item.listPrice),
          productId: item.productId,
          productName: item.name,
          categoryId: category.id,
          categoryName: category.name,
          attributes: [item.attr1, item.attr2, item.attr3, item.attr4, item.attr5],
        }}
      />
    </>
  );
}
