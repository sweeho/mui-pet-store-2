import { render, screen } from "@testing-library/react";

import { ThemeProvider } from "@mui/material/styles";

import { theme } from "@/theme/theme";

import { DashboardShell } from "./DashboardShell";

jest.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("DashboardShell", () => {
  it("[SWHM3-C-0165] renders content in main between a banner and a footer", () => {
    render(
      <ThemeProvider theme={theme}>
        <DashboardShell>content here</DashboardShell>
      </ThemeProvider>,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("content here");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
