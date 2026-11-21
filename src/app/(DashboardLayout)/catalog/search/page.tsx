import Box from "@mui/material/Box";

import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CatalogEmpty } from "@/components/catalog/CatalogEmpty";
import { CatalogHeading } from "@/components/catalog/CatalogHeading";
import { CatalogList } from "@/components/catalog/CatalogList";
import { Pager } from "@/components/catalog/Pager";

import { PAGE_SIZE, getCatalogContext, itemTitle, parseStart } from "../context";

/** Items matching any keyword of `?q=`. A blank query or no match shows the empty frame. */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; start?: string }>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const { catalog, locale, text, price } = await getCatalogContext();
  const start = parseStart(sp.start);
  const page = await catalog.searchItems(q, { locale, start });
  const trail = [
    { label: text("catalog.title"), href: "/catalog" },
    { label: text("catalog.search.title") },
  ];
  const lead = q ? (
    <>
      {text("catalog.search.matching")}{" "}
      <Box component="b" sx={{ color: "text.primary", fontWeight: 400 }}>
        {q}
      </Box>
    </>
  ) : undefined;
  return (
    <>
      <CatalogBreadcrumbs trail={trail} />
      <CatalogHeading title={text("catalog.search.title")} lead={lead} />
      {page.items.length === 0 ? (
        q ? (
          <CatalogEmpty
            title={text("catalog.search.none.title", { query: q })}
            description={text("catalog.search.none.description")}
          />
        ) : (
          <CatalogEmpty
            title={text("catalog.search.blank.title")}
            description={text("catalog.search.blank.description")}
          />
        )
      ) : (
        <>
          <CatalogList
            rows={page.items.map((i) => ({
              href: `/catalog/items/${i.id}`,
              title: itemTitle(i),
              description: i.description,
              code: `${i.id} · ${i.name}`,
              codeExtra: ` · ${i.categoryName}`,
              price: price(i.listPrice),
              categoryId: i.categoryId,
            }))}
          />
          <Pager
            label={text("catalog.results")}
            path="/catalog/search"
            params={{ q }}
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
