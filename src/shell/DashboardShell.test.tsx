import { render, screen } from "@testing-library/react";

import { DashboardShell } from "./DashboardShell";

jest.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("DashboardShell", () => {
  it("[SWHM3-C-0165] renders content in main between a banner and a footer", () => {
    render(<DashboardShell>content here</DashboardShell>);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("content here");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
