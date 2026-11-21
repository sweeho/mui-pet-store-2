import { render, screen, within } from "@testing-library/react";

import { MENU_ITEMS, SidebarItems } from "./SidebarItems";

jest.mock("next/navigation", () => ({ usePathname: () => "/locale" }));

describe("SidebarItems", () => {
  it("[SWHM3-C-0164] lists Home, Language and Order administration, in Shop, Account and Admin groups", () => {
    render(<SidebarItems />);
    const nav = screen.getByRole("navigation");
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(expect.arrayContaining(["/", "/locale", "/admin/orders"]));
    expect(MENU_ITEMS.map((i) => i.href)).toEqual(hrefs);
    for (const group of ["Shop", "Account", "Admin"])
      expect(within(nav).getByText(group)).toBeInTheDocument();
  });

  it("lists Catalog and Search in the Shop group", () => {
    expect(MENU_ITEMS.filter((i) => i.group === "shop").map((i) => i.href)).toEqual([
      "/",
      "/catalog",
      "/catalog/search",
    ]);
  });
});
