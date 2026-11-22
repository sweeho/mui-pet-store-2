"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { getDb } from "@/db/client";
import {
  linkSignedOn,
  rotateSession,
  PASSWORD_MAX,
  rememberCookie,
  saveProfileForSession,
  signOffSession,
  validateProfileForm,
  type ProfileForm,
} from "@/lib/customer-accounts";
import { getSignedOnCustomer } from "@/lib/customer-accounts/current";
import { signOnFailures, signUps, sourceOf } from "@/lib/customer-accounts/limits";
import { getDomain } from "@/lib/customer-accounts/server";
import { getSessionId } from "@/lib/localization/request";
import { createSessionStore } from "@/lib/localization/session-store";
import { safeFrom } from "@/lib/problem";

export type SignOnState = { error?: "invalid" | "locked"; userName?: string };

const credential = z.object({
  userName: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(PASSWORD_MAX),
});

const text = (data: FormData, name: string) => {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
};

/** The page to land on: the one first requested, else the welcome page. */
const landing = (from: string) => {
  const path = safeFrom(from);
  return path === "/" || path === "/signin" || path.startsWith("/signin?")
    ? "/account/welcome"
    : path;
};

async function parts() {
  const db = await getDb();
  return { db, now: Date.now, domain: await getDomain(), store: createSessionStore(db) };
}

/** Sign on through Auth.js, then join the shopper session and set the locale from the profile. */
async function signOn(userName: string, password: string): Promise<boolean> {
  try {
    const result: unknown = await signIn("credentials", { userName, password, redirect: false });
    if (typeof result === "string" && result.includes("error")) return false;
  } catch (error) {
    if (error instanceof AuthError) return false;
    throw error;
  }
  const sessionId = await getSessionId();
  if (sessionId) {
    const p = await parts();
    // A new shopper session id at sign-on, so an id planted before it is not shared (session fixation).
    const fresh = await rotateSession(p, sessionId);
    await linkSignedOn(p, fresh, userName);
    (await cookies()).set("sid", fresh, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: (await headers()).get("x-forwarded-proto") === "https",
    });
  }
  return true;
}

/** The sign-on form: the sign-on outcome, the remember cookie and the return to the requested page. */
export async function signOnAction(_previous: SignOnState, data: FormData): Promise<SignOnState> {
  const typed = text(data, "userName");
  const parsed = credential.safeParse({ userName: typed, password: text(data, "password") });
  if (!parsed.success) return { error: "invalid", userName: typed };
  const source = sourceOf(await headers());
  if (!signOnFailures.allowed(source)) return { error: "locked", userName: typed };
  if (!(await signOn(parsed.data.userName, parsed.data.password))) {
    signOnFailures.record(source);
    return { error: "invalid", userName: typed };
  }
  const jar = await cookies();
  const remember = rememberCookie(parsed.data.userName, data.get("remember") === "on");
  if (remember.maxAge > 0) {
    jar.set({ ...remember, path: "/", sameSite: "lax", httpOnly: false });
  } else {
    jar.delete(remember.name);
  }
  redirect(landing(text(data, "from")));
}

/** Sign up: create the customer, sign on and ask for the profile; a refusal goes to the error page. */
export async function signUpAction(_previous: SignOnState, data: FormData): Promise<SignOnState> {
  const userName = text(data, "userName").trim();
  const password = text(data, "password");
  const source = sourceOf(await headers());
  if (!signUps.allowed(source)) return { error: "locked", userName };
  signUps.record(source);
  const outcome = await (
    await getDomain()
  ).signUp({ userName, password }, (await getSessionId()) ?? "anonymous");
  if (!outcome.ok) {
    const target = new URL(outcome.redirect, "http://localhost");
    if (userName) target.searchParams.set("name", userName.slice(0, 80));
    redirect(`${target.pathname}${target.search}`);
  }
  if (!(await signOn(userName, password))) redirect("/signin");
  redirect("/account/profile");
}

export type ProfileState = { saved?: boolean; missing?: string[]; signOnRequired?: boolean };

const flag = (data: FormData, name: string) => data.get(name) === "on";

/** Save the profile; every mandatory field that is empty is named and nothing is stored. */
export async function saveProfileAction(
  _previous: ProfileState,
  data: FormData,
): Promise<ProfileState> {
  const me = await getSignedOnCustomer();
  if (!me) return { signOnRequired: true };
  const p = await parts();
  const existing = await p.domain.accounts.get(me.userName);
  const month = text(data, "expiryMonth");
  const year = text(data, "expiryYear");
  const form: ProfileForm = {
    contact: {
      familyName: text(data, "familyName"),
      givenName: text(data, "givenName"),
      email: text(data, "email"),
      telephone: text(data, "telephone"),
      address: {
        street1: text(data, "street1"),
        street2: text(data, "street2") || null,
        city: text(data, "city"),
        state: text(data, "state"),
        zip: text(data, "zip"),
        country: text(data, "country"),
      },
    },
    card: {
      // A blank number keeps the saved card; a new one replaces it.
      number: text(data, "cardNumber").trim() || existing?.card.number || null,
      type: text(data, "cardType") || null,
      expiry: month && year ? `${month}/${year}` : null,
    },
    language: text(data, "language"),
    favoriteCategory: text(data, "favoriteCategory") || null,
    myList: flag(data, "myList"),
    banner: flag(data, "banner"),
  };
  const check = validateProfileForm(form);
  if (!check.ok) return { missing: check.missing };
  const sessionId = (await getSessionId()) ?? "anonymous";
  await saveProfileForSession(p, sessionId, me.userName, form);
  revalidatePath("/", "layout");
  return { saved: true };
}

/** Sign off: end the user's tokens, clear the token cookie and start a new session that keeps only the locale. */
export async function signOffAction(): Promise<void> {
  const me = await getSignedOnCustomer();
  const sessionId = await getSessionId();
  const fresh = await signOffSession(await parts(), sessionId ?? "anonymous", me?.userName);
  await signOut({ redirect: false });
  (await cookies()).set("sid", fresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: (await headers()).get("x-forwarded-proto") === "https",
  });
  redirect("/signed-off");
}
