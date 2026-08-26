# Biryani Shop Management System
## Frontend Architecture & Implementation Specification

**Document:** 09 — Frontend Architecture  
**Version:** 1.0  
**Status:** Foundation Specification  
**Framework:** Next.js  
**Language:** TypeScript  
**Styling:** Tailwind CSS  
**UI Components:** Reusable component system  
**Primary Target:** Mobile-first responsive web application  
**Desktop Support:** Yes  
**Primary Users:** Shop Owner / Cashier

---

# 1. Purpose

This document defines how the frontend of the Biryani Shop Management System must be designed and implemented.

The frontend must be:

- Mobile-first
- Responsive
- Fast
- Simple
- Professional
- Touch-friendly
- Easy for a shop owner to understand
- Optimized for quick POS operations
- Consistent across all modules

The application must NOT feel like a complicated enterprise ERP.

---

# 2. Frontend Philosophy

The core principle is:

> **The owner should be able to understand and use the application without needing technical knowledge.**

The interface should prioritize:

```text
Clarity
↓
Speed
↓
Simplicity
↓
Consistency
↓
Information density
```

Do not prioritize visual complexity over usability.

# 3. Mobile-First Requirement

Mobile responsiveness is a HARD requirement.

The owner may primarily use:
- Android phone
- iPhone
- Tablet

Therefore every important workflow must work comfortably on a small screen.

# 4. Responsive Design

The application must support:
- Mobile
- Tablet
- Desktop
- Large Desktop

Recommended conceptual breakpoints:
- Mobile < 640px
- Tablet 640px – 1024px
- Desktop 1024px+

The exact Tailwind breakpoints may be used where appropriate.

# 5. Mobile Priority

The mobile experience must NOT be treated as:
Desktop UI -> Shrink everything

Instead:
Mobile-first layout -> Expand intelligently for tablet -> Expand intelligently for desktop

# 6. Primary Navigation

The application should use a simple navigation structure.

Primary modules:
- Dashboard
- POS
- Sales
- Inventory
- Expenses
- Reports
- Products
- Settings

Do not place every possible feature in the main navigation.

# 7. Mobile Navigation

On mobile, navigation should prioritize the most important actions.

Recommended: Bottom Navigation
Dashboard, POS, Sales, Inventory, More

The More area can contain: Expenses, Reports, Products, Settings

The exact navigation can be adjusted based on usability testing.

# 8. Desktop Navigation

Desktop may use a sidebar:
```text
┌────────────────────────────┐
│ Logo / Shop Name            │
├────────────────────────────┤
│ Dashboard                   │
│ POS                         │
│ Sales                       │
│ Inventory                   │
│ Expenses                    │
│ Reports                     │
│ Products                    │
│ Settings                    │
├────────────────────────────┤
│ User                        │
└────────────────────────────┘
```

# 9. Responsive Navigation Behavior

Desktop: Sidebar
Mobile: Bottom navigation + Contextual header
Do not force a large desktop sidebar onto a 360px phone screen.

# 10. Global Layout

The application should have a consistent shell.
```text
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│                              │
│ Main Content                 │
│                              │
│                              │
└──────────────────────────────┘
```
Desktop may additionally include: Sidebar

# 11. Page Structure

A typical page should follow:
Page Header -> Page Description / Actions -> Filters / Search -> Primary Content -> Pagination / Summary
Avoid random layouts between modules.

# 12. Page Header

Example:
```text
Sales

View and manage your shop's sales.

[Today] [Date Range] [Export]
```
The header should immediately tell the user: Where am I? What can I do here?

# 13. Typography

Typography must prioritize readability.
Use a clean modern sans-serif font.
Recommended characteristics: Clear, Professional, Readable, Compact
Avoid decorative fonts.

# 14. Typography Hierarchy

Recommended hierarchy:
Page Title -> Section Heading -> Body Text -> Supporting Text -> Table Metadata
Do not use huge headings that consume valuable mobile screen space.

# 15. Color System

The UI should use a restrained professional palette.
Use: Primary, Background, Surface, Border, Text, Muted Text, Success, Warning, Danger
Avoid excessive colors.

# 16. Color Semantics

Colors must communicate meaning consistently.
Success: Completed / Paid / Available
Warning: Low Stock / Pending
Danger: Voided / Error / Critical Stock
Neutral: Draft / Informational
Do not randomly assign colors to different pages.

# 17. Dark Mode

Dark mode is NOT required for the initial MVP.
The initial design should prioritize a polished light theme.
If dark mode is added later, it must be implemented systematically.

# 18. Card Design

Cards should be used when they improve information grouping.
Examples: Today's Sales, Today's Orders, Today's Expenses, Low Stock
Do not wrap every piece of content inside a card. Excessive cards make the application visually cluttered.

# 19. Dashboard

The dashboard should provide a quick overview.
Possible structure:
```text
Good morning

[Today's Sales]
[Orders]
[Expenses]
[Estimated Profit]

Recent Sales
Low Stock
Top Selling Items
```

# 20. Dashboard Mobile

Mobile dashboard should stack content vertically.
```text
Today's Sales
Rs. 12,500

Today's Orders
42

Expenses
Rs. 4,200

Low Stock
3 Items
```
Cards should remain compact.

# 21. POS Philosophy

The POS is the most important frontend workflow.
The POS must optimize:
- Speed
- Large touch targets
- Minimal steps
- Clear pricing
- Easy item selection
- Easy quantity editing
- Fast checkout

# 22. POS Desktop Layout

Desktop may use a two-column layout:
```text
┌───────────────────────┬─────────────────────┐
│                       │                     │
│   Product Selection   │      Cart           │
│                       │                     │
│   [Biryani] [Drinks]  │ Chicken Biryani x2 │
│   [Raita]   [Sides]   │ Raita x1            │
│                       │                     │
│                       │ Subtotal            │
│                       │ Discount            │
│                       │ Total               │
│                       │                     │
│                       │ [Complete Sale]     │
└───────────────────────┴─────────────────────┘
```

# 23. POS Mobile Layout

Mobile should prioritize the product list and cart.
Possible flow: POS -> Categories -> Products -> Tap Product -> Cart -> Checkout
The cart may be displayed as a bottom sheet or dedicated cart screen.

# 24. POS Product Cards

Product cards should show: Product Name, Price, Availability
```text
┌─────────────────────┐
│ Chicken Biryani     │
│ Rs. 250             │
│                     │
│       [+ Add]       │
└─────────────────────┘
```
The entire card can be tappable.

# 25. POS Touch Targets

Interactive POS controls must be comfortable for touch.
Avoid tiny buttons.
Primary controls should have approximately 44px+ touch area where practical.

# 26. POS Search

POS should support quick product search.
Example: `[ 🔍 Search product... ]`
Search should be fast and forgiving.

# 27. POS Categories

Products should be grouped by category.
Example: `[Biryani] [Drinks] [Sides] [Extras]`
On mobile, categories can be horizontally scrollable.

# 28. POS Cart

Cart should clearly display: Product, Quantity, Unit Price, Subtotal
Example:
```text
Chicken Biryani

[-] 2 [+]

Rs. 250 × 2
Rs. 500
```

# 29. Quantity Controls

Quantity controls must be simple: `[-]  2  [+]`
Avoid complicated quantity editors.

# 30. Remove Item

The user should have an obvious way to remove an item.
Possible: Trash icon or Swipe/remove on mobile.

# 31. Cart Total

The total should always remain visible or easily accessible.
```text
Subtotal     Rs. 750
Discount     Rs. 50
--------------------
Total        Rs. 700
```

# 32. Checkout

Checkout should be a short workflow.
Recommended: Cart -> Review -> Payment Method -> Confirm -> Success
Avoid unnecessary screens.

# 33. Complete Sale Button

The primary checkout button must be visually dominant.
```text
┌──────────────────────────┐
│ Complete Sale — Rs. 700  │
└──────────────────────────┘
```
This reduces ambiguity.

# 34. Checkout Confirmation

Before final submission, clearly show: Items, Subtotal, Discount, Total, Payment Method.
The user should know exactly what will be recorded.

# 35. Prevent Double Submission

After checkout begins: Complete Sale -> Loading -> Button disabled.
This helps prevent duplicate sales.

# 36. Sale Success

After successful checkout:
```text
✓ Sale Completed

Invoice:
INV-000123

Total:
Rs. 700

[New Sale]
[View Sale]
```
Do not force the user through unnecessary navigation.

# 37. Sales Page

The Sales page should provide a professional table.
Desktop:
```text
┌────────────┬────────────┬──────────┬──────────┐
│ Invoice    │ Date       │ Items    │ Total    │
├────────────┼────────────┼──────────┼──────────┤
│ INV-001    │ Today      │ 4        │ Rs. 850  │
│ INV-002    │ Today      │ 2        │ Rs. 450  │
└────────────┴────────────┴──────────┴──────────┘
```

# 38. Excel-Like Table Requirement

Tables should feel similar to a clean Excel/Google Sheets data grid.
Characteristics: Compact rows, Clear columns, Strong alignment, Subtle borders, Sortable headers, Readable values, Row hover, Pagination.
Do NOT make tables visually heavy.

# 39. Mobile Tables

Do NOT simply squeeze a desktop table onto mobile.
Use one of: Horizontal scrolling, Responsive columns, Compact row layout, Card-like row representation.
Choose based on the data.

# 40. Sales Mobile Row

Example:
```text
INV-001
Today · 12:30 PM

4 Items
Rs. 850

Completed

Tap: → Sale Details
```

# 41. Inventory Page

Inventory should immediately communicate stock health.
```text
Inventory

[Search inventory...]

Rice
120 kg
Healthy

Chicken
8 kg
Low Stock

Oil
2 L
Critical
```

# 42. Inventory Desktop Table

Example:
```text
┌─────────────┬─────────┬─────────┬─────────────┐
│ Item        │ Current │ Unit    │ Status      │
├─────────────┼─────────┼─────────┼─────────────┤
│ Rice        │ 120     │ kg      │ Healthy     │
│ Chicken     │ 8       │ kg      │ Low Stock   │
│ Oil         │ 2       │ liter   │ Critical    │
└─────────────┴─────────┴─────────┴─────────────┘
```

# 43. Inventory Adjustment UI

The adjustment form should be extremely simple.
```text
Item
[ Rice ]

Adjustment
[ -5 ]

Reason
[ Physical stock count ]

[Save Adjustment]
```
The user should not need to understand database concepts.

# 44. Inventory History

Each inventory item should provide a history view.
Example: Date, Type, Quantity, Previous, New, Reason

# 45. Products Page

Products should be easy to manage.
```text
Products

[Search...]                     [+ Add Product]

Chicken Biryani     Rs. 250     Available
Beef Biryani        Rs. 350     Available
Raita               Rs. 50      Available
```

# 46. Product Form

Keep the form minimal.
Fields: Product Name, Category, Selling Price, Availability.
Optional description should only exist if genuinely useful.

# 47. Expense Page

Expenses should be simple to record.
```text
Expenses

[Today] [This Month]

Total Expenses
Rs. 12,500

[+ Add Expense]

Recent Expenses
```

# 48. Expense Form

Recommended: Category, Amount, Date, Description, Payment Method -> [Save Expense]
Do not create a complicated accounting form.

# 49. Reports Page

Reports should answer practical business questions.
Examples: How much did I sell today? How much did I sell this month? What products sell the most? How much did I spend? What were my expenses? How is the business performing?

# 50. Report Filters

Provide simple filters: Today, Yesterday, This Week, This Month, Custom Range.
Avoid overwhelming users with dozens of filters.

# 51. Sales Report

Possible visualization:
```text
Sales

Rs. 325,000

Daily Sales
████████████████

Orders
1,240
```
Charts should remain simple.

# 52. Report Tables

Charts should be complemented by tables when exact numbers matter.
Example:
```text
Date        Orders     Sales
Aug 20      42         Rs. 10,500
Aug 21      51         Rs. 12,750
Aug 22      47         Rs. 11,800
```

# 53. Loading States

Every data-driven page must have a loading state.
Use: Skeleton, Spinner, Progress indicator depending on context.
Avoid blank screens.

# 54. Empty States

When no data exists, show a useful empty state.
```text
No products yet.

Add your first product to start selling.

[Add Product]
```

# 55. Error States

Errors must be understandable.
Bad: 500 Internal Server Error
Better:
```text
Something went wrong.
We couldn't load your sales.
[Try Again]
```

# 56. Toast Notifications

Use toast notifications for short-lived feedback.
Examples: Product created, Sale completed, Expense saved, Inventory updated.
Do not use toasts for important information that the user must read for a long time.

# 57. Confirmation Dialogs

Use confirmation dialogs for destructive or significant actions.
```text
Void Sale?

This will mark INV-001 as voided.

[Cancel] [Void Sale]
```
Do not show confirmation for every normal action.

# 58. Forms

Forms should:
- Have clear labels
- Show validation errors near fields
- Preserve user input when possible
- Disable submission during processing
- Give clear success feedback

# 59. Form Validation

Frontend validation should improve UX.
Example:
```text
Selling Price
[ -50 ]

Price must be greater than 0.
```
However, server-side validation remains authoritative.

# 60. Buttons

Buttons should follow a consistent hierarchy.
Primary: Complete Sale, Save, Add Product
Secondary: Cancel, Filter, Export
Destructive: Void, Deactivate

# 61. Icon Usage

Icons should support text rather than replace it when the meaning is ambiguous.
Good: `[+ Add Product]`
Less clear: `[ + ]`
Use familiar icons consistently.

# 62. Tables

Tables should support: Search, Sort, Filter, Pagination, Row actions.
Only add features when useful.

# 63. Table Row Actions

Use a predictable action pattern.
Example: View, Edit, More.
Avoid putting ten buttons inside every row.

# 64. Pagination

Use pagination for potentially large datasets.
Example: `Showing 1–25 of 240` `[Previous] 1 2 3 ... [Next]`

# 65. Search UX

Search fields should:
- Have clear placeholder
- Show search icon
- Support keyboard input
- Debounce server requests when necessary
- Provide empty result feedback

# 66. Responsive Forms

Desktop: Two-column form (Name | Category; Price | Status)
Mobile: One-column form (Name, Category, Price, Status)

# 67. Accessibility

The application must support basic accessibility.
Requirements: Keyboard navigation, Readable contrast, Visible focus states, Semantic buttons, Proper labels, Accessible dialogs, Accessible form errors.

# 68. Touch Accessibility

Mobile controls must have enough spacing.
Avoid: Tiny icons, Crowded buttons, Closely packed controls.

# 69. Frontend State Management

Do not introduce global state for everything.
Use: Local component state, Server state, URL state, Global state only where necessary.

# 70. POS State

The POS cart is a good candidate for client-side state.
Example: `cart.items`, `cart.subtotal`, `cart.discount`, `cart.total`
However: Final price, Final total must always be verified by the backend.

# 71. Server State

Data such as: Products, Sales, Inventory, Expenses, Reports should be treated as server state.
Use an appropriate data-fetching/caching strategy.

# 72. URL State

Filters that should survive refresh/share/navigation can be stored in URL query parameters.
Example: `/sales?date=today` or `/sales?search=chicken`

# 73. No Business Logic in Components

Avoid: React Component -> Calculate accounting logic -> Modify database
Components should focus on presentation and user interaction.

# 74. Frontend Service Layer

If the application uses client-side API clients, centralize them.
Example:
```text
src/lib/api/
├── products.ts
├── sales.ts
├── inventory.ts
├── expenses.ts
└── reports.ts
```
Do not scatter raw fetch() calls throughout dozens of components.

# 75. API Client

The frontend API client should handle common behavior:
Request, Authentication, JSON parsing, Error normalization, Response handling.

# 76. Component Architecture

Use reusable components.
```text
components/
├── ui/ (Button, Input, Dialog, Table, Badge, Select)
├── layout/ (Sidebar, MobileNav, Header, PageContainer)
├── pos/ (ProductGrid, ProductCard, Cart, CartItem, Checkout)
└── ...
```

# 77. Component Reuse

If two pages need the same UI pattern, create a reusable component.
Do not duplicate 500 lines of nearly identical table code across multiple pages.

# 78. Avoid Over-Abstraction

Do not create a component for every `<div>`.
Create reusable components when there is: Repeated behavior, Repeated visual pattern, Shared business-independent UI.

# 79. Page-Level Components

Pages should compose smaller components.
Example: `SalesPage` composes `SalesHeader`, `SalesFilters`, `SalesTable`, `Pagination`.

# 80. POS Component Structure

Recommended: `POSPage` composes `POSHeader`, `CategoryTabs`, `ProductSearch`, `ProductGrid`, `Cart` (with `CartItem`, `CartSummary`, `CheckoutButton`), `CheckoutModal`.

# 81. Frontend Data Flow

Preferred flow:
User Action -> Component -> Frontend API Client / Server Action -> Backend API -> Service -> Database -> Response -> UI Update

# 82. Cache Invalidation

After mutations, affected server data must be refreshed or invalidated.
Example: Create Sale -> Invalidate today's sales -> Invalidate dashboard summary -> Update POS state.
Avoid showing stale information after important actions.

# 83. Optimistic UI

Optimistic updates may be used for low-risk interactions.
Do NOT use optimistic UI for critical financial operations unless rollback behavior is properly implemented.
For sale completion: Server confirmation should be authoritative.

# 84. Authentication UI

Unauthenticated users should be redirected to Login.
Authenticated users should see the application according to their permissions.

# 85. Permission-Based UI

If a user lacks permission: Hide or disable unavailable actions.
Frontend permission checks are for UX only. Backend authorization remains mandatory.

# 86. Responsive Modal Behavior

Desktop: Centered dialog
Mobile: Bottom sheet or Full-screen modal when the content requires more space.
Do not create tiny mobile dialogs.

# 87. Mobile Header

Mobile headers should remain compact.
Example: `←  Sales                 ⋮`
Avoid large desktop-style navigation bars.

# 88. Mobile Performance

The frontend should minimize: Large JavaScript bundles, Unnecessary dependencies, Huge images, Unnecessary re-renders.

# 89. Next.js Rendering

Use server rendering/server components where beneficial.
Use client components only when interaction or browser APIs require them.
Do not make the entire application a client component without reason.

# 90. Client Components

Use client components for things such as: POS cart, Interactive forms, Dialogs, Tabs, Charts, Search interactions.

# 91. Server Components

Use server components for: Static page structure, Initial data fetching where appropriate, Non-interactive content.

# 92. Frontend Security

Never place secrets in client-side code.
Never expose: DATABASE_URL, AUTH_SECRET, Private API credentials, Server secrets.

# 93. Frontend Environment Variables

Only variables explicitly intended for browser use should use: `NEXT_PUBLIC_`
Do not prefix secrets with NEXT_PUBLIC_.

# 94. Error Boundaries

Major application areas should have appropriate error handling.
A failure in one page should not unnecessarily destroy the entire application.

# 95. Not Found Pages

Invalid routes should provide a useful 404 page.
Example: Page not found. `[Back to Dashboard]`

# 96. Unsaved Changes

For important forms, consider warning users before navigating away if meaningful data could be lost.
Do not implement this globally without reason.

# 97. Excel-Like Data Experience

Tables should feel familiar to business users.
Recommended: Clear headers, Dense but readable rows, Column alignment, Sortable columns, Search, Filters, Pagination, Inline status badges.
Avoid overly decorative tables.

# 98. UI Consistency Rules

The same action should look the same throughout the application.
For example: `[+ Add Product]` should not become `Create New Item` on another page unless there is a meaningful distinction.

# 99. Terminology

Use simple business language.
Prefer: Sale, Expense, Product, Stock, Inventory, Report.
Avoid unnecessary technical terminology such as: Transaction Entity, Ledger Mutation, Resource, Aggregate in the user interface.

# 100. UI Copy

UI text should be: Short, Clear, Action-oriented, Professional.
Example:
Bad: Please click this button in order to proceed with the process of creating a new product.
Good: Add Product

# 101. Frontend Testing

Frontend testing must cover critical workflows.
Especially: Login, POS, Add product, Create sale, View sales, Add expense, Inventory adjustment, Reports.

# 102. POS Testing

Test: Add product, Increase quantity, Decrease quantity, Remove item, Calculate subtotal, Apply discount, Checkout, Prevent duplicate submission, Handle failed checkout, Clear cart after success.

# 103. Responsive Testing

Test at minimum: 360px, 390px, 414px, 768px, 1024px, 1280px, 1920px.
The exact test devices may vary, but mobile must never be skipped.

# 104. Frontend Definition of Done

A frontend feature is complete only when:
- Mobile layout works
- Desktop layout works
- Loading state exists
- Empty state exists
- Error state exists
- Validation exists
- API integration works
- Permission behavior works
- Touch targets are usable
- No console errors
- No obvious layout overflow
- Critical workflow is tested

# 105. AI Frontend Rules

The AI coding agent MUST:
- Follow the existing design system.
- Reuse existing components.
- Check existing pages before creating new components.
- Keep mobile as a first-class experience.
- Never blindly shrink desktop layouts for mobile.
- Keep POS extremely simple.
- Use tables for business data where appropriate.
- Avoid excessive cards.
- Avoid unnecessary animations.
- Keep forms short.
- Keep terminology simple.
- Never place database logic in components.
- Never trust frontend financial calculations.
- Never expose server secrets.
- Handle loading, empty, and error states.
- Test responsive behavior.

# 106. AI Anti-Patterns

The AI MUST NOT create:
❌ Overly complicated dashboards
❌ Huge hero sections inside the management app
❌ Excessive animations
❌ Glassmorphism everywhere
❌ Tiny mobile buttons
❌ Desktop-only tables
❌ 10-step POS checkout
❌ Unnecessary confirmation dialogs
❌ Random colors
❌ Different button styles on every page
❌ Database calls directly from UI components
❌ Fake loading delays
❌ Fake statistics
❌ Hardcoded sales/revenue data

# 107. Visual Quality Standard

The application should feel like:
Modern SaaS + Simple POS + Business Dashboard

It should NOT feel like:
Old-school accounting software
A flashy marketing website

# 108. Final Frontend Architecture

```text
Next.js
│
├── App Router
│
├── Pages
│
├── Layout
│
├── Reusable UI Components
│
├── Feature Components
│
├── Client State
│
├── API Client
│
└── Server Components / Actions
          │
          ▼
       Backend API
```

# 109. Golden Frontend Principle

Every screen must answer three questions immediately: Where am I? What can I do here? What should I do next?
If a user needs to figure out how the interface works, the UI is too complicated.

# 110. Golden POS Principle

A shop owner should be able to complete a normal sale with as few taps as reasonably possible.
The POS is not a dashboard. It is a transaction tool. Speed and clarity come first.

# 111. Final AI Rule

Before creating any frontend feature:
Requirement -> User workflow -> Mobile UX -> Desktop UX -> Reusable components -> API integration -> Loading / Empty / Error states -> Permission handling -> Responsive testing -> Done

Never start by simply creating a page and adding random components until it "looks good."
