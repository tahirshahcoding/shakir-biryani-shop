# Biryani Shop Management System

## Database Specification & Data Model

**Document:** 03 — Database Specification
**Version:** 1.0
**Status:** Foundation Specification
**Database:** PostgreSQL
**ORM:** Prisma
**Architecture:** Layered Modular Monolith

---

# 1. Purpose

This document defines the database architecture and data model for the Biryani Shop Management System.

It establishes:

* Database technology
* Core entities
* Relationships
* Fields
* Data types
* Constraints
* Indexing strategy
* Financial data rules
* Inventory data rules
* Historical data rules
* Transaction requirements
* Deletion rules
* Migration rules
* Seed data requirements

The database must be treated as the authoritative source of persistent business data.

---

# 2. Database Technology

The application will use:

> PostgreSQL

The application will access PostgreSQL through the application's database access layer.

The initial ORM decision is:

> Prisma

Database access must remain isolated from the frontend.

The frontend must never connect directly to PostgreSQL.

---

# 3. Database Philosophy

The database must prioritize:

1. Data integrity
2. Financial accuracy
3. Historical consistency
4. Referential integrity
5. Traceability
6. Query performance
7. Maintainability

The database should remain simple and appropriate for a small shop.

Do not create unnecessary enterprise-level tables or relationships.

---

# 4. Core Entities

The initial database consists of the following core entities:

```text
User
Role
Permission

Category
Product

Sale
SaleItem
Payment

InventoryItem
InventoryTransaction

ExpenseCategory
Expense

AuditLog
```

Some implementation details may evolve, but the business concepts must remain consistent.

---

# 5. Entity Relationship Overview

Conceptually:

```text
Role
 │
 └──────< User

Category
 │
 └──────< Product

User
 │
 ├──────< Sale
 ├──────< Expense
 ├──────< InventoryTransaction
 └──────< AuditLog

Sale
 │
 ├──────< SaleItem
 └──────< Payment

Product
 │
 └──────< SaleItem

InventoryItem
 │
 └──────< InventoryTransaction

ExpenseCategory
 │
 └──────< Expense
```

---

# 6. User Entity

The User represents an authenticated person using the system.

## Required Concepts

A user should contain:

```text
id
name
email/username
passwordHash
roleId
isActive
createdAt
updatedAt
```

The exact authentication fields may depend on the authentication implementation.

---

# 7. User Rules

A user:

* Must have a unique identifier.
* Must have an assigned role.
* Must be active to access the application.
* Must never expose password hashes to the frontend.
* Must not be physically deleted if historical records depend on the user.

Deactivation should be preferred.

---

# 8. Role Entity

Roles determine groups of permissions.

Initial conceptual roles:

```text
OWNER
MANAGER
CASHIER
```

Roles may be expanded later.

---

# 9. Permission Entity

Permissions represent specific capabilities.

Examples:

```text
dashboard:view

sales:create
sales:view
sales:void

products:view
products:create
products:update
products:deactivate

inventory:view
inventory:update
inventory:adjust

expenses:view
expenses:create
expenses:update
expenses:delete

reports:view

users:view
users:create
users:update
users:manage

settings:view
settings:update
```

The exact permission matrix is defined in the security documentation.

---

# 10. Category Entity

Categories organize products.

Examples:

```text
Biryani
Drinks
Sides
Extras
```

Potential fields:

```text
id
name
description
sortOrder
isActive
createdAt
updatedAt
```

---

# 11. Category Rules

Category names should be unique according to the application's business requirements.

Categories should normally be deactivated instead of physically deleted if products reference them.

Inactive categories should not appear in normal POS selection.

---

# 12. Product Entity

Products represent items that can be sold through the POS.

Examples:

```text
Chicken Biryani
Beef Biryani
Family Biryani
Raita
Salad
Soft Drink
```

Potential fields:

```text
id
name
categoryId
sellingPrice
costPrice
unit
imageUrl
isAvailable
isActive
createdAt
updatedAt
```

---

# 13. Product Price Rules

The product's current selling price represents its current POS price.

When the price changes:

```text
Product.currentPrice
```

may change.

However, historical sales must NOT change.

Therefore, each SaleItem must preserve the price used during the sale.

---

# 14. Product Availability

There are two distinct concepts:

### Active

Whether the product exists as an active business record.

### Available

Whether the product can currently be sold through POS.

For example:

```text
isActive = true
isAvailable = false
```

means the product exists but is temporarily unavailable.

---

# 15. Product Deletion

Products referenced by historical sales should normally not be physically deleted.

Instead:

```text
isActive = false
```

This preserves historical relationships.

---

# 16. Sale Entity

Sale represents the overall transaction.

Potential fields:

```text
id
invoiceNumber
subtotal
discount
total
status
createdBy
createdAt
updatedAt
```

The exact payment relationship will be defined through Payment.

---

# 17. Sale Status

Initial statuses:

```text
COMPLETED
VOIDED
```

Additional statuses should not be introduced without a business requirement.

---

# 18. Invoice Number

Every completed sale should have a unique human-readable invoice/order number.

Example:

```text
INV-000001
INV-000002
INV-000003
```

The exact numbering format may be finalized during implementation.

Invoice numbers must be unique.

---

# 19. SaleItem Entity

SaleItem represents an individual product inside a sale.

Required concepts:

```text
id
saleId
productId
productNameSnapshot
unitPrice
quantity
subtotal
```

---

# 20. SaleItem Historical Snapshot

This is a critical database rule.

SaleItem must preserve the information required to correctly display the historical transaction.

Example:

At time of sale:

```text
Chicken Biryani
Price = Rs. 250
Quantity = 2
```

Later the product price becomes:

```text
Rs. 300
```

The old sale must still show:

```text
Chicken Biryani
Rs. 250
× 2
```

Therefore the sale item stores the historical selling price.

---

# 21. Sale Item Calculation

Conceptually:

```text
SaleItem Subtotal =
Unit Price × Quantity
```

The backend must calculate the authoritative value.

The frontend may display a preview.

---

# 22. Sale Calculation

Conceptually:

```text
Subtotal =
SUM(all SaleItem subtotals)

Total =
Subtotal - Valid Discount
```

If tax or additional charges are introduced later, the formula must be explicitly documented before implementation.

Do not invent tax or service-charge logic.

---

# 23. Discount

Discounts must be validated server-side.

The frontend must not be trusted to determine the final sale total.

Example of unsafe behavior:

```text
Browser sends:

total = 10
```

while the actual products are worth:

```text
Rs. 1000
```

The backend must calculate the correct amount independently.

---

# 24. Payment Entity

Payment represents how a sale was paid.

Initial payment methods may include:

```text
CASH
CARD
ONLINE
OTHER
```

The exact payment methods should remain configurable where appropriate.

Potential fields:

```text
id
saleId
method
amount
createdAt
```

---

# 25. Payment Rules

Payment information must correspond to the sale.

For a simple single-payment sale:

```text
Payment Amount = Sale Total
```

If split payments are required in the future, the database model can support multiple Payment records per Sale.

Split payment functionality should NOT be implemented unless explicitly required.

---

# 26. InventoryItem Entity

InventoryItem represents a stock-controlled item.

Examples:

```text
Rice
Chicken
Beef
Cooking Oil
Spices
Soft Drinks
Packaging
```

Potential fields:

```text
id
name
category
unit
currentQuantity
minimumQuantity
costPerUnit
isActive
createdAt
updatedAt
```

---

# 27. Inventory Units

The system must store an explicit unit.

Examples:

```text
kg
g
liter
ml
piece
packet
box
bottle
```

The unit should not be embedded inconsistently into the item name.

Bad:

```text
Rice 25kg
```

Better:

```text
name = Rice
quantity = 25
unit = kg
```

---

# 28. Inventory Quantity

Inventory quantity must represent the current known stock level.

Example:

```text
Rice
Current Quantity: 125
Unit: kg
```

---

# 29. Minimum Stock Level

Each inventory item may have a minimum stock threshold.

Example:

```text
Current Quantity = 8 kg
Minimum Quantity = 10 kg
```

The system should mark the item as low stock.

---

# 30. Stock Status

Conceptually:

```text
currentQuantity > minimumQuantity
    → IN_STOCK

currentQuantity <= minimumQuantity
    → LOW_STOCK
```

A critical threshold may be introduced later if explicitly required.

Do not invent additional stock statuses unnecessarily.

---

# 31. InventoryTransaction Entity

InventoryTransaction provides a history of inventory changes.

Potential fields:

```text
id
inventoryItemId
type
quantity
previousQuantity
newQuantity
reason
referenceId
createdBy
createdAt
```

---

# 32. Inventory Transaction Types

Initial types:

```text
STOCK_IN
STOCK_OUT
ADJUSTMENT
SALE_USAGE
RETURN
```

Only applicable transaction types should be used.

Do not create meaningless inventory transactions.

---

# 33. Inventory Transaction Principle

Every controlled inventory change should have a corresponding transaction record.

Example:

```text
Previous:
100 kg

Operation:
STOCK_IN +50 kg

New:
150 kg
```

The transaction record should preserve:

```text
100 → +50 → 150
```

---

# 34. Inventory Adjustment

An adjustment must require a reason.

Examples:

```text
Damaged stock
Physical count correction
Spillage
Expired stock
Data correction
```

The application should not silently alter inventory quantities.

---

# 35. ExpenseCategory Entity

Expense categories organize expenses.

Examples:

```text
Gas
Electricity
Rent
Ingredients
Packaging
Transportation
Maintenance
Salaries
Miscellaneous
```

Potential fields:

```text
id
name
description
isActive
createdAt
updatedAt
```

---

# 36. Expense Entity

Expense represents money spent by the business.

Potential fields:

```text
id
categoryId
amount
description
paymentMethod
expenseDate
createdBy
createdAt
updatedAt
```

---

# 37. Expense Rules

Expense amount must:

* Be greater than zero.
* Use precise financial representation.
* Be validated server-side.
* Be associated with an active/valid category where required.

---

# 38. Expense Deletion

Financial records should not be casually deleted.

If deletion is permitted, it should be restricted by permissions and handled according to the final financial policy.

A safer future design may use:

```text
VOIDED
```

rather than physical deletion.

The final behavior must be explicitly documented before implementation.

---

# 39. AuditLog Entity

Important business operations should be auditable.

Potential fields:

```text
id
userId
action
entityType
entityId
metadata
createdAt
```

Examples:

```text
SALE_CREATED
SALE_VOIDED
INVENTORY_ADJUSTED
PRODUCT_PRICE_CHANGED
EXPENSE_CREATED
USER_CREATED
USER_PERMISSION_CHANGED
```

---

# 40. Audit Log Rules

Audit logs should be append-oriented.

Normal users must not be able to modify audit records.

Audit logs should not contain passwords, authentication tokens, or unnecessary sensitive information.

---

# 41. Financial Precision

Financial fields should use a database type appropriate for exact monetary values.

Do not use PostgreSQL floating-point types for money.

The application must avoid unsafe JavaScript floating-point arithmetic for financial calculations.

---

# 42. Timestamps

Entities that require timestamps should use consistent timestamp fields.

Common fields:

```text
createdAt
updatedAt
```

Financial and inventory transactions must preserve their actual event time.

---

# 43. Date-Based Reports

Reports may need to distinguish:

```text
createdAt
```

from:

```text
expenseDate
```

For example, an expense may be entered today for a business expense that occurred yesterday.

The business meaning of the date must remain explicit.

---

# 44. Relationships

Foreign keys must enforce valid relationships.

Examples:

```text
Product.categoryId
→ Category.id

SaleItem.saleId
→ Sale.id

SaleItem.productId
→ Product.id

Payment.saleId
→ Sale.id

InventoryTransaction.inventoryItemId
→ InventoryItem.id

Expense.categoryId
→ ExpenseCategory.id
```

---

# 45. Referential Integrity

The database should prevent invalid references.

A SaleItem must not reference a nonexistent Sale.

A Payment must not reference a nonexistent Sale.

An Expense must not reference a nonexistent ExpenseCategory where the relationship is required.

---

# 46. Unique Constraints

Appropriate unique constraints should be applied.

Likely examples:

```text
User.email/username
Category.name
InvoiceNumber
```

The exact uniqueness behavior must reflect the business requirements.

---

# 47. Required Fields

Fields that are fundamental to business correctness should be required.

Examples:

```text
Sale.total
Sale.status
Sale.createdAt

SaleItem.quantity
SaleItem.unitPrice

Expense.amount
Expense.expenseDate

InventoryItem.currentQuantity
InventoryItem.unit
```

Optional information should only be nullable when there is a legitimate business reason.

---

# 48. Database Indexing

Indexes should be created for frequently queried fields.

Likely indexes include:

```text
Sale.createdAt
Sale.invoiceNumber
Sale.status

SaleItem.saleId
SaleItem.productId

Product.categoryId
Product.isActive
Product.isAvailable

InventoryItem.isActive

InventoryTransaction.inventoryItemId
InventoryTransaction.createdAt

Expense.expenseDate
Expense.categoryId
```

Indexes must be based on actual query patterns.

Do not create indexes on every column.

---

# 49. Pagination

Database queries for large collections should support pagination.

At minimum, pagination should be considered for:

* Sales
* Orders
* Expenses
* Inventory transactions
* Products

The database should perform filtering and pagination rather than downloading the entire dataset to the browser.

---

# 50. Search

Search should be performed at the database/query layer where practical.

For example:

```text
Product search:
"chicken"
```

should query matching products rather than loading every product into the browser.

---

# 51. Transaction Requirements

Database transactions are mandatory for multi-step operations where partial completion could corrupt business data.

The primary example is sale creation.

A sale transaction may include:

```text
Create Sale
Create SaleItems
Create Payment
Update Inventory
Create Inventory Transactions
```

These operations must succeed or fail as one logical unit where they are part of the same business operation.

---

# 52. Sale Transaction Integrity

Unsafe:

```text
Sale created
↓
Payment creation fails
↓
Inventory still changed
```

Correct:

```text
BEGIN
↓
Create Sale
↓
Create SaleItems
↓
Create Payment
↓
Update Inventory
↓
Create Inventory Transactions
↓
COMMIT
```

If any required step fails:

```text
ROLLBACK
```

---

# 53. Duplicate Sales

The system must protect against duplicate submissions.

Potential causes:

* User double-clicks checkout.
* Network retry occurs.
* Browser retries a request.
* Client accidentally submits twice.

The POS should disable checkout while processing.

The backend must also use appropriate safeguards so that client-side button disabling is not the only protection.

---

# 54. Concurrent Inventory Operations

The system must account for simultaneous stock-changing operations.

Example:

```text
User A sells stock
User B adjusts the same stock
```

Database transactions and appropriate update logic must prevent inconsistent final quantities.

---

# 55. Historical Data Protection

Completed financial records must be treated as historical business records.

Changing:

```text
Product Name
Product Price
Category Name
```

must not rewrite historical sale information.

SaleItem snapshots exist specifically to protect transaction history.

---

# 56. Deletion Strategy

The general deletion philosophy is:

> Prefer deactivation/voiding over destructive deletion for business records.

Examples:

```text
Product → isActive = false
Category → isActive = false
User → isActive = false
Sale → VOIDED
```

The exact rules for expenses and other financial records must be finalized before implementation.

---

# 57. Database Migration Rules

All schema changes must be performed through version-controlled migrations.

Do NOT manually modify production database structure.

Workflow:

```text
Modify Prisma Schema
        ↓
Create Migration
        ↓
Test Migration
        ↓
Review
        ↓
Apply to Production
```

---

# 58. Production Migration Rules

Before a production migration:

1. Backup database.
2. Review migration.
3. Test migration against a production-like database.
4. Verify application compatibility.
5. Apply migration.
6. Verify application behavior.

Destructive migrations require additional review.

---

# 59. Seed Data

Development environments should have seed data.

Seed data may include:

### Roles

```text
Owner
Manager
Cashier
```

### Categories

```text
Biryani
Drinks
Sides
Extras
```

### Example Products

```text
Chicken Biryani
Beef Biryani
Raita
Salad
Soft Drink
```

Seed data is for development/testing and must not be confused with real production business data.

---

# 60. Production Data Rules

Production must never be populated with fake demo sales or fake financial records unless explicitly intended.

Development seed scripts must not accidentally execute against production.

---

# 61. Database Security

Database credentials must be stored in environment variables.

Never commit:

```text
DATABASE_URL
Database passwords
API keys
Authentication secrets
```

to source control.

---

# 62. Database Connection Management

Because the application is deployed on Vercel/serverless infrastructure, database connection management must be compatible with serverless execution.

The implementation must avoid uncontrolled creation of database connections.

The chosen PostgreSQL provider and connection strategy must support the expected deployment architecture.

---

# 63. ORM Rules

Prisma should be accessed from the server-side database layer.

The frontend must never import Prisma.

The Repository Layer should isolate Prisma-specific implementation.

This makes future database access changes less disruptive.

---

# 64. Prisma Rules

Prisma schema should:

* Clearly define relations.
* Use appropriate database types.
* Use timestamps consistently.
* Define indexes deliberately.
* Define unique constraints deliberately.
* Avoid unnecessary duplication.
* Maintain readable model names.

The schema should remain understandable to another developer without requiring hidden knowledge.

---

# 65. Business Logic vs Database Logic

Not every rule belongs in the database.

### Database responsibilities

* Data types
* Required fields
* Foreign keys
* Unique constraints
* Referential integrity
* Indexes

### Application responsibilities

* Sale calculation
* Discount rules
* Permission rules
* Business workflows
* Inventory business rules
* Report calculations

Do not attempt to put the entire business application inside database triggers.

---

# 66. Database Triggers

Database triggers should NOT be introduced unless there is a clearly documented reason.

Business logic should normally remain in the application/service layer.

If a trigger is proposed, its purpose and consequences must be documented before implementation.

---

# 67. Reporting Data

The application should initially generate reports from transactional data.

Do not create separate duplicated reporting tables unless performance requirements later justify them.

For the expected scale of a small biryani shop, normal PostgreSQL queries should be sufficient.

---

# 68. Profit Calculation Data

Estimated profit may require product cost information.

Conceptually:

```text
Revenue
-
Product Cost
-
Expenses
=
Estimated Profit
```

If cost information is missing or unreliable, the system must clearly communicate that profit is an estimate.

Do not present an inaccurate value as guaranteed accounting profit.

---

# 69. Inventory and Recipe Complexity

The MVP does not require a full recipe/BOM system.

For example, the system does not initially need to automatically calculate:

```text
1 Chicken Biryani
→ 250g Rice
→ 150g Chicken
→ 20ml Oil
→ 5g Spice
```

unless explicitly requested.

Basic inventory management should be implemented first.

If recipe-based automatic stock consumption is introduced later, it requires a separate documented feature.

---

# 70. Multi-Branch Data

The MVP assumes a single shop/branch.

The database should not introduce complex multi-branch architecture unless required.

Future multi-branch support may be added later.

---

# 71. Customer Data

Customer management is not a required core database entity for the MVP.

Do not create a complex Customer/CRM subsystem unless the feature is explicitly approved.

---

# 72. Supplier Data

Supplier management is not required for the initial MVP.

Basic inventory can be managed without a full supplier module.

Supplier functionality may be added later.

---

# 73. Database Naming Convention

Database naming should be consistent.

Application-level model names should be clear and readable.

Use a consistent convention for:

* Models
* Fields
* Relations
* Enum values
* Indexes
* Constraints

Do not mix multiple naming styles without reason.

---

# 74. Nullability

Nullable fields should represent genuine optionality.

Do not make fields nullable merely because it makes implementation easier.

Bad:

```text
amount: nullable
```

when an expense must always have an amount.

Good:

```text
description: nullable
```

if a description is genuinely optional.

---

# 75. Data Validation

Database constraints are not a replacement for application validation.

The system should use both:

```text
Frontend validation
        ↓
Backend validation
        ↓
Database constraints
```

Each layer provides a different level of protection.

---

# 76. Database Source of Truth

PostgreSQL is authoritative for:

```text
Users
Products
Categories
Sales
Sale Items
Payments
Inventory
Inventory Transactions
Expenses
Audit Logs
```

The browser is not authoritative for any of these.

---

# 77. AI Agent Database Rules

An AI coding agent MUST:

1. Read this document before modifying the schema.
2. Inspect the existing Prisma schema before adding models.
3. Reuse existing entities.
4. Avoid duplicate models representing the same business concept.
5. Never silently rename existing fields.
6. Never remove columns containing historical business data without explicit approval.
7. Never create destructive migrations casually.
8. Never change financial data types without review.
9. Never remove foreign-key relationships to make an error disappear.
10. Use transactions for multi-step financial operations.
11. Preserve historical sale information.
12. Add indexes based on actual query requirements.
13. Avoid unnecessary tables.
14. Never put secrets in seed files.
15. Never seed fake financial data into production.
16. Verify migrations before considering schema work complete.

---

# 78. Schema Change Protocol

When a new requirement requires database changes:

```text
Requirement
    ↓
Determine affected entity
    ↓
Review existing relationships
    ↓
Update documentation
    ↓
Modify Prisma schema
    ↓
Generate migration
    ↓
Run migration locally
    ↓
Run tests
    ↓
Verify existing functionality
```

---

# 79. Database Definition of Done

A database feature is complete when:

* Model is correctly defined.
* Relationships are correct.
* Required fields are enforced.
* Appropriate constraints exist.
* Appropriate indexes exist.
* Migration succeeds.
* Existing data remains safe.
* Services use the model correctly.
* Tests cover important behavior.
* No unintended destructive behavior exists.

---

# 80. Final Database Principle

The database should remain:

> **Simple, reliable, financially accurate, historically safe, and structured around the actual needs of a small biryani shop.**

The database must support the application without becoming a source of unnecessary complexity.

The authoritative architecture remains:

```text
Next.js Frontend
       ↓
Next.js Server/API
       ↓
Application Services
       ↓
Business Logic
       ↓
Repositories
       ↓
Prisma
       ↓
PostgreSQL
```

PostgreSQL stores the truth.

The application determines the business rules.

The frontend presents the information.
