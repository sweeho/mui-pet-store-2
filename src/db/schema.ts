import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

/** A shopper session: attributes and controller state are JSON text (ARC-103: not process memory). */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  attributes: text("attributes").notNull().default("{}"),
  controllerState: text("controller_state").notNull().default("{}"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

/** Who changed what and when (ACC-003). */
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const category = sqliteTable("category", { id: text("id").primaryKey() });

export const product = sqliteTable(
  "product",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
  },
  (t) => [index("product_category_id_idx").on(t.categoryId)],
);

export const item = sqliteTable(
  "item",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
  },
  (t) => [index("item_product_id_idx").on(t.productId)],
);

// Per-locale text: one row per (id, locale).
export const categoryDetails = sqliteTable(
  "category_details",
  {
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    image: text("image"),
    description: text("description"),
  },
  (t) => [
    primaryKey({ columns: [t.categoryId, t.locale] }),
    index("category_details_locale_name_idx").on(t.locale, t.name),
  ],
);

export const productDetails = sqliteTable(
  "product_details",
  {
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    image: text("image"),
    description: text("description"),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.locale] }),
    index("product_details_locale_name_idx").on(t.locale, t.name),
  ],
);

export const itemDetails = sqliteTable(
  "item_details",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => item.id),
    locale: text("locale").notNull(),
    image: text("image").notNull(),
    description: text("description").notNull(),
    listPrice: real("list_price").notNull(),
    unitCost: real("unit_cost").notNull(),
    attr1: text("attr1"),
    attr2: text("attr2"),
    attr3: text("attr3"),
    attr4: text("attr4"),
    attr5: text("attr5"),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.locale] })],
);

// Customer accounts (SWHM3-I-0004). The records are linked by user name. Mandatory-field rules
// are enforced when a profile is saved (src/lib/customer-accounts), so an empty contact and card
// can exist from sign-up on.

/** A sign-on record: the user name (the key) and the scrypt hash of the password (never the password). */
export const signon = sqliteTable("signon", {
  userName: text("user_name").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  /** Sign-off, a password change and disabling the account increment it; a token with another value is refused. */
  sessionVersion: integer("session_version").notNull().default(0),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: integer("locked_until"),
  createdAt: integer("created_at").notNull(),
});

export const customer = sqliteTable("customer", {
  userName: text("user_name").primaryKey(),
});

export const account = sqliteTable("account", {
  userName: text("user_name").primaryKey(),
  status: text("status", { enum: ["active", "disabled"] }).notNull(),
});

export const contactInfo = sqliteTable("contact_info", {
  userName: text("user_name").primaryKey(),
  familyName: text("family_name"),
  givenName: text("given_name"),
  email: text("email"),
  telephone: text("telephone"),
  street1: text("street1"),
  street2: text("street2"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
});

export const creditCard = sqliteTable("credit_card", {
  userName: text("user_name").primaryKey(),
  number: text("number"),
  type: text("type"),
  expiry: text("expiry"),
});

export const profile = sqliteTable("profile", {
  userName: text("user_name").primaryKey(),
  language: text("language").notNull().default("en_US"),
  favoriteCategory: text("favorite_category"),
  myList: integer("my_list", { mode: "boolean" }).notNull().default(true),
  banner: integer("banner", { mode: "boolean" }).notNull().default(true),
});
