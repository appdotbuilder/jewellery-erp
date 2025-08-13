import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import all schemas
import {
  createInventoryItemInputSchema,
  updateInventoryItemInputSchema,
  inventorySearchInputSchema,
  createSupplierInputSchema,
  createCustomerInputSchema,
  customerPurchaseHistoryInputSchema,
  createSalesTransactionInputSchema,
  createPurchaseOrderInputSchema,
  purchaseOrderStatusSchema,
  createAccountInputSchema,
  createJournalEntryInputSchema
} from './schema';

// Import all handlers
// Inventory Management
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventoryItems,
  updateStockQuantity
} from './handlers/inventory_management';

// POS Management
import {
  createSalesTransaction,
  getSalesTransactionById,
  getSalesTransactionItems,
  getSalesTransactions,
  getItemBySku,
  generateSalesReceipt
} from './handlers/pos_management';

// Purchase Management
import {
  createPurchaseOrder,
  getPurchaseOrderById,
  getPurchaseOrders,
  getPurchaseOrderItems,
  updatePurchaseOrderStatus,
  receivePurchaseOrder,
  getPurchaseOrdersBySupplier
} from './handlers/purchase_management';

// Supplier Management
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} from './handlers/supplier_management';

// Customer Management
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchaseHistory,
  searchCustomers
} from './handlers/customer_management';

// Financial Accounting
import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deactivateAccount,
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  getJournalEntryLines,
  getTrialBalance,
  getProfitLossStatement,
  getBalanceSheet,
  getAccountsPayable,
  getAccountsReceivable,
  recordCashTransaction,
  recordBankTransaction
} from './handlers/financial_accounting';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Inventory Management Routes
  inventory: router({
    create: publicProcedure
      .input(createInventoryItemInputSchema)
      .mutation(({ input }) => createInventoryItem(input)),
    
    getAll: publicProcedure
      .query(() => getInventoryItems()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getInventoryItemById(input.id)),
    
    update: publicProcedure
      .input(updateInventoryItemInputSchema)
      .mutation(({ input }) => updateInventoryItem(input)),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteInventoryItem(input.id)),
    
    search: publicProcedure
      .input(inventorySearchInputSchema)
      .query(({ input }) => searchInventoryItems(input)),
    
    updateStock: publicProcedure
      .input(z.object({ itemId: z.number(), newQuantity: z.number().int().nonnegative() }))
      .mutation(({ input }) => updateStockQuantity(input.itemId, input.newQuantity))
  }),

  // POS Routes
  pos: router({
    createSale: publicProcedure
      .input(createSalesTransactionInputSchema)
      .mutation(({ input }) => createSalesTransaction(input)),
    
    getSaleById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getSalesTransactionById(input.id)),
    
    getSaleItems: publicProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(({ input }) => getSalesTransactionItems(input.transactionId)),
    
    getAllSales: publicProcedure
      .query(() => getSalesTransactions()),
    
    getItemBySku: publicProcedure
      .input(z.object({ sku: z.string() }))
      .query(({ input }) => getItemBySku(input.sku)),
    
    generateReceipt: publicProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(({ input }) => generateSalesReceipt(input.transactionId))
  }),

  // Purchase Management Routes
  purchase: router({
    createOrder: publicProcedure
      .input(createPurchaseOrderInputSchema)
      .mutation(({ input }) => createPurchaseOrder(input)),
    
    getOrderById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getPurchaseOrderById(input.id)),
    
    getAllOrders: publicProcedure
      .query(() => getPurchaseOrders()),
    
    getOrderItems: publicProcedure
      .input(z.object({ purchaseOrderId: z.number() }))
      .query(({ input }) => getPurchaseOrderItems(input.purchaseOrderId)),
    
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: purchaseOrderStatusSchema }))
      .mutation(({ input }) => updatePurchaseOrderStatus(input.id, input.status)),
    
    receiveOrder: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => receivePurchaseOrder(input.id)),
    
    getOrdersBySupplier: publicProcedure
      .input(z.object({ supplierId: z.number() }))
      .query(({ input }) => getPurchaseOrdersBySupplier(input.supplierId))
  }),

  // Supplier Management Routes
  suppliers: router({
    create: publicProcedure
      .input(createSupplierInputSchema)
      .mutation(({ input }) => createSupplier(input)),
    
    getAll: publicProcedure
      .query(() => getSuppliers()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getSupplierById(input.id)),
    
    update: publicProcedure
      .input(z.object({ id: z.number() }).merge(createSupplierInputSchema.partial()))
      .mutation(({ input }) => {
        const { id, ...updateData } = input;
        return updateSupplier(id, updateData);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteSupplier(input.id))
  }),

  // Customer Management Routes
  customers: router({
    create: publicProcedure
      .input(createCustomerInputSchema)
      .mutation(({ input }) => createCustomer(input)),
    
    getAll: publicProcedure
      .query(() => getCustomers()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCustomerById(input.id)),
    
    update: publicProcedure
      .input(z.object({ id: z.number() }).merge(createCustomerInputSchema.partial()))
      .mutation(({ input }) => {
        const { id, ...updateData } = input;
        return updateCustomer(id, updateData);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCustomer(input.id)),
    
    getPurchaseHistory: publicProcedure
      .input(customerPurchaseHistoryInputSchema)
      .query(({ input }) => getCustomerPurchaseHistory(input)),
    
    search: publicProcedure
      .input(z.object({ searchTerm: z.string() }))
      .query(({ input }) => searchCustomers(input.searchTerm))
  }),

  // Financial Accounting Routes
  accounting: router({
    // Chart of Accounts
    accounts: router({
      create: publicProcedure
        .input(createAccountInputSchema)
        .mutation(({ input }) => createAccount(input)),
      
      getAll: publicProcedure
        .query(() => getAccounts()),
      
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => getAccountById(input.id)),
      
      update: publicProcedure
        .input(z.object({ id: z.number() }).merge(createAccountInputSchema.partial()))
        .mutation(({ input }) => {
          const { id, ...updateData } = input;
          return updateAccount(id, updateData);
        }),
      
      deactivate: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(({ input }) => deactivateAccount(input.id))
    }),

    // Journal Entries
    journalEntries: router({
      create: publicProcedure
        .input(createJournalEntryInputSchema)
        .mutation(({ input }) => createJournalEntry(input)),
      
      getAll: publicProcedure
        .query(() => getJournalEntries()),
      
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => getJournalEntryById(input.id)),
      
      getLines: publicProcedure
        .input(z.object({ journalEntryId: z.number() }))
        .query(({ input }) => getJournalEntryLines(input.journalEntryId))
    }),

    // Financial Reports
    reports: router({
      trialBalance: publicProcedure
        .input(z.object({ asOfDate: z.coerce.date().optional() }))
        .query(({ input }) => getTrialBalance(input.asOfDate)),
      
      profitLoss: publicProcedure
        .input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }))
        .query(({ input }) => getProfitLossStatement(input.startDate, input.endDate)),
      
      balanceSheet: publicProcedure
        .input(z.object({ asOfDate: z.coerce.date() }))
        .query(({ input }) => getBalanceSheet(input.asOfDate)),
      
      accountsPayable: publicProcedure
        .query(() => getAccountsPayable()),
      
      accountsReceivable: publicProcedure
        .query(() => getAccountsReceivable())
    }),

    // Cash and Bank Transactions
    transactions: router({
      recordCash: publicProcedure
        .input(z.object({
          accountId: z.number(),
          amount: z.number(),
          description: z.string(),
          transactionDate: z.coerce.date()
        }))
        .mutation(({ input }) => recordCashTransaction(
          input.accountId,
          input.amount,
          input.description,
          input.transactionDate
        )),
      
      recordBank: publicProcedure
        .input(z.object({
          accountId: z.number(),
          amount: z.number(),
          description: z.string(),
          transactionDate: z.coerce.date()
        }))
        .mutation(({ input }) => recordBankTransaction(
          input.accountId,
          input.amount,
          input.description,
          input.transactionDate
        ))
    })
  })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
  console.log('Available endpoints:');
  console.log('- Inventory Management: inventory.*');
  console.log('- Point of Sale: pos.*');
  console.log('- Purchase Management: purchase.*');
  console.log('- Supplier Management: suppliers.*');
  console.log('- Customer Management: customers.*');
  console.log('- Financial Accounting: accounting.*');
}

start();