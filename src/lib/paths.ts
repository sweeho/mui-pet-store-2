/** An app path with the base path the app is served under (next.config.ts), for a fetch. */
export function withBasePath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
