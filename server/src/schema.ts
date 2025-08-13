import { z } from 'zod';

// Enums
export const metalTypeSchema = z.enum(['Gold', 'Silver', 'Platinum', 'Other']);
export type MetalType = z.infer<typeof metalTypeSchema>;

export const stoneTypeSchema = z.enum(['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Other']);
export type StoneType = z.infer<typeof stoneTypeSchema>;

export const paymentMethodSchema = z.enum(['Cash', 'Card', 'Bank_Transfer', 'Check']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const purchaseOrderStatusSchema = z.enum(['Draft', 'Confirmed', 'Received', 'Cancelled']);
export type PurchaseOrderStatus = z.infer<typeof purchaseOrderStatusSchema>;

export const accountTypeSchema = z.enum(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']);
export type AccountType = z.infer<typeof accountTypeSchema>;

// Inventory Management Schemas
export const inventoryItemSchema = z.object({
  id: z.number(),
  item_name: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  metal_type: metalTypeSchema,
  metal_purity: z.string(), // e.g., "22K", "18K", "925"
  gross_weight: z.number(), // in grams
  net_weight: z.number(), // in grams
  stone_type: stoneTypeSchema.nullable(),
  stone_weight: z.number().nullable(), // in carats
  number_of_stones: z.number().int().nullable(),
  making_charges: z.number(),
  hallmarking_details: z.string().nullable(),
  certification_details: z.string().nullable(),
  supplier_id: z.number().nullable(),
  current_stock: z.number().int(),
  purchase_price: z.number(),
  selling_price: z.number(),
  location: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const createInventoryItemInputSchema = z.object({
  item_name: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  metal_type: metalTypeSchema,
  metal_purity: z.string(),
  gross_weight: z.number().positive(),
  net_weight: z.number().positive(),
  stone_type: stoneTypeSchema.nullable(),
  stone_weight: z.number().positive().nullable(),
  number_of_stones: z.number().int().nonnegative().nullable(),
  making_charges: z.number().nonnegative(),
  hallmarking_details: z.string().nullable(),
  certification_details: z.string().nullable(),
  supplier_id: z.number().nullable(),
  current_stock: z.number().int().nonnegative(),
  purchase_price: z.number().positive(),
  selling_price: z.number().positive(),
  location: z.string().nullable()
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemInputSchema>;

export const updateInventoryItemInputSchema = z.object({
  id: z.number(),
  item_name: z.string().optional(),
  description: z.string().nullable().optional(),
  sku: z.string().optional(),
  metal_type: metalTypeSchema.optional(),
  metal_purity: z.string().optional(),
  gross_weight: z.number().positive().optional(),
  net_weight: z.number().positive().optional(),
  stone_type: stoneTypeSchema.nullable().optional(),
  stone_weight: z.number().positive().nullable().optional(),
  number_of_stones: z.number().int().nonnegative().nullable().optional(),
  making_charges: z.number().nonnegative().optional(),
  hallmarking_details: z.string().nullable().optional(),
  certification_details: z.string().nullable().optional(),
  supplier_id: z.number().nullable().optional(),
  current_stock: z.number().int().nonnegative().optional(),
  purchase_price: z.number().positive().optional(),
  selling_price: z.number().positive().optional(),
  location: z.string().nullable().optional()
});

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemInputSchema>;

// Supplier/Vendor Schemas
export const supplierSchema = z.object({
  id: z.number(),
  name: z.string(),
  contact_person: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Supplier = z.infer<typeof supplierSchema>;

export const createSupplierInputSchema = z.object({
  name: z.string(),
  contact_person: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable()
});

export type CreateSupplierInput = z.infer<typeof createSupplierInputSchema>;

// Customer Schemas
export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Customer = z.infer<typeof customerSchema>;

export const createCustomerInputSchema = z.object({
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable()
});

export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;

// Sales Transaction Schemas
export const salesTransactionSchema = z.object({
  id: z.number(),
  customer_id: z.number().nullable(),
  total_amount: z.number(),
  discount_amount: z.number(),
  final_amount: z.number(),
  payment_method: paymentMethodSchema,
  transaction_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type SalesTransaction = z.infer<typeof salesTransactionSchema>;

export const salesTransactionItemSchema = z.object({
  id: z.number(),
  transaction_id: z.number(),
  inventory_item_id: z.number(),
  quantity: z.number().int(),
  unit_price: z.number(),
  total_price: z.number()
});

export type SalesTransactionItem = z.infer<typeof salesTransactionItemSchema>;

export const createSalesTransactionInputSchema = z.object({
  customer_id: z.number().nullable(),
  items: z.array(z.object({
    inventory_item_id: z.number(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive()
  })),
  discount_amount: z.number().nonnegative().default(0),
  payment_method: paymentMethodSchema
});

export type CreateSalesTransactionInput = z.infer<typeof createSalesTransactionInputSchema>;

// Purchase Order Schemas
export const purchaseOrderSchema = z.object({
  id: z.number(),
  supplier_id: z.number(),
  order_date: z.coerce.date(),
  expected_delivery_date: z.coerce.date().nullable(),
  status: purchaseOrderStatusSchema,
  total_amount: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;

export const purchaseOrderItemSchema = z.object({
  id: z.number(),
  purchase_order_id: z.number(),
  inventory_item_id: z.number(),
  quantity: z.number().int(),
  unit_price: z.number(),
  total_price: z.number()
});

export type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>;

export const createPurchaseOrderInputSchema = z.object({
  supplier_id: z.number(),
  expected_delivery_date: z.coerce.date().nullable(),
  items: z.array(z.object({
    inventory_item_id: z.number(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive()
  }))
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderInputSchema>;

// Financial Accounting Schemas
export const accountSchema = z.object({
  id: z.number(),
  account_code: z.string(),
  account_name: z.string(),
  account_type: accountTypeSchema,
  parent_account_id: z.number().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date()
});

export type Account = z.infer<typeof accountSchema>;

export const createAccountInputSchema = z.object({
  account_code: z.string(),
  account_name: z.string(),
  account_type: accountTypeSchema,
  parent_account_id: z.number().nullable()
});

export type CreateAccountInput = z.infer<typeof createAccountInputSchema>;

export const journalEntrySchema = z.object({
  id: z.number(),
  entry_date: z.coerce.date(),
  reference_number: z.string().nullable(),
  description: z.string(),
  total_debit: z.number(),
  total_credit: z.number(),
  created_at: z.coerce.date()
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;

export const journalEntryLineSchema = z.object({
  id: z.number(),
  journal_entry_id: z.number(),
  account_id: z.number(),
  debit_amount: z.number(),
  credit_amount: z.number(),
  description: z.string().nullable()
});

export type JournalEntryLine = z.infer<typeof journalEntryLineSchema>;

export const createJournalEntryInputSchema = z.object({
  entry_date: z.coerce.date(),
  reference_number: z.string().nullable(),
  description: z.string(),
  lines: z.array(z.object({
    account_id: z.number(),
    debit_amount: z.number().nonnegative(),
    credit_amount: z.number().nonnegative(),
    description: z.string().nullable()
  })).min(2) // At least 2 lines for double-entry
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntryInputSchema>;

// Financial Reports Schemas
export const trialBalanceItemSchema = z.object({
  account_id: z.number(),
  account_code: z.string(),
  account_name: z.string(),
  account_type: accountTypeSchema,
  debit_balance: z.number(),
  credit_balance: z.number()
});

export type TrialBalanceItem = z.infer<typeof trialBalanceItemSchema>;

export const profitLossItemSchema = z.object({
  account_id: z.number(),
  account_code: z.string(),
  account_name: z.string(),
  amount: z.number()
});

export type ProfitLossItem = z.infer<typeof profitLossItemSchema>;

export const balanceSheetItemSchema = z.object({
  account_id: z.number(),
  account_code: z.string(),
  account_name: z.string(),
  amount: z.number()
});

export type BalanceSheetItem = z.infer<typeof balanceSheetItemSchema>;

// Search and filter schemas
export const inventorySearchInputSchema = z.object({
  search: z.string().optional(),
  metal_type: metalTypeSchema.optional(),
  stone_type: stoneTypeSchema.optional(),
  supplier_id: z.number().optional(),
  location: z.string().optional()
});

export type InventorySearchInput = z.infer<typeof inventorySearchInputSchema>;

export const customerPurchaseHistoryInputSchema = z.object({
  customer_id: z.number(),
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0)
});

export type CustomerPurchaseHistoryInput = z.infer<typeof customerPurchaseHistoryInputSchema>;