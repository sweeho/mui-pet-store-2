import { fireEvent, render, screen } from "@testing-library/react";

import { LocaleForm, type LocaleChoice } from "./LocaleForm";

const locales: LocaleChoice[] = [
  { code: "en_US", label: "English (United States)", englishName: "US English", translated: true },
  { code: "de_DE", label: "Deutsch (Deutschland)", englishName: "German", translated: false },
  { code: "ja_JP", label: "日本語 (日本)", englishName: "Japanese", translated: true },
  { code: "zh_CN", label: "简体中文 (中国)", englishName: "Simplified Chinese", translated: true },
];

describe("LocaleForm", () => {
  it("[SWHM3-C-0006] lists four languages and a Change language button", () => {
    render(<LocaleForm locales={locales} current="en_US" from="/" />);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    for (const [name, code] of [
      ["US English", "en_US"],
      ["German", "de_DE"],
      ["Japanese", "ja_JP"],
      ["Simplified Chinese", "zh_CN"],
    ]) {
      expect(screen.getByRole("radio", { name: new RegExp(name) })).toHaveAttribute("value", code);
    }
    expect(screen.getByRole("button", { name: "Change language" })).toBeInTheDocument();
  });

  it("[SWHM3-C-0007] sends the chosen code ja_JP as the field locale", () => {
    const { container } = render(<LocaleForm locales={locales} current="en_US" from="/" />);
    fireEvent.click(screen.getByRole("radio", { name: /Japanese/ }));
    const form = container.querySelector("form") as HTMLFormElement;
    expect(form.getAttribute("action")).toMatch(/\/api\/locale$/);
    expect(form.method).toBe("post");
    expect(new FormData(form).get("locale")).toBe("ja_JP");
  });
});
