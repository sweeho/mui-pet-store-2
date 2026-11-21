## Context

Legacy implementation notes for localization. Source is under `legacy-source/`.

## Legacy implementation notes

- **Locale parsing** exists three times with the same logic: `I18nUtil.getLocaleFromString` (waf), `CatalogHelper.getLocaleFromString` (catalog) and `LocaleUtil.getLocaleFromString` (opc). Null or underscore-less text gives null; "default" gives the JVM default. In opc the variant branch is dead (variantIndex never assigned) and a three-part string loses its country.
- **Front controller** (`MainServlet.doProcess`) sets the session locale from init-param `default_locale` (en_US) when absent. Unhandled errors are mapped through `ScreenFlowManager.getExceptionScreen`; the only mapping in `mappings.xml` names a petstore exception class, not the WAF one.
- **Locale change**: `ChangeLocaleHTMLAction` stores the Locale in the session under `com.sun.j2ee.blueprints.waf.LOCALE`; `ChangeLocaleEJBAction` copies it to the state-machine attribute `locale`. Suspected defect: the event mapping names a class that does not exist, so the EJB action is not invoked. The only caller found is the framework demo page `changelocale.jsp`, which posts to `changelocale.do`; it offers de_DE although `web.xml` `locales` lists only en_US.
- **Screen locale** (`TemplateServlet`): request parameter `locale`, else session; unknown locale replaced by the default; a screen missing in a locale file is taken from the default. Definitions load from `/WEB-INF/screendefinitions_<locale>.xml`. If the default also lacks the screen a NullPointerException is possible. `PREVIOUS` re-renders the stored last screen.
- **Client-state links** (`ClientStateFlowHandler`, wired to `changeclientchachelinklocale.do`) deserialise Base64 data with `ObjectInputStream`. Suspected defect: untrusted deserialisation; read errors are logged and ignored.
- **Catalog**: `catalog.locales` and `catalog.defaultLocale` in `conf/petstore.properties`. A null locale reaches `locale.toString()` in the DAO and throws an unhandled NullPointerException.
- **Schema**: `CATEGORY_DETAILS`, `PRODUCT_DETAILS`, `ITEM_DETAILS` with composite keys (id, locale); item attributes attr1..attr5 optional. Prices are per locale, so one item may be priced differently per locale. Requirement LOC-REQ-0002 (name and locale required; image and description optional for category and product details) differs from LOCALIZATION-ENT-0001 on item details; both are kept as recorded.
- **Encoding**: `EncodingFilter` calls `setCharacterEncoding` from init-param `encoding` (UTF-8 in the petstore `web.xml`), mapped to `/*`. The in-class default ASCII is overwritten in init(). Other web apps were not seen to declare the filter.
- **Mailer**: `MailerMDB` passes `Locale.getDefault()`; `MailHelper` ignores it. Localization, if any, happens upstream.
- **Formatting**: `I18nUtil.formatCurrency/formatNumber/parseKeywords`; callers were not verified. `parseKeywords` returns null on error.
