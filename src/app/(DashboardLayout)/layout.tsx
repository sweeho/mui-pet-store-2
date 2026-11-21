import { DashboardShell } from "@/shell/DashboardShell";

/** Every page inside the Modernize shell: sidebar, header and content. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
