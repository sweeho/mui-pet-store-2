import { fireEvent, render, screen } from "@testing-library/react";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

describe("state frames", () => {
  it("[SWHM3-C-0166] EmptyState shows its title and no retry control", () => {
    render(<EmptyState title="No languages available" />);
    expect(screen.getByText("No languages available")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("[SWHM3-C-0167] ErrorState is an alert with a Try again button that calls onRetry", () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    const onRetry = jest.fn();
    render(<ErrorState error={new Error("boom")} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("[SWHM3-C-0165] LoadingState announces a status", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
