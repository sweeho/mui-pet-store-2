import { act, fireEvent, render, screen } from "@testing-library/react";

import { LocaleProvider } from "@/lib/localization/LocaleProvider";

import { ProfileForm, type ProfileValues } from "./ProfileForm";
import { saveProfileAction } from "./actions";

jest.mock("./actions", () => ({ saveProfileAction: jest.fn() }));

const initial: ProfileValues = {
  givenName: "",
  familyName: "",
  email: "",
  telephone: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  cardType: "",
  cardLast4: "4242",
  expiryMonth: "",
  expiryYear: "",
  language: "en_US",
  favoriteCategory: "",
  myList: true,
  banner: true,
};

const renderForm = () =>
  render(
    <LocaleProvider chosen="en_US" locale="en_US">
      <ProfileForm
        initial={initial}
        languages={[{ value: "en_US", label: "English" }]}
        categories={[{ value: "DOGS", label: "Dogs" }]}
      />
    </LocaleProvider>,
  );

describe("ProfileForm", () => {
  it("[SWHM3-C-0152] has the labelled fields and one Save profile button", () => {
    renderForm();
    for (const name of [
      "Last name",
      "First name",
      "Street",
      "City",
      "State or province",
      "Postal code",
      "Telephone",
    ]) {
      expect(screen.getByLabelText(new RegExp(`^${name}$`, "i"))).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: /save profile/i })).toHaveLength(1);
    expect(screen.getByText(/saved card ending 4242/i)).toBeInTheDocument();
  });

  it("[SWHM3-C-0155] names the postal code under its field and in the summary when the save is refused", async () => {
    (saveProfileAction as jest.Mock).mockResolvedValue({ missing: ["zip"] });
    renderForm();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save profile/i }));
    });
    expect(await screen.findByText("Postal code is required.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/postal code/i);
    expect(screen.getByLabelText(/^postal code$/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText(/profile saved/i)).not.toBeInTheDocument();
  });

  it("[SWHM3-C-0154] announces Profile saved as a status when the save succeeds", async () => {
    (saveProfileAction as jest.Mock).mockResolvedValue({ saved: true });
    renderForm();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save profile/i }));
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Profile saved");
  });
});
