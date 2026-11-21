## ADDED Requirements

### Requirement: Per-shopper session cart
Recovered from: SHOPPING-CART-REQ-0001

The system SHALL keep a per-shopper cart of item identifiers mapped to quantities, held for the shopper's session.

#### Scenario: New shopper
- **GIVEN** a shopper with a new session
- **WHEN** the cart is viewed
- **THEN** the cart is empty

#### Scenario: Carts are separate
- **GIVEN** two shoppers each with a session
- **WHEN** one adds an item
- **THEN** the other shopper's cart is unchanged

### Requirement: Cart operations
Recovered from: CART-REQ-0001

The system SHALL support adding an item by item id, removing an item by item id, and updating quantities of several items in one request.

#### Scenario: Several quantities updated at once
- **GIVEN** a cart with items A and B
- **WHEN** one update request supplies new quantities for both
- **THEN** both quantities are changed

### Requirement: Add item with default quantity
Recovered from: SHOP-REQ-0002

The system SHALL add an item to the cart with quantity 1 when no quantity is given, or with the stated quantity otherwise.

#### Scenario: No quantity given
- **GIVEN** an empty cart
- **WHEN** item A is added without a quantity
- **THEN** the cart holds item A with quantity 1

#### Scenario: Quantity given
- **GIVEN** an empty cart
- **WHEN** item A is added with quantity 3
- **THEN** the cart holds item A with quantity 3

### Requirement: Re-adding an item replaces its quantity
Recovered from: SHOP-BR-0001

Where an item is already in the cart and is added again, the system SHALL set its quantity to the newly supplied value (default 1) and MUST NOT increase it.

#### Scenario: Item added twice
- **GIVEN** a cart holding item A with quantity 2
- **WHEN** item A is added again with no quantity
- **THEN** item A has quantity 1

### Requirement: Remove item
Recovered from: SHOPPING-CART-REQ-0003

The system SHALL allow an item to be removed from the cart.

#### Scenario: Item removed
- **GIVEN** a cart holding item A
- **WHEN** item A is removed
- **THEN** the cart no longer holds item A

#### Scenario: Absent item removed
- **GIVEN** a cart not holding item B
- **WHEN** item B is removed
- **THEN** no error is raised and the cart is unchanged

### Requirement: Update quantity
Recovered from: SHOPPING-CART-REQ-0004

The system SHALL set an item's quantity to the new value on update, and where the new quantity is zero or less SHALL remove the item from the cart.

#### Scenario: Positive quantity
- **GIVEN** a cart holding item A with quantity 2
- **WHEN** its quantity is updated to 5
- **THEN** item A has quantity 5

#### Scenario: Zero quantity
- **GIVEN** a cart holding item A
- **WHEN** its quantity is updated to 0
- **THEN** item A is removed from the cart

### Requirement: Non-numeric quantity counts as zero
Recovered from: CART-REQ-0002

Where a quantity in an update is not a whole number, the system SHALL treat that quantity as 0.

#### Scenario: Text entered as quantity
- **GIVEN** a cart holding item A
- **WHEN** an update supplies "abc" as its quantity
- **THEN** the quantity is treated as 0 and item A is removed

### Requirement: Item count and emptying
Recovered from: SHOPPING-CART-REQ-0005

The system SHALL report the cart item count as the number of distinct items, not the sum of quantities, and SHALL allow the cart to be emptied.

#### Scenario: Count of distinct items
- **GIVEN** a cart holding item A with quantity 3 and item B with quantity 2
- **WHEN** the item count is requested
- **THEN** it is 2

#### Scenario: Cart emptied
- **GIVEN** a cart holding items
- **WHEN** the cart is emptied
- **THEN** the cart holds no items

### Requirement: Cart line presentation
Recovered from: SHOPPING-CART-REQ-0006

The system SHALL present each cart line with item, product, category, name, attribute and unit cost taken from the catalog, together with the stored quantity.

#### Scenario: Cart listed
- **GIVEN** a cart holding item A with quantity 2
- **WHEN** the cart is listed
- **THEN** the line shows item A's catalog data and quantity 2

### Requirement: Omit lines whose catalog lookup fails
Recovered from: SHOP-BR-0003

Where a cart item's catalog lookup fails when the cart is listed, the system SHALL omit that line, log the error, and continue with the remaining lines.

#### Scenario: One lookup fails
- **GIVEN** a cart holding items A and B and a failing lookup for A
- **WHEN** the cart is listed
- **THEN** only B's line is shown and the error is logged

### Requirement: Cart subtotal
Recovered from: SHOPPING-CART-REQ-0007

The system SHALL compute the cart subtotal as the sum over displayed lines of unit cost multiplied by quantity, using floating-point arithmetic without rounding and without discount, tax or shipping.

#### Scenario: Subtotal of two lines
- **GIVEN** lines of unit cost 10.00 quantity 2 and unit cost 5.50 quantity 1
- **WHEN** the subtotal is computed
- **THEN** it is 25.50

### Requirement: Cart line structure
Recovered from: SHOP-ENT-0001

The system SHALL represent a cart line with item id, product id, category, name, attribute, quantity and unit cost, and its line total as quantity times unit cost.

#### Scenario: Line total
- **GIVEN** a line with unit cost 4.00 and quantity 3
- **WHEN** its line total is read
- **THEN** it is 12.00
