import type { AppDb } from "@/db/client";

export type AccountStatus = "active" | "disabled";

export type Address = {
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type ContactInfo = {
  familyName: string;
  givenName: string;
  email: string;
  telephone: string;
  address: Address;
};

export type CreditCard = { number?: string | null; type?: string | null; expiry?: string | null };

export type Profile = {
  language: string;
  favoriteCategory: string | null;
  myList: boolean;
  banner: boolean;
};

export type ProfileForm = {
  contact: ContactInfo;
  card: CreditCard;
  language: string;
  favoriteCategory?: string | null;
  myList: boolean;
  banner: boolean;
};

/** Everything the domain functions need: the database and a clock (milliseconds). */
export type Deps = { db: AppDb; now: () => number };
