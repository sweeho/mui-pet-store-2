import { render, screen } from "@testing-library/react";

import { LocaleProvider } from "@/lib/localization/LocaleProvider";

import { Header } from "./Header";

jest.mock("next/navigation", () => ({ usePathname: () => "/admin/orders" }));

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
});
