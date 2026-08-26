# Biryani Shop Management System
## Backend Architecture & API Specification

**Document:** 04 — Backend Architecture & API Specification  
**Version:** 1.0  
**Status:** Foundation Specification  
**Framework:** Next.js  
**Language:** TypeScript  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Architecture:** Layered Modular Monolith  

---

# 1. Purpose

This document defines how the backend of the Biryani Shop Management System must be implemented.

The backend must be:

- Structured
- Predictable
- Type-safe
- Secure
- Testable
- Maintainable
- Mobile-client friendly
- Resistant to AI-generated architectural inconsistencies

The backend is part of the Next.js application.

There will NOT be a separate Express, Django, FastAPI, or Node.js backend server for the MVP.

---

# 2. Backend Architecture

The backend follows this layered architecture:

```text
                    HTTP REQUEST
                         │
                         ▼
                ┌─────────────────┐
                │ API / SERVER    │
                │     LAYER       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   VALIDATION    │
                │     LAYER       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ APPLICATION     │
                │   SERVICE       │
                │     LAYER       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ BUSINESS /      │
                │ DOMAIN LOGIC    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  REPOSITORY     │
                │     LAYER       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │     PRISMA      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   POSTGRESQL    │
                └─────────────────┘
```

# 3. Backend Responsibilities

The backend is responsible for:

- Authentication
- Authorization
- Input validation
- Product management
- Category management
- POS sales
- Payments
- Inventory
- Expenses
- Reports
- Dashboard data
- User management
- Business rules
- Database transactions
- Audit logging
- Error handling

# 4. Backend Must Be Server-Side

All sensitive business operations must execute on the server.
The browser must never be considered trusted.

The backend must independently validate:
- User identity
- Permissions
- Product IDs
- Product prices
- Quantities
- Discounts
- Sale totals
- Inventory state
- Expense amounts
- Report parameters

# 5. API Technology

The backend API will use Next.js server-side API capabilities.

API routes will be organized under:
`src/app/api/`

Example:
```text
src/app/api/products/route.ts
src/app/api/sales/route.ts
src/app/api/inventory/route.ts
src/app/api/expenses/route.ts
```

# 6. API Route Responsibility

API route handlers must remain thin.

A route handler should generally perform:
1. Receive request
2. Authenticate
3. Authorize
4. Parse input
5. Validate input
6. Call service
7. Return response

It should NOT contain large business workflows.

# 7. Correct API Pattern

Example:

```text
POST /api/sales
        │
        ▼
Authenticate
        │
        ▼
Check sales:create
        │
        ▼
Validate request
        │
        ▼
salesService.createSale()
        │
        ▼
Business logic
        │
        ▼
Repository
        │
        ▼
PostgreSQL
```

# 8. Incorrect API Pattern

Do NOT create routes like:
`POST /api/sales`
- Find products
- Calculate prices
- Check permissions
- Update inventory
- Create sale
- Create payment
- Create logs
- Calculate reports
- Handle database errors
- Format UI response

inside one enormous route handler. The route should delegate.

# 9. Application Services

Services represent business use cases.

Recommended services:
- AuthService
- UserService
- ProductService
- CategoryService
- SaleService
- PaymentService
- InventoryService
- ExpenseService
- ReportService
- DashboardService
- SettingsService
- AuditService

Services may call multiple repositories.

# 10. Service Naming

Use action-oriented methods.

Examples:
```text
productService.create()
productService.update()
productService.deactivate()

saleService.create()
saleService.getById()
saleService.list()
saleService.void()

inventoryService.addStock()
inventoryService.removeStock()
inventoryService.adjustStock()

expenseService.create()
expenseService.update()
expenseService.delete()

reportService.getSalesSummary()
reportService.getExpenseSummary()
```

# 11. Repository Layer

Repositories isolate database access.

Examples:
- UserRepository
- RoleRepository
- ProductRepository
- CategoryRepository
- SaleRepository
- SaleItemRepository
- PaymentRepository
- InventoryRepository
- InventoryTransactionRepository
- ExpenseRepository
- ExpenseCategoryRepository
- AuditRepository

# 12. Repository Responsibilities

Repositories may:
- Query PostgreSQL
- Insert records
- Update records
- Find records
- Delete records where permitted
- Paginate
- Filter
- Sort
- Execute database-specific queries

Repositories must NOT determine business policy.

# 13. Example Repository

Conceptually:
```ts
productRepository.findById(id)

productRepository.findMany({
  search,
  categoryId,
  isActive,
  page,
  limit,
})
```

The repository returns data.
It does not decide whether the user is allowed to see that data.

# 14. Business Logic Layer

Business rules must be centralized.

Examples:
- Sale total calculation
- Discount validation
- Inventory adjustment validation
- Product availability rules
- Sale void rules
- Expense validation
- Report calculations

# 15. Sale Business Logic

Creating a sale should follow:
```text
Receive cart
     ↓
Validate products
     ↓
Verify active/available products
     ↓
Retrieve authoritative prices
     ↓
Validate quantities
     ↓
Calculate item subtotals
     ↓
Calculate subtotal
     ↓
Validate discount
     ↓
Calculate final total
     ↓
Create transaction
```

# 16. Never Trust Client Prices

The frontend may send:
```json
{
  "productId": "abc",
  "quantity": 2,
  "unitPrice": 250
}
```

The backend must NOT blindly trust unitPrice.

Instead:
```text
productId
   ↓
Database
   ↓
Current authoritative price
```

The server calculates the actual sale.

# 17. POS Checkout Flow

The complete backend flow:

```text
POS Cart
   │
   ▼
POST /api/sales
   │
   ▼
Authentication
   │
   ▼
Authorization
   │
   ▼
Schema Validation
   │
   ▼
SaleService.create()
   │
   ├── Fetch Products
   ├── Validate Availability
   ├── Validate Quantity
   ├── Calculate Prices
   ├── Validate Discount
   └── Calculate Total
   │
   ▼
DATABASE TRANSACTION
   │
   ├── Create Sale
   ├── Create Sale Items
   ├── Create Payment
   ├── Update Inventory
   └── Create Audit Log
   │
   ▼
COMMIT
   │
   ▼
Return Sale
```

# 18. Sale Transaction

Sale creation must use a database transaction when multiple related records are written.

Conceptually:
```ts
transaction(async (tx) => {
  createSale()
  createSaleItems()
  createPayment()
  updateInventory()
  createInventoryTransactions()
  createAuditLog()
})
```

If a required operation fails: `ROLLBACK`

No partial sale should remain.

# 19. Sale Response

A successful sale response should contain enough information for the POS to immediately display confirmation.

Example conceptual response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "invoiceNumber": "INV-000123",
    "subtotal": 1000,
    "discount": 50,
    "total": 950,
    "paymentMethod": "CASH",
    "createdAt": "..."
  }
}
```

The exact response structure should be standardized during implementation.

# 20. API Response Convention

Use a consistent response format.

Success:
```json
{
  "success": true,
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "The selected product could not be found."
  }
}
```

Do not return inconsistent response formats between modules.

# 21. HTTP Status Codes

Use appropriate HTTP status codes.

Common examples:
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity
- 500 Internal Server Error

Do not return HTTP 200 for every error.

# 22. Authentication

Every protected endpoint must identify the authenticated user.

Example:
```text
Request
   ↓
Session
   ↓
Authenticated User
```

Unauthenticated users must not access protected business operations.

# 23. Authorization

Authentication is not authorization.

After authentication:
```text
User
 ↓
Role
 ↓
Permission
 ↓
Allowed / Denied
```

Example: `POST /api/products` may require: `products:create`

# 24. Authorization Must Be Server-Side

Hiding a button is NOT authorization.

This is insufficient:
```ts
if (!canCreateProduct) {
  hideButton()
}
```

The API must also enforce: `products:create`
A malicious user must not be able to bypass the UI and call the API directly.

# 25. Input Validation

All external input must be validated.
Use a schema validation library such as Zod.

Conceptually:
```ts
const createProductSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string(),
  sellingPrice: z.number().positive(),
});
```

The exact schema must match the database and business requirements.

# 26. Validation Rules

Validation should check:
- Required fields
- Types
- String lengths
- Numeric ranges
- Valid IDs
- Enum values
- Date formats
- Array sizes
- Quantity values

Business rules should then be checked by the service/domain layer.

# 27. Validation vs Business Rules

These are different.

Validation: quantity must be a number, quantity must be > 0
Business rule: Product must be available for sale.

Validation handles input shape. Business logic handles business meaning.

# 28. Product API

Recommended endpoints:
```text
GET    /api/products
POST   /api/products

GET    /api/products/:id
PATCH  /api/products/:id

POST   /api/products/:id/deactivate
POST   /api/products/:id/activate
```

# 29. Product List Query

The product API should support appropriate filtering.

Conceptually: `GET /api/products`

Parameters may include:
- search
- categoryId
- isActive
- isAvailable
- page
- limit
- sort

Only parameters actually required by the UI should be implemented.

# 30. Category API

Recommended endpoints:
```text
GET    /api/categories
POST   /api/categories

GET    /api/categories/:id
PATCH  /api/categories/:id

POST   /api/categories/:id/deactivate
```

# 31. Sales API

Recommended endpoints:
```text
GET    /api/sales
POST   /api/sales

GET    /api/sales/:id

POST   /api/sales/:id/void
```

A completed sale should not normally be edited like a normal CRUD record.

# 32. Sale Editing

The system should avoid arbitrary editing of completed sales.

Incorrect:
```text
PATCH /api/sales/123
total = 50
```

Preferred:
```text
POST /api/sales/123/void
```
if the business requires cancelling the transaction.
Any correction workflow must preserve financial history.

# 33. Inventory API

Recommended endpoints:
```text
GET  /api/inventory
POST /api/inventory

GET  /api/inventory/:id
PATCH /api/inventory/:id

POST /api/inventory/:id/stock-in
POST /api/inventory/:id/adjust
```

# 34. Inventory Mutation

Inventory mutations must go through InventoryService.

Example:
```text
POST /api/inventory/:id/adjust
        ↓
InventoryService.adjustStock()
        ↓
Validate quantity
        ↓
Calculate new quantity
        ↓
Database transaction
        ↓
Create InventoryTransaction
        ↓
Update InventoryItem
```

# 35. Inventory History API

The system should support retrieving stock movement history.

Example: `GET /api/inventory/:id/transactions`

Filters may include:
- startDate
- endDate
- transactionType

# 36. Expense API

Recommended endpoints:
```text
GET    /api/expenses
POST   /api/expenses

GET    /api/expenses/:id
PATCH  /api/expenses/:id

POST   /api/expenses/:id/void
```

The exact deletion/void policy must follow the financial rules defined elsewhere.

# 37. Expense Category API

```text
GET    /api/expense-categories
POST   /api/expense-categories

PATCH  /api/expense-categories/:id

POST   /api/expense-categories/:id/deactivate
```

# 38. Reports API

Reports should have dedicated service methods.

Possible endpoints:
```text
GET /api/reports/sales
GET /api/reports/expenses
GET /api/reports/profit
GET /api/reports/products
GET /api/reports/inventory
```

Only required reports should be implemented.
Do not create dozens of reports simply because they are technically possible.

# 39. Sales Report

Possible parameters: startDate, endDate

Possible output:
- Total Sales
- Number of Transactions
- Total Discounts
- Average Sale
- Top Products

The final report specification will define the exact metrics.

# 40. Expense Report

Possible metrics:
- Total Expenses
- Expenses by Category
- Expenses by Date

# 41. Dashboard API

Dashboard data may be exposed through:
`GET /api/dashboard`
or through server-side application functions where appropriate.

Dashboard data may include:
- Today's Sales
- Today's Orders
- Today's Expenses
- Estimated Profit
- Low Stock Items
- Top Selling Products

The dashboard must not create duplicate business data.

# 42. Search API

Search should be implemented according to actual UI needs.
Avoid creating a universal `/api/search-everything` unless there is a legitimate requirement.
Module-specific queries are preferred.

# 43. Pagination

Paginated APIs should return enough metadata for the frontend.

Example:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 250,
    "totalPages": 10
  }
}
```

# 44. Sorting

Sorting must be controlled.
Never directly insert arbitrary client-provided SQL/order expressions.
The backend should map allowed values.

Example:
allowed: createdAt, name, price

Anything else should be rejected or ignored according to the API contract.

# 45. Filtering

Filters should be validated.

For example: `status=COMPLETED`
must be validated against the allowed status enum.
Do not pass arbitrary filter objects directly to Prisma.

# 46. Database Transactions

Use transactions for operations that must remain atomic.

Examples: Create sale, Void sale, Inventory adjustment, Stock-in operation
Not every simple SELECT requires a transaction.

# 47. Concurrency Protection

Inventory operations must consider concurrent updates.
The backend must avoid this unsafe pattern:
Read quantity -> Calculate new quantity -> Write quantity
without considering another transaction modifying the same record.

Use appropriate transactional database operations.

# 48. Duplicate Checkout Protection

The POS must prevent accidental duplicate submissions.

Frontend:
Checkout -> Disable button -> Show processing state

Backend:
Validate request -> Prevent duplicate operation where appropriate

Client-side protection alone is insufficient.

# 49. Error Classes

Create standardized application errors.

Example:
```text
AppError
├── ValidationError
├── AuthenticationError
├── AuthorizationError
├── NotFoundError
├── ConflictError
├── BusinessRuleError
└── DatabaseError
```

# 50. Business Error Codes

Examples:
- PRODUCT_NOT_FOUND
- PRODUCT_UNAVAILABLE
- INSUFFICIENT_STOCK
- INVALID_DISCOUNT
- SALE_NOT_FOUND
- SALE_ALREADY_VOIDED
- EXPENSE_NOT_FOUND
- INVENTORY_ITEM_NOT_FOUND
- PERMISSION_DENIED

Error codes should remain stable.

# 51. Error Handling Flow

```text
Database Error
      ↓
Repository
      ↓
Service
      ↓
Application Error
      ↓
API Error Handler
      ↓
Safe JSON Response
```

Technical database errors must not leak to the client.

# 52. Logging

Backend logging should capture enough information to diagnose errors.

Useful information: Timestamp, Request/operation, User ID where appropriate, Entity ID, Error code, Technical error

Do not log: Passwords, Session tokens, Database credentials, API secrets

# 53. Audit Logging

Important business actions should create audit records.

Examples: SALE_CREATED, SALE_VOIDED, PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_PRICE_CHANGED, INVENTORY_ADJUSTED, EXPENSE_CREATED, USER_CREATED, PERMISSION_CHANGED

Audit logging should be handled consistently.

# 54. Business Logic Centralization

Never duplicate critical logic.
For example, do not calculate sales totals separately in POS API, Dashboard API, Sales Report API, Invoice API.
Instead use shared business logic.

# 55. Report Calculation Rules

Reports should query authoritative data.
For example:
Daily Sales = Sum of valid completed sales for selected business date
The exact definition must be documented and reused everywhere.

# 56. Money Handling

Money must use exact representations.
Never use floating-point arithmetic as the authoritative financial calculation.
Example:
BAD: `0.1 + 0.2`
Use appropriate database/application representations for monetary values.

# 57. Date Range Handling

Report date ranges must be interpreted consistently.
Example: `2026-08-26`
must represent the intended business date according to the configured shop timezone.
Do not rely blindly on the user's browser timezone.

# 58. API Security

Every protected endpoint must consider:
- Authentication
- Authorization
- Validation
- Rate/abuse protection where appropriate
- Safe error messages
- Input limits

# 59. Request Size Limits

Do not allow unnecessarily large request payloads.
For example, a POS sale should have reasonable limits on: Number of items, Quantity, String lengths.
This prevents accidental or malicious oversized requests.

# 60. Sensitive Operations

Operations requiring elevated permissions should be explicitly protected.
Examples: Void sale, Inventory adjustment, Change product price, Manage users, Change permissions

# 61. Product Price Changes

Changing a product's price should not modify historical sales.

Flow:
```text
PATCH /api/products/:id
        ↓
ProductService.update()
        ↓
Update current product price
        ↓
Historical SaleItems remain unchanged
```

# 62. Sale Voiding

Voiding a sale must be treated as a controlled financial operation.

Potential flow:
```text
Request void
     ↓
Authenticate
     ↓
Authorize
     ↓
Verify sale exists
     ↓
Verify sale is not already voided
     ↓
Reverse relevant inventory where applicable
     ↓
Mark sale VOIDED
     ↓
Create audit record
```
The exact inventory reversal behavior must match the final business specification.

# 63. Inventory Adjustment

Flow:
```text
Request adjustment
       ↓
Validate quantity
       ↓
Validate reason
       ↓
Authorize user
       ↓
Begin transaction
       ↓
Read current quantity
       ↓
Calculate new quantity
       ↓
Update inventory
       ↓
Create transaction record
       ↓
Audit log
       ↓
Commit
```

# 64. Expense Creation

Flow:
```text
Request
 ↓
Authenticate
 ↓
Authorize
 ↓
Validate
 ↓
ExpenseService.create()
 ↓
Validate category
 ↓
Create expense
 ↓
Audit log
 ↓
Response
```

# 65. Service-Level Authorization

Authorization may be enforced at the API boundary, but critical service methods should also be designed so that they cannot accidentally be exposed through an unauthorized route.
The final implementation must establish one clear authorization strategy and apply it consistently.
Do not implement random permission checks differently in every route.

# 66. Type Safety

Backend code must use TypeScript types.
Avoid `any` unless there is a documented technical reason.
Prefer type, interface, enum, Prisma-generated types, Zod-inferred types where appropriate.

# 67. DTO Principle

API input/output types should be explicit.
Do not automatically expose complete Prisma models to the frontend.
For example, a User response must NOT accidentally include passwordHash, internal security fields.
Create appropriate response objects.

# 68. Data Exposure

Only return information required by the client.
Bad: return complete database object
Good: return public/required fields
This prevents accidental data leakage.

# 69. Backend Folder Structure

Recommended structure:

```text
src/
├── app/
│   └── api/
│       ├── auth/
│       ├── products/
│       ├── categories/
│       ├── sales/
│       ├── inventory/
│       ├── expenses/
│       ├── reports/
│       └── dashboard/
│
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.validation.ts
│   │   ├── auth.types.ts
│   │   └── auth.repository.ts
│   │
│   ├── products/
│   │   ├── product.service.ts
│   │   ├── product.repository.ts
│   │   ├── product.validation.ts
│   │   ├── product.types.ts
│   │   └── product.rules.ts
│   │
│   ├── sales/
│   │   ├── sale.service.ts
│   │   ├── sale.repository.ts
│   │   ├── sale.validation.ts
│   │   ├── sale.types.ts
│   │   └── sale.rules.ts
│   │
│   ├── inventory/
│   ├── expenses/
│   ├── reports/
│   ├── users/
│   └── settings/
│
└── lib/
    ├── db/
    ├── auth/
    ├── errors/
    ├── validation/
    └── utilities/
```

# 70. API Route Example Structure

Conceptually:
`src/app/api/sales/route.ts` should be responsible for HTTP concerns.
Business logic belongs here: `src/modules/sales/sale.service.ts`
Database logic belongs here: `src/modules/sales/sale.repository.ts`
Validation belongs here: `src/modules/sales/sale.validation.ts`

# 71. Module Independence

Modules should have clear responsibilities.
For example: Sales Module may depend on Products, Inventory, Payments, Audit, but should not directly manipulate their database tables. It should use their approved services/repositories according to the architecture.

# 72. Circular Dependencies

Avoid circular dependencies such as:
Sales → Inventory
Inventory → Sales
Sales → Inventory
If a relationship becomes complex, extract shared business functionality into an appropriate service.

# 73. Backend Testing

Every important service should have tests.
Priority areas: Sale calculations, Discount validation, Inventory adjustments, Expense calculations, Permissions, Sale voiding, Report calculations.

# 74. Unit Tests

Unit tests should test business logic independently.
Examples: calculateSubtotal(), calculateDiscount(), calculateTotal(), validateInventoryAdjustment()

# 75. Integration Tests

Integration tests should verify: Service -> Repository -> Database
Examples: Create Sale, Create Expense, Adjust Inventory, Void Sale

# 76. API Tests

API tests should verify: Authentication, Authorization, Validation, Success responses, Error responses.

# 77. Backend Definition of Done

A backend feature is complete only when:
- API endpoint works.
- Input is validated.
- Authentication is enforced.
- Authorization is enforced.
- Service logic is implemented.
- Database access is isolated.
- Errors are handled.
- Transactions are used where required.
- Types are correct.
- Tests pass.
- No business logic is duplicated.
- No sensitive data is exposed.

# 78. AI Coding Agent Rules

The AI MUST follow these rules.
Rule 1: Never put business logic directly into UI components.
Rule 2: Never access Prisma from the frontend.
Rule 3: Never bypass the repository/service architecture without explicit justification.
Rule 4: Never trust frontend prices or totals.
Rule 5: Never trust frontend permissions.
Rule 6: Never expose Prisma objects blindly.
Rule 7: Never return database errors directly to users.
Rule 8: Never create duplicate implementations of financial calculations.
Rule 9: Never modify historical sale data when changing current products.
Rule 10: Never silently change an API contract used by existing frontend code.
Rule 11: Never create a new dependency without checking whether an existing dependency can solve the problem.
Rule 12: Never create fake API data as a substitute for actual backend functionality.
Rule 13: Never silently introduce a second backend framework.
Rule 14: Never bypass authentication/authorization for convenience during feature development.
Rule 15: Never perform multi-step financial operations without evaluating transaction requirements.

# 79. Backend Anti-Patterns

The following are explicitly prohibited:
❌ Prisma inside React components
❌ PostgreSQL queries inside UI
❌ 500-line API route handlers
❌ Business logic inside JSX
❌ Frontend-controlled final totals
❌ Frontend-only authorization
❌ Hardcoded financial values
❌ Fake API responses in production
❌ Duplicate sale calculation logic
❌ Direct database manipulation from random files
❌ Unvalidated request data
❌ Exposing password hashes
❌ Silent schema changes
❌ Destructive financial deletion

# 80. Backend Golden Rule

Every important operation should follow:

```text
REQUEST
   ↓
AUTHENTICATE
   ↓
AUTHORIZE
   ↓
VALIDATE
   ↓
SERVICE
   ↓
BUSINESS RULES
   ↓
REPOSITORY
   ↓
DATABASE
   ↓
SAFE RESPONSE
```

# 81. Final Backend Contract

The backend must remain a:
Layered, modular, server-side business system inside the Next.js application.

The architecture is:
```text
Next.js API / Server
        ↓
Validation
        ↓
Application Services
        ↓
Business / Domain Logic
        ↓
Repositories
        ↓
Prisma
        ↓
PostgreSQL
```

The backend is the authoritative source for business operations.
The frontend is a client of the backend, not the owner of the business logic.

# 82. Final Principle

The backend should be:
Simple enough for a small biryani shop, but structured professionally enough that an AI coding agent can implement, extend, test, and maintain it without inventing a different architecture for every feature.
