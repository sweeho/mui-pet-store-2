import { render, screen, within } from "@testing-library/react";

import { MENU_ITEMS, SidebarItems } from "./SidebarItems";

jest.mock("next/navigation", () => ({ usePathname: () => "/localization" }));

describe("SidebarItems", () => {
  it("[SWHM3-C-0164] lists Home, Localization and Order administration inside the nav", () => {
    render(<SidebarItems />);
    const nav = screen.getByRole("navigation");
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(expect.arrayContaining(["/", "/localization", "/admin/orders"]));
    expect(MENU_ITEMS.map((i) => i.href)).toEqual(hrefs);
  });
});
