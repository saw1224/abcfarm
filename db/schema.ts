import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
export const inventory = sqliteTable(
  "inventory",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    dose: text("dose").notNull(),
    presentation: text("presentation").notNull(),
    brand: text("brand").notNull().default("Genérico"),
    stock: integer("stock").notNull().default(0),
  salePrice: real("sale_price").notNull(),
  itemCode: text("item_code"),
  lot: text("lot"),
  expiryDate: text("expiry_date"),
  productCode: text("product_code"),
  unitCode: text("unit_code"),
  unitName: text("unit_name"),
  retailPrice: real("retail_price"),
  discountPercent: real("discount_percent"),
  discountPo: real("discount_po"),
  discountSo: real("discount_so"),
  discountPcc: real("discount_pcc"),
  discountFair: real("discount_fair"),
  netPrice: real("net_price"),
  lineAmount: real("line_amount"),
  sourceFile: text("source_file"),
  imageInfoText: text("image_info_text"),
  imageInfoJson: text("image_info_json"),
  imageAnalyzedAt: text("image_analyzed_at"),
  entryDate: text("entry_date"),
  updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_inventory_owner_product").on(
      table.ownerId,
      table.name,
      table.dose,
      table.presentation,
    ),
  ],
);

export const appUsers = sqliteTable(
  "app_users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("Empleado"),
    status: text("status").notNull().default("Activo"),
    passwordSalt: text("password_salt"),
    passwordHash: text("password_hash"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_app_users_owner_email").on(table.ownerId, table.email),
  ],
);

export const pharmacySources = sqliteTable(
  "pharmacy_sources",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: text("owner_id").notNull(),
    sourceKey: text("source_key").notNull(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_pharmacy_sources_owner_key").on(
      table.ownerId,
      table.sourceKey,
    ),
  ],
);
