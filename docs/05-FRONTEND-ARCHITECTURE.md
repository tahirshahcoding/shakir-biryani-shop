# Biryani Shop Management System
## Frontend Architecture & Implementation Specification

**Document:** 05 — Frontend Architecture  
**Version:** 1.0  
**Status:** Foundation Specification  
**Framework:** Next.js  
**Language:** TypeScript  
**UI:** React  
**Styling:** Tailwind CSS  
**Database:** PostgreSQL  
**Architecture:** Component-Based + Feature-Oriented Frontend

---

# 1. Purpose

This document defines the frontend architecture of the Biryani Shop Management System.

The frontend must be:

- Mobile-first
- Responsive
- Fast
- Simple
- Professional
- Touch-friendly
- Easy to understand
- Consistent
- Maintainable
- Accessible
- Suitable for a shop owner using a mobile phone

The application should feel like a polished commercial business application rather than an academic CRUD project.

---

# 2. Frontend Technology

The frontend will use:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Additional libraries may be introduced only when they solve a real requirement.

Do not install libraries simply because they are popular.

# 3. Rendering Strategy

Use Next.js rendering capabilities appropriately.

## Server Components

Use Server Components where:

- Data can be fetched server-side.
- Interactivity is not required.
- Rendering can happen on the server.

## Client Components

Use Client Components where:

- User interaction is required.
- Forms are interactive.
- POS cart changes dynamically.
- Modals are required.
- Dropdowns require client state.
- Charts require browser interaction.

Do not convert the entire application into Client Components unnecessarily.

# 4. Frontend Architecture

The frontend follows:

```text
Pages / Routes
      ↓
Feature Components
      ↓
Shared UI Components
      ↓
Hooks / Client State
      ↓
API Client
      ↓
Backend API
```

The frontend must NOT communicate directly with PostgreSQL.

# 5. Frontend Folder Structure

Recommended structure:

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── pos/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── expenses/
│   │   ├── reports/
│   │   ├── users/
│   │   └── settings/
│   │
│   ├── api/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   └── feedback/
│
├── features/
│   ├── dashboard/
│   ├── pos/
│   ├── products/
│   ├── inventory/
│   ├── sales/
│   ├── expenses/
│   ├── reports/
│   ├── users/
│   └── settings/
│
├── hooks/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── utils/
│   └── validation/
│
├── types/
└── styles/
```

# 6. Route Structure

The main application routes should be:

```text
/login

/dashboard
/pos
/products
/inventory
/sales
/expenses
/reports
/users
/settings
```

Only required modules should be exposed to the user.

# 7. Application Shell

Authenticated pages should share a common application shell.

Conceptually:

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Navigation   │        Main Content          │
│              │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

On desktop:
- Sidebar navigation

On mobile:
- Compact header
- Navigation drawer or bottom navigation
- Full-width content

# 8. Mobile-First Requirement

Mobile responsiveness is a PRIMARY requirement.

The application must not be designed for desktop first and "fixed" for mobile later.

The implementation should start from:

```text
Mobile
 ↓
Tablet
 ↓
Desktop
```

# 9. Mobile Design Priority

The owner should be able to perform important operations using one hand where practical.

High-priority mobile workflows:
- Open POS
- Select product
- Change quantity
- Checkout
- Record expense
- Check today's sales
- Check inventory
- View reports

These workflows must require minimal navigation.

# 10. Touch Targets

Interactive elements must be sufficiently large for touch interaction.

Avoid tiny:
- buttons
- icons
- checkboxes
- table controls

Important POS actions should be easy to tap without precision.

# 11. Responsive Breakpoints

The design should support:
- Small Mobile
- Mobile
- Tablet
- Desktop
- Large Desktop

Do not design only for one phone width.
The layout must adapt naturally.

# 12. Navigation

Desktop navigation may use:
- Dashboard
- POS
- Products
- Inventory
- Sales
- Expenses
- Reports
- Users
- Settings

Mobile navigation should prioritize the most frequently used actions.
Recommended mobile priority:
- Dashboard
- POS
- Sales
- Inventory
- More

The exact navigation implementation may be finalized during UI design.

# 13. Dashboard

The dashboard should provide an immediate overview of the shop.

Possible sections:
- Today's Sales
- Today's Orders
- Today's Expenses
- Estimated Profit
- Low Stock
- Top Products
- Recent Sales

Do not overcrowd the dashboard.
The owner should understand the business situation within a few seconds.

# 14. POS Screen

The POS is the most important operational screen.
It must be optimized for speed.

Desktop concept:

```text
┌───────────────────────────────────────────────┐
│ Search                         Category       │
├─────────────────────────┬─────────────────────┤
│                         │                     │
│ Product Grid            │ Cart                │
│                         │                     │
│ [Biryani] [Biryani]     │ Chicken × 2         │
│ [Drink]   [Raita]       │ Raita × 1           │
│ [Salad]   [Extra]       │                     │
│                         │---------------------│
│                         │ Total               │
│                         │                     │
│                         │ [ CHECKOUT ]        │
└─────────────────────────┴─────────────────────┘
```

# 15. Mobile POS

On mobile, the POS should become a stacked workflow.

Example:

```text
Search
Categories
Products
     ↓
Add to Cart
     ↓
Cart
     ↓
Checkout
```

The cart may use a bottom sheet or dedicated cart view.
The user should always be able to understand:
- Items
- Quantity
- Subtotal
- Discount
- Total

# 16. POS Product Cards

Product cards should show only useful information.

Example:

```text
┌──────────────────┐
│   Product Image  │
│                  │
│ Chicken Biryani  │
│ Rs. 250          │
└──────────────────┘
```

Do not overload product cards with unnecessary information.

# 17. POS Product Selection

Tapping a product should have an obvious result.

Depending on the design:
```text
Tap Product
     ↓
Add to Cart
```

If the product is already in the cart:
```text
Tap Product
     ↓
Increase Quantity
```

This should be intuitive.

# 18. POS Search

Search must be fast and simple.

Example:
`🔍 Search products...`

The user should be able to find:
`Chicken Biryani`

by typing:
`chicken`

# 19. POS Categories

Categories provide fast navigation.

Example:
- All
- Biryani
- Drinks
- Sides
- Extras

The active category must be visually obvious.

# 20. POS Cart

Cart items should show:
- Product
- Quantity
- Unit Price
- Subtotal
- Remove

Example:
```text
Chicken Biryani
Rs. 250

[-] 2 [+]

Rs. 500
```

# 21. Quantity Controls

Quantity controls must be touch-friendly.

Use:
`[-]  2  [+]`

rather than requiring manual typing for common quantity changes.
Manual quantity entry may still be supported when useful.

# 22. Checkout

Checkout should be extremely simple.

Example:

```text
Subtotal       Rs. 1000
Discount       Rs. 50
-----------------------
Total          Rs. 950

Payment Method
[ Cash ]

[ COMPLETE SALE ]
```

Do not put unnecessary fields into checkout.

# 23. Checkout Confirmation

After successful checkout:

```text
Sale Completed
INV-000123

Total: Rs. 950

[New Sale]
[View Receipt]
```

The user should immediately know the transaction succeeded.

# 24. Prevent Double Checkout

When checkout is processing:
`[ Processing... ]`

The button must not allow repeated submissions.

# 25. Products Page

The Products page should provide simple product management.

Primary actions:
- Add Product
- Search
- Filter
- Edit
- Activate/Deactivate

# 26. Product Table

On desktop, use an Excel-like table.

Example:

```text
┌───────────────┬──────────┬────────┬──────────┐
│ Product       │ Category │ Price  │ Status   │
├───────────────┼──────────┼────────┼──────────┤
│ Chicken       │ Biryani  │ 250    │ Active   │
│ Beef          │ Biryani  │ 300    │ Active   │
│ Raita         │ Sides    │ 50     │ Active   │
└───────────────┴──────────┴────────┴──────────┘
```

# 27. Mobile Tables

Do not force wide desktop tables onto small screens.

On mobile:
```text
Product
Category
Rs. 250
Active
```
may become a card/list layout.
Alternatively, horizontal scrolling may be used when tabular structure is important.
Choose the approach based on the specific table.

# 28. Excel-Like Table Principles

Tables should feel familiar to users who have used Excel.
Provide:
- Clear columns
- Row separation
- Sorting where useful
- Search
- Filters
- Pagination
- Consistent alignment
- Clear numeric formatting
- Sticky headers when useful
- Responsive behavior

Do not make tables visually noisy.

# 29. Inventory Page

Inventory should immediately communicate stock health.

Example:

```text
┌──────────────┬─────────┬────────────┬──────────┐
│ Item         │ Quantity│ Min Stock  │ Status   │
├──────────────┼─────────┼────────────┼──────────┤
│ Rice         │ 120 kg  │ 20 kg      │ Healthy  │
│ Oil          │ 8 L     │ 10 L       │ Low      │
└──────────────┴─────────┴────────────┴──────────┘
```

# 30. Inventory Actions

Common actions:
- Add Stock
- Adjust Stock
- View History
- Edit Item
- Deactivate

These should be clearly separated from normal viewing.

# 31. Inventory History

Inventory history should show:
- Date
- Item
- Type
- Quantity
- Previous
- New
- Reason
- User

This creates transparency.

# 32. Expenses Page

The Expenses page should be simple.

Primary action:
`+ Add Expense`

Table:
- Date
- Category
- Description
- Amount
- Payment Method

# 33. Expense Form

Example:

```text
Amount
[ Rs. 5,000 ]

Category
[ Gas ▼ ]

Date
[ 26 Aug 2026 ]

Description
[ Monthly gas expense ]

Payment Method
[ Cash ▼ ]

[ Save Expense ]
```

Keep the form short.

# 34. Sales Page

The Sales page provides historical transactions.

Example:
- Date
- Invoice
- Items
- Total
- Payment
- Status

Filters:
- Today
- Yesterday
- This Week
- This Month
- Custom Range

# 35. Sale Details

Selecting a sale should show:
- Invoice Number
- Date
- Items
- Quantities
- Prices
- Subtotal
- Discount
- Total
- Payment Method
- Cashier/User
- Status

# 36. Reports Page

Reports should be useful rather than complicated.

Possible report categories:
- Sales
- Expenses
- Profit
- Products
- Inventory

# 37. Report Date Filters

Use simple presets:
- Today
- Yesterday
- This Week
- This Month
- Last Month
- Custom

The custom date range should be easy to use on mobile.

# 38. Report Visualizations

Use charts only where they improve understanding.
Examples:
- Sales over time
- Expenses by category
- Top-selling products

Do not turn every number into a chart.

# 39. Dashboard/Report Cards

Cards should be concise.

Example:
```text
Today's Sales

Rs. 24,500

↑ 12%
```

Avoid excessive decorative content.

# 40. Forms

All forms should have:
- Label
- Input
- Validation
- Error message
- Help text where necessary
- Submit action
- Cancel action
- Loading state

Do not rely solely on placeholder text as labels.

# 41. Form Validation

Validation should happen:
```text
Frontend
+
Backend
```

Frontend validation improves user experience.
Backend validation protects the application.

# 42. Loading States

Every data-dependent screen must have an appropriate loading state.
Avoid showing a blank screen.
Use:
- Skeleton
- Spinner
- Loading text
- Disabled action
depending on the context.

# 43. Empty States

When there is no data, show a useful empty state.

Example:
```text
No products found.

Add your first product to start selling.

[ Add Product ]
```

Do not display an empty table with no explanation.

# 44. Error States

Errors must be understandable.

Bad:
`Error 500`

Better:
```text
Something went wrong while loading sales.

[ Try Again ]
```

Technical details should be logged rather than exposed unnecessarily.

# 45. Success Feedback

Successful actions should provide immediate feedback.
Examples:
- Product added successfully.
- Expense recorded successfully.
- Stock updated successfully.
- Sale completed successfully.

Use toast notifications where appropriate.

# 46. Confirmation Dialogs

Use confirmation dialogs for destructive or high-impact actions.
Examples:
- Deactivate Product
- Void Sale
- Adjust Stock
- Delete/void Expense

Do not ask for confirmation for every normal action.

# 47. Modal Rules

Modals should be used for short focused tasks.
Good:
- Add Product
- Add Expense
- Stock Adjustment

Avoid placing entire complex pages inside giant modals.

# 48. Typography

Typography should prioritize readability.
Use:
- Clear heading hierarchy
- Readable body text
- Strong numeric emphasis
- Consistent labels

Numbers in financial dashboards should be easy to scan.

# 49. Color System

The application should use a restrained professional color palette.
Use color primarily for:
- Primary actions
- Success
- Warning
- Error
- Information
- Status

Do not use many unrelated colors.

# 50. Status Colors

Examples:
- Active: Success
- Low Stock: Warning
- Inactive: Neutral
- Error: Danger

Status must never rely solely on color.
Use Text, Icon, and Color where appropriate.

# 51. Icons

Icons should communicate meaning.
Do not use icons simply for decoration.
Maintain consistent iconography throughout the application.

# 52. Buttons

Buttons must clearly communicate action.
Examples:
- Add Product
- Save Expense
- Complete Sale
- Add Stock
- Generate Report

Avoid vague buttons like:
- Click
- Go
- Do It
- Submit
when a more descriptive action is available.

# 53. Primary Action Hierarchy

Each screen should have one clear primary action where appropriate.
Example:
Products: `+ Add Product`
POS: `Complete Sale`
Expenses: `+ Add Expense`

Avoid making every button visually dominant.

# 54. Responsive Sidebar

Desktop:
```text
┌────────────┐
│ Logo       │
│ Dashboard  │
│ POS        │
│ Products   │
│ Inventory  │
│ Sales      │
│ Expenses   │
│ Reports    │
│ Settings   │
└────────────┘
```

Mobile:
```text
Header
   +
Navigation Drawer / Bottom Navigation
```

# 55. Mobile Header

The mobile header should contain only essential controls.
Potentially:
- ☰
- Page Title
- Notifications/Profile

Do not overcrowd it.

# 56. Desktop Header

Potential controls:
- Page Title
- Search where relevant
- Notifications
- User/Profile

The header should remain visually clean.

# 57. Global Search

A global search should NOT be implemented unless there is a real requirement.
Module-specific search is preferred for the MVP.

# 58. State Management

Do not introduce global state management automatically.
Use:
- Local React state for local UI state.
- Server state/query solution where appropriate.
- URL state for filters/pagination where useful.
- Global state only for genuinely global client state.

Do not put the entire application into one global store.

# 59. POS State

POS cart state should be isolated from unrelated modules.

Conceptually:
```text
POS
 ├── products
 ├── cart
 ├── selectedCategory
 ├── search
 └── checkout state
```
Leaving the POS should not accidentally corrupt the cart.

# 60. API Client

Frontend API communication should use a centralized API client.

Example:
`src/lib/api/`

Potential structure:
```text
client.ts
products.ts
sales.ts
inventory.ts
expenses.ts
reports.ts
users.ts
```

# 61. API Client Rules

Components should not repeatedly contain raw:
`fetch("/api/...")`
logic everywhere.

Instead:
```text
productsApi.list()
salesApi.create()
expensesApi.create()
```
This keeps API communication consistent.

# 62. Frontend Types

Types should correspond to backend API contracts.

Example:
```ts
type Product = {
  id: string
  name: string
  sellingPrice: number
  ...
}
```
Do not manually create conflicting versions of the same entity throughout the application.

# 63. API Response Handling

The frontend should consistently handle:
- Loading
- Success
- Empty
- Error

For every data-driven operation.

# 64. Optimistic Updates

Optimistic updates may be used for low-risk UI interactions.
Do NOT use optimistic updates blindly for critical financial operations.

For example:
Sale checkout should wait for authoritative backend confirmation.

# 65. Financial Data Display

Currency must be formatted consistently.

Example:
`Rs. 1,250`

Do not display:
`1250`, `1250.00`, `Rs 1250`, `₨1250`
randomly throughout the application.

Use one centralized formatting utility.

# 66. Quantity Display

Inventory quantities should preserve their units.

Examples:
- 25 kg
- 8 L
- 50 pieces

Do not show ambiguous values.

# 67. Date Display

Dates must be formatted consistently throughout the application.
Use centralized formatting utilities.
Do not format dates differently in every component.

# 68. Accessibility

The application must support:
- Keyboard navigation
- Proper labels
- Focus states
- Accessible buttons
- Accessible dialogs
- Sufficient contrast
- Screen-reader-friendly semantics where appropriate

# 69. Accessibility and Mobile

Touch accessibility is especially important.
Avoid controls that are:
- Too small
- Too close together
- Difficult to identify
- Dependent solely on hover

# 70. Performance

The frontend should prioritize:
- Fast initial load
- Small client bundles
- Efficient data fetching
- Lazy loading where appropriate
- Optimized images
- Minimal unnecessary re-renders

Do not optimize prematurely. Measure actual bottlenecks.

# 71. Tables and Large Data

Tables should not load thousands of records unnecessarily.
Use:
- Pagination
- Filtering
- Search
- Server-side querying
where appropriate.

# 72. Charts

Charts should remain responsive.
They must work on Mobile, Tablet, Desktop.
Do not create fixed-width charts that overflow mobile screens.

# 73. Component Architecture

Components should have clear responsibilities.

Example:
- ProductTable
- ProductFilters
- ProductForm
- ProductRow
- ProductStatusBadge

Do not create one giant `ProductsPage.tsx` containing every concern.

# 74. Shared Components

Common UI components should be reused.
Examples: Button, Input, Select, Dialog, Modal, Table, Badge, Card, Tabs, Dropdown, Toast, Skeleton, EmptyState, ErrorState.

Do not duplicate identical components across modules.

# 75. Feature Components

Feature-specific components belong inside the relevant feature.

Example:
```text
features/pos/
├── ProductGrid.tsx
├── ProductCard.tsx
├── Cart.tsx
├── CartItem.tsx
├── Checkout.tsx
└── PaymentSelector.tsx
```

# 76. Component Size

Avoid enormous components.
If a component becomes difficult to understand, extract logical subcomponents.
However, do not split every five lines into a separate component. Extraction should improve readability.

# 77. Business Logic Restriction

Frontend components must NOT contain authoritative business logic.
For example, the frontend may calculate `displaySubtotal` for immediate UI feedback.
But the backend must calculate the authoritative `saleTotal`.

# 78. Permission-Based UI

The frontend may hide unavailable actions.
Example:
User cannot manage users → Hide "Add User"

But this is only a UX feature. The backend must enforce the permission.

# 79. Routing Protection

Protected application routes must require authentication.
Unauthenticated users should be redirected to `/login` according to the authentication implementation.

# 80. Unauthorized UI

If the user lacks permission: `Access Denied` should be displayed instead of exposing unauthorized functionality.

# 81. Authentication State

Authentication state should be centralized and consistent.
Avoid multiple competing authentication implementations.

# 82. Forms and Server Actions

Server Actions may be used where appropriate.
However, they must not bypass:
- Authentication
- Authorization
- Validation
- Business logic
- Repository boundaries

Whether an operation uses an API route or Server Action, the business rules remain the same.

# 83. API vs Server Action Rule

Choose one consistent approach for each type of operation.
Do not create Product creation through API, Product editing through Server Action, Product deletion through direct Prisma without architectural justification.

# 84. Frontend Error Boundary

Important application areas should have appropriate error handling.
A module failure should not unnecessarily crash the entire application.

# 85. Not Found Pages

Provide useful not-found behavior.

Example:
```text
Sale not found

The requested sale does not exist or is no longer available.

[Back to Sales]
```

# 86. Unsaved Changes

For forms where losing entered data would be problematic, consider unsaved-change protection.
This is especially useful for Product forms, Expense forms, Settings.
Do not add unnecessary prompts to simple interactions.

# 87. Offline Behavior

The MVP is NOT an offline-first application.
The system assumes an internet connection because the backend and PostgreSQL database are deployed online.
The UI should still handle Network failure, Request timeout, Temporary server error gracefully.

# 88. Network Failure

Example:
```text
Unable to connect to the server.
Please check your internet connection and try again.

[ Retry ]
```

# 89. Frontend Security Rules

Never store sensitive secrets in frontend code.
Never expose Database URL, Database password, Private API keys, Server secrets to the browser.

# 90. Environment Variables

Public variables must be explicitly identified as public.
Server-only secrets must remain server-side.
Never prefix a secret with a public environment variable prefix merely to make it accessible to the client.

# 91. Frontend Testing

The frontend should include tests for important workflows.
Priority: POS checkout, Product creation, Inventory adjustment, Expense creation, Report filters, Authentication, Permission-based UI.

# 92. Component Testing

Reusable components should be tested where behavior is non-trivial.
Examples: ProductCard, CartItem, DateRangePicker, DataTable, Form components.

# 93. End-to-End Testing

Critical workflows should be tested end-to-end.

Example:
```text
Login
 ↓
Open POS
 ↓
Select Chicken Biryani
 ↓
Add quantity
 ↓
Checkout
 ↓
Confirm sale
 ↓
Verify sale appears in Sales
```

# 94. Visual Consistency

All pages must use the same Spacing system, Typography, Button styles, Input styles, Table styles, Border radius, Shadows, Status indicators, Modal behavior.
Do not design each page as a separate website.

# 95. Design System

The project should have a small internal design system.
At minimum: Colors, Typography, Spacing, Radius, Shadows, Buttons, Inputs, Cards, Tables, Badges, Dialogs.
The detailed values will be defined in the UI/UX Design Specification.

# 96. AI Frontend Rules

The AI coding agent MUST:
- Read this document before creating frontend features.
- Follow the existing component architecture.
- Reuse existing components.
- Avoid duplicate UI components.
- Keep mobile responsiveness mandatory.
- Never connect directly to PostgreSQL.
- Never place secrets in client code.
- Never trust frontend calculations as authoritative.
- Never implement frontend-only authorization.
- Never create fake data to hide missing backend functionality.
- Preserve existing design patterns.
- Avoid arbitrary colors and typography.
- Avoid unnecessary animations.
- Avoid giant components.
- Avoid unnecessary global state.
- Use centralized API utilities.
- Use consistent loading/error/empty states.
- Test important user workflows.

# 97. Frontend Anti-Patterns

The following are prohibited:
❌ Direct PostgreSQL access
❌ Prisma inside components
❌ Hardcoded production data
❌ Fake dashboard numbers
❌ Fake POS checkout
❌ Client-only authorization
❌ Giant page components
❌ Duplicate UI systems
❌ Random colors
❌ Random spacing
❌ Desktop-only layouts
❌ Tiny mobile controls
❌ Unnecessary animations
❌ Exposing server secrets
❌ Trusting client totals

# 98. Frontend Definition of Done

A frontend feature is complete when:
- Desktop works.
- Mobile works.
- Tablet works where applicable.
- Loading state exists.
- Empty state exists.
- Error state exists.
- Validation exists.
- API integration works.
- Permission behavior works.
- Accessibility has been considered.
- Existing design system is followed.
- No fake data remains.
- Important workflows are tested.

# 99. Golden Frontend Principle

The application should feel like:
A simple, modern shop-management tool that a busy biryani shop owner can understand immediately.

It should NOT feel like:
❌ Enterprise ERP
❌ Complicated accounting software
❌ Generic admin template
❌ Academic CRUD application

# 100. Final Frontend Architecture

The frontend architecture is:

```text
Next.js App Router
       ↓
Pages / Routes
       ↓
Feature Components
       ↓
Shared UI Components
       ↓
Hooks / State
       ↓
Centralized API Client
       ↓
Next.js Backend
```

The frontend is responsible for: Presentation, Interaction, Navigation, User experience, Client-side validation, UI state.
The backend is responsible for: Authentication, Authorization, Business logic, Financial calculations, Inventory rules, Data validation, Database operations.

# 101. Final Rule

When implementing any frontend feature, the AI must ask:
- Is this presentation? → Frontend
- Is this user interaction? → Frontend
- Is this authoritative business logic? → Backend
- Is this database access? → Repository / Database Layer
