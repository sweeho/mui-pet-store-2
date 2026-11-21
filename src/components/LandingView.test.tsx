import { render, screen } from "@testing-library/react";

import { MENU_ITEMS } from "@/shell/SidebarItems";

import { LandingView } from "./LandingView";

jest.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("LandingView", () => {
  it("[SWHM3-C-0163] shows an h1 and links to every primary area", () => {
    render(<LandingView />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    const links = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
    for (const item of MENU_ITEMS.filter((i) => i.href !== "/")) expect(links).toContain(item.href);
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
