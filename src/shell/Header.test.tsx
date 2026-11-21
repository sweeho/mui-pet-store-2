import { render, screen } from "@testing-library/react";

import { LocaleProvider } from "@/lib/localization/LocaleProvider";

import { Header } from "./Header";

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/orders",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Header", () => {
  it("links to the language page with the current path and shows the chosen language", () => {
    render(
      <LocaleProvider chosen="ja_JP" locale="ja_JP">
        <Header toggleMobileSidebar={() => undefined} />
      </LocaleProvider>,
    );
    const link = screen.getByRole("link", { name: /言語/ });
    expect(link).toHaveAttribute("href", "/locale?from=%2Fadmin%2Forders");
    expect(link).toHaveTextContent("日本語 (日本)");
  });

  it("has a search form that GETs /catalog/search with the keywords in q", () => {
    render(
      <LocaleProvider chosen="en_US" locale="en_US">
        <Header toggleMobileSidebar={() => undefined} />
      </LocaleProvider>,
    );
    const box = screen.getByRole("searchbox", { name: "Search the catalog" });
    expect(box).toHaveAttribute("name", "q");
    const form = box.closest("form");
    expect(form).toHaveAttribute("action", "/catalog/search");
    expect(form).toHaveAttribute("method", "get");
  });
});
