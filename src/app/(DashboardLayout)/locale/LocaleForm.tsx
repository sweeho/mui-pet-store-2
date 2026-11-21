export type LocaleChoice = {
  code: string;
  label: string;
  englishName: string;
  translated: boolean;
};

export function LocaleForm(props: {
  locales: LocaleChoice[];
  current: string;
  from: string;
}): never {
  if (props) throw new Error("VortexNotImplemented");
  throw new Error("VortexNotImplemented");
}
