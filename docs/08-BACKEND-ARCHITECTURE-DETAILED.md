# Biryani Shop Management System
## Backend Architecture & API Specification

**Document:** 08 — Backend Architecture  
**Version:** 1.0  
**Status:** Foundation Specification  
**Framework:** Next.js  
**Backend Runtime:** Next.js Server  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Architecture:** Layered / Modular Monolith  
**API Style:** REST-oriented HTTP API  
**Primary Goal:** Maintainable, secure, testable business logic

---

# 1. Purpose

This document defines how the backend must be structured and implemented.

The backend must provide:
- Authentication
- Authorization
- Product management
- Inventory management
- POS operations
- Sales management
- Expense management
- Reporting
- Dashboard data
- Settings
- Audit logging

The backend must remain simple enough for a small business while following professional software architecture.

---

# 2. Backend Architecture

The backend MUST use a layered architecture.

```text
┌──────────────────────────────────────┐
│            Presentation Layer        │
│       API Routes / Controllers       │
├──────────────────────────────────────┤
│            Business Layer            │
│          Services / Use Cases        │
├──────────────────────────────────────┤
│          Data Access Layer           │
│        Repositories / Queries        │
├──────────────────────────────────────┤
│          Database Infrastructure     │
│              Prisma ORM              │
├──────────────────────────────────────┤
│              PostgreSQL              │
└──────────────────────────────────────┘
```

# 3. Layer Responsibilities

Each layer has one primary responsibility.

Presentation Layer
Responsible for:
- Receiving HTTP requests
- Validating request shape
- Authentication checks
- Calling services
- Returning HTTP responses
It should NOT contain business logic.

Business Logic Layer
Responsible for:
- Business rules
- Calculations
- Validation beyond basic request validation
- Transaction orchestration
- Inventory rules
- Sale rules
- Expense rules

Data Access Layer
Responsible for:
- Database queries
- Prisma operations
- Database-specific access
Repositories should NOT decide business rules.

Database Layer
Responsible for:
- PostgreSQL
- Prisma schema
- Migrations
- Constraints
- Indexes
- Transactions

# 4. Critical Rule

API routes must NEVER contain large blocks of business logic.

Bad:
```text
API Route
   ↓
Validate
   ↓
Calculate sale
   ↓
Update inventory
   ↓
Create payment
   ↓
Write audit log
   ↓
Return response
```

Better:
```text
API Route
   ↓
SaleService.completeSale()
   ↓
Repositories
   ↓
Database
```

# 5. Recommended Project Structure

Recommended structure:

```text
src/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── sales/
│   │   ├── inventory/
│   │   ├── expenses/
│   │   ├── reports/
│   │   ├── dashboard/
│   │   └── settings/
│   │
│   └── ...
│
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.validation.ts
│   │   └── auth.types.ts
│   │
│   ├── products/
│   ├── categories/
│   ├── sales/
│   ├── inventory/
│   ├── expenses/
│   ├── reports/
│   ├── dashboard/
│   └── settings/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── permissions.ts
│   ├── errors.ts
│   └── logger.ts
│
├── middleware.ts
│
└── ...
```

The exact folder structure may evolve, but the architectural boundaries MUST remain.

# 6. Modular Monolith

The application should initially be a modular monolith.
Do NOT create microservices.

```text
One Next.js Application
        ↓
Multiple Internal Modules
        ↓
One PostgreSQL Database
```

This is appropriate for the scale of a single-shop management system.

# 7. Why Modular Monolith

The project does not currently require:
- Microservices
- Service mesh
- Message brokers
- Kubernetes
- Distributed transactions

A modular monolith provides:
- Simpler deployment
- Easier development
- Lower cost
- Easier debugging
- Easier Vercel deployment

# 8. API Architecture

The API should follow predictable resource-oriented endpoints.

Example:
```text
GET    /api/products
POST   /api/products

GET    /api/products/:id
PATCH  /api/products/:id

GET    /api/sales
POST   /api/sales

GET    /api/sales/:id

GET    /api/inventory
POST   /api/inventory/adjust

GET    /api/expenses
POST   /api/expenses
```
The exact routing structure should remain consistent.

# 9. HTTP Methods

Use HTTP methods correctly.
- GET → Read
- POST → Create / execute operation
- PATCH → Partial update
- DELETE → Only where safe and appropriate
Financial records should generally not use unrestricted DELETE.

# 10. API Response Format

Responses should follow a consistent structure.

Success example:
```json
{
  "success": true,
  "data": {
    "id": "..."
  }
}
```

Error example:
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```
The exact response wrapper may be standardized during implementation.

# 11. Error Codes

Errors should have machine-readable codes.

Example:
- PRODUCT_NOT_FOUND
- INVALID_PRODUCT_PRICE
- SALE_NOT_FOUND
- EMPTY_CART
- INSUFFICIENT_STOCK
- INVALID_EXPENSE_AMOUNT
- UNAUTHORIZED
- FORBIDDEN
- VALIDATION_ERROR
- INTERNAL_SERVER_ERROR

# 12. HTTP Status Codes

Use appropriate HTTP status codes.
- 200: Successful read/update
- 201: Successful creation
- 400: Invalid request
- 401: Not authenticated
- 403: Not authorized
- 404: Resource not found
- 409: Conflict
- 422: Business validation failure
- 500: Unexpected server error

Do not return HTTP 200 for every failure.

# 13. Request Validation

Every API endpoint accepting input must validate it.
Use a schema validation library such as Zod.
The validation must happen server-side.

# 14. Validation Flow

```text
HTTP Request
     ↓
Parse body
     ↓
Validate schema
     ↓
Authenticate
     ↓
Authorize
     ↓
Service
     ↓
Repository
```
The frontend validation is helpful for UX but is NOT security.

# 15. Authentication

Authentication must be handled centrally.
The system should identify: "Who is making this request?" before accessing protected resources.
The exact authentication implementation may use an established Next.js-compatible authentication solution.
Do not build custom password/session cryptography from scratch.

# 16. Authorization

Authentication answers: "Who are you?"
Authorization answers: "What are you allowed to do?"
Both must be implemented separately.

# 17. Authorization Example

A cashier may be allowed to: Create Sale, View Products, View Inventory
but may not be allowed to: Delete Product, Void Sale, Manage Users, View sensitive reports
The exact permission matrix should be defined in the authorization configuration.

# 18. Permission Checking

Permission checks should happen server-side.
Example concept: `requirePermission("sales:create")`
The frontend may hide unavailable actions, but the backend MUST still enforce permissions.

# 19. Service Layer

Services contain business logic.
Example: SaleService, ProductService, InventoryService, ExpenseService, ReportService, DashboardService

# 20. Sale Service

The SaleService is one of the most important backend components.
It should handle:
- Create sale
- Validate cart
- Calculate totals
- Validate products
- Create sale items
- Create payment
- Update inventory where applicable
- Create audit record

# 21. Sale Creation Flow

```text
POST /api/sales
       ↓
Validate request
       ↓
Authenticate user
       ↓
Check permission
       ↓
SaleService.createSale()
       ↓
Load products from database
       ↓
Validate availability
       ↓
Calculate authoritative prices
       ↓
Calculate subtotal
       ↓
Calculate discount
       ↓
Calculate final total
       ↓
Create transaction
       ↓
Create Sale
       ↓
Create SaleItems
       ↓
Create Payment
       ↓
Update Inventory if applicable
       ↓
Create AuditLog
       ↓
Commit transaction
       ↓
Return sale
```

# 22. Backend Calculation Rule

The client MUST NOT be trusted for:
- Subtotal
- Discount
- Total
- Product price
- Inventory quantity
- Payment amount
The backend must calculate/verify these values.

# 23. Example

Frontend sends:
```json
{
  "items": [
    {
      "productId": "...",
      "quantity": 2
    }
  ]
}
```
The backend retrieves: Product price, Product availability
and calculates: quantity × authoritative price

# 24. Never Trust Client Price

The frontend should NOT be able to send:
```json
{
  "productId": "...",
  "quantity": 2,
  "unitPrice": 1
}
```
and expect the server to accept the price. The server must determine the actual price.

# 25. Sale Transaction

Sale creation must use a database transaction when multiple records must remain consistent.
Conceptually: `prisma.$transaction(...)`
The transaction should include all required atomic operations.

# 26. Inventory Service

InventoryService handles: Stock in, Stock adjustment, Stock out, Inventory history, Low-stock calculations.
It must ensure that inventory changes are consistent.

# 27. Inventory Update Flow

```text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
InventoryService
 ↓
Load current stock
 ↓
Validate change
 ↓
Calculate new quantity
 ↓
Update InventoryItem
 ↓
Create InventoryTransaction
 ↓
Commit
```

# 28. Inventory Race Conditions

The implementation must consider concurrent updates.
Example: Request A (Stock = 10), Request B (Stock = 10). Both attempting to modify stock simultaneously must not result in lost updates.
Use appropriate database transactions and update strategies.

# 29. Expense Service

ExpenseService handles: Create expense, Update expense, Retrieve expenses, Expense filtering, Expense summaries.
It must validate: Amount > 0, Valid category, Valid date.

# 30. Product Service

ProductService handles: Create product, Update product, Activate product, Deactivate product, List products, Search products, Filter products.
It must prevent invalid product states.

# 31. Product Price Update

When a product price changes: `Product current price` changes.
Historical: `SaleItem.unitPrice` must remain unchanged.

# 32. Category Service

CategoryService handles: Create category, Update category, Activate/deactivate category, List categories.
Category deletion must respect existing relationships.

# 33. Dashboard Service

DashboardService aggregates data for the dashboard.
Potential metrics: Today's sales, Today's orders, Today's expenses, Estimated profit, Low-stock products, Recent sales, Top-selling products.
The service should use efficient queries.

# 34. Report Service

ReportService handles business reporting.
Examples: Daily sales, Weekly sales, Monthly sales, Sales by product, Sales by category, Expense summary, Inventory summary, Profit estimation.

# 35. Report Date Handling

Date filtering must be handled carefully.
The backend must use the configured business timezone.
Do NOT blindly rely on: `new Date()` with server timezone assumptions.

# 36. Timezone

The shop's timezone should be explicitly configured.
For Pakistan: `Asia/Karachi` may be the default if appropriate.
The implementation should make timezone configurable rather than scattering timezone strings throughout the code.

# 37. Daily Sales

"Today's sales" must mean the current business day in the shop's configured timezone.
It must NOT mean: UTC calendar day unless the business timezone is UTC.

# 38. Monthly Sales

Monthly reports should use the business timezone and appropriate calendar boundaries.
Example: August 1 00:00 → September 1 00:00 in the configured business timezone.

# 39. Repository Layer

Repositories provide controlled database access.
Examples: ProductRepository, SaleRepository, InventoryRepository, ExpenseRepository, ReportRepository, UserRepository.

# 40. Repository Responsibilities

A repository may: Find product, Create product, Update product, List products, Find sale, Create sale, Create inventory transaction.
A repository must NOT decide: Whether a cashier is allowed to void a sale, Whether an expense is valid from a business perspective, Whether stock should be automatically reduced.
Those belong to the service/business layer.

# 41. Repository Example

Conceptually:
```ts
ProductRepository.findById(id)
ProductRepository.findActiveProducts()
ProductRepository.create(data)
ProductRepository.update(id, data)
```

# 42. Service Example

Conceptually: `ProductService.updateProduct()`
may: Validate business rules, Check permissions through application layer, Load existing product, Apply allowed changes, Call repository, Create audit log.

# 43. Database Access Rule

Only the data-access layer should directly use Prisma for business entities.
Avoid scattered: `prisma.product.findMany()` throughout arbitrary UI components and API handlers.

# 44. Prisma Client

Use a shared Prisma client instance appropriate for the Next.js environment.
Avoid accidentally creating a new PrismaClient instance for every request/module load.

# 45. Server-Only Rule

Database and server-only modules must never be imported into client components.
Never expose: DATABASE_URL, Prisma Client, Database credentials, Server secrets to the browser.

# 46. Server Actions vs API Routes

The project may use Server Actions for internal mutations where appropriate.
However, the architecture must remain layered.
Even if a Server Action is used: `Server Action` -> `Service` -> `Repository` -> `Prisma`.
Do NOT put business logic directly inside the Server Action.

# 47. API Routes vs Server Actions

Use API routes when: A clear HTTP API is useful, External integration may be required, Resource-oriented endpoints make sense.
Server Actions may be used for: Internal application mutations, Simple form operations.
The project must not randomly mix patterns.

# 48. Business Logic Location

Business rules belong in services/use cases.
Examples: SaleService, InventoryService, ExpenseService
NOT: React Component, API Route, Prisma schema

# 49. Utility Functions

Utilities should contain genuinely reusable technical logic.
Examples: currency formatting, date utilities, pagination, API response helpers, error normalization.
Do not hide business logic inside generic utility files.

# 50. Error Handling

The backend must use centralized error handling.
Expected categories: ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, BusinessRuleError, DatabaseError.

# 51. Error Exposure

Do not expose internal errors to users.
Bad: PrismaClientKnownRequestError..., DATABASE_URL..., SQL query..., Stack trace...
Good: "Unable to complete the sale. Please try again."
The detailed error should be available only in secure server logs when appropriate.

# 52. Logging

Use structured server-side logging.
Log useful information such as: Request ID, User ID where appropriate, Operation, Error code, Timestamp.
Do NOT log: Passwords, Session secrets, Database credentials, Sensitive tokens.

# 53. Request IDs

For production debugging, requests should ideally have a trace/request identifier.
Example: `requestId = abc123`
This makes it easier to correlate frontend errors with server logs.

# 54. API Pagination

List endpoints should support pagination.
Example: `GET /api/products?page=1&limit=25`
The implementation should enforce reasonable maximum limits.
Never allow `limit=1000000` to cause an unnecessarily huge query.

# 55. Search

Search should be implemented server-side for large datasets.
Example: `GET /api/products?search=chicken`
The backend should use appropriate indexed/database-supported searching.

# 56. Filtering

Filtering should use explicit query parameters.
Example: `GET /api/sales?from=2026-08-01&to=2026-08-31&status=COMPLETED`
Do not accept arbitrary SQL-like filters from the client.

# 57. Sorting

Allow only explicitly supported sort fields.
Example: `sortBy=createdAt`, `sortOrder=desc`
Do NOT directly interpolate user-provided strings into SQL.

# 58. API Security

The backend must protect against: Unauthorized access, Privilege escalation, Injection, Invalid input, Mass assignment, Sensitive data exposure, Abusive requests.

# 59. Mass Assignment Protection

Do not blindly pass request objects into Prisma.
Bad:
```ts
prisma.product.update({ data: request.body })
```
Better:
```ts
const validated = productUpdateSchema.parse(body)
const allowedData = { name: validated.name, sellingPrice: validated.sellingPrice, ... }
```

# 60. Authorization Before Mutation

Sensitive mutations must follow: Authenticate -> Authorize -> Validate -> Execute.
The exact order may vary where validation is intentionally performed first, but authorization MUST occur before the operation is committed.

# 61. Idempotency

Critical operations should be designed to reduce accidental duplicate transactions.
This is especially important for POS checkout.
Example problem: User taps Complete Sale -> Network delay -> User taps again.
The backend should have a strategy to prevent accidental duplicate sales.

# 62. POS Duplicate Prevention

Possible mechanisms include:
Client-generated transaction reference + Database uniqueness constraint
or another server-supported idempotency mechanism.
The final implementation must choose one and document it.

# 63. Sale Creation Atomicity

A completed sale must not result in: Sale created + Payment missing OR Payment created + Sale missing when these records are required to be atomic.

# 64. Void Sale

Voiding a sale should be treated as a controlled business operation.
Example: `POST /api/sales/:id/void`
The service should: Check permission, Check sale state, Mark sale as voided, Reverse inventory if applicable, Create audit log.
All relevant changes should be handled transactionally.

# 65. Audit Logging

Important actions should create audit entries.
Examples: Sale created, Sale voided, Product price changed, Inventory adjusted, Expense created, User role changed.

# 66. Business Rule Example

A voided sale should not continue appearing as a valid completed sale in sales totals.
Reports must consistently apply: `status = COMPLETED` where appropriate.

# 67. Reporting Rule

Do not duplicate business calculations across endpoints.
Bad: Dashboard calculates profit one way. Reports calculate profit another way.
Better: Shared reporting/business logic with consistent definitions.

# 68. Profit Definition

The application must clearly define what "profit" means.
For the MVP, if complete cost accounting is not implemented, the dashboard should avoid pretending to provide exact accounting profit.
It may instead use a clearly labeled estimate based on the available data. Do not invent accounting logic.

# 69. API Documentation

Every major endpoint should be documented with: Method, Path, Purpose, Authentication requirement, Permission, Request body, Query parameters, Success response, Possible errors.

# 70. Example API Specification

**Create Sale**
`POST /api/sales`

Authentication: Required
Permission: `sales:create`

Request:
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "discount": 0,
  "paymentMethod": "CASH"
}
```

Server:
Validate -> Calculate -> Create Sale -> Create SaleItems -> Create Payment -> Update Inventory -> Audit

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoiceNumber": "INV-000123",
    "total": 500
  }
}
```

# 71. Product API

```text
GET    /api/products
POST   /api/products
GET    /api/products/:id
PATCH  /api/products/:id
POST   /api/products/:id/activate
POST   /api/products/:id/deactivate
```

# 72. Category API

```text
GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PATCH  /api/categories/:id
POST   /api/categories/:id/activate
POST   /api/categories/:id/deactivate
```

# 73. Sales API

```text
GET    /api/sales
POST   /api/sales
GET    /api/sales/:id
POST   /api/sales/:id/void
```

# 74. Inventory API

```text
GET    /api/inventory
GET    /api/inventory/:id
GET    /api/inventory/:id/transactions
POST   /api/inventory/:id/adjust
POST   /api/inventory/:id/stock-in
```

# 75. Expenses API

```text
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/:id
PATCH  /api/expenses/:id
```

# 76. Expense Categories API

```text
GET    /api/expense-categories
POST   /api/expense-categories
PATCH  /api/expense-categories/:id
```

# 77. Dashboard API

Possible endpoint: `GET /api/dashboard/summary`
Response may contain: Today's Sales, Today's Orders, Today's Expenses, Estimated Profit, Low Stock Count, Recent Sales.

# 78. Reports API

Possible endpoints:
```text
GET /api/reports/sales
GET /api/reports/expenses
GET /api/reports/inventory
GET /api/reports/products
```
The final endpoint structure may be consolidated if that results in a cleaner API.

# 79. Settings API

```text
GET   /api/settings
PATCH /api/settings
```
Only authorized users should modify settings.

# 80. Authentication API

Authentication endpoints depend on the selected authentication implementation.
The project should prefer a mature authentication solution rather than implementing cryptography manually.

# 81. Backend Testing

Every service should be testable independently from HTTP.
Example: SaleService, InventoryService, ExpenseService, ProductService
Tests should verify business rules.

# 82. Unit Tests

Examples: Correct sale total, Invalid quantity rejected, Inactive product cannot be sold, Expense amount must be positive, Low stock calculation works.

# 83. Integration Tests

Integration tests should verify: Service -> Repository -> PostgreSQL
Examples: Create sale, Update inventory, Void sale, Create expense.

# 84. API Tests

API tests should verify: Authentication, Authorization, Validation, HTTP status codes, Response structure, Error handling.

# 85. Security Testing

Test that:
- Unauthenticated users cannot access protected APIs.
- Cashiers cannot access admin-only APIs.
- Invalid IDs are handled safely.
- Unauthorized mutations are rejected.
- Client-supplied financial totals are not trusted.

# 86. Performance

The backend should be optimized for normal small-business workloads.
Priorities: Efficient queries, Proper indexes, Pagination, Avoid N+1 queries, Minimal response payloads.
Do not prematurely introduce complex caching.

# 87. Vercel Compatibility

The backend must be compatible with Vercel's serverless execution model.
Avoid relying on: Permanent in-memory state, Long-running processes, Local filesystem persistence, In-process background workers.

# 88. PostgreSQL Connection Management

The implementation must use a PostgreSQL setup appropriate for serverless workloads.
Connection pooling must be considered.
Do not create uncontrolled database connections per request.

# 89. File Storage

The local Vercel filesystem must NOT be treated as permanent storage.
If future features require: Receipt PDFs, Product images, Documents, Backups use appropriate persistent object storage.

# 90. Backend Environment Variables

Secrets must be stored in environment variables.
Potential variables: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL.
Only variables explicitly marked public should be exposed to the browser.

# 91. Environment Separation

Maintain separate environments where practical: Development, Preview, Production.
Production credentials must never be used for local development.

# 92. Production Safety

The backend must never:
- Reset production database
- Run destructive seed scripts
- Expose database credentials
- Disable authorization
- Return stack traces
- Trust frontend totals

# 93. Backend Dependency Rule

Dependencies should flow inward: `API` -> `Service` -> `Repository` -> `Prisma`.
The service should not depend on React components.
The repository should not depend on HTTP request objects.

# 94. Separation of Concerns

Bad:
React Component -> Prisma
API Route -> 500 lines of business logic
Repository -> Permission decision

Correct:
UI -> API -> Service -> Repository -> Prisma -> PostgreSQL

# 95. Backend Code Quality Rules

The AI must:
- Keep functions focused.
- Avoid giant files.
- Avoid giant API handlers.
- Use descriptive names.
- Avoid duplicate business logic.
- Validate inputs.
- Handle errors.
- Write tests for critical business rules.
- Keep database access centralized.
- Document non-obvious business decisions.

# 96. No Hallucinated Features

The AI must NOT implement backend functionality merely because it is common in POS systems.
Examples: ❌ Customer CRM, ❌ Loyalty points, ❌ Supplier management, ❌ Payroll, ❌ Multi-branch support, ❌ Complex accounting, ❌ Tax engine, ❌ Online ordering, ❌ Delivery management, ❌ AI forecasting unless explicitly added to the requirements.

# 97. Change Protocol

Before modifying backend architecture, the AI must:
1. Read existing architecture.
2. Identify affected module.
3. Check whether functionality already exists.
4. Reuse existing services/repositories.
5. Define required schema changes.
6. Implement business logic in service layer.
7. Add/update API endpoint.
8. Add validation.
9. Add tests.
10. Verify existing functionality.

# 98. Backend Definition of Done

A backend feature is complete only when:
- Request validation exists
- Authentication is handled
- Authorization is handled
- Business logic is in service layer
- Database access is in repository/data layer
- Errors are handled
- Database transaction is used where required
- Tests exist for critical logic
- API response is consistent
- No secrets are exposed
- Existing functionality still works

# 99. Golden Backend Architecture

The final architecture should follow:

```text
                    ┌─────────────┐
                    │   Next.js   │
                    │   Frontend  │
                    └──────┬──────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Presentation    │
                  │ API / Actions   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Business Layer  │
                  │    Services     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Data Access     │
                  │  Repositories   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     Prisma      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  └─────────────────┘
```

# 100. Final Backend Principle

Routes handle HTTP. Services handle business rules. Repositories handle data access. Prisma handles database communication. PostgreSQL stores the authoritative data.
No layer should take responsibility for another layer's job.

# 101. AI Golden Rule

Before writing backend code, the AI must determine:
What is the business rule? -> Which module owns it? -> Which service implements it? -> Which repository provides the required data? -> Which API exposes it? -> Which frontend workflow consumes it? -> Which tests prove it works?
This process must be followed for every significant backend feature.
