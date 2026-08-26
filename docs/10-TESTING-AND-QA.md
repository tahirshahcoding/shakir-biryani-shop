# Biryani Shop Management System
## Testing, QA & Production Readiness Specification

**Document:** 10 — Testing & QA  
**Version:** 1.0  
**Status:** Foundation Specification  
**Application:** Biryani Shop Management System  
**Frontend:** Next.js + TypeScript  
**Backend:** Next.js  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Deployment:** Vercel  

---

# 1. Purpose

This document defines the testing, quality assurance, validation, and production-readiness requirements for the application.

The goal is to ensure that the system is:
- Functionally correct
- Mobile responsive
- Secure
- Reliable
- Consistent
- Free from obvious UI bugs
- Safe for financial transactions
- Safe for inventory operations
- Production-ready

The AI coding agent MUST NOT consider a feature complete merely because the code compiles.

---

# 2. Definition of "Working"

A feature is considered working only when:
```text
Code exists
    ↓
Build succeeds
    ↓
Feature works normally
    ↓
Invalid input is handled
    ↓
Error conditions are handled
    ↓
Mobile UI works
    ↓
Desktop UI works
    ↓
Database behavior is correct
    ↓
Permissions are respected
    ↓
Existing functionality still works
```

# 3. Testing Pyramid

Testing should follow:
```text
             ┌───────────────┐
             │  E2E Tests    │
             └───────┬───────┘
                     │
             ┌───────▼───────┐
             │ Integration   │
             │    Tests      │
             └───────┬───────┘
                     │
             ┌───────▼───────┐
             │ Unit Tests    │
             └───────────────┘
```
Most business logic should be tested at the unit/service level.
Critical user workflows should also have integration/E2E coverage.

# 4. Testing Categories

The project should include:
- Unit Testing
- Integration Testing
- API Testing
- Database Testing
- End-to-End Testing
- UI Testing
- Responsive Testing
- Accessibility Testing
- Security Testing
- Performance Testing
- Regression Testing
- Production Smoke Testing

# 5. Unit Testing

Unit tests should verify isolated business logic.
Important areas: Sale calculations, Discount calculations, Inventory calculations, Expense validation, Report calculations, Permission logic, Date range calculations.

# 6. Sale Calculation Tests

At minimum test: 1 item, Multiple items, Different quantities, Zero quantity, Negative quantity, Discount, No discount, Large totals, Decimal values where applicable.
Example:
Chicken Biryani 250 × 2 = 500
Raita 50 × 1 = 50
Subtotal = 550
The test must verify the exact expected result.

# 7. Backend Price Authority Test

The backend must ignore or reject manipulated client-side prices.
Example: Actual product price = 250, Client attempts = 1.
Expected: Server still calculates using 250.
This is a mandatory security/business test.

# 8. Inventory Tests

Test: Stock increases correctly, Stock decreases correctly, Stock adjustment works, Inventory history is created, Invalid quantity is rejected, Negative resulting stock is handled according to business rules.

# 9. Inventory Consistency

After a sale:
Before: Chicken Biryani stock = 20
Sold: 3
Expected: Stock = 17
The test must verify both: Sale exists, Inventory changed correctly.

# 10. Transaction Tests

Operations requiring multiple database changes must be tested for atomicity.
Example: Sale + Sale Items + Payment + Inventory Update
If one required operation fails: Entire transaction rolls back.
The system must not leave partial financial records.

# 11. Expense Tests

Test: Valid expense, Zero amount, Negative amount, Missing category, Missing amount, Invalid date, Long description.

# 12. Product Tests

Test: Create product, Edit product, Deactivate product, Reactivate product, Invalid price, Empty name, Duplicate/invalid category relationships.

# 13. Report Tests

Reports must be tested against known data.
Example: Sale 1 = 500, Sale 2 = 700, Sale 3 = 300. Expected daily sales: 1500.
Never test reports only by checking that a page renders.

# 14. Date Range Testing

Test: Today, Yesterday, This week, This month, Previous month, Custom range, Start date = End date, Month boundary, Year boundary.
Special attention must be given to timezone handling.

# 15. Timezone Testing

The system must use the configured business timezone consistently.
Test cases should include sales created around 11:59 PM and 12:00 AM to ensure they appear under the correct business date.

# 16. Integration Testing

Integration tests should verify communication between: Service -> Repository -> Prisma -> PostgreSQL.
Examples: Create product in database, Create sale in database, Update inventory, Create expense, Generate report.

# 17. API Testing

Every important API endpoint should be tested.
Test: Valid request, Invalid request, Missing authentication, Insufficient permissions, Missing resource, Malformed ID, Invalid data, Database failure.

# 18. HTTP Response Testing

Verify correct status codes:
201 (Successful creation), 200 (Successful read), 400/422 (Invalid input), 401 (Unauthorized), 403 (Forbidden), 404 (Not found), 409 (Conflict), 500 (Unexpected failure).

# 19. Authentication Tests

Verify: Unauthenticated user cannot access protected pages, Unauthenticated API requests are rejected, Valid login succeeds, Invalid login fails, Session expiration is handled, Logout works.

# 20. Authorization Tests

Test every important role/permission.
Admin: Can manage products, Can manage expenses, Can view reports, Can manage settings.
Cashier: Can create sales, Can view permitted data, Cannot perform restricted admin actions.

# 21. Frontend Tests

Frontend tests should cover: Rendering, User interaction, Form validation, State changes, Error states, Loading states, Responsive behavior.

# 22. POS Frontend Tests

The POS must have dedicated tests.
Test: Open POS, Search product, Select category, Add product, Increase quantity, Decrease quantity, Remove product, View subtotal, Apply discount, Open checkout, Select payment method, Complete sale, Handle failed sale, Start new sale.

# 23. POS Duplicate Submission Test

Simulate: User taps Complete Sale + User taps Complete Sale again immediately.
Expected: Only one sale is created. This is critical.

# 24. POS Failure Test

Simulate: User completes checkout -> Server returns error.
Expected: Sale is not falsely shown as completed. Cart remains recoverable where appropriate. User receives clear error feedback.

# 25. POS Empty Cart Test

Attempt checkout with 0 items.
Expected: Checkout blocked. Clear message shown. No API transaction created.

# 26. Product Availability Test

If an inactive product cannot be sold: Deactivate Product -> Open POS -> Product should not be available for normal sale.
Backend must enforce this too.

# 27. UI Loading Tests

Verify that pages do not display broken/empty content while data loads.
Expected: Loading -> Data OR Loading -> Error

# 28. Empty State Tests

Test empty datasets: No products, No sales, No expenses, No inventory history, No report data. Every state should have a useful message.

# 29. Error State Tests

Test: Network failure, Server failure, Unauthorized request, Invalid request, Database failure. User should receive understandable feedback.

# 30. Responsive Testing

The application MUST be tested on mobile widths.
Minimum conceptual test widths: 360px, 375px, 390px, 414px.
Also test: 768px, 1024px, 1280px, 1920px.

# 31. Mobile POS Testing

At mobile widths verify: Product cards fit, Search works, Categories work, Cart is accessible, Checkout is accessible, Buttons are tappable, No horizontal overflow, Text is readable, Dialogs fit the screen.

# 32. Mobile Navigation Testing

Verify: Bottom navigation works, Active page is clear, Navigation does not overlap content, More menu works, Back navigation behaves correctly.

# 33. Mobile Table Testing

For every important table verify: No broken layout, No unreadable text, No clipped actions, Horizontal scrolling works if used, Responsive row layout works if used.

# 34. Desktop Testing

Desktop should verify: Sidebar, Tables, Dashboard, POS, Forms, Dialogs, Charts, Reports.
The interface must not appear stretched or excessively empty on large screens.

# 35. Accessibility Testing

Verify: Keyboard navigation, Focus visibility, Form labels, Button labels, Dialog accessibility, Color contrast, Error messages, Semantic HTML.

# 36. Touch Testing

Important mobile controls should be large enough to comfortably tap.
Especially: Add Product, +, -, Checkout, Navigation, Search, Filters, Save.

# 37. Browser Testing

At minimum test modern versions of: Chrome, Edge, Safari, Firefox. Mobile Safari and Android Chrome are particularly important.

# 38. Regression Testing

Whenever a feature is modified, test related functionality.
Example: If inventory code changes -> Test inventory + Test POS + Test sales + Test reports, because inventory can affect all of them.

# 39. Critical Regression Areas

Authentication, POS, Sales, Inventory, Expenses, Dashboard, Reports, Database migrations.

# 40. Database Testing

Verify: Foreign keys, Unique constraints, Required fields, Nullable fields, Indexes, Transactions, Cascade behavior.

# 41. Migration Testing

Every schema change must be tested.
Modify Prisma schema -> Generate migration -> Apply migration locally -> Run tests -> Verify existing data compatibility.
Never blindly modify production database structure.

# 42. Seed Data

Development seed data may be used (Products, Categories, Inventory, Sample sales, Sample expenses).
But development seed scripts MUST NOT accidentally run against production.

# 43. Test Database

Where practical, automated integration tests should use an isolated test database.
Never run destructive automated tests against production.

# 44. Security Testing

Verify protection against: SQL injection, Unauthorized access, Privilege escalation, Mass assignment, Sensitive information exposure, Invalid input, Session abuse.

# 45. SQL Injection

The application must use Prisma parameterized operations.
Never construct SQL using raw user input.

# 46. Authorization Bypass

Test that manually calling a restricted endpoint does NOT bypass frontend restrictions.
Example: Cashier manually calls `POST /api/sales/:id/void` -> Expected 403 Forbidden.

# 47. Sensitive Data

Verify that API responses do not accidentally expose: Passwords, Authentication secrets, Database credentials, Internal tokens, Private configuration.

# 48. Input Security

Test unusually large values: Extremely long product name, Extremely large quantity, Extremely large price, Unexpected characters, Malformed IDs, Unexpected JSON structures.

# 49. Performance Testing

Test: Large product list, Large sales history, Large expense history, Large inventory history, Long report periods.

# 50. Database Query Performance

Watch for: N+1 queries, Unnecessary full-table scans, Missing indexes, Huge unpaginated queries, Repeated identical queries.

# 51. Pagination Testing

Test: 0 records, 1 record, 25 records, 26 records, 100+ records.
Verify: First page, Middle page, Last page, Previous, Next.

# 52. Search Testing

Test: Exact product name, Partial name, Uppercase, Lowercase, Mixed case, No result, Special characters.

# 53. Filter Testing

Verify combinations such as: Date + status, Date + search, Category + search, Date + category.

# 54. Financial Accuracy

Financial values must be handled carefully. Avoid unsafe floating-point arithmetic for money. Use Decimal or integer minor units.

# 55. Money Test

Example: Price = 250, Quantity = 3 -> Expected: 750.

# 56. Inventory Accuracy

For every inventory-changing operation verify: Previous quantity, Change, New quantity, Transaction history.

# 57. Sale Accuracy

For every completed sale verify: Sale record, Sale items, Prices, Quantities, Subtotal, Discount, Total, Payment, Inventory effect.

# 58. Expense Accuracy

For every expense verify: Amount, Category, Date, Description, Payment method, Created record.

# 59. Report Accuracy

Reports must be verified against manually calculated expected values.
Example: Database: Sale A=1000, Sale B=1500, Expense A=400. Expected: Sales=2500, Expenses=400.

# 60. Dashboard Accuracy

Dashboard numbers must come from actual database data.
Never use hardcoded values, fake statistics, or placeholders in production.

# 61. Production Smoke Test

Immediately after deployment verify: Application opens, Login works, Dashboard loads, Products load, POS loads, Sale can be completed, Sales appear, Inventory updates, Expense can be added, Reports load, Logout works.

# 62. Vercel Deployment Verification

After deployment verify: Production URL, Environment variables, Database connection, Prisma migrations, Authentication, API routes, Server-side functionality.

# 63. Environment Variables

Production must contain all required variables (e.g., DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL). No secret should be hardcoded.

# 64. Production Database Safety

Before applying database migrations: Backup/recovery strategy confirmed, Migration reviewed, Migration tested, Production environment verified.

# 65. Build Verification

Before production deployment: `npm run lint`, `npm run typecheck`, `npm run build`.

# 66. TypeScript

Maintain strict TypeScript discipline. Avoid unnecessary `any`. If unavoidable, document why.

# 67. Linting

Linting errors should not be ignored without a legitimate reason. Fix unused imports, incorrect dependencies, formatting inconsistencies.

# 68. Console Errors

Production UI should not contain unexpected: console.error, React warnings, Hydration errors, Unhandled promise rejections.

# 69. Hydration Testing

Verify there are no hydration mismatches (dates, times, random values, browser-only APIs).

# 70. Network Failure Testing

Simulate poor/unavailable internet. Verify application shows loading state, shows meaningful error, does not falsely confirm actions.

# 71. Refresh Testing

Refresh pages at important locations (Dashboard, POS, Sales, Inventory, Expenses, Reports). Application should recover correctly.

# 72. Navigation Testing

Test routes (Dashboard -> POS, POS -> Sales, etc.). No broken routes should exist.

# 73. Browser Back Button

Verify normal browser navigation works (e.g., Sales -> Sale Details -> Back).

# 74. Data Persistence Testing

After creating records, refresh the application. The data must still exist.

# 75. Concurrent Usage

Even for a small shop, basic concurrent behavior should be considered (Two devices + Same product + Sales at same time).

# 76. Bug Classification

P0 — Critical: System unusable or financial data corruption.
P1 — High: Major functionality broken.
P2 — Medium: Feature partially broken.
P3 — Low: Minor UI issue.

# 77. Bug Reporting Format

Every bug should contain: Title, Severity, Environment, Steps to reproduce, Expected result, Actual result, Screenshot/video, Relevant logs.

# 78. AI Bug-Fixing Protocol

1. Reproduce bug
2. Identify root cause
3. Fix root cause
4. Avoid unnecessary unrelated changes
5. Run relevant tests
6. Run regression tests
7. Verify UI
8. Verify database
9. Confirm bug is actually resolved. Do NOT simply hide the symptom.

# 79. No Fake Fixes

The AI must NOT:
❌ Disable an error to make tests pass
❌ Remove validation
❌ Hide broken UI
❌ Hardcode expected output
❌ Catch every exception silently
❌ Disable authorization
❌ Remove failing tests

# 80. Testing Before Feature Completion

Verify: Implementation, TypeScript, Lint, Unit tests, Integration tests, UI behavior, Mobile behavior, Desktop behavior, Error handling, Permissions, Database behavior.

# 81. Regression Checklist

Login, Dashboard, POS, Create Sale, View Sales, Product Management, Inventory, Inventory Adjustment, Expenses, Reports, Settings, Logout.

# 82. Final Production Checklist

Architecture: Layered backend implemented, logic separated, frontend/backend clean.
Database: PostgreSQL configured, Prisma finalized, Migrations tested.
Frontend: Mobile responsive, Desktop responsive, POS optimized, Tables usable, Forms validated, Loading/Empty/Error states.
Backend: Authentication, Authorization, Validation, Error handling, Transactions, Logging.
Testing: Unit/Integration/API/POS/Responsive/Security/Regression tests.
Deployment: Production env vars, Vercel deployment, DB connection, Smoke testing.

# 83. Final Quality Gate

Project MUST NOT be considered complete if:
❌ POS can create duplicate sales
❌ Backend trusts client prices
❌ Inventory becomes inconsistent
❌ Unauthorized users can access restricted operations
❌ Production contains fake data
❌ Mobile POS is difficult to use
❌ Critical API errors are silently ignored
❌ Database migrations are untested
❌ Production build fails
❌ Critical tests fail

# 84. AI Final Verification Protocol

STEP 1: Read the requirements.
STEP 2: Inspect the current implementation.
STEP 3: Run type checking.
STEP 4: Run linting.
STEP 5: Run automated tests.
STEP 6: Test the affected feature manually.
STEP 7: Test mobile layout.
STEP 8: Test desktop layout.
STEP 9: Test error cases.
STEP 10: Test database behavior.
STEP 11: Run relevant regression tests.
STEP 12: Run production build.
STEP 13: Fix all critical/high issues.
STEP 14: Only then report completion.

# 85. Final Principle

"It compiles" does not mean "it works." The application is complete only when: Correct + Secure + Tested + Responsive + Reliable + Production-ready.

# 86. Golden QA Rule

Never trust the implementation simply because the AI says it is complete. Verify the behavior.

# 87. Project Completion Standard

Simple enough for a shop owner + Powerful enough for daily management + Fast enough for POS operations + Reliable enough for financial records + Responsive enough for mobile use + Structured enough for future maintenance.
