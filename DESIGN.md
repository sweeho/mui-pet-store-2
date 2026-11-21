# Design

The standing design system. Per-screen designs live in each capability's approved mockups.

## The theme

There is one MUI theme, `src/theme/theme.ts`. Its palette, typography and shape come from
`design/tokens.mui.json`, which holds the project's **Design Reference** tokens (the Modern SaaS
guide). They replace the template's original Modernize blue. To change the look, change the
tokens. Components never carry their own colours: they use the theme through MUI props
(`color="primary"`, `sx={{ color: "text.secondary" }}`).

| Token                            | Value                                                         |
| -------------------------------- | ------------------------------------------------------------- |
| Primary (brand, indigo)          | `#4f46e5`, text on primary `#ffffff`                          |
| Success / warning / error / info | `#16a34a` / `#d97706` / `#dc2626` / `#0284c7`                 |
| Text primary / secondary         | `#0f172a` / `#64748b`                                         |
| Divider                          | `#e2e8f0`                                                     |
| Background default / paper       | `#ffffff` / `#f8fafc`                                         |
| Corner radius                    | 4px                                                           |
| Typeface                         | Inter                                                         |
| Type scale                       | page title 24px semibold, body 14px, labels and captions 12px |

The font the tokens name is loaded in `src/app/layout.tsx` from its `@fontsource-variable` package,
so the app serves it itself. A font that is named but not loaded falls back to Helvetica or Arial
without any error: change the token's family, the package and the import together. Buttons show
their text as written (`textTransform: "none"`). Only a light theme exists. The tokens carry no
dark values.

When an approved mockup and the tokens disagree, the mockup wins: change the token to the mockup's
value, never a component.

## The shell

`src/shell/` is Modernize Free's layout, adjusted to the Design Reference:

- a **240px navigation rail** on the left, fixed on a large screen and a drawer behind the header's
  menu button below `lg`. The store name at the top and the Home entry lead to the landing page,
  and the current area is highlighted;
- a **header** (the `banner` landmark) and a **footer** (the `contentinfo` landmark) on every page;
- the page's content in the one `main` landmark between them.

Every page lives under `src/app/(DashboardLayout)/` and so renders inside the shell, including the
"page not found" screen. A primary area gets one entry in `MENU_ITEMS`
(`src/shell/SidebarItems.tsx`). The landing page's area links are generated from the same list.
The rail is the first `navigation` landmark on the page.

## State frames

Three shared frames in `src/components/StateFrames/` cover every page's non-data states. A page
never draws its own:

- **Empty**: a title saying there is nothing to show yet, one line on why, and the next step.
- **Error**: an alert saying the page couldn't load, a **Try again** button that re-runs the load,
  and a way home.
- **Loading**: a skeleton placeholder in the shape of the content.

The route-level `error.tsx` and `loading.tsx` of the shell's route group reuse them. A region of a
page uses the same components.

## Components

Use MUI's components. A component of the app's own goes in `src/components/`, with a test beside
it, and takes its data as props. Interactive elements meet WCAG 2.2 AA (rule A11Y-001).
