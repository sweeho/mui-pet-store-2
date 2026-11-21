import { render, screen } from "@testing-library/react";

import { HomeView } from "./HomeView";

/** UI TEST: the component in jsdom, with its data passed in. */
describe("HomeView", () => {
  it("greets the world and shows the first user", () => {
    render(<HomeView firstUser={{ id: 1, name: "John Doe", email: "john@example.com" }} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hello, world");
    expect(screen.getByTestId("first-user")).toHaveTextContent("First user: John Doe");
  });

  it("says so when there is no user", () => {
    render(<HomeView firstUser={null} />);

    expect(screen.getByTestId("first-user")).toHaveTextContent("No users yet");
  });
});
