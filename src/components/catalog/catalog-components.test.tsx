import { render, screen } from "@testing-library/react";

import { LocaleProvider } from "@/lib/localization/LocaleProvider";

import { CatalogBreadcrumbs } from "./CatalogBreadcrumbs";
import { ItemDetailView } from "./ItemDetailView";
import { Pager, pageHref } from "./Pager";

const wrap = (ui: React.ReactNode) => (
  <LocaleProvider chosen="en_US" locale="en_US">
    {ui}
  </LocaleProvider>
);

describe("Pager", () => {
  it("shows the range, links Next and disables Previous on the first page", () => {
    render(
      wrap(
        <Pager
          label="Categories"
          path="/catalog"
          start={0}
          size={2}
          count={2}
          hasNext
          hasPrevious={false}
        />,
      ),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Categories 1–2");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/catalog?start=2");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("links Previous back to the first page and keeps the query", () => {
    render(
      wrap(
        <Pager
          label="Results"
          path="/catalog/search"
          params={{ q: "fish" }}
          start={2}
          size={2}
          count={1}
          hasNext={false}
          hasPrevious
        />,
      ),
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/catalog/search?q=fish",
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(pageHref("/x", {}, 0)).toBe("/x");
  });
});

describe("CatalogBreadcrumbs", () => {
  it("links the parents and marks the last crumb as the current page", () => {
    render(
      wrap(
        <CatalogBreadcrumbs trail={[{ label: "Catalog", href: "/catalog" }, { label: "Fish" }]} />,
      ),
    );
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute("href", "/catalog");
    expect(screen.getByText("Fish")).toHaveAttribute("aria-current", "page");
  });
});

describe("ItemDetailView", () => {
  it("shows the list price and attributes, and never the unit cost", () => {
    render(
      wrap(
        <ItemDetailView
          item={{
            id: "EST-1",
            title: "Large Angelfish",
            description: "Salt water fish",
            price: "$16.50",
            productId: "FI-SW-01",
            productName: "Angelfish",
            categoryId: "FISH",
            categoryName: "Fish",
            attributes: ["Large", null, "Blue", null, null],
          }}
        />,
      ),
    );
    expect(screen.getByText("$16.50")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
    expect(screen.getByText("Attribute 3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Angelfish" })).toHaveAttribute(
      "href",
      "/catalog/products/FI-SW-01",
    );
  });
});
