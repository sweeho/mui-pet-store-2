import { and, asc, count, eq } from "drizzle-orm";
import { z } from "zod";

import * as s from "@/db/schema";
import { DEFAULT_LOCALE, parseLocaleCode } from "@/lib/localization/locale";

import { hashPassword, verifyPassword } from "./password";
import type { AccountStatus, ContactInfo, CreditCard, Deps, Profile, ProfileForm } from "./types";

/** A refused write: nothing was stored. `code` says why, for the page that explains it. */
export class AccountError extends Error {
  constructor(
    readonly code: "invalid" | "duplicate",
    message: string,
    readonly fields: string[] = [],
  ) {
    super(message);
  }
}

/** The record allows 50 characters; sign-up allows 25 (R-0004, R-0080). */
export const USER_NAME_MAX = 50;
export const SIGN_UP_USER_NAME_MAX = 25;
export const PASSWORD_MAX = 50;
/** Five failed sign-ins lock the account for fifteen minutes (SEC-118). */
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MS = 15 * 60_000;
export const PAGE_SIZE_MAX = 100;

const text = (max: number) => z.string().trim().min(1).max(max);
const credential = z.object({
  userName: text(USER_NAME_MAX),
  password: z.string().min(1).max(PASSWORD_MAX),
});

const required = z.string().trim().min(1).max(80);
const addressSchema = z.object({
  street1: required,
  street2: z.string().max(80).nullish(),
  city: required,
  state: required,
  zip: required,
  country: required,
});
const contactSchema = z.object({
  familyName: required,
  givenName: required,
  email: required,
  telephone: required,
  address: addressSchema,
});
const cardSchema = z.object({
  number: z.string().max(30).nullish(),
  type: z.string().max(30).nullish(),
  expiry: z.string().max(10).nullish(),
});
const statusSchema = z.enum(["active", "disabled"]);
const languageSchema = z.string().refine((v) => parseLocaleCode(v) !== null, "language");
const profileSchema = z.object({
  language: languageSchema,
  favoriteCategory: z.string().max(30).nullish(),
  myList: z.boolean().optional(),
  banner: z.boolean().optional(),
});

/** The names of the fields a failed parse points at, as the form names them ("zip", "familyName"). */
const fieldsOf = (error: z.ZodError): string[] => [
  ...new Set(error.issues.map((i) => String(i.path[i.path.length - 1] ?? "value"))),
];

function parse<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AccountError("invalid", `${what} is not valid`, fieldsOf(result.error));
  }
  return result.data;
}

/** A new profile with the defaults: en_US, no favourite category, my list and banner on. */
export function newProfile(init: Partial<Profile> = {}): Profile {
  return {
    language: init.language ?? DEFAULT_LOCALE,
    favoriteCategory: init.favoriteCategory ?? null,
    myList: init.myList ?? true,
    banner: init.banner ?? true,
  };
}

/** Which mandatory fields of a profile form are missing or blank. */
export function validateProfileForm(form: unknown): { ok: boolean; missing: string[] } {
  const result = z
    .object({ contact: contactSchema, card: cardSchema.optional(), language: languageSchema })
    .safeParse(form);
  return result.success
    ? { ok: true, missing: [] }
    : { ok: false, missing: fieldsOf(result.error) };
}

const isConstraint = (error: unknown): boolean =>
  /UNIQUE|PRIMARY KEY|constraint/i.test(
    `${String(error)} ${String((error as { cause?: unknown })?.cause ?? "")}`,
  );

const emptyContact = (userName: string) => ({ userName });
const rowToContact = (row: typeof s.contactInfo.$inferSelect | undefined) => ({
  familyName: row?.familyName ?? null,
  givenName: row?.givenName ?? null,
  email: row?.email ?? null,
  telephone: row?.telephone ?? null,
  address: {
    street1: row?.street1 ?? null,
    street2: row?.street2 ?? null,
    city: row?.city ?? null,
    state: row?.state ?? null,
    zip: row?.zip ?? null,
    country: row?.country ?? null,
  },
});
const contactValues = (c: ContactInfo) => ({
  familyName: c.familyName.trim(),
  givenName: c.givenName.trim(),
  email: c.email.trim(),
  telephone: c.telephone.trim(),
  street1: c.address.street1.trim(),
  street2: c.address.street2 ?? null,
  city: c.address.city.trim(),
  state: c.address.state.trim(),
  zip: c.address.zip.trim(),
  country: c.address.country.trim(),
});

export function createDomain({ db, now }: Deps) {
  // Changes that belong together go through `db.batch`: one atomic call on the one connection.
  // (A libsql transaction moves the client to a new connection, which loses the busy timeout.)
  const signonRow = async (c: z.infer<typeof credential>) => ({
    userName: c.userName,
    passwordHash: await hashPassword(c.password),
    createdAt: now(),
  });

  /** Run a write; a duplicate key becomes an AccountError("duplicate"). Nothing is left half written. */
  async function write<T>(what: string, run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof AccountError) throw error;
      if (isConstraint(error)) throw new AccountError("duplicate", `${what} already exists`);
      throw error;
    }
  }

  const signons = {
    async create(input: unknown): Promise<void> {
      const c = parse(credential, input, "The sign-on credential");
      const row = await signonRow(c);
      await write("The user name", () => db.insert(s.signon).values(row));
    },
    async exists(userName: string): Promise<boolean> {
      const [row] = await db
        .select()
        .from(s.signon)
        .where(eq(s.signon.userName, userName))
        .limit(1);
      return Boolean(row);
    },
    async stored(userName: string) {
      const [row] = await db
        .select()
        .from(s.signon)
        .where(eq(s.signon.userName, userName))
        .limit(1);
      return row;
    },
  };

  const contacts = {
    /** Validates the contact (all but street 2 mandatory); stores it when a user name is given. */
    async store(input: unknown): Promise<void> {
      const userName = (input as { userName?: unknown } | null)?.userName;
      const c = parse(contactSchema, input, "The contact information");
      if (typeof userName === "string") {
        await db
          .insert(s.contactInfo)
          .values({ userName, ...contactValues(c) })
          .onConflictDoUpdate({ target: s.contactInfo.userName, set: contactValues(c) });
      }
    },
  };

  const accounts = {
    async store(input: {
      userName: string;
      status: AccountStatus;
      contact?: ContactInfo;
      card?: CreditCard;
    }): Promise<void> {
      const userName = parse(text(USER_NAME_MAX), input.userName, "The user name");
      const status = parse(statusSchema, input.status, "The account status");
      const contact =
        input.contact === undefined
          ? undefined
          : parse(contactSchema, input.contact, "The contact information");
      const card =
        input.card === undefined ? undefined : parse(cardSchema, input.card, "The credit card");
      await write("The account", () =>
        db.batch([
          db.insert(s.account).values({ userName, status }),
          db
            .insert(s.contactInfo)
            .values(contact ? { userName, ...contactValues(contact) } : emptyContact(userName)),
          db.insert(s.creditCard).values({ userName, ...(card ?? {}) }),
        ]),
      );
    },
    async create(input: { userName: string; status?: AccountStatus }): Promise<void> {
      await accounts.store({ ...input, status: input.status ?? "active" });
    },
    async get(userName: string) {
      const [acct] = await db
        .select()
        .from(s.account)
        .where(eq(s.account.userName, userName))
        .limit(1);
      if (!acct) return undefined;
      const [contact] = await db
        .select()
        .from(s.contactInfo)
        .where(eq(s.contactInfo.userName, userName))
        .limit(1);
      const [card] = await db
        .select()
        .from(s.creditCard)
        .where(eq(s.creditCard.userName, userName))
        .limit(1);
      return {
        status: acct.status,
        contact: rowToContact(contact),
        card: {
          number: card?.number ?? null,
          type: card?.type ?? null,
          expiry: card?.expiry ?? null,
        },
      };
    },
    async counts(userName: string) {
      const [c] = await db
        .select({ n: count() })
        .from(s.contactInfo)
        .where(eq(s.contactInfo.userName, userName));
      const [d] = await db
        .select({ n: count() })
        .from(s.creditCard)
        .where(eq(s.creditCard.userName, userName));
      return { contacts: c.n, cards: d.n };
    },
  };

  const profiles = {
    async store(input: unknown): Promise<void> {
      const p = parse(
        profileSchema.extend({ userName: text(USER_NAME_MAX) }),
        input,
        "The profile",
      );
      const profile = newProfile({
        language: p.language,
        favoriteCategory: p.favoriteCategory ?? null,
        myList: p.myList,
        banner: p.banner,
      });
      await write("The profile", () =>
        db.insert(s.profile).values({ userName: p.userName, ...profile }),
      );
    },
    async get(userName: string): Promise<Profile | undefined> {
      const [row] = await db
        .select()
        .from(s.profile)
        .where(eq(s.profile.userName, userName))
        .limit(1);
      return row
        ? {
            language: row.language,
            favoriteCategory: row.favoriteCategory,
            myList: row.myList,
            banner: row.banner,
          }
        : undefined;
    },
    /** Validate then store contact, card and preferences in one transaction. */
    async save(userName: string, form: ProfileForm, actor: string): Promise<void> {
      const parsed = parse(
        z.object({
          contact: contactSchema,
          card: cardSchema,
          language: languageSchema,
          favoriteCategory: z.string().max(30).nullish(),
          myList: z.boolean(),
          banner: z.boolean(),
        }),
        form,
        "The profile",
      );
      const card = {
        number: parsed.card.number ?? null,
        type: parsed.card.type ?? null,
        expiry: parsed.card.expiry ?? null,
      };
      const prefs = {
        language: parsed.language,
        favoriteCategory: parsed.favoriteCategory ?? null,
        myList: parsed.myList,
        banner: parsed.banner,
      };
      const contact = contactValues(parsed.contact);
      await db.batch([
        db
          .insert(s.contactInfo)
          .values({ userName, ...contact })
          .onConflictDoUpdate({ target: s.contactInfo.userName, set: contact }),
        db
          .insert(s.creditCard)
          .values({ userName, ...card })
          .onConflictDoUpdate({ target: s.creditCard.userName, set: card }),
        db
          .insert(s.profile)
          .values({ userName, ...prefs })
          .onConflictDoUpdate({ target: s.profile.userName, set: prefs }),
        db
          .insert(s.auditLog)
          .values({ sessionId: actor, action: "profile.save", detail: userName, createdAt: now() }),
      ]);
    },
  };

  const customers = {
    /** One transaction: sign-on, customer, active account, empty contact and card, default profile. */
    async create(
      input: { userName: string; password: string; language?: string | null },
      actor = "system",
    ): Promise<void> {
      const c = parse(credential, input, "The customer");
      const language = input.language
        ? parse(languageSchema, input.language, "The language")
        : undefined;
      const row = await signonRow(c);
      await write("The user name", () =>
        db.batch([
          db.insert(s.signon).values(row),
          db.insert(s.customer).values({ userName: c.userName }),
          db.insert(s.account).values({ userName: c.userName, status: "active" }),
          db.insert(s.contactInfo).values(emptyContact(c.userName)),
          db.insert(s.creditCard).values({ userName: c.userName }),
          db.insert(s.profile).values({ userName: c.userName, ...newProfile({ language }) }),
          db.insert(s.auditLog).values({
            sessionId: actor,
            action: "customer.create",
            detail: c.userName,
            createdAt: now(),
          }),
        ]),
      );
    },
    async get(userName: string) {
      const signon = await signons.stored(userName);
      const account = await accounts.get(userName);
      if (!signon || !account) return undefined;
      return {
        signon: { userName: signon.userName },
        account,
        profile: await profiles.get(userName),
      };
    },
    /** One page, ordered by user name (R-0183). */
    async list(page = { page: 1, pageSize: PAGE_SIZE_MAX }): Promise<{ userName: string }[]> {
      const size = Math.min(Math.max(1, page.pageSize), PAGE_SIZE_MAX);
      return db
        .select({ userName: s.customer.userName })
        .from(s.customer)
        .orderBy(asc(s.customer.userName))
        .limit(size)
        .offset((Math.max(1, page.page) - 1) * size);
    },
    async counts(userName: string) {
      const n = async (
        table:
          | typeof s.signon
          | typeof s.customer
          | typeof s.account
          | typeof s.profile
          | typeof s.contactInfo
          | typeof s.creditCard,
      ) => (await db.select({ n: count() }).from(table).where(eq(table.userName, userName)))[0].n;
      return {
        signons: await n(s.signon),
        accounts: await n(s.account),
        profiles: await n(s.profile),
        contacts: await n(s.contactInfo),
        cards: await n(s.creditCard),
      };
    },
  };

  const users = {
    /** Sign-up: the user name is at most 25 characters (R-0080). */
    async create(
      input: { userName: string; password: string; language?: string | null },
      actor?: string,
    ): Promise<void> {
      if (
        typeof input.userName === "string" &&
        input.userName.trim().length > SIGN_UP_USER_NAME_MAX
      ) {
        throw new AccountError("invalid", "The user name is too long", ["userName"]);
      }
      await customers.create(input, actor);
    },
  };

  /** Sign-up outcome: a refusal goes to the user creation error page (R-0081). */
  async function signUp(
    input: { userName: string; password: string; language?: string | null },
    actor?: string,
  ) {
    try {
      await users.create(input, actor);
      return { ok: true } as const;
    } catch (error) {
      if (!(error instanceof AccountError)) throw error;
      return {
        ok: false,
        redirect:
          error.code === "duplicate"
            ? "/user-creation-error?reason=duplicate"
            : "/user-creation-error",
      } as const;
    }
  }

  const auth = {
    /**
     * True only for an existing, not locked, not disabled sign-on record with this password. An
     * unknown user name fails exactly like a wrong password (R-0200). Repeated failures lock the account.
     */
    async authenticate(userName: string, password: string): Promise<boolean> {
      const record = typeof userName === "string" ? await signons.stored(userName) : undefined;
      const ok = await verifyPassword(
        String(password),
        record?.passwordHash ?? "scrypt$16384$AAAA$AAAA",
      );
      if (!record) return false;
      const t = now();
      if (record.lockedUntil && record.lockedUntil > t) return false;
      if (!ok) {
        const failed = record.failedAttempts + 1;
        await db
          .update(s.signon)
          .set(
            failed >= MAX_FAILED_ATTEMPTS
              ? { failedAttempts: 0, lockedUntil: t + LOCK_MS }
              : { failedAttempts: failed },
          )
          .where(eq(s.signon.userName, userName));
        return false;
      }
      const [acct] = await db
        .select()
        .from(s.account)
        .where(eq(s.account.userName, userName))
        .limit(1);
      if (acct?.status === "disabled") return false;
      if (record.failedAttempts > 0 || record.lockedUntil) {
        await db
          .update(s.signon)
          .set({ failedAttempts: 0, lockedUntil: null })
          .where(eq(s.signon.userName, userName));
      }
      return true;
    },
    /** The session version a token must carry; sign-off, password change and disabling increment it. */
    async sessionVersion(userName: string): Promise<number | undefined> {
      return (await signons.stored(userName))?.sessionVersion;
    },
    async endSessions(userName: string): Promise<void> {
      const v = await auth.sessionVersion(userName);
      if (v === undefined) return;
      await db
        .update(s.signon)
        .set({ sessionVersion: v + 1 })
        .where(and(eq(s.signon.userName, userName), eq(s.signon.sessionVersion, v)));
    },
  };

  return { signons, contacts, accounts, profiles, customers, users, signUp, auth };
}

export type Domain = ReturnType<typeof createDomain>;
export type { CreditCard };
