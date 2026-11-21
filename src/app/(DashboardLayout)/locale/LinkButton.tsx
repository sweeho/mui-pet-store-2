"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import Link from "next/link";

/** A MUI button that navigates with next/link (usable from a server component). */
export function LinkButton({ href, ...props }: Omit<ButtonProps<typeof Link>, "component">) {
  return <Button component={Link} href={href} {...props} />;
}
