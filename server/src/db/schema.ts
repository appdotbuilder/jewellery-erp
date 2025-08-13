import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const metalTypeEnum = pgEnum('metal_type', ['Gold', 'Silver', 'Platinum', 'Other']);
export const stoneTypeEnum = pgEnum('stone_type', ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Other']);
export const paymentMethodEnum = pgEnum('payment_method', ['Cash', 'Card', 'Bank_Transfer', 'Check']);
export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', ['Draft', 'Confirmed', 'Received', 'Cancelled']);
export const accountTypeEnum = pgEnum('account_type', ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']);

// Suppliers table
export const suppliersTable = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contact_person: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Customers table
export const customersTable = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Inventory items table
export const inventoryItemsTable = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  item_name: text('item_name').notNull(),
  description: text('description'),
  sku: text('sku').notNull().unique(),
  metal_type: metalTypeEnum('metal_type').notNull(),
  metal_purity: text('metal_purity').notNull(), // e.g., "22K", "18K", "925"
  gross_weight: numeric('gross_weight', { precision: 10, scale: 3 }).notNull(), // in grams
  net_weight: numeric('net_weight', { precision: 10, scale: 3 }).notNull(), // in grams
  stone_type: stoneTypeEnum('stone_type'),
  stone_weight: numeric('stone_weight', { precision: 10, scale: 3 }), // in carats
  number_of_stones: integer('number_of_stones'),
  making_charges: numeric('making_charges', { precision: 10, scale: 2 }).notNull(),
  hallmarking_details: text('hallmarking_details'),
  certification_details: text('certification_details'),
  supplier_id: integer('supplier_id').references(() => suppliersTable.id),
  current_stock: integer('current_stock').notNull(),
  purchase_price: numeric('purchase_price', { precision: 10, scale: 2 }).notNull(),
  selling_price: numeric('selling_price', { precision: 10, scale: 2 }).notNull(),
  location: text('location'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Sales transactions table
export const salesTransactionsTable = pgTable('sales_transactions', {
  id: serial('id').primaryKey(),
  customer_id: integer('customer_id').references(() => customersTable.id),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  final_amount: numeric('final_amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  transaction_date: timestamp('transaction_date').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Sales transaction items table
export const salesTransactionItemsTable = pgTable('sales_transaction_items', {
  id: serial('id').primaryKey(),
  transaction_id: integer('transaction_id').notNull().references(() => salesTransactionsTable.id, { onDelete: 'cascade' }),
  inventory_item_id: integer('inventory_item_id').notNull().references(() => inventoryItemsTable.id),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
});

// Purchase orders table
export const purchaseOrdersTable = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  supplier_id: integer('supplier_id').notNull().references(() => suppliersTable.id),
  order_date: timestamp('order_date').defaultNow().notNull(),
  expected_delivery_date: timestamp('expected_delivery_date'),
  status: purchaseOrderStatusEnum('status').notNull().default('Draft'),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Purchase order items table
export const purchaseOrderItemsTable = pgTable('purchase_order_items', {
  id: serial('id').primaryKey(),
  purchase_order_id: integer('purchase_order_id').notNull().references(() => purchaseOrdersTable.id, { onDelete: 'cascade' }),
  inventory_item_id: integer('inventory_item_id').notNull().references(() => inventoryItemsTable.id),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
});

// Chart of accounts table
export const accountsTable = pgTable('accounts', {
  id: serial('id').primaryKey(),
  account_code: text('account_code').notNull().unique(),
  account_name: text('account_name').notNull(),
  account_type: accountTypeEnum('account_type').notNull(),
  parent_account_id: integer('parent_account_id'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    parentAccountReference: foreignKey({
      columns: [table.parent_account_id],
      foreignColumns: [table.id],
    }),
  };
});

// Journal entries table
export const journalEntriesTable = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  entry_date: timestamp('entry_date').notNull(),
  reference_number: text('reference_number'),
  description: text('description').notNull(),
  total_debit: numeric('total_debit', { precision: 10, scale: 2 }).notNull(),
  total_credit: numeric('total_credit', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Journal entry lines table
export const journalEntryLinesTable = pgTable('journal_entry_lines', {
  id: serial('id').primaryKey(),
  journal_entry_id: integer('journal_entry_id').notNull().references(() => journalEntriesTable.id, { onDelete: 'cascade' }),
  account_id: integer('account_id').notNull().references(() => accountsTable.id),
  debit_amount: numeric('debit_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  credit_amount: numeric('credit_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  description: text('description'),
});

// Relations
export const suppliersRelations = relations(suppliersTable, ({ many }) => ({
  inventoryItems: many(inventoryItemsTable),
  purchaseOrders: many(purchaseOrdersTable),
}));

export const customersRelations = relations(customersTable, ({ many }) => ({
  salesTransactions: many(salesTransactionsTable),
}));

export const inventoryItemsRelations = relations(inventoryItemsTable, ({ one, many }) => ({
  supplier: one(suppliersTable, {
    fields: [inventoryItemsTable.supplier_id],
    references: [suppliersTable.id],
  }),
  salesTransactionItems: many(salesTransactionItemsTable),
  purchaseOrderItems: many(purchaseOrderItemsTable),
}));

export const salesTransactionsRelations = relations(salesTransactionsTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [salesTransactionsTable.customer_id],
    references: [customersTable.id],
  }),
  items: many(salesTransactionItemsTable),
}));

export const salesTransactionItemsRelations = relations(salesTransactionItemsTable, ({ one }) => ({
  transaction: one(salesTransactionsTable, {
    fields: [salesTransactionItemsTable.transaction_id],
    references: [salesTransactionsTable.id],
  }),
  inventoryItem: one(inventoryItemsTable, {
    fields: [salesTransactionItemsTable.inventory_item_id],
    references: [inventoryItemsTable.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrdersTable, ({ one, many }) => ({
  supplier: one(suppliersTable, {
    fields: [purchaseOrdersTable.supplier_id],
    references: [suppliersTable.id],
  }),
  items: many(purchaseOrderItemsTable),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItemsTable, ({ one }) => ({
  purchaseOrder: one(purchaseOrdersTable, {
    fields: [purchaseOrderItemsTable.purchase_order_id],
    references: [purchaseOrdersTable.id],
  }),
  inventoryItem: one(inventoryItemsTable, {
    fields: [purchaseOrderItemsTable.inventory_item_id],
    references: [inventoryItemsTable.id],
  }),
}));

export const accountsRelations = relations(accountsTable, ({ one, many }) => ({
  parentAccount: one(accountsTable, {
    fields: [accountsTable.parent_account_id],
    references: [accountsTable.id],
    relationName: 'ParentAccount',
  }),
  childAccounts: many(accountsTable, {
    relationName: 'ParentAccount',
  }),
  journalEntryLines: many(journalEntryLinesTable),
}));

export const journalEntriesRelations = relations(journalEntriesTable, ({ many }) => ({
  lines: many(journalEntryLinesTable),
}));

export const journalEntryLinesRelations = relations(journalEntryLinesTable, ({ one }) => ({
  journalEntry: one(journalEntriesTable, {
    fields: [journalEntryLinesTable.journal_entry_id],
    references: [journalEntriesTable.id],
  }),
  account: one(accountsTable, {
    fields: [journalEntryLinesTable.account_id],
    references: [accountsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Supplier = typeof suppliersTable.$inferSelect;
export type NewSupplier = typeof suppliersTable.$inferInsert;

export type Customer = typeof customersTable.$inferSelect;
export type NewCustomer = typeof customersTable.$inferInsert;

export type InventoryItem = typeof inventoryItemsTable.$inferSelect;
export type NewInventoryItem = typeof inventoryItemsTable.$inferInsert;

export type SalesTransaction = typeof salesTransactionsTable.$inferSelect;
export type NewSalesTransaction = typeof salesTransactionsTable.$inferInsert;

export type SalesTransactionItem = typeof salesTransactionItemsTable.$inferSelect;
export type NewSalesTransactionItem = typeof salesTransactionItemsTable.$inferInsert;

export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrdersTable.$inferInsert;

export type PurchaseOrderItem = typeof purchaseOrderItemsTable.$inferSelect;
export type NewPurchaseOrderItem = typeof purchaseOrderItemsTable.$inferInsert;

export type Account = typeof accountsTable.$inferSelect;
export type NewAccount = typeof accountsTable.$inferInsert;

export type JournalEntry = typeof journalEntriesTable.$inferSelect;
export type NewJournalEntry = typeof journalEntriesTable.$inferInsert;

export type JournalEntryLine = typeof journalEntryLinesTable.$inferSelect;
export type NewJournalEntryLine = typeof journalEntryLinesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  suppliers: suppliersTable,
  customers: customersTable,
  inventoryItems: inventoryItemsTable,
  salesTransactions: salesTransactionsTable,
  salesTransactionItems: salesTransactionItemsTable,
  purchaseOrders: purchaseOrdersTable,
  purchaseOrderItems: purchaseOrderItemsTable,
  accounts: accountsTable,
  journalEntries: journalEntriesTable,
  journalEntryLines: journalEntryLinesTable,
};