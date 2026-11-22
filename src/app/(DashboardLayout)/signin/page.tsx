import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignOnScreen } from "@/components/account/SignOnForm";
import { getSignedOnCustomer } from "@/lib/customer-accounts/current";
import { safeFrom } from "@/lib/problem";

const decode = (value: string | undefined) => {
  try {
    return value ? decodeURIComponent(value) : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The sign-on screen. The gate (src/proxy.ts) shows it at the address of a protected page with
 * `required=1`; the form then returns the customer to that page.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const { required } = await searchParams;
  if (!required && (await getSignedOnCustomer())) redirect("/account/welcome");
  const requested = (await headers()).get("x-requested-path");
  return (
    <SignOnScreen
      from={safeFrom(requested)}
      failed={Boolean(required)}
      rememberedName={decode((await cookies()).get("bp_signon")?.value)}
    />
  );
}
