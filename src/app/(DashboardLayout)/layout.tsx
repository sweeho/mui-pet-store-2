import { signOffAction } from "@/components/account/actions";
import { getSignedOnCustomer } from "@/lib/customer-accounts/current";
import { DashboardShell } from "@/shell/DashboardShell";

/** Every page inside the Modernize shell: sidebar, header and content. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getSignedOnCustomer();
  return (
    <DashboardShell userName={me?.userName} signOffAction={signOffAction}>
      {children}
    </DashboardShell>
  );
}
