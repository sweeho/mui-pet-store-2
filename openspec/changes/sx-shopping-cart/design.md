# Legacy implementation notes: shopping cart

## User interface
No screen records were extracted for this capability; its user interface is unspecified. The cart page, its form fields and its controls are not described here and must not be invented.

## How the legacy application implements it
- State: `ShoppingCartLocalEJB` is a stateful session bean (container transactions) holding a `HashMap` of item id to `Integer`, created empty. State exists only in the session bean (`components/cart/src/ejb-jar.xml`).
- Add: `addItem(id)` and `addItem(id, qty)` use `cart.put`, so re-adding replaces the quantity. The quantity is not validated at add time; zero or negative values are stored.
- Update: `updateItemQuantity` removes the item when the new quantity is zero or less; for an item absent from the cart with a positive quantity it adds it.
- Remove / empty: `deleteItem` and `empty`; removing an absent item is a silent no-op.
- Count: `getCount` returns `cart.size()` (distinct items).
- Lines: `getItems` builds `CartItem` objects from catalog lookups (`CatalogHelper(false)`, `catalog.getItem(key, locale)`); price is `Item.getListCost`. A failed lookup prints to stdout, the line is omitted, and the item stays in the map.
- Subtotal: summed in `double` with no rounding, in two parallel implementations (the bean and `ShoppingCartModel` in the web tier). No discount, tax or shipping.
- Web tier: `CartHTMLAction` and `CartEJBAction` map action values `purchase`, `remove`, `update` to ADD_ITEM, DELETE_ITEM, UPDATE_ITEMS. The cart bean is reached through `ShoppingClientFacade` and created lazily. `CartHTMLAction` catches `NumberFormatException` and substitutes 0, which then removes the line on update.
- Unseen: the web tier may check for existence before add; that code is outside the cart module.
- Locale for cart lines (SHOP-REQ-0006) is recorded under `localization`.
