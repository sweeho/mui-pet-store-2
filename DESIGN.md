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
- the rail's entries sit in **labelled groups** (Shop, Account, Admin), each with a small muted
  subheader. A capability adds its entry to the group it belongs to;
- a **header** (the `banner` landmark) and a **footer** (the `contentinfo` landmark) on every page.
  The header carries the **search box** ("Search the catalog"), which opens the catalog's search
  results from any page, and on its right side the **language control**: the current language's
  name, which opens the language page and remembers the page it came from;
- the page's content in the one `main` landmark between them.

Every page lives under `src/app/(DashboardLayout)/` and so renders inside the shell, including the
"page not found" screen. A primary area gets one entry in `MENU_ITEMS`
(`src/shell/SidebarItems.tsx`). The landing page's area links are generated from the same list.
The rail is the first `navigation` landmark on the page.

## Language and text

The interface follows the shopper's language (ARCHITECTURE.md §Data flow):

- No user-facing string is written in a component. It comes from the message catalogs in
  `src/lib/localization/messages/`, and a missing key or locale shows the en_US text.
- `<html lang>` is the current language, so screen readers pronounce the page correctly.
- Money and numbers are always formatted for the locale, never by hand.
- A language is named in its own script first, with the English name beside it, as in
  `日本語 (日本) · Japanese`. A choice of a language that has no translation yet says so in its row.
- A choose-one setting is a radio list with the current value marked **Current**, and one primary
  button below it. A confirmation screen leads with what changed and offers one primary way back to
  where the user was.

## Lists and wayfinding

- **Breadcrumbs.** A page below an area's top level shows breadcrumbs that start at the area
  (Catalog › Fish › Angelfish), as a `nav` labelled "Breadcrumb" placed after the rail, so the rail
  stays the first navigation landmark. The last crumb is the current page and is not a link.
- **Paged lists.** A list shows its range ("Categories 1–2") and a pager with **Previous** only after
  the first page and **Next** only while more entries remain. Paging is in the address (`?start=`),
  so a page can be linked and the browser's back button works.
- **Nothing found is not an error.** An unknown entry, an empty search or a page past the end shows
  the empty frame with a way back to the list, never the error frame.

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
