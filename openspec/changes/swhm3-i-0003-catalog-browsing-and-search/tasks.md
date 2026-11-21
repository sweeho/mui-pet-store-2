## 1. Data model

- [ ] 1.1 Define category, product and item entities with 10-character identifiers and ownership
- [ ] 1.2 Define locale-keyed detail records for categories, products and items
- [ ] 1.3 Define item detail fields: list price, unit cost (two decimals), image, description, five optional 80-character attributes
- [ ] 1.4 Leave list price versus unit cost unconstrained

## 2. Browsing queries

- [ ] 2.1 Implement locale-filtered listing of categories, products and items
- [ ] 2.2 Order categories and products by name
- [ ] 2.3 Return no result for unknown identifiers
- [ ] 2.4 Implement single item detail retrieval

## 3. Paging

- [ ] 3.1 Implement offset and page size paging with default size 2
- [ ] 3.2 Report next and previous page flags
- [ ] 3.3 Return an empty page for negative or out-of-range offsets

## 4. Search

- [ ] 4.1 Implement multi-keyword any-match search across product name, category id and item description
- [ ] 4.2 Return an empty page for blank queries

## 5. Operations

- [ ] 5.1 Implement catalog table check with first-load population and failure exit code 8
- [ ] 5.2 Report data-access failures as system errors
