# Biryani Shop Management System
## Master Implementation Plan

**Document:** Implementation Plan  
**Version:** 1.0  
**Status:** Master Development Roadmap  
**Frontend:** Next.js + TypeScript  
**Backend:** Next.js  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Deployment:** Vercel  
**Architecture:** Layered Architecture  
**Primary Platform:** Mobile-first Web Application  

---

# 1. Purpose

This document defines the complete implementation roadmap for the Biryani Shop Management System.

The project must be implemented sequentially from:
Project Initialization -> Architecture Setup -> Database Design -> Backend Foundation -> Authentication -> Frontend Foundation -> Dashboard -> Product Management -> Inventory -> POS -> Sales -> Expenses -> Reports -> Settings -> Testing -> Security Hardening -> Performance Optimization -> Production Deployment -> Production Verification

The AI coding agent MUST follow this implementation order unless there is a documented technical reason to deviate.

# 2. Core Technology Stack

The implementation must use:
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Next.js, TypeScript, API / Server-side backend
- Database: PostgreSQL
- ORM: Prisma
- Deployment: Vercel
- Version Control: Git, GitHub

Additional libraries may be introduced only when there is a clear requirement. Do not add dependencies simply because they are popular.

# 3. Architecture Requirement

The application must follow a layered architecture.

Recommended structure:
Presentation Layer -> API / Controller Layer -> Validation Layer -> Business Logic / Service Layer -> Repository / Data Access Layer -> Prisma ORM -> PostgreSQL

The frontend must communicate with the backend through defined interfaces. Business logic must NOT be scattered throughout React components.

# 4. Development Principles

The implementation must follow these principles: Simple, Maintainable, Type-safe, Secure, Testable, Mobile-first, Scalable, Consistent.
Avoid: Premature optimization, Unnecessary abstractions, Duplicate code, Huge components, Mixed responsibilities, Hardcoded business data, Fake functionality.

# 5. Development Workflow

Every phase follows: Plan -> Implement -> Test -> Review -> Fix -> Verify -> Commit -> Move to next phase
Do NOT implement the entire project first and test everything at the end.

---

# PHASE 0 — Requirements & Project Understanding
Objective: Understand the requirements before writing application code.

# PHASE 1 — Project Initialization
Objective: Create the initial Next.js project.
Tasks: Create Next.js project, Enable TypeScript, Configure App Router, Configure Tailwind CSS, Initialize Git, Create GitHub repository, Create .gitignore, Configure environment files, Configure code formatting, Configure linting.

# PHASE 2 — Development Standards
Objective: Establish coding standards before feature development.
Define: Naming, Folder, Component, API, Error handling, Validation, Database, and Git conventions.

# PHASE 3 — Environment Configuration
Objective: Configure development, test, and production environments.
Rules: Never hardcode secrets, Never commit .env files, Create .env.example, Separate development and production configuration.

# PHASE 4 — PostgreSQL & Prisma Setup
Objective: Connect the application to PostgreSQL.
Tasks: Install Prisma, Initialize Prisma, Configure DATABASE_URL, Create Prisma schema, Configure migrations, Configure Prisma client, Create development database.

# PHASE 5 — Database Architecture
Objective: Design the complete database structure before implementing major business features.

# PHASE 6 — Database Migration & Seed System
Objective: Make database setup reproducible.
Tasks: Create migrations, Create seed script, Create development data. Safety Rule: Seed data must NEVER accidentally execute against production.

# PHASE 7 — Backend Foundation
Objective: Implement the backend architecture before business modules.

# PHASE 8 — Backend Layer Implementation
Each module should follow: Route / Controller -> Validation -> Service -> Repository -> Prisma -> PostgreSQL.

# PHASE 9 — Validation & Error Handling
Objective: Create centralized backend validation and error handling.

# PHASE 10 — Authentication
Objective: Secure the application.

# PHASE 11 — Authorization / RBAC
Objective: Implement role-based permissions (Owner / Admin, Cashier).

# PHASE 12 — Frontend Design System
Objective: Build the reusable UI foundation before building application pages.

# PHASE 13 — Application Layout
Objective: Create the global application shell (Sidebar, Header, Main Content, Bottom Navigation).

# PHASE 14 — Authentication UI
Objective: Build login and authentication-related screens.

# PHASE 15 — Dashboard
Objective: Create the business overview. All numbers must come from real backend data.

# PHASE 16 — Category Management
Objective: Allow the owner to organize products.

# PHASE 17 — Product Management
Objective: Allow the owner to manage sellable products.

# PHASE 18 — Inventory Foundation
Objective: Implement stock management.

# PHASE 19 — Inventory Adjustments
Objective: Allow authorized users to correct stock. Every manual stock change must be traceable.

# PHASE 20 — POS Foundation
Objective: Build the core point-of-sale interface. Mobile: Categories -> Products -> Cart -> Checkout. Desktop: Product Selection | Cart.

# PHASE 21 — POS Product Selection
Implement: Product search, Category filtering, Product cards, Product availability, Add to cart. Must be optimized for touch.

# PHASE 22 — POS Cart
Implement: Add item, Remove item, Increase quantity, Decrease quantity, Subtotal, Discount, Total.

# PHASE 23 — POS Checkout
Implement: Cart -> Review -> Payment Method -> Confirm -> Backend Transaction -> Success. Critical: Prevent duplicate submission, use database transaction.

# PHASE 24 — Sales Management
Objective: Provide a complete sales history.

# PHASE 25 — Sale Details
Create a professional detail page.

# PHASE 26 — Sale Status / Voiding
If sale voiding is part of the requirements: Sale -> Void -> Authorization Check -> Database Transaction -> Update Sale Status -> Reverse Inventory if required.

# PHASE 27 — Expense Management
Objective: Allow the owner to record business expenses.

# PHASE 28 — Expense Categories
Implement simple categories such as: Rent, Utilities, Raw Materials, Transportation, Salaries, Maintenance, Other.

# PHASE 29 — Reports Foundation
Objective: Create the reporting system. Reports should be generated from real database records.

# PHASE 30 — Sales Reports
Implement: Today's Sales, Yesterday's Sales, Weekly Sales, Monthly Sales, Custom Date Range.

# PHASE 31 — Expense Reports
Display: Total Expenses, Expense by Category, Expense by Date.

# PHASE 32 — Profit Summary
Sales - Expenses = Estimated Profit. Clearly label calculations that are estimates.

# PHASE 33 — Product Performance
Implement: Top Selling Products, Quantity Sold, Revenue Generated.

# PHASE 34 — Inventory Reports
Provide: Current Stock, Low Stock, Critical Stock, Inventory Changes.

# PHASE 35 — Settings
Objective: Implement basic application configuration.

# PHASE 36 — User Management
If required by the role system: Create/Edit/Activate users, Assign roles, Reset credentials.

# PHASE 37 — Global Search / Filtering
Add search and filtering where useful (Products, Sales, Inventory, Expenses).

# PHASE 38 — Responsive Optimization
Objective: Perform a dedicated mobile optimization pass. Verify no horizontal overflow, touch-friendly buttons, usable POS.

# PHASE 39 — UX Polish
Objective: Improve the application after functionality is complete. Review Spacing, Typography, Alignment, Empty states, Loading states, Error states, Toast messages.

# PHASE 40 — Accessibility Pass
Verify Keyboard navigation, Focus states, Form labels, Accessible dialogs/buttons, Color contrast.

# PHASE 41 — Unit Testing
Test core business logic (Sale calculations, Inventory calculations, Permission logic).

# PHASE 42 — Integration Testing
Test Database, Services, Repositories, API routes.

# PHASE 43 — POS End-to-End Testing
The complete workflow must be tested from POS open to Sale Created.

# PHASE 44 — Expense End-to-End Testing
Test Expense creation flow.

# PHASE 45 — Inventory End-to-End Testing
Test inventory decrements on sale, and manual adjustments.

# PHASE 46 — Reports Verification
Reports must return exactly the expected values based on known test data.

# PHASE 47 — Security Audit
Review Authentication, Authorization, SQL injection protection, Mass assignment.

# PHASE 48 — Financial Integrity Audit
Verify prices and totals are server-authoritative. Prevent duplicate sales. Atomic inventory updates.

# PHASE 49 — Database Integrity Audit
Verify Foreign keys, Unique constraints, Transactions, Migration consistency.

# PHASE 50 — Performance Optimization
Review Database queries, N+1 queries, Pagination. Fix actual bottlenecks.

# PHASE 51 — Production Configuration
Prepare production (Vercel project, env vars, database).

# PHASE 52 — Production Database Migration
Test migrations locally before applying to production.

# PHASE 53 — Vercel Deployment
GitHub -> Vercel -> Build -> Deployment -> Production URL.

# PHASE 54 — Production Smoke Testing
Immediately verify application opens, login works, POS works.

# PHASE 55 — Production Monitoring
Monitor Application errors, Database errors, Failed requests.

# PHASE 56 — Final Regression Test
Run the complete regression suite.

# PHASE 57 — Documentation Finalization
Update README.md, Deployment documentation, API documentation.

# PHASE 58 — Production Release
Before release: Production build passes, Tests pass, Database ready, Env vars configured, Smoke test completed.

# PHASE 59 — Post-Release Verification
After release, perform another real-world verification.

# PHASE 60 — Maintenance
Monitor -> Collect feedback -> Fix bugs -> Test fixes -> Deploy.

---

# 6. Feature Development Order

1. Project Initialization
2. Architecture
3. Database
4. Backend Foundation
5. Authentication
6. Authorization
7. UI Foundation
8. Layout
9. Dashboard
10. Categories
11. Products
12. Inventory
13. POS
14. Sales
15. Expenses
16. Reports
17. Settings
18. Testing
19. Security
20. Performance
21. Deployment
22. Production Verification

# 7. Critical Dependencies
Database -> Products -> Inventory -> POS -> Sales -> Reports
Expenses can be independent. Dashboard depends on Sales/Expenses/Inventory.

# 8. AI Agent Working Rules
1. Read documentation before coding.
2. Understand current architecture.
3. Check existing code before creating new code.
4. Follow implementation phases.
5. Avoid unnecessary dependencies.
6. Reuse components.
7. Keep business logic in services.
8. Keep database access in repositories.
9. Validate external input.
10. Never trust client-side financial calculations.
11. Never expose secrets.
12. Never create fake production data.
13. Test completed features.
14. Test mobile layouts.
15. Run regression tests.

# 9. AI Must Not Skip Phases
The AI MUST NOT jump directly from Empty project -> Complete POS without establishing Architecture, Database, Backend, Authentication, UI foundation.

# 10. Phase Completion Rule
Implementation -> Verification -> Testing -> Review. Only then move to next phase.

# 11. Git Strategy
Use meaningful commits (e.g., `chore: initialize next.js project`, `feat: add product management`).

# 12. Branching Strategy
For a small project: `main` can represent production. Feature branches may be used and merged after testing.

# 13. Definition of Done
□ UI implemented
□ Mobile responsive
□ Backend implemented
□ Validation implemented
□ Database integration implemented
□ Authorization implemented
□ Error handling implemented
□ Loading/Empty/Error states implemented
□ Tests implemented
□ Manual verification completed
□ No critical regression

# 14. MVP Definition
Authentication, Dashboard, Products, Categories, Inventory, POS, Sales, Expenses, Reports, Basic Settings. No overloaded enterprise features.

# 15. Features That Should NOT Be Added Without Requirement
No Payroll, Advanced accounting, CRM, Customer loyalty, Multi-branch, Online ordering, Delivery management, AI forecasting.

# 16. Future Expansion Strategy
Architecture should leave room for future extensibility but must NOT make the MVP unnecessarily complicated.

# 17. Final Architecture Verification
Frontend -> API -> Validation -> Business Services -> Repositories -> Prisma -> PostgreSQL.

# 18. Final Production Checklist
Ensure all project, database, backend, frontend, business, testing, and deployment requirements are met.

# 19. Master Development Sequence
1. Requirements -> 2. Project Initialization -> 3. Architecture -> ... -> 20. Production QA -> 🚀 PRODUCTION

# 20. Golden Implementation Rule
Build the application as one coherent business system, not a collection of pages.

# 21. Final Rule for AI Coding Agents
Before implementing anything, ask: What requirement? Which phase? What architecture? Which entities/rules/APIs/UI? How mobile? What if fails? How tested?

# 22. Completion Statement
The project is considered production-ready only when the complete system has successfully passed all testing phases.
