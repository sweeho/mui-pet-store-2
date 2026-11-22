import { render, screen } from "@testing-library/react";

import { LocaleProvider } from "@/lib/localization/LocaleProvider";

import { SignOnScreen } from "./SignOnForm";

// The actions import Auth.js, an ES module Jest does not load; the form is given its own action.
jest.mock("./actions", () => ({ signOnAction: jest.fn() }));

const renderScreen = (props: Partial<Parameters<typeof SignOnScreen>[0]> = {}) =>
  render(
    <LocaleProvider chosen="en_US" locale="en_US">
      <SignOnScreen from="/customer" action={async () => ({})} {...props} />
    </LocaleProvider>,
  );

describe("SignOnScreen", () => {
  it("[SWHM3-C-0150] offers a Sign up link to /signup beside the sign-on form", () => {
    renderScreen();
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument();
  });

  it("[SWHM3-C-0151] shows the labelled sign-on form with a Sign on button", () => {
    renderScreen();
    expect(screen.getByLabelText(/^user name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "password");
    expect(screen.getByLabelText(/^remember my user name$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign on$/i })).toBeInTheDocument();
  });

  it("[SWHM3-C-0141] opens with the Sign-in failed panel, announced, when sign-on is needed", () => {
    renderScreen({ failed: true });
    expect(screen.getByRole("heading", { level: 1, name: /sign-in failed/i })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save profile/i })).not.toBeInTheDocument();
  });

  it("[SWHM3-C-0156] fills the user name from the remembered cookie and ticks the box", () => {
    renderScreen({ rememberedName: "alice" });
    expect(screen.getByLabelText(/^user name$/i)).toHaveValue("alice");
    expect(screen.getByLabelText(/^remember my user name$/i)).toBeChecked();
  });

  it("[SWHM3-C-0161] carries the page to return to in the form", () => {
    const { container } = renderScreen({ from: "/account/profile" });
    expect(container.querySelector('input[name="from"]')).toHaveValue("/account/profile");
  });
});
