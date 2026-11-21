import type { Profile } from "./types";

/* eslint-disable @typescript-eslint/no-unused-vars */
export function newProfile(init?: Partial<Profile>): Profile {
  throw new Error("VortexNotImplemented");
}

export function validateProfileForm(form: unknown): { ok: boolean; missing: string[] } {
  throw new Error("VortexNotImplemented");
}

export function rememberCookie(
  userName: string,
  remember: boolean,
): { name: string; value: string; maxAge: number } {
  throw new Error("VortexNotImplemented");
}

export function decideAccess(req: {
  pathname: string;
  method: string;
  signedOn: boolean;
}): "allow" | "sign-in-required" {
  throw new Error("VortexNotImplemented");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub, replaced by the runtime type
export async function createAccountsRuntime(opts?: unknown): Promise<any> {
  throw new Error("VortexNotImplemented");
}
