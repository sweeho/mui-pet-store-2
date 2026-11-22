import { headers } from "next/headers";

import { customerFromCookies, type SignedOnCustomer } from "./server";

/** The signed-on customer of the current page or action request, or undefined. */
export async function getSignedOnCustomer(): Promise<SignedOnCustomer | undefined> {
  return customerFromCookies((await headers()).get("cookie"));
}
