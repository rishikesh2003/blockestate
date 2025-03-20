import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicKey: varchar("public_key", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' or 'government'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  authId: text("auth_id"), // Clerk auth ID
});

// Define users relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedProperties: many(properties),
  verifications: many(verifications),
  buyerTransactions: many(transactions, { relationName: "buyer" }),
  sellerTransactions: many(transactions, { relationName: "seller" }),
}));

// Properties table
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockchainId: integer("blockchain_id"), // ID on the blockchain
  ownerId: uuid("owner_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  documentUrl: text("document_url"), // URL to the stored document
  documentHash: varchar("document_hash", { length: 255 }), // Hash stored on the blockchain
  imgUrl: text("img_url"), // URL to the property image
  isForSale: boolean("is_for_sale").default(false),
  isVerified: boolean("is_verified").default(false),
  price: varchar("price", { length: 255 }), // Price in ETH
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define properties relations
// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").references(() => users.id),
  sellerId: uuid("seller_id").references(() => users.id),
  propertyId: uuid("property_id").references(() => properties.id),
  amount: varchar("amount", { length: 255 }), // Amount in ETH
  transactionHash: varchar("transaction_hash", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Verifications table
export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  governmentUserId: uuid("government_user_id").references(() => users.id),
  propertyId: uuid("property_id").references(() => properties.id),
  verifiedAt: timestamp("verified_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'approved', 'rejected'
});
