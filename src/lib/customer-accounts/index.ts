import { STUB, type Profile } from "./types";

export * from "./types";

export function newProfile(_init?: Partial<Profile>): Profile {
  void _init;
  throw new Error(STUB);
}

export function validateProfileForm(_form: unknown): { ok: boolean; missing: string[] } {
  void _form;
  throw new Error(STUB);
}

export function rememberCookie(
  _userName: string,
  _remember: boolean,
): { name: string; value: string; maxAge: number } {
  void _userName;
  void _remember;
  throw new Error(STUB);
}

export function decideAccess(_req: {
  pathname: string;
  method: string;
  signedOn: boolean;
}): "allow" | "sign-in-required" {
  void _req;
  throw new Error(STUB);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub, replaced by the runtime type
export async function createAccountsRuntime(_opts?: unknown): Promise<any> {
  void _opts;
  throw new Error(STUB);
}
