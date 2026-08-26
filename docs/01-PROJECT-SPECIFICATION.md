# Biryani Shop Management System

## Project Specification & Product Requirements

**Document Version:** 1.0
**Status:** Foundation Specification
**Application Type:** Mobile-First Web Application
**Frontend:** Next.js
**Backend:** Next.js
**Database:** PostgreSQL
**Deployment:** Vercel

---

# 1. Document Purpose

This document defines the fundamental requirements, scope, goals, constraints, and product behavior of the Biryani Shop Management System.

This document is the primary product-level source of truth for development.

The development team or AI coding agent MUST use this document together with the other project documentation before implementing or modifying functionality.

No feature should be invented solely based on assumptions.

If a requirement is not documented, the developer/AI agent must:

1. Check the other project documentation.
2. Check the existing implementation.
3. If the requirement remains unclear, ask for clarification before making a major architectural or business decision.

---

# 2. Project Overview

The Biryani Shop Management System is a simple business management application designed specifically for a small biryani/food shop.

The application allows the shop owner or authorized staff to manage daily shop operations from a mobile phone, tablet, or desktop computer.

The primary purpose of the application is to make the following activities easy:

* Selling food through POS.
* Managing products/menu items.
* Managing stock and inventory.
* Recording business expenses.
* Viewing sales.
* Viewing daily and monthly performance.
* Viewing useful business reports.
* Reviewing previous orders.
* Managing basic system settings.

The application is intentionally NOT designed as a complex enterprise restaurant management platform.

---

# 3. Product Vision

The product should feel like a simple digital notebook and cash register for a shop owner, while providing professional reporting and inventory management.

The core principle is:

> The owner should be able to understand the application immediately without needing technical knowledge.

The application must prioritize:

* Simplicity
* Speed
* Mobile usability
* Reliability
* Data accuracy
* Professional appearance
* Easy navigation
* Minimal unnecessary complexity

---

# 4. Technology Requirements

## 4.1 Frontend

The frontend MUST be built using:

**Next.js**

The application should use:

* React
* TypeScript
* Tailwind CSS
* A reusable component system

The frontend must be responsive and optimized primarily for mobile devices.

---

# 4.2 Backend

The backend MUST also be implemented within the Next.js application.

A separate backend application is NOT required for the initial system.

The backend must provide a proper layered architecture.

Conceptually:

```text
Frontend / Presentation
        ↓
API / Server Layer
        ↓
Application / Service Layer
        ↓
Business Logic Layer
        ↓
Repository / Data Access Layer
        ↓
Database Layer
        ↓
PostgreSQL
```

Frontend components must never directly communicate with PostgreSQL.

Business logic must not be placed inside React components.

---

# 4.3 Database

The database MUST be:

**PostgreSQL**

PostgreSQL is the authoritative source of persistent business data.

The application must not rely on browser local storage as the primary database.

Important business information such as:

* Sales
* Sale items
* Expenses
* Inventory
* Products
* Users
* Reports-related data

must be stored in PostgreSQL.

---

# 4.4 Deployment

The application will be deployed on:

**Vercel**

The architecture must therefore be compatible with Vercel's deployment model.

The application must not depend on:

* A permanently running custom server
* Local filesystem persistence
* Local-only databases
* Desktop-only services
* Long-running background processes unless explicitly supported by the final architecture

---

# 5. Primary Users

The primary user is the:

## Shop Owner

The owner should be able to:

* Make sales.
* View sales.
* Manage products.
* Manage stock.
* Record expenses.
* View reports.
* Monitor business performance.
* Manage settings.
* Manage authorized users if user management is enabled.

---

# 6. Secondary Users

The system may support staff accounts such as:

## Manager

A manager may be allowed to:

* Use POS.
* View orders.
* Manage inventory.
* Manage expenses.
* View reports.
* Manage products.

## Cashier

A cashier may primarily be allowed to:

* Use POS.
* View appropriate order information.
* Perform authorized sales operations.

The exact permission matrix will be defined in the Security/RBAC documentation.

The frontend MUST NOT be treated as the security boundary.

All permissions must ultimately be enforced on the backend.

---

# 7. Primary Product Requirements

The system MUST provide the following core modules:

1. Dashboard
2. POS
3. Orders/Sales
4. Products/Menu
5. Inventory/Stock
6. Expenses
7. Reports
8. Settings
9. Authentication
10. User/Role Management where required

---

# 8. Mobile-First Requirement

Mobile responsiveness is a mandatory requirement and one of the highest priorities of the project.

The application must be fully usable from a modern smartphone.

The owner should not need a desktop computer to perform normal daily operations.

The following workflows MUST work properly on mobile:

* Login
* Dashboard viewing
* POS sales
* Product selection
* Cart management
* Checkout
* Order history
* Inventory viewing
* Stock adjustment
* Expense creation
* Report viewing
* Product management
* Settings

---

# 9. Responsive Design Requirements

The application must support:

* Small mobile phones
* Large mobile phones
* Tablets
* Laptops
* Desktop monitors

There must be one responsive application rather than separate mobile and desktop applications.

Desktop layouts may use additional horizontal space, but mobile must remain fully functional.

---

# 10. POS Requirement

POS is a core feature of the application.

The POS must prioritize:

* Speed
* Simplicity
* Touch interaction
* Minimal steps
* Clear pricing
* Easy quantity changes
* Fast checkout

The standard workflow should be:

```text
Open POS
    ↓
Select Category
    ↓
Select Product
    ↓
Add to Cart
    ↓
Adjust Quantity
    ↓
Review Cart
    ↓
Apply Discount if Authorized
    ↓
Select Payment Method
    ↓
Confirm Sale
    ↓
Sale Completed
    ↓
Receipt / Confirmation
```

The POS must not require unnecessary navigation between multiple pages for a normal sale.

---

# 11. POS User Experience

The POS screen should make the following immediately obvious:

* Available products
* Product categories
* Product prices
* Current cart
* Quantity
* Subtotal
* Discount if applicable
* Final total
* Checkout action

The primary checkout action must always be easy to locate.

Touch targets must be sufficiently large for mobile users.

---

# 12. Product/Menu Management

The owner must be able to manage products sold through the POS.

A product may contain:

* Product name
* Category
* Selling price
* Cost price where applicable
* Unit
* Image where applicable
* Availability
* Active/inactive status
* Creation date
* Updated date

The owner should be able to:

* Add products
* Edit products
* Activate products
* Deactivate products
* Organize products into categories
* Change prices

Historical sales must retain the historical product name and selling price used at the time of the transaction.

Changing a product later must not rewrite historical sales records.

---

# 13. Inventory Requirement

The system must provide basic inventory/stock management.

The owner should be able to track items such as:

* Rice
* Chicken
* Beef
* Cooking oil
* Spices
* Drinks
* Raita ingredients
* Packaging materials
* Other shop stock

Inventory should support:

* Current quantity
* Unit
* Minimum stock level
* Stock-in
* Stock adjustment
* Stock-out where required
* Inventory history
* Low-stock indication

The inventory system should remain simple.

The initial version should not attempt to become a full enterprise supply-chain system.

---

# 14. Expense Management

The owner must be able to record business expenses.

Example expenses:

* Gas
* Electricity
* Rent
* Ingredients
* Packaging
* Transportation
* Maintenance
* Salaries
* Miscellaneous expenses

An expense should contain at minimum:

* Amount
* Category
* Description
* Date
* Payment method where applicable
* Created by
* Creation timestamp

The system must use expenses in relevant reports.

---

# 15. Sales & Order Management

The system must maintain a history of sales/orders.

The owner should be able to:

* View sales
* Search sales
* Filter sales
* View individual sale details
* See payment method
* See items purchased
* See quantities
* See total
* See date/time
* See the user who created the sale where applicable

Sales should be displayed in a clean business-style table on desktop.

On mobile, the information must remain readable and usable.

---

# 16. Reports

The reporting system must remain practical and easy to understand.

At minimum, reports should support:

## Sales Reports

* Today's sales
* Yesterday's sales
* Weekly sales
* Monthly sales
* Custom date range

## Expense Reports

* Daily expenses
* Weekly expenses
* Monthly expenses
* Expense category breakdown

## Product Reports

* Best-selling products
* Quantity sold
* Revenue by product

## Business Summary

The system should be able to show:

* Total sales
* Total discounts
* Total expenses
* Estimated profit/net amount where sufficient cost information exists
* Number of orders
* Number of items sold

---

# 17. Dashboard

The dashboard is the owner's main overview screen.

It should provide a quick understanding of the shop's current situation.

Important dashboard information includes:

* Today's sales
* Today's orders
* Today's expenses
* Estimated net amount
* Recent orders
* Top-selling products
* Low-stock items
* Sales trend

The dashboard MUST NOT become overloaded with unnecessary widgets.

The most important information should appear first.

---

# 18. Financial Data Rules

Financial information is business-critical.

The backend must be the authoritative source for:

* Sale totals
* Discounts
* Payment amounts
* Expense totals
* Report calculations
* Profit calculations

The frontend may perform temporary calculations for user experience, but the backend must independently validate and calculate authoritative financial values.

Financial calculations must not depend solely on values sent by the browser.

---

# 19. Sale Integrity

A completed sale must be treated as a financial record.

The application must not casually delete completed sales.

If a completed sale needs to be cancelled, the system should use a controlled void/cancellation process rather than silently deleting the record.

Voided sales must be clearly distinguishable from completed sales.

Normal sales reports must not accidentally include voided transactions.

---

# 20. Inventory Integrity

Inventory changes must be traceable.

Important inventory operations should record:

* Item
* Quantity
* Previous quantity
* New quantity
* Operation type
* Reason where applicable
* User
* Date/time
* Related transaction where applicable

The system should avoid silently changing stock quantities without an audit trail.

---

# 21. User Interface Philosophy

The UI must be:

* Professional
* Modern
* Minimal
* Clean
* Easy to understand
* Business-oriented
* Mobile-friendly

The design should resemble modern professional business software rather than a generic restaurant template.

---

# 22. Table/UI Philosophy

The application should use professional business tables.

Tables should provide, where appropriate:

* Search
* Filtering
* Sorting
* Pagination
* Clear column headings
* Row actions
* Empty states
* Loading states
* Error states

On mobile, large tables must be adapted rather than simply compressed until they become unreadable.

Possible mobile representations include:

* Horizontal scrolling
* Simplified rows
* Responsive cards
* Detail pages

The exact implementation will be defined in the UI/UX documentation.

---

# 23. Navigation

The navigation must be optimized for the user's device.

On mobile, primary navigation should expose the most important areas such as:

```text
Home
POS
Orders
Stock
More
```

Secondary modules may be placed inside a More menu.

On desktop, a compact sidebar may be used.

The navigation structure must remain consistent throughout the application.

---

# 24. Simplicity Requirement

The system must avoid unnecessary complexity.

Do not add features merely because they are common in large restaurant management systems.

Every feature should have a clear business purpose.

The application should optimize for:

```text
Few clicks
Clear information
Fast actions
Low learning curve
```

---

# 25. MVP Scope

The initial production version should focus on:

```text
Dashboard
POS
Orders/Sales
Products
Inventory
Expenses
Reports
Authentication
Settings
```

Advanced features should not be added to the MVP unless explicitly requested.

---

# 26. Out of Scope for Initial MVP

The following are NOT required unless later approved:

* Complex accounting system
* Full payroll system
* Advanced CRM
* Customer loyalty program
* Multi-branch management
* Delivery fleet management
* Advanced kitchen display system
* Complex supplier management
* AI sales forecasting
* Advanced procurement system
* Enterprise-level accounting
* Complex restaurant table management
* Franchise management

Adding these features without explicit approval is prohibited.

---

# 27. Technical Quality Requirements

The application must maintain:

* Strict TypeScript
* Clean architecture
* Modular code
* Reusable components
* Input validation
* Server-side authorization
* Proper error handling
* Database integrity
* Automated testing
* Responsive UI
* Production-safe configuration

---

# 28. Architecture Constraint

The application must use a layered backend architecture.

The intended dependency flow is:

```text
Presentation Layer
        ↓
API / Server Layer
        ↓
Application / Service Layer
        ↓
Business / Domain Layer
        ↓
Repository Layer
        ↓
ORM / Database Access
        ↓
PostgreSQL
```

The following patterns are prohibited:

```text
React Component
      ↓
Database
```

```text
React Component
      ↓
Prisma
```

```text
API Route
      ↓
Large block of business logic
```

Business logic must be reusable independently of the UI.

---

# 29. Data Ownership

PostgreSQL is the authoritative persistent data source.

The browser must not be considered the source of truth for:

* Sales
* Inventory
* Expenses
* Users
* Permissions
* Financial calculations

---

# 30. Error Handling

The application must provide useful errors.

Avoid generic messages such as:

> Something went wrong.

Where appropriate, errors should explain:

* What happened
* What the user can do
* Whether the operation was saved or failed

Technical details must not be exposed unnecessarily to end users.

---

# 31. Loading and Empty States

Every major data-driven screen must have:

* Loading state
* Error state
* Empty state

Examples:

No orders:

> No orders found.

No expenses:

> No expenses recorded for this period.

No products:

> No products have been added yet.

The UI should always communicate what is happening.

---

# 32. Accessibility

The application should support:

* Readable typography
* Adequate contrast
* Keyboard navigation
* Visible focus states
* Accessible labels
* Semantic HTML
* Touch-friendly controls
* Screen-reader-friendly interactive elements where applicable

---

# 33. Performance Requirements

The application should be optimized for normal shop usage.

Avoid:

* Loading unnecessary records
* Fetching entire tables when pagination is possible
* Excessive client-side JavaScript
* Unoptimized images
* Duplicate API calls
* Unnecessary database queries

Large datasets must be paginated or appropriately queried.

---

# 34. Security Requirements

Security is a mandatory system requirement.

The application must implement:

* Secure authentication
* Server-side authorization
* Input validation
* Secure session management
* Secure environment variables
* Database access protection
* Protection against unauthorized operations
* Safe error handling
* Appropriate rate limiting for sensitive operations

The frontend must never be trusted to enforce permissions.

---

# 35. Source of Truth Rules for AI Development

When an AI coding agent is used to develop the application, it MUST follow these rules:

### Rule 1

Documentation is the source of truth.

### Rule 2

The AI must inspect the existing implementation before changing architecture.

### Rule 3

The AI must not invent undocumented business rules.

### Rule 4

The AI must not introduce a new architectural pattern when an existing pattern already exists.

### Rule 5

The AI must reuse existing components and utilities where possible.

### Rule 6

The AI must not bypass the service/business layer.

### Rule 7

The AI must not access PostgreSQL directly from frontend code.

### Rule 8

The AI must not trust frontend financial calculations.

### Rule 9

The AI must validate all externally supplied data.

### Rule 10

The AI must enforce permissions on the server.

### Rule 11

The AI must preserve historical financial data.

### Rule 12

The AI must not remove existing functionality to solve a new problem without explicit approval.

### Rule 13

The AI must not install unnecessary dependencies.

### Rule 14

The AI must test changes before considering a task complete.

### Rule 15

If a requirement conflicts with existing documentation, the AI must stop and identify the conflict instead of silently choosing an implementation.

---

# 36. Definition of Done

A feature is not considered complete merely because the UI appears to work.

A feature is complete when:

* Requirements are satisfied.
* UI is implemented.
* Mobile responsiveness is verified.
* Desktop responsiveness is verified where applicable.
* Backend logic is implemented.
* Input validation exists.
* Authorization is enforced.
* Database operations are correct.
* Errors are handled.
* Loading states exist.
* Empty states exist.
* Relevant tests pass.
* TypeScript checks pass.
* Linting passes.
* Existing functionality remains operational.

---

# 37. Decisions That Must Not Be Invented

The following technical decisions will be defined in subsequent architecture documents unless explicitly approved:

* Exact RBAC implementation
* Exact API conventions
* Database schema
* Validation library
* Testing framework
* Deployment database provider
* File/image storage provider
* Receipt printing implementation
* Backup strategy

An AI coding agent must not make major architectural decisions about these areas simply because a library is familiar or convenient.

---

# 38. Current Confirmed Technology Decisions

The following decisions are confirmed:

| Area                 | Decision             |
| -------------------- | -------------------- |
| Application Type     | Web Application      |
| Frontend             | Next.js              |
| Backend              | Next.js              |
| Language             | TypeScript           |
| Database             | PostgreSQL           |
| ORM                  | Prisma               |
| Authentication       | NextAuth.js (Auth.js)|
| Deployment           | Vercel               |
| Responsive           | Mobile-first         |
| POS                  | Required             |
| Inventory            | Required             |
| Expenses             | Required             |
| Reports              | Required             |
| Orders/Sales         | Required             |
| Product Management   | Required             |
| Dashboard            | Required             |
| Complex ERP Features | Not required for MVP |

---

# 39. Project Success Criteria

The project is successful when a shop owner can perform the following without assistance:

### Daily Operation

```text
Login
→ Open POS
→ Make sale
→ Complete payment
→ View order
```

### Stock Management

```text
Open Inventory
→ View stock
→ Add stock
→ Adjust stock
→ Identify low-stock items
```

### Expense Management

```text
Open Expenses
→ Add expense
→ Save
→ See expense reflected in reports
```

### Business Monitoring

```text
Open Dashboard
→ See today's sales
→ See expenses
→ See orders
→ See stock alerts
```

### Reporting

```text
Open Reports
→ Select date range
→ View sales
→ View expenses
→ View business summary
```

If these workflows are fast, reliable, understandable, and mobile-friendly, the core product objective has been achieved.

---

# 40. Final Product Principle

The Biryani Shop Management System must follow one central principle:

> **Build a simple system that makes running a small biryani shop easier—not a complicated system that makes the owner learn software.**

Every future architectural, UI, and feature decision should support this principle.
