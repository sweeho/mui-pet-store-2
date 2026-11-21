import { notFound } from "next/navigation";

/** Any address no page owns: the 404, rendered inside the shell (the group's not-found.tsx). */
export default function MissingPage() {
  notFound();
}
