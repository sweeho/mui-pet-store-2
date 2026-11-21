import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

export const product = sqliteTable("product", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id),
});

export const item = sqliteTable("item", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => product.id),
});

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
  (t) => [primaryKey({ columns: [t.categoryId, t.locale] })],
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
  (t) => [primaryKey({ columns: [t.productId, t.locale] })],
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
