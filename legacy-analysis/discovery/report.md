# Discovery report SX-0001: Java Pet Store 1.3.2 (J2EE)

## Shape
4 apps (petstore storefront, opc order processing, supplier, admin Swing client), 18 EJB/servlet components, the WAF web framework, DDL (Oracle/Cloudscape), 7 shell batch jobs with SQL, Control-M schedule, conf. ~570 files. No Struts: a custom WAF controller driven by `mappings.xml`, `requestmappings.xml` and `screendefinitions*.xml`. Module paths in risk-scores.csv are relative to `legacy-source/`.

## Risk ranking (see risk-scores.csv)
- High: opc and processmanager (order state machine, approval limits), purchaseorder, petstore (checkout, 25 screens), cart, signon, and the DB/batch assets (schema CHECKs, purge, aging, backup retention).
- Medium: supplier, supplierpo, creditcard, catalog, customer, admin, xmldocuments, lineitem, conf, scheduler.
- Low: plumbing (waf, servicelocator, uidgen, asyncsender, mailer, filters, tracer, address, contactinfo).

## Early observations (to verify in extraction)
- conf/petstore.properties: `opc.autoApprove.limit.en_US=500`, `ja_JP=50000`. Check OrderApprovalTD for literals that disagree.
- Schema CHECKs: po_line quantity > 0; quantity_shipped <= quantity; order_manager status in PENDING/APPROVED/DENIED/COMPLETED; supplier_order status PENDING/COMPLETED; inventory quantity >= 0.
- Batch: purge COMPLETED/DENIED orders older than 180 days; aging report for PENDING/APPROVED over 24h; backups kept 7 days; low-stock threshold in conf.
- Order status constants exist twice (processmanager and supplierpo `OrderStatusNames`).
- Mail flags default false in conf.
- Possible dead code, reachability unverified: waf `clientstatetag_test.jsp`, `template2.jsp`, `opc/EntityCatalog.jsp`.
- A credential property exists in conf (already redacted): a security finding, not a requirement.

## Exclusions
- `app/src/lib/jstl`, `lib/base64`, `*.tld` (third party).
- Build and packaging files: build.xml/.sh/.bat/.properties, setup.*, manifests, sun-j2ee-ri.xml, application.xml (read only for config values).
- `petstore/docroot/zh` and `ja`: localized copies of the en JSPs; covered under localization.
- Populate tools, DTDs and sample XML; XSL stylesheets (read only for localized mail content); COPYRIGHT/LICENSE html.
- Admin Swing rendering classes (TableSorter, Chart, StatusBar, ...): presentation only.

## Dependency graph
dependency-graph.json: inferred from layout and JNDI naming, not compiler analysis.

## Capabilities
10 keys in capabilities.csv (closed list).
