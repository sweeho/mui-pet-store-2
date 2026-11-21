import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
// The font design/tokens.mui.json names, served from the app (no request to a font host). Change
// the token's family and this import together.
import "@fontsource-variable/plus-jakarta-sans";

import { APP_NAME } from "@/constants/app";
import { Providers } from "./providers";
import "./global.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME}, created from the Next.js, MUI and Modernize stack template.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
