# Biryani Shop Management System
## Database Architecture & PostgreSQL Schema Specification

**Document:** 07 — Database Architecture  
**Version:** 1.0  
**Status:** Foundation Specification  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Application:** Next.js  
**Architecture:** Relational Database  
**Primary Goal:** Reliable shop operations with simple reporting and inventory tracking

---

# 1. Purpose

This document defines the database architecture for the Biryani Shop Management System.

The database must support:
- Products
- Categories
- Sales
- Sale items
- Payments
- Inventory
- Inventory movements
- Expenses
- Expense categories
- Users
- Roles
- Permissions
- Settings
- Audit logs
- Reporting

The database must remain simple enough for a small biryani shop while maintaining professional data integrity.

---

# 2. Database Technology

The project MUST use:

```text
PostgreSQL
+
Prisma ORM
```

No other primary database should be introduced.
Do not introduce MongoDB, MySQL, SQLite, Firebase, Supabase Database, or Redis as primary database unless the architecture is explicitly changed in a future specification.

# 3. Database Architecture

The system follows:

```text
Next.js
   ↓
Application Services
   ↓
Repositories
   ↓
Prisma
   ↓
PostgreSQL
```

The frontend must NEVER communicate directly with PostgreSQL.

# 4. Database Design Principles

The database must prioritize:
- Data integrity
- Referential integrity
- Consistency
- Transaction safety
- Historical accuracy
- Simple querying
- Maintainability
- Reasonable performance

Do not over-engineer the schema.

# 5. Core Entities

The initial database consists of the following major entities:

- User
- Role
- Permission
- Category
- Product
- Sale
- SaleItem
- Payment
- InventoryItem
- InventoryTransaction
- Expense
- ExpenseCategory
- Setting
- AuditLog

# 6. High-Level Relationship Diagram

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │     Role     │
                    └──────────────┘

┌──────────────┐       ┌──────────────┐
│   Category   │──────<│   Product    │
└──────────────┘       └──────┬───────┘
                              │
                              │
                     ┌────────▼────────┐
                     │ Inventory Item  │
                     └────────┬────────┘
                              │
                     ┌────────▼────────────┐
                     │ Inventory Transaction│
                     └─────────────────────┘

┌──────────────┐
│     Sale     │
└──────┬───────┘
       │
       ├──────────< SaleItem >──────── Product
       │
       └──────────< Payment

┌────────────────┐
│    Expense     │
└───────┬────────┘
        │
        └──────── ExpenseCategory
```

# 7. UUIDs

Primary keys should preferably use UUIDs.

Example: `id UUID PRIMARY KEY`

This avoids predictable sequential identifiers being exposed through APIs.

# 8. IDs

Every primary entity must have a unique ID.
Example: User.id, Product.id, Sale.id, Expense.id, InventoryItem.id
Do not use product names or invoice numbers as database primary keys.

# 9. Timestamps

Major entities should have:
- `createdAt`
- `updatedAt`
where appropriate.
Use database-compatible timestamp types with timezone awareness.

# 10. User Table

The User entity represents a person who can access the application.

Conceptual fields:
```text
User
├── id
├── name
├── email / username
├── passwordHash
├── roleId
├── isActive
├── createdAt
└── updatedAt
```
The exact authentication fields depend on the authentication implementation.

# 11. User Security

Never store plaintext passwords.
The database must store `passwordHash`, not `password`.

# 12. Role

The role defines the user's general access level.
Example roles: ADMIN, CASHIER
The exact role list should remain minimal unless the business requires more.

# 13. Permission

Permissions provide granular authorization.

Examples:
- products:view, products:create, products:update
- sales:view, sales:create, sales:void
- inventory:view, inventory:adjust
- expenses:view, expenses:create, expenses:update
- reports:view
- users:manage
- settings:manage

# 14. Role-Permission Relationship

Conceptually:
```text
Role
  │
  └──< RolePermission >── Permission
```
This allows the system to control what each role can do.

# 15. Category

Categories organize products.
Examples: Biryani, Drinks, Sides, Extras

Conceptual fields:
```text
Category
├── id
├── name
├── description
├── isActive
├── createdAt
└── updatedAt
```

# 16. Category Rules

Category names should be unique where appropriate.
Inactive categories should not be selectable for new products unless explicitly supported.
Do not physically delete categories that are referenced by historical data unless referential behavior has been explicitly designed.

# 17. Product

The Product entity represents something sold by the shop.
Examples: Chicken Biryani, Beef Biryani, Raita, Cold Drink, Salad

Conceptual fields:
```text
Product
├── id
├── categoryId
├── name
├── description
├── sellingPrice
├── isActive
├── isAvailable
├── createdAt
└── updatedAt
```

# 18. Product Status

Separate `isActive` from `isAvailable`.

Potential meaning:
`isActive`: Whether the product exists as a managed product.
`isAvailable`: Whether it can currently be sold.

For example:
Chicken Biryani (Active = true, Available = false) means the product exists but is temporarily unavailable.

# 19. Product Price

The current product price is stored on the Product entity.
However, historical sales MUST NOT depend on the current product price.

# 20. Historical Price Rule

When a sale is created:
`Product current price` -> `SaleItem.unitPrice`

The sale item stores the price used during that transaction.
Therefore: Product price changes -> Old SaleItems remain unchanged.
This is mandatory.

# 21. Sale

The Sale entity represents a completed or otherwise recorded POS transaction.

Conceptual fields:
```text
Sale
├── id
├── invoiceNumber
├── subtotal
├── discount
├── total
├── status
├── paymentMethod
├── createdById
├── createdAt
└── updatedAt
```

The final fields must follow the implementation plan.

# 22. Invoice Number

Each sale should have a human-readable invoice/receipt number.
Example: INV-000001, INV-000002
This is NOT the primary database key.

# 23. Invoice Number Rules

Invoice numbers must:
- Be unique
- Be generated server-side
- Never be generated solely by the browser
- Never depend on the frontend clock
- Remain associated with the historical transaction

# 24. Sale Status

Use a controlled status.
Example: COMPLETED, VOIDED
Additional statuses should only be added if a real workflow requires them.

# 25. Sale Item

A Sale contains multiple SaleItems.

Conceptually:
```text
Sale
  │
  └──< SaleItem
```

Fields:
```text
SaleItem
├── id
├── saleId
├── productId
├── productName
├── quantity
├── unitPrice
├── subtotal
└── createdAt
```

# 26. Historical Product Name

The sale item may store the product name used at the time of sale.
This prevents historical receipts from changing if the product name is later edited.

# 27. Sale Item Price

`unitPrice` must represent the actual price used in the sale.
The backend calculates this.
The frontend cannot be the authoritative source.

# 28. Sale Item Quantity

Quantity must be positive.
The system must reject: 0, negative quantity, invalid numeric values unless a specific adjustment workflow requires otherwise.

# 29. Payment

A sale may have one payment record for the MVP.

Conceptual fields:
```text
Payment
├── id
├── saleId
├── amount
├── method
├── createdAt
└── updatedAt
```

# 30. Payment Methods

The MVP should support only required methods.
Potential: CASH, OTHER
If additional methods are required later: CARD, BANK, EASYPAISA, JAZZCASH may be added through a documented schema change.
Do not implement unnecessary payment infrastructure.

# 31. Payment Amount

For a completed sale: `Payment.amount` = `Sale.total` unless the business later supports partial payments.

# 32. Inventory Item

InventoryItem represents stock managed by the shop.
Examples: Rice, Cooking Oil, Chicken, Beef, Potatoes, Spices, Drinks, Packaging

Conceptual fields:
```text
InventoryItem
├── id
├── name
├── unit
├── currentQuantity
├── minimumQuantity
├── isActive
├── createdAt
└── updatedAt
```

# 33. Inventory Unit

Each inventory item must have a unit.
Examples: kg, g, liter, ml, piece, box, pack
Do not store unitless inventory when a meaningful unit exists.

# 34. Inventory Quantity

Inventory quantities should support appropriate precision.
For example: 12.5 kg, 7.25 liters
The exact PostgreSQL numeric precision/scale must be defined during schema implementation based on business requirements.

# 35. Minimum Stock

`minimumQuantity` defines the threshold below which the system should consider stock low.
Example: Current = 8 kg, Minimum = 10 kg -> Status = LOW STOCK

# 36. Inventory Transaction

Every stock-changing operation should create an inventory transaction record.

Conceptually:
```text
InventoryTransaction
├── id
├── inventoryItemId
├── type
├── quantity
├── previousQuantity
├── newQuantity
├── reason
├── referenceType
├── referenceId
├── createdById
└── createdAt
```

# 37. Inventory Transaction Types

Potential types: STOCK_IN, STOCK_OUT, ADJUSTMENT, SALE, VOID_REVERSAL
Only types actually required by the implemented workflows should be used.

# 38. Inventory Auditability

Never update inventory without considering whether a corresponding inventory transaction should exist.
The system should be able to answer: Why did this stock quantity change?

# 39. Inventory Transaction Example

Suppose: Current Rice = 100 kg
Stock-in: +50 kg
Transaction: previousQuantity = 100, quantity = 50, newQuantity = 150, type = STOCK_IN

# 40. Inventory Adjustment Example

Suppose: Current = 150 kg, Actual physical stock = 145 kg
Adjustment: previousQuantity = 150, quantity = -5, newQuantity = 145, type = ADJUSTMENT, reason = Physical stock count

# 41. Expense Category

Expense categories organize shop expenses.
Examples: Gas, Electricity, Rent, Ingredients, Packaging, Transport, Maintenance, Other

Conceptual fields:
```text
ExpenseCategory
├── id
├── name
├── isActive
├── createdAt
└── updatedAt
```

# 42. Expense

Expense represents money spent by the business.

Conceptual fields:
```text
Expense
├── id
├── categoryId
├── amount
├── description
├── paymentMethod
├── expenseDate
├── createdById
├── createdAt
└── updatedAt
```

# 43. Expense Amount

Expense amount must:
- Be positive
- Use exact monetary representation
- Be validated server-side

Do not store negative expenses simply to represent normal expense entries.

# 44. Expense Date

The business date of an expense should be stored separately from the record creation timestamp where appropriate.
Example: `expenseDate`, `createdAt`
These may differ.

# 45. Settings

The Settings entity stores shop configuration.
Potential settings: Shop Name, Currency, Timezone, Receipt Footer, Low Stock Threshold Defaults
Do not store arbitrary application state in settings.

# 46. Audit Log

AuditLog records important user actions.

Conceptual fields:
```text
AuditLog
├── id
├── userId
├── action
├── entityType
├── entityId
├── metadata
└── createdAt
```

# 47. Audit Metadata

Metadata may contain useful context.
Example: `{"oldPrice": 250, "newPrice": 280}`
Do not store passwords, secrets, or sensitive authentication data.

# 48. Referential Integrity

Foreign keys must be used.
Examples: `Product.categoryId`, `Sale.createdById`, `SaleItem.saleId`, `SaleItem.productId`, `Payment.saleId`, `Expense.categoryId`, `InventoryTransaction.inventoryItemId`
The database should enforce relationships wherever practical.

# 49. Delete Strategy

Do not blindly use hard deletion. Historical records must remain reliable.
For important entities, prefer `isActive = false` or controlled status transitions.

# 50. Product Deletion

Products with historical sales should generally NOT be physically deleted.
Instead: `isActive = false`
This preserves historical relationships.

# 51. Category Deletion

Categories referenced by products or historical records should generally be deactivated rather than physically deleted.

# 52. Sales Deletion

Completed sales should NOT be physically deleted.
Use: `status = VOIDED` when the business workflow permits cancellation.

# 53. Expense Deletion

Financial history should be preserved.
The final implementation should define whether expense corrections use void or another controlled approach.
Do not allow unrestricted permanent deletion of financial records.

# 54. Inventory Deletion

Inventory records with historical movements should generally be deactivated rather than deleted.

# 55. Unique Constraints

Important fields should have appropriate unique constraints.
Examples: User.email / username, Category.name, InvoiceNumber, Permission.code
The exact uniqueness rules must reflect the business requirements.

# 56. Indexing

Indexes should be created for frequently queried fields.
Potential indexes:
- Product.categoryId, Product.isActive
- Sale.createdAt, Sale.status, Sale.invoiceNumber
- SaleItem.saleId, SaleItem.productId
- Expense.expenseDate, Expense.categoryId
- InventoryTransaction.inventoryItemId, InventoryTransaction.createdAt
- AuditLog.userId, AuditLog.createdAt
Do not create indexes for every column.

# 57. Composite Indexes

Composite indexes may be used where real query patterns justify them.
Example: `Sale(status, createdAt)` if reports frequently filter by both.
Indexes must be based on actual query patterns.

# 58. Database Constraints

Use database constraints where appropriate.
Examples: NOT NULL, UNIQUE, FOREIGN KEY, CHECK
Business-critical invariants should not rely exclusively on frontend validation.

# 59. Monetary Database Type

Money should use PostgreSQL NUMERIC/DECIMAL rather than floating-point types.
Example conceptually: `NUMERIC(12,2)`
The exact precision should be chosen according to expected shop volume.

# 60. Quantity Database Type

Inventory quantities should use an exact numeric type rather than floating-point where fractional quantities are required.
Example: `NUMERIC(12,3)`
The exact scale should depend on the unit requirements.

# 61. Enum Strategy

Use controlled enums for values with a stable finite set.
Examples: SaleStatus, PaymentMethod, InventoryTransactionType
Avoid using free-form strings for critical status values.

# 62. Schema Naming

Use consistent naming conventions.
Recommended: camelCase for Prisma/TypeScript fields.
PostgreSQL naming should follow the project's Prisma configuration consistently.
Do not mix snake_case, camelCase, PascalCase randomly.

# 63. Relationship Naming

Relationships must have clear names.
Examples: Sale.items, Sale.payment, Sale.createdBy, Product.category, Expense.category, InventoryItem.transactions

# 64. Sale Relationship

Conceptually:
```text
Sale
 │
 ├── createdBy → User
 │
 ├── items[] → SaleItem
 │
 └── payment → Payment
```

# 65. Product Relationship

```text
Category
   │
   └── products[]
          │
          └── SaleItem[]
```
The relationship between products and historical sales must remain intact.

# 66. Inventory Relationship

```text
InventoryItem
      │
      └── transactions[]
```
Each inventory transaction references exactly one inventory item.

# 67. Expense Relationship

```text
ExpenseCategory
      │
      └── expenses[]
```

# 68. User Relationship

A user may: Create sales, Create expenses, Perform inventory adjustments, Create audit records depending on permissions.

# 69. Transaction Requirements

Database transactions must be used for multi-step operations.
Sale creation: Sale + SaleItems + Payment + Inventory changes + Audit log should be atomic where inventory is integrated with the sale.

# 70. Sale Transaction Integrity

If Sale creation succeeds but Inventory update fails, the system must NOT leave a partially completed transaction unless the business workflow explicitly supports it.

# 71. Inventory Transaction Integrity

When changing inventory: `InventoryItem` + `InventoryTransaction` must remain consistent.
If one operation fails, the database transaction should roll back.

# 72. Reporting Data

Reports should be generated from transactional data.
Do not create manually maintained totals such as `totalSalesToday`, `totalExpensesToday` unless there is a documented performance requirement.

# 73. Dashboard Data

Dashboard values should be derived from authoritative records.
Example: Today's Sales = SUM(valid completed Sale.total) rather than a manually maintained number.

# 74. Historical Accuracy

Historical records must remain accurate even if current data changes.
Examples: Product price changes, Product name changes, Category changes, User role changes should not corrupt historical transactions.

# 75. Soft Deletion

Soft deletion should be used selectively.
Recommended for: Products, Categories, Inventory Items, Users
Do not add soft-delete fields to every table without reason.

# 76. Data Retention

Do not automatically delete: Sales, SaleItems, Payments, InventoryTransactions, AuditLogs unless a formal retention policy is introduced.

# 77. Database Migrations

Every schema change must be performed through Prisma migrations.
Never manually change production schema without recording the change in the migration system.

# 78. Migration Workflow

Development: Modify Prisma schema -> Create migration -> Apply migration -> Test
Production: Approved migration -> Deploy migration -> Verify database

# 79. Migration Rules

The AI must NOT:
❌ Delete production tables casually
❌ Drop columns without checking data
❌ Rename fields without migration
❌ Change types without migration
❌ Reset production database

# 80. Seed Data

Development may use seed data.
Examples: Admin user, Categories, Sample products, Expense categories, Permissions
Seed data must be clearly distinguishable from real business data.

# 81. Production Seed Safety

Production seeding must NOT accidentally:
Delete real records, Reset the database, Overwrite real products, Create duplicate admin users

# 82. Database Environment

The application should use environment variables for database configuration.
Example conceptually: `DATABASE_URL`
The actual secret must never be committed to Git.

# 83. Database Security

Database credentials must:
Remain server-side, Never appear in client bundles, Never be committed to Git, Never be printed in logs.

# 84. Backup Strategy

The production PostgreSQL database must have a backup strategy.
The application itself should not assume that backups are automatically available unless the hosting/database provider explicitly provides them.

# 85. Restore Testing

A backup is not considered reliable until restoration has been tested.
The deployment documentation must define: Backup, Restore, Verification procedures.

# 86. Database Performance

The initial application is small.
Therefore: Simple queries, Proper indexes, Pagination, Efficient joins should be sufficient.
Do not prematurely introduce: Complex caching, Materialized views, Event sourcing, Distributed databases, Microservices.

# 87. N+1 Query Prevention

The backend should avoid unnecessary N+1 database queries.
Use appropriate Prisma relations/includes/selects.
Do not fetch the same entity repeatedly inside loops.

# 88. Select Only Required Fields

Queries should avoid returning unnecessary columns.
Use appropriate Prisma select where useful.
This improves: Performance, Security, Network usage.

# 89. Pagination Requirement

Large lists should use pagination.
Especially: Sales, Expenses, Inventory transactions, Audit logs, Products.

# 90. Database Testing

Database tests should verify:
Relations, Constraints, Transactions, Unique fields, Sale creation, Inventory updates, Expense creation, Historical price preservation, Sale void behavior.

# 91. Critical Database Invariants

The following must always remain true.
Invariant 1: Every SaleItem belongs to a valid Sale.
Invariant 2: Every SaleItem references a valid Product unless historical deletion behavior explicitly handles it.
Invariant 3: Every Payment belongs to a valid Sale.
Invariant 4: Every InventoryTransaction belongs to a valid InventoryItem.
Invariant 5: Historical SaleItem prices do not change when Product prices change.
Invariant 6: Completed sales cannot be silently deleted.
Invariant 7: Inventory changes are auditable.
Invariant 8: Financial amounts use exact monetary representation.

# 92. Example Sale Data

Conceptually:
```text
Sale
--------------------------------
id: UUID
invoiceNumber: INV-000123
subtotal: 1000.00
discount: 50.00
total: 950.00
status: COMPLETED

SaleItems
--------------------------------
Chicken Biryani
quantity: 2
unitPrice: 250.00
subtotal: 500.00

Beef Biryani
quantity: 1
unitPrice: 450.00
subtotal: 450.00
```

# 93. Example Expense

```text
Expense
--------------------------------
category: Gas
amount: 5000.00
description: Monthly gas expense
expenseDate: 2026-08-26
```

# 94. Example Inventory

```text
InventoryItem
--------------------------------
name: Rice
unit: kg
currentQuantity: 120.000
minimumQuantity: 20.000
```

# 95. Database Architecture Rule

The database is the authoritative persistent source of business data.
The frontend must not maintain an independent copy of financial truth.

# 96. AI Database Rules

The AI coding agent MUST:
- Read this document before changing the database.
- Check existing Prisma schema before creating models.
- Reuse existing entities where possible.
- Never duplicate the same concept in multiple tables without justification.
- Use foreign keys.
- Use appropriate unique constraints.
- Use exact monetary types.
- Preserve historical transaction data.
- Use migrations.
- Use transactions for multi-step operations.
- Avoid destructive production migrations.
- Add indexes based on real query requirements.
- Keep the schema simple.
- Never create a second database.
- Never use the frontend as the source of truth.

# 97. AI Database Anti-Patterns

The following are prohibited:
❌ Duplicate Product tables
❌ Duplicate Sale tables
❌ Floating-point money
❌ Plaintext passwords
❌ Random JSON blobs for relational data
❌ No foreign keys
❌ No unique constraints where required
❌ Hard-delete historical sales
❌ Store current prices only and reconstruct historical prices
❌ Direct SQL from frontend
❌ Production database resets
❌ Untracked schema changes
❌ Arbitrary fields added without documentation

# 98. Schema Change Protocol

Before adding a new table or field, the AI must determine:
1. Does this concept already exist?
2. Can an existing table support it?
3. Is this field actually required?
4. Is the relationship necessary?
5. Will historical data be affected?
6. Does the API need it?
7. Does the UI need it?
8. Does the migration preserve existing data?

Only then should the schema change be implemented.

# 99. Final Database Architecture

The intended structure is:

AUTHORIZATION
User, Role, Permission

PRODUCT CATALOG
Category, Product

SALES
Sale, SaleItem, Payment

INVENTORY
InventoryItem, InventoryTransaction

FINANCE
Expense, ExpenseCategory

SYSTEM
Setting, AuditLog

# 100. Final Principle

The database should remain:
Small, relational, normalized where useful, transaction-safe, historically accurate, and easy to understand.
Do not turn a simple biryani shop into a giant ERP database.

# 101. Golden Rule

Before adding anything to PostgreSQL:
```text
Requirement
   ↓
Business Need
   ↓
Existing Entity Check
   ↓
Schema Design
   ↓
Migration
   ↓
Repository
   ↓
Service
   ↓
API
   ↓
Frontend
```
Never start with: "Let's create a new table."
The database must serve the business requirements, not the other way around.
