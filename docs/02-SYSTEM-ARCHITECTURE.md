# Biryani Shop Management System

## System Architecture Specification

**Document:** 02 — System Architecture
**Version:** 1.0
**Status:** Approved Foundation Architecture
**Frontend:** Next.js
**Backend:** Next.js
**Language:** TypeScript
**Database:** PostgreSQL
**Deployment:** Vercel

---

# 1. Purpose

This document defines the technical architecture of the Biryani Shop Management System.

It establishes:

* Application structure
* Frontend/backend boundaries
* Backend layers
* Module boundaries
* Data flow
* Dependency rules
* Database access rules
* Authentication boundaries
* Authorization boundaries
* Error handling boundaries
* Server/client responsibilities
* Scalability principles
* AI development rules

This document is an architectural contract.

The implementation must follow this architecture unless an explicit architectural change is approved.

---

# 2. Core Architectural Decision

The application will be implemented as a **single Next.js application**.

Next.js will provide both:

1. Frontend/presentation functionality
2. Backend/server functionality

PostgreSQL will provide persistent data storage.

The application does NOT require a separate backend server for the MVP.

---

# 3. High-Level Architecture

```text
                         USER
                           │
                           ▼
                ┌──────────────────────┐
                │     Next.js App      │
                │                      │
                │  Presentation Layer  │
                │          │           │
                │          ▼           │
                │    API / Server      │
                │          │           │
                │          ▼           │
                │ Application Services │
                │          │           │
                │          ▼           │
                │ Business / Domain    │
                │          │           │
                │          ▼           │
                │ Repository Layer     │
                │          │           │
                │          ▼           │
                │ Prisma / DB Client   │
                └──────────┬───────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  └─────────────────┘
```

---

# 4. Architectural Layers

The system is divided into the following logical layers:

```text
1. Presentation Layer
2. API / Server Layer
3. Application Layer
4. Domain / Business Logic Layer
5. Repository / Data Access Layer
6. Database Layer
```

Each layer has a specific responsibility.

---

# 5. Presentation Layer

## Responsibility

The Presentation Layer is responsible for everything the user sees and interacts with.

It includes:

* Pages
* Layouts
* React components
* Forms
* Tables
* Buttons
* Dialogs
* Charts
* Navigation
* POS interface
* Loading states
* Empty states
* Error displays

The Presentation Layer is implemented using:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Reusable UI components

---

# 6. Presentation Layer Rules

The Presentation Layer MUST NOT:

* Access Prisma directly
* Query PostgreSQL directly
* Contain database queries
* Contain complex business rules
* Decide whether a user has permission
* Calculate authoritative financial values
* Modify inventory directly

The frontend may perform temporary calculations for user experience.

However, the backend remains authoritative.

---

# 7. Server/API Layer

The API/Server Layer is the entry point for backend operations.

It is responsible for:

* Receiving requests
* Reading request parameters
* Authentication checks
* Authorization checks
* Input validation
* Calling application services
* Formatting responses
* Returning appropriate errors

Example:

```text
POST /api/sales
```

The API handler should NOT implement the entire sale process.

Instead:

```text
API
 ↓
Validation
 ↓
Sale Service
 ↓
Business Rules
 ↓
Repositories
 ↓
Database
```

---

# 8. Application Layer

The Application Layer coordinates complete business use cases.

Examples:

```text
SaleService
ProductService
InventoryService
ExpenseService
ReportService
OrderService
UserService
```

Services answer questions such as:

* How is a sale created?
* How is an expense recorded?
* How is stock adjusted?
* How is a report generated?
* How is a product deactivated?

---

# 9. Service Layer Rules

Services MAY:

* Call repositories
* Call domain rules
* Coordinate multiple repositories
* Start database transactions
* Validate business conditions
* Transform data
* Execute complete use cases

Services MUST NOT:

* Render UI
* Import React components
* Depend on browser APIs
* Return UI-specific components
* Trust client-side financial calculations

---

# 10. Domain / Business Logic Layer

The Domain Layer contains business rules that determine how the business operates.

Examples:

```text
Sale total calculation
Discount rules
Inventory quantity rules
Product availability rules
Expense rules
Report calculations
Permission rules
Sale cancellation rules
```

The domain layer should contain logic that is independent from the user interface.

---

# 11. Example: Sale Calculation

The business rule should conceptually be:

```text
Item 1 subtotal
+
Item 2 subtotal
+
Item 3 subtotal
=
Subtotal

Subtotal
-
Valid Discount
=
Final Total
```

The final authoritative calculation happens on the server.

The browser must not be able to manipulate the final amount by simply sending a modified total.

---

# 12. Repository Layer

The Repository Layer provides database access to the application.

Examples:

```text
SaleRepository
ProductRepository
InventoryRepository
ExpenseRepository
CategoryRepository
UserRepository
RoleRepository
```

Repositories are responsible for:

* Querying records
* Creating records
* Updating records
* Finding records
* Filtering records
* Pagination
* Database-specific operations

---

# 13. Repository Rules

Repositories MUST NOT contain business decisions.

For example, this is incorrect:

```text
SaleRepository:
"If discount > 20%, reject sale."
```

That is business logic and belongs in the service/domain layer.

The repository should perform data operations.

---

# 14. Database Layer

PostgreSQL is the persistent data layer.

The application will use an ORM/database client.

The ORM is currently intended to be:

**Prisma**

If the ORM decision is changed later, the rest of the architecture should remain unaffected.

The Repository Layer is the abstraction boundary that protects the rest of the application from database implementation details.

---

# 15. Database Access Rule

Only the server-side data access layer may communicate with PostgreSQL.

Allowed:

```text
Service
 ↓
Repository
 ↓
Prisma
 ↓
PostgreSQL
```

Not allowed:

```text
React
 ↓
Prisma
```

Not allowed:

```text
Browser
 ↓
PostgreSQL
```

Not allowed:

```text
React Component
 ↓
Repository
```

The frontend must communicate through approved server-side application interfaces.

---

# 16. Complete Request Flow

A typical request should follow:

```text
User
 ↓
React / Next.js UI
 ↓
Server/API Endpoint
 ↓
Authentication
 ↓
Authorization
 ↓
Input Validation
 ↓
Application Service
 ↓
Business Rules
 ↓
Repository
 ↓
Prisma
 ↓
PostgreSQL
 ↓
Repository Result
 ↓
Service Result
 ↓
API Response
 ↓
UI
```

---

# 17. POS Request Flow

Example:

```text
User selects:
Chicken Biryani × 2
Raita × 1
        │
        ▼
Frontend Cart
        │
        ▼
Checkout
        │
        ▼
POST /api/sales
        │
        ▼
Authenticate User
        │
        ▼
Validate Request
        │
        ▼
SaleService
        │
        ├── Verify Products
        ├── Verify Availability
        ├── Calculate Prices
        ├── Validate Discount
        ├── Calculate Total
        │
        ▼
Database Transaction
        │
        ├── Create Sale
        ├── Create Sale Items
        ├── Create Payment
        └── Update Inventory if applicable
        │
        ▼
Commit Transaction
        │
        ▼
Return Sale Result
        │
        ▼
POS Confirmation
```

---

# 18. Atomic Transactions

Operations involving multiple related database writes must use database transactions where required.

A sale is an example.

The following operations should be treated as one logical operation:

```text
Create Sale
Create Sale Items
Create Payment
Update Inventory
Create Inventory Transactions
```

If one required operation fails:

```text
ROLLBACK
```

The system must not leave a partially completed sale.

---

# 19. Module Architecture

The application should be divided into business modules.

Primary modules:

```text
Authentication
Users
Products
Categories
Sales
Orders
Inventory
Expenses
Reports
Settings
Dashboard
```

Each module should own its relevant:

* Types
* Validation
* Services
* Repositories
* Business rules
* Tests

---

# 20. Recommended Module Structure

A module may follow this structure:

```text
src/modules/sales/

├── sales.service.ts
├── sales.repository.ts
├── sales.validation.ts
├── sales.types.ts
├── sales.rules.ts
└── index.ts
```

Additional files may be introduced when justified.

Do not create unnecessary files merely to make the folder look structured.

---

# 21. Recommended Project Structure

The application should follow a structure similar to:

```text
biryani-shop/
│
├── docs/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── pos/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── expenses/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   └── api/
│   │       ├── sales/
│   │       ├── products/
│   │       ├── inventory/
│   │       ├── expenses/
│   │       └── reports/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── pos/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── expenses/
│   │   └── reports/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── expenses/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── lib/
│   │   ├── db/
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── validation/
│   │   └── utilities/
│   │
│   ├── types/
│   │
│   └── config/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

This is a recommended structure, not permission to create unnecessary abstractions.

---

# 22. Next.js App Router

The application should use the Next.js App Router.

Route groups should be used where they improve organization.

For example:

```text
app/
├── (auth)/
│   └── login/
│
└── (dashboard)/
    ├── dashboard/
    ├── pos/
    ├── orders/
    └── inventory/
```

The route structure should remain understandable.

---

# 23. Server Components

Next.js Server Components should be the default where appropriate.

Use Server Components for:

* Server-rendered dashboard data
* Reports
* Product lists
* Order history
* Inventory views
* Static layouts

Server Components can safely access approved server-side services.

They must still respect the architectural boundaries.

---

# 24. Client Components

Client Components should only be used when browser-side interactivity is required.

Examples:

* POS cart
* Product selection
* Interactive filters
* Dialogs
* Dropdown interactions
* Charts requiring client interaction
* Mobile navigation
* Highly interactive forms

Do not mark entire pages as client components unnecessarily.

---

# 25. Server vs Client Rule

Use the smallest possible client boundary.

Prefer:

```text
Server Page
    ↓
Server Data
    ↓
Small Client Component
```

instead of:

```text
Entire Application
        ↓
Client Component
```

---

# 26. Authentication Architecture

Authentication must be handled server-side.

The application should have a trusted server-side session.

The browser may contain session information, but the backend must determine the authenticated user.

The frontend must never be trusted to provide its own identity.

---

# 27. Authorization Architecture

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to do?

These are separate concerns.

Example:

```text
Authenticated User
        ↓
Retrieve User Role
        ↓
Check Permission
        ↓
Allow / Deny
```

Authorization MUST occur server-side.

---

# 28. Permission Examples

Potential permissions:

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

The exact permission matrix will be finalized in the security documentation.

---

# 29. Validation Architecture

External input must always be validated.

Sources include:

* Form submissions
* API requests
* URL parameters
* Search parameters
* IDs
* Query parameters

Validation should occur before business logic executes.

Conceptually:

```text
Request
 ↓
Schema Validation
 ↓
Validated Data
 ↓
Service
```

Invalid data must never reach sensitive business operations.

---

# 30. Error Architecture

The backend should use structured application errors.

Examples:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
BusinessRuleError
DatabaseError
InternalServerError
```

Errors should have stable internal codes where useful.

Example:

```text
PRODUCT_NOT_FOUND
SALE_INVALID
INSUFFICIENT_STOCK
PERMISSION_DENIED
INVALID_DISCOUNT
```

---

# 31. Error Boundary

Database errors must not be exposed directly to the user.

Bad:

```text
PrismaClientKnownRequestError...
```

Good:

```text
Unable to complete the sale.
Please try again.
```

The server logs the technical error.

The user receives an appropriate safe message.

---

# 32. Financial Data Architecture

Financial values must have one authoritative implementation.

Examples:

```text
calculateSaleSubtotal()
calculateDiscount()
calculateSaleTotal()
calculateSalesSummary()
calculateEstimatedProfit()
```

These calculations must not be independently reimplemented on:

* POS
* Dashboard
* Reports
* Orders
* Another API endpoint

unless there is a clear reason.

---

# 33. Money Handling

Financial values must not rely on unsafe JavaScript floating-point calculations.

Use an appropriate precise representation in PostgreSQL and application logic.

Money calculations must be consistent across the entire application.

---

# 34. Inventory Architecture

Inventory changes should occur through controlled application services.

Example:

```text
InventoryService.addStock()
InventoryService.adjustStock()
InventoryService.removeStock()
```

The UI must not directly modify inventory quantities.

---

# 35. Inventory Transaction Principle

A stock quantity change should be traceable.

Conceptually:

```text
Previous Quantity
        ↓
Operation
        ↓
New Quantity
        ↓
Transaction Record
```

Example:

```text
Rice
Previous: 100 kg
Added: 50 kg
New: 150 kg
Reason: Supplier Purchase
User: Owner
Date: ...
```

---

# 36. Sales Architecture

A sale is a financial transaction.

It should contain:

* Sale header
* Sale items
* Payment information
* User information
* Timestamps
* Status

Historical sale information must remain stable.

---

# 37. Historical Data Principle

Changing a product must not rewrite historical sales.

For example:

Today:

```text
Chicken Biryani = Rs. 250
```

Next month:

```text
Chicken Biryani = Rs. 300
```

Previous sales must still show:

```text
Chicken Biryani
Rs. 250
```

Historical transaction snapshots should therefore be maintained where appropriate.

---

# 38. Soft Deletion Principle

Business entities that are referenced by historical records should generally not be physically deleted.

For example:

Instead of:

```text
DELETE Product
```

prefer:

```text
Product.isActive = false
```

This prevents historical references from becoming invalid.

---

# 39. Reporting Architecture

Reports should be generated from authoritative database records.

Example:

```text
Reports Page
     ↓
Report API / Server Function
     ↓
Report Service
     ↓
Repository
     ↓
PostgreSQL
```

Report calculations must use consistent business rules.

---

# 40. Date and Time Handling

The application must consistently handle:

* Sale timestamps
* Expense dates
* Inventory transaction timestamps
* Report date ranges

The business timezone must be explicitly configured.

The application must not randomly interpret dates using browser timezone assumptions.

---

# 41. Dashboard Architecture

The dashboard should aggregate existing business data.

It should not create duplicate business records merely for dashboard display.

Conceptually:

```text
Dashboard
   ↓
Dashboard Service
   ├── Sales Summary
   ├── Expense Summary
   ├── Order Summary
   ├── Inventory Alerts
   └── Top Products
```

---

# 42. Caching Principle

Caching may be used for data where small amounts of staleness are acceptable.

However:

* POS data must prioritize correctness.
* Financial totals must prioritize correctness.
* Inventory availability must prioritize correctness.

Do not introduce aggressive caching simply to improve perceived performance.

---

# 43. Pagination Architecture

Large datasets must not be loaded entirely into the browser.

Pagination should be used for:

* Orders
* Sales
* Inventory transactions
* Expenses
* Products when necessary

The database should perform filtering and pagination whenever practical.

---

# 44. Search Architecture

Search should be performed using appropriate database queries rather than downloading all records to the browser.

Example:

```text
User searches:
"chicken"

        ↓

Server
        ↓

Database query
        ↓

Matching products
```

---

# 45. API Architecture

API endpoints should follow consistent naming.

Examples:

```text
/api/products
/api/products/[id]

/api/sales
/api/sales/[id]

/api/orders
/api/orders/[id]

/api/inventory
/api/inventory/[id]

/api/expenses
/api/expenses/[id]

/api/reports/sales
/api/reports/expenses
```

The exact API structure may be refined during backend implementation without violating the layer boundaries.

---

# 46. API Responsibility

An API endpoint should remain thin.

Preferred:

```text
Request
 ↓
Auth
 ↓
Validation
 ↓
Service
 ↓
Response
```

Avoid:

```text
Request
 ↓
100+ lines of business logic
 ↓
Database
 ↓
More business logic
 ↓
Response
```

---

# 47. Dependency Direction

Dependencies must follow:

```text
Presentation
      ↓
Application/API
      ↓
Services
      ↓
Domain
      ↓
Repositories
      ↓
Database
```

Lower-level infrastructure must not leak into higher-level presentation code.

---

# 48. Forbidden Dependencies

The following are prohibited:

```text
UI → Prisma
UI → PostgreSQL
UI → Database Repository
```

```text
React Component → Business Database Mutation
```

```text
API Handler → Large Business Algorithm
```

```text
Repository → React
```

```text
Domain Logic → Browser APIs
```

---

# 49. Reusability Principle

If a business operation is required by multiple interfaces, it must exist in a reusable backend service.

For example:

```text
POS
Dashboard
Admin Tool
```

should not each implement their own sale calculation.

They should rely on the same business logic.

---

# 50. Security Boundary

The browser is considered untrusted.

Anything coming from the browser can be manipulated.

Therefore the server must independently verify:

* User identity
* Permissions
* Product existence
* Product price
* Quantity
* Discount
* Sale total
* Inventory conditions
* IDs
* Business rules

---

# 51. Data Integrity

Database constraints should be used where appropriate.

Examples:

* Required fields
* Unique invoice numbers
* Unique usernames/emails where applicable
* Valid relationships
* Foreign keys
* Appropriate indexes

Application-level validation and database-level integrity should complement each other.

---

# 52. Concurrency

The application must account for simultaneous operations.

Example:

Two users attempt to sell stock at approximately the same time.

The backend must prevent inconsistent inventory state through appropriate database transactions and concurrency-safe operations.

---

# 53. Idempotency / Duplicate Submission

The system should prevent accidental duplicate sales caused by:

* Double-clicking checkout
* Network retries
* Browser retries
* Repeated form submissions

The POS should disable the checkout action while a sale is being processed.

The backend should also be designed so that client-side prevention is not the only protection.

---

# 54. Observability

The application should provide sufficient logging to diagnose production problems.

Useful events include:

* Authentication failures
* Server errors
* Failed sale transactions
* Database errors
* Authorization failures
* Important inventory adjustments

Logs must not expose:

* Passwords
* Secrets
* Session tokens
* Sensitive authentication information

---

# 55. Environment Separation

The application should support separate environments:

```text
Development
Preview
Production
```

Environment-specific values must be supplied through environment variables.

Production secrets must never be committed to source control.

---

# 56. Scalability Principle

The MVP is designed for a small shop.

The architecture should nevertheless allow future expansion without requiring a complete rewrite.

Potential future capabilities may include:

* Multiple branches
* Customer management
* Online ordering
* Delivery
* Advanced inventory recipes
* Supplier management
* Advanced analytics

These are NOT part of the MVP.

The architecture should remain modular enough to accommodate them later.

---

# 57. Overengineering Rule

Do not introduce architecture merely for theoretical scalability.

Avoid unnecessary:

* Microservices
* Message queues
* Separate backend servers
* Complex event buses
* Multiple databases
* Distributed systems
* Unnecessary state-management libraries

The application is a small business management system.

A well-structured modular monolith is the preferred architecture.

---

# 58. Preferred Architecture Model

The system should be considered a:

> **Modular Monolith**

Meaning:

* One Next.js application
* One PostgreSQL database
* Clearly separated business modules
* Clearly separated application layers
* Shared infrastructure
* Independent business logic

This provides simplicity without sacrificing maintainability.

---

# 59. Development Rules for AI Agents

An AI coding agent working on this project MUST follow these rules.

## Rule 1 — Read Documentation First

Before implementing a feature, read the relevant documentation.

---

## Rule 2 — Inspect Existing Code

Before creating a new implementation, inspect existing patterns.

Do not assume the repository is empty.

---

## Rule 3 — Reuse Existing Patterns

If an existing service, repository, validation schema, component, or utility solves the problem, reuse it.

---

## Rule 4 — Do Not Bypass Layers

Never access Prisma directly from UI components.

Never put large business logic into route handlers.

---

## Rule 5 — No Fake Functionality

Do not implement fake database operations using:

* Hardcoded arrays
* Fake API responses
* setTimeout
* Random generated values
* Static dashboard numbers

unless explicitly required for testing or temporary UI development.

---

## Rule 6 — No Silent Architecture Changes

Do not replace:

* Next.js
* PostgreSQL
* The layered architecture
* The modular monolith architecture

without explicit approval.

---

## Rule 7 — No Unnecessary Dependencies

Before installing a library, determine whether the existing stack already provides the required functionality.

---

## Rule 8 — Preserve Existing Features

A new feature must not break existing functionality.

---

## Rule 9 — Financial Correctness

Never trust frontend totals.

The server must calculate and validate financial values.

---

## Rule 10 — Authorization

Never rely only on hidden buttons or frontend route protection.

Authorization must be enforced server-side.

---

## Rule 11 — Database Integrity

Do not directly manipulate critical business records without considering transactions, historical integrity, and auditability.

---

## Rule 12 — Mobile First

Every user-facing feature must be tested on mobile.

---

## Rule 13 — Error Handling

Every asynchronous operation must have appropriate:

* Loading state
* Success state
* Error state
* Empty state where applicable

---

## Rule 14 — Type Safety

Avoid:

```ts
any
```

unless there is a documented technical reason.

Prefer explicit types.

---

## Rule 15 — Testing

A feature is not complete until appropriate tests and verification have been performed.

---

# 60. Architecture Change Protocol

If a developer believes the architecture needs to change:

```text
Problem Identified
        ↓
Explain Current Limitation
        ↓
Propose Change
        ↓
Evaluate Impact
        ↓
Update Documentation
        ↓
Implement Change
        ↓
Test
```

The AI must not silently change architecture while implementing an unrelated feature.

---

# 61. Final Architecture Contract

The following architecture is considered the baseline contract:

```text
                    ┌─────────────────────┐
                    │       USER          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   NEXT.JS FRONTEND  │
                    │  Presentation Layer  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   API / SERVER      │
                    │       LAYER         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ APPLICATION/SERVICE │
                    │       LAYER         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ BUSINESS / DOMAIN   │
                    │       LAYER         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    REPOSITORY       │
                    │       LAYER         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       PRISMA        │
                    │     DB CLIENT       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     POSTGRESQL      │
                    └─────────────────────┘
```

This architecture should remain the foundation of the project.

The application is a **Next.js modular monolith with a layered backend architecture and PostgreSQL persistence**, optimized for a simple, mobile-first biryani shop management workflow.

---

# 62. Architecture Success Criteria

The architecture is considered correctly implemented when:

* Frontend and backend are contained within the Next.js application.
* PostgreSQL is the persistent source of truth.
* Database access is isolated behind repositories.
* Business logic is isolated from UI.
* API routes remain thin.
* Services coordinate business operations.
* Financial operations use appropriate transactions.
* Authentication is server-side.
* Authorization is server-side.
* Input validation occurs before business logic.
* Historical sales remain stable.
* Inventory operations are traceable.
* Mobile workflows remain fully functional.
* Modules are independently understandable.
* Existing features can be extended without architectural duplication.

---

# 63. Final Principle

The architecture must remain:

> **Simple enough for a small shop, structured enough for professional software, and predictable enough that an AI coding agent cannot freely invent its own architecture.**
