## 1. Data model

- [ ] 1.1 Define category, product and item entities with 10-character identifiers and ownership (SWHM3-T-0011; SWHM3-R-0007, SWHM3-R-0045)
- [ ] 1.2 Define locale-keyed detail records for categories, products and items (SWHM3-T-0011; SWHM3-R-0048, SWHM3-R-0007)
- [ ] 1.3 Define item detail fields: list price, unit cost (two decimals), image, description, five optional 80-character attributes (SWHM3-T-0011; SWHM3-R-0001, SWHM3-R-0163)
- [ ] 1.4 Leave list price versus unit cost unconstrained (SWHM3-T-0011; SWHM3-R-0162)

## 2. Browsing queries

- [ ] 2.1 Implement locale-filtered listing of categories, products and items (SWHM3-T-0011; SWHM3-R-0050, SWHM3-R-0164)
- [ ] 2.2 Order categories and products by name (SWHM3-T-0011; SWHM3-R-0046, SWHM3-R-0051)
- [ ] 2.3 Return no result for unknown identifiers (SWHM3-T-0011; SWHM3-R-0047, SWHM3-R-0051)
- [ ] 2.4 Implement single item detail retrieval (SWHM3-T-0011; SWHM3-R-0163)

## 3. Paging

- [ ] 3.1 Implement offset and page size paging with default size 2 (SWHM3-T-0011; SWHM3-R-0008, SWHM3-R-0165, SWHM3-R-0166, SWHM3-R-0046)
- [ ] 3.2 Report next and previous page flags (SWHM3-T-0011; SWHM3-R-0008)
- [ ] 3.3 Return an empty page for negative or out-of-range offsets (SWHM3-T-0011; SWHM3-R-0008)

## 4. Search

- [ ] 4.1 Implement multi-keyword any-match search across product name, category id and item description (SWHM3-T-0011; SWHM3-R-0052)
- [ ] 4.2 Return an empty page for blank queries (SWHM3-T-0011; SWHM3-R-0053)

## 5. Operations

- [ ] 5.1 Implement catalog table check with first-load population and failure exit code 8 (SWHM3-T-0011; SWHM3-R-0042)
- [ ] 5.2 Report data-access failures as system errors (SWHM3-T-0011; SWHM3-R-0054)
