# Biryani Shop Management System
## UI/UX Design System & Visual Specification

**Document:** 06 — UI/UX Design System  
**Version:** 1.0  
**Status:** Design Foundation  
**Application Type:** Biryani Shop Management System  
**Primary Device:** Mobile  
**Secondary Devices:** Tablet / Desktop  
**Design Direction:** Professional, Minimal, Fast, Practical

---

# 1. Purpose

This document defines the visual and interaction standards for the entire application.

The application must be:

- Professional
- Minimal
- Modern
- Clean
- Mobile-first
- Easy to learn
- Fast to operate
- Touch-friendly
- Visually consistent
- Practical for daily shop operations

The application must NOT look like a generic AI-generated admin dashboard.

---

# 2. Product Design Philosophy

The application is designed for a shop owner, not a software engineer.

The owner should not need to understand:

- Databases
- Accounting terminology
- Technical concepts
- Complex ERP workflows
- Advanced analytics

The UI should communicate in simple business language.

---

# 3. Core UX Principles

Every screen must follow these principles:

### 1. Clarity
The user should immediately understand what they are seeing.

### 2. Simplicity
Do not expose unnecessary options.

### 3. Speed
Common operations should require minimal interaction.

### 4. Consistency
The same UI pattern must behave the same way everywhere.

### 5. Mobile-first
Mobile is the primary operational device.

### 6. Feedback
Every important action should provide visible feedback.

### 7. Safety
Destructive or financially important actions require appropriate confirmation.

---

# 4. Design Personality

The application should feel:

- Professional
- Modern
- Friendly
- Reliable
- Calm
- Efficient

It should NOT feel:

- Corporate-heavy
- Overly colorful
- Gaming-like
- Experimental
- Crowded
- Technically intimidating

# 5. Visual Direction

Use a clean business application aesthetic inspired by modern products such as:

- Stripe
- Linear
- Vercel
- Notion
- Modern POS systems

Do NOT copy any of these products directly.
Use them only as general quality references.

# 6. Overall Layout

Desktop:

```text
┌──────────────────────────────────────────────────┐
│ Header                                           │
├──────────────┬───────────────────────────────────┤
│              │                                   │
│ Sidebar      │           Main Content            │
│              │                                   │
│              │                                   │
│              │                                   │
└──────────────┴───────────────────────────────────┘
```

Mobile:

```text
┌──────────────────────┐
│ Header               │
├──────────────────────┤
│                      │
│ Main Content         │
│                      │
│                      │
├──────────────────────┤
│ Navigation           │
└──────────────────────┘
```

# 7. Content Width

Desktop content should not stretch indefinitely.
Use a comfortable maximum content width.

The UI should maintain:
- Readable tables
- Comfortable cards
- Balanced whitespace

Large screens should not result in enormous empty or stretched components.

# 8. Spacing System

Use a consistent spacing scale.

Recommended base:
- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px
- 48px
- 64px

Avoid arbitrary values unless required by the design.

# 9. Page Padding

Mobile: 16px
Tablet: 20–24px
Desktop: 24–32px

The exact implementation may adapt based on screen size.

# 10. Typography

Typography must prioritize readability.

Hierarchy:
- Page Title
- Section Heading
- Card Heading
- Body
- Secondary Text
- Caption

Example:
```text
Dashboard

Today's Overview

Today's Sales
Rs. 24,500

12 transactions
```

# 11. Font

Use one primary UI font throughout the application.

The font must:
- Be highly readable
- Support numbers well
- Work on mobile
- Have multiple weights
- Render consistently

Do not use multiple unrelated fonts.

# 12. Font Weight

Recommended hierarchy:
- Regular
- Medium
- Semibold
- Bold

Use bold sparingly.
Important financial numbers may use stronger weight.

# 13. Color Philosophy

The application should use a restrained palette.

Color should communicate:
- Primary action
- Success
- Warning
- Error
- Information
- Neutral state

Avoid rainbow dashboards.

# 14. Primary Color

The project should have one primary brand/action color.

Use it for:
- Primary buttons
- Active navigation
- Important interactive elements
- Selected states
- Links where appropriate

Do not use the primary color on every element.

# 15. Semantic Colors

Use semantic colors consistently.

Success
→ Successful sale
→ Healthy status

Warning
→ Low stock
→ Attention required

Error
→ Failed operation
→ Invalid state

Neutral
→ Inactive
→ Informational

# 16. Color + Text Rule

Never communicate an important state using color alone.

Bad: Red = Low Stock
Better: ⚠ Low Stock (with the appropriate visual styling)

# 17. Background

The primary application background should be visually calm.

Use subtle contrast between:
- Application background
- Cards
- Tables
- Inputs
- Navigation

Avoid excessive shadows and gradients.

# 18. Cards

Cards should be used to group meaningful information.

Examples:
- Today's Sales
- Today's Orders
- Today's Expenses
- Low Stock

Cards should NOT be used simply because an admin template uses cards everywhere.

# 19. Card Design

Cards should have:
- Clear hierarchy
- Moderate padding
- Subtle border
- Small or restrained shadow
- Consistent radius

Avoid:
- Huge shadows
- Strong gradients
- Excessive rounded corners
- Decorative illustrations

# 20. Border Radius

Use a consistent radius system.

Example:
- Small
- Medium
- Large

Do not randomly use: 2px, 7px, 13px, 21px throughout the application.

# 21. Shadows

Use shadows sparingly.

Primary visual separation should come from:
- Spacing
- Borders
- Background contrast

rather than heavy shadows.

# 22. Buttons

Buttons must have clear hierarchy.

Primary
Used for the main action.
Example: + Add Product, Complete Sale, Save Expense

Secondary
Used for supporting actions.

Destructive
Used for: Void, Delete, Deactivate

# 23. Button Sizes

Provide appropriate sizes for:
- Desktop
- Mobile
- Compact/table actions

POS buttons should be large enough for touch.

# 24. Button Labels

Use action-oriented labels.

Good: Add Product, Save Expense, Complete Sale, Add Stock, View Report
Avoid: Submit, Proceed, Click, OK (unless context makes the meaning obvious)

# 25. Icon Buttons

Icon-only buttons should be used carefully.

Examples: Edit, Delete, More, Search, Close

They must have:
- Tooltip where useful
- Accessible label
- Adequate touch area

# 26. Forms

Forms should be short and structured.

Example:
```text
Product Name
[________________]

Category
[ Biryani ▼ ]

Selling Price
[ Rs. 250 ]

Status
[ Active ]

[ Save Product ]
```

# 27. Form Layout

Desktop:
```text
Label      Input
Label      Input
Label      Input
```
or grouped sections.

Mobile:
```text
Label
Input

Label
Input

Label
Input
```
Avoid cramped two-column forms on small screens.

# 28. Form Validation

Validation messages must appear close to the problematic field.

Bad: Something went wrong.
Better: Selling price must be greater than 0.

# 29. Required Fields

Clearly identify required fields.
Do not make users guess which fields are mandatory.

# 30. Placeholder Usage

Placeholders are examples, not labels.

Bad: `[ Product Name ]` with no visible label.
Better:
```text
Product Name
[ Chicken Biryani ]
```

# 31. Tables

Tables are a major part of the application.
They should feel similar to familiar spreadsheet software.

# 32. Table Design

Use:
- Clear header
- Consistent row height
- Readable columns
- Subtle row separation
- Right-aligned numeric values
- Action column

Example:
```text
┌──────────────┬──────────┬──────────┬──────────┐
│ Product      │ Category │ Price    │ Status   │
├──────────────┼──────────┼──────────┼──────────┤
│ Chicken      │ Biryani  │ Rs. 250  │ Active   │
│ Beef         │ Biryani  │ Rs. 300  │ Active   │
└──────────────┴──────────┴──────────┴──────────┘
```

# 33. Numeric Alignment

Financial numbers should generally be right-aligned.

Example:
```text
Quantity       Price
      10    Rs. 2,500
       2      Rs. 500
```
This makes numbers easier to compare.

# 34. Table Header

Table headers must be visually distinct but not excessively heavy.

Use: Product, Category, Price, Status, Actions

# 35. Table Row Actions

Keep actions compact.

For example:
- Edit
- More

Avoid placing five large buttons in every row.

# 36. Mobile Tables

Tables must adapt for mobile.

Preferred strategies:

Strategy A — Card/List
Use when each row has many columns.

Strategy B — Horizontal Scroll
Use when tabular comparison is important.

Strategy C — Reduced Columns
Show only the most important fields.

The AI must choose the most usable approach for each specific table.

# 37. Table Pagination

Pagination should be simple.

Example:
```text
Showing 1–25 of 125

< 1 2 3 4 5 >
```
On mobile, simplify the controls.

# 38. Search

Search fields should be visually obvious.

Example:
`🔍 Search products...`

Search should not require unnecessary configuration.

# 39. Filters

Filters should expose only useful filtering options.

Example: Category, Status, Date

Do not create filters for every database field.

# 40. Mobile Filters

On mobile, filters may open in:
- Bottom sheet
- Drawer
- Modal

This prevents the page from becoming vertically cluttered.

# 41. Dropdowns

Dropdowns should be:
- Easy to tap
- Clearly labeled
- Easy to close
- Keyboard accessible where applicable

Do not create overly complex custom dropdowns unless necessary.

# 42. Date Picker

Date selection must be mobile-friendly.

Reports should provide presets:
- Today
- Yesterday
- This Week
- This Month
- Custom

The custom date picker should remain simple.

# 43. Status Badges

Use compact badges.

Example:
- ● Active
- ● Low Stock
- ● Inactive
- ● Completed
- ● Voided

The status should be readable even without color.

# 44. Toast Notifications

Use toast notifications for lightweight feedback.

Examples:
- Product added successfully.
- Stock updated successfully.
- Expense recorded successfully.

Do not use toasts for important information that must remain visible.

# 45. Confirmation Dialogs

Use dialogs for important destructive actions.

Example:
```text
Void Sale?

This will mark invoice INV-000123 as voided.

[Cancel] [Void Sale]
```

The destructive button must be clearly distinguishable.

# 46. Dialog Rules

Dialogs should:
- Have clear titles
- Explain consequences
- Have explicit actions
- Be keyboard accessible
- Work on mobile
- Not exceed reasonable screen height

# 47. Bottom Sheets

Bottom sheets are particularly useful on mobile.

Good uses:
- POS Cart
- Filters
- Quick Actions
- Payment Selection

# 48. POS Design Philosophy

The POS should be the fastest part of the application.

The owner should be able to:
Open POS
→ Find product
→ Add product
→ Change quantity
→ Checkout
→ Complete sale
without navigating through multiple pages.

# 49. POS Layout

Desktop:
```text
┌─────────────────────────────────────────────┐
│ Search                                      │
├──────────────────────────┬──────────────────┤
│ Products                 │ Cart             │
│                          │                  │
│ [Product] [Product]      │ Chicken × 2      │
│ [Product] [Product]      │ Raita × 1        │
│ [Product] [Product]      │                  │
│                          │ Total             │
│                          │                  │
│                          │ [Checkout]       │
└──────────────────────────┴──────────────────┘
```

# 50. POS Mobile Layout

Mobile:
```text
┌──────────────────────┐
│ Search               │
├──────────────────────┤
│ Categories            │
├──────────────────────┤
│ Product               │
│ Product               │
│ Product               │
│ Product               │
├──────────────────────┤
│ 🛒 3 Items   Rs. 750 │
└──────────────────────┘
```

The cart summary may remain sticky at the bottom.

# 51. POS Product Card

A product card should prioritize:
- Name
- Price
- Availability

Optional:
- Image

Images are not mandatory.
Do not make the POS depend on images.

# 52. POS Cart

Cart should remain visually prominent.

Example:
```text
Chicken Biryani

[-] 2 [+]

Rs. 500
```
Then:
Subtotal
Discount
Total

# 53. POS Checkout CTA

The checkout button must be visually dominant.

Example:
```text
┌────────────────────────┐
│ COMPLETE SALE           │
│ Rs. 1,250               │
└────────────────────────┘
```
The owner should immediately know what will happen when pressing it.

# 54. Payment Method

Keep payment selection simple.

Example:
Payment Method
`[ Cash ] [ Other ]`

Only implement payment methods actually required by the business.
Do not build a complex payment gateway system unless specifically required.

# 55. Sale Success Screen

After checkout:
```text
✓ Sale Completed

INV-000123

Rs. 1,250

[ New Sale ]
[ View Receipt ]
```
The success state must feel reassuring.

# 56. Dashboard Design

The dashboard should answer:
- How much did I sell today?
- How many orders?
- How much did I spend?
- How is the business performing?
- Is anything low in stock?

# 57. Dashboard Layout

Mobile:
```text
Today's Sales
Rs. 24,500

Today's Orders
82

Today's Expenses
Rs. 7,200

Estimated Profit
Rs. 17,300

Low Stock
3 items
```
Then:
Recent Sales
Top Products

# 58. Dashboard Card Priority

The most important information should appear first.

Recommended:
1. Today's Sales
2. Today's Orders
3. Today's Expenses
4. Estimated Profit
5. Low Stock

# 59. Reports Design

Reports should not feel like accounting software.

Start with:
- Date Range
- Summary
- Chart if useful
- Detailed table

# 60. Report Example

```text
Sales Report

[ This Month ▼ ]

Total Sales
Rs. 685,000

Orders
2,184

Average Order
Rs. 314

Sales Trend
[ Chart ]

Top Products
[ Table ]
```

# 61. Inventory Visual Hierarchy

Inventory should make low-stock items obvious.

Example:
- Healthy
- Low Stock
- Out of Stock

The user should not need to inspect every number manually.

# 62. Expense Design

Expense entry should be quick.

Target workflow:
Expenses
→ + Add Expense
→ Enter amount
→ Select category
→ Save

# 63. Navigation UX

Navigation must communicate the application's mental model.

Recommended order:
- Dashboard
- POS
- Products
- Inventory
- Sales
- Expenses
- Reports
- Settings

The most frequently used features should be easiest to reach.

# 64. Mobile Navigation Priority

Mobile navigation should emphasize:
- Dashboard
- POS
- Sales
- Inventory
- More

Secondary modules can be placed inside More.

# 65. Active Navigation

The active page must be visually obvious.

Use:
- Icon
- Label
- Background/indicator

Do not rely only on a tiny color change.

# 66. Breadcrumbs

Use breadcrumbs only where they improve navigation.
Do not add breadcrumbs to simple mobile pages.

# 67. Page Headers

Each page should have a clear header.

Example:
```text
Products

Manage your menu items

[ + Add Product ]
```

Avoid unnecessary descriptive text on every page.

# 68. Page Actions

Primary actions should appear near the page title on desktop.

On mobile:
Page title
+
Primary action
may be stacked.

# 69. Empty States

Empty states should explain what to do next.

Example:
```text
No products yet.

Add your first product to start selling.

[ Add Product ]
```

# 70. Error States

Error states should be actionable.

Example:
```text
Unable to load inventory.

[ Try Again ]
```
Avoid exposing technical stack traces.

# 71. Loading States

Use skeletons for major page content.

For quick actions:
- Saving...
- Processing...
- Loading...

Avoid unnecessary full-screen spinners.

# 72. Animation

Animations must be subtle.

Allowed:
- Modal opening
- Drawer opening
- Toast appearing
- Button loading
- Small transitions

Avoid:
- Large page animations
- Constant movement
- Particle backgrounds
- Excessive gradients
- Decorative animations

The application is a business tool, not a marketing website.

# 73. Interaction Speed

Common operations should feel immediate.

For example:
Tap Product → Cart updates immediately
while the authoritative transaction still happens on the backend.

# 74. Feedback States

Interactive controls should have:
- Default
- Hover
- Focus
- Pressed
- Disabled
- Loading
- Error
- Success
where applicable.

# 75. Disabled Controls

Disabled buttons should visually communicate that they cannot currently be used.

Example:
Complete Sale disabled when Cart is empty

# 76. Confirmation Philosophy

Do not ask "Are you sure?" for harmless actions.

Do ask before:
- Voiding a sale
- Deleting/voiding financial records
- Major inventory corrections
- Deactivating important records

# 77. Accessibility

The UI must support:
- Keyboard navigation
- Visible focus states
- Proper labels
- Semantic HTML
- Accessible dialogs
- Accessible buttons
- Sufficient contrast
- Screen-reader-friendly controls

# 78. Touch Accessibility

Mobile controls must have comfortable touch areas.

Avoid:
- Tiny icon
- Tiny checkbox
- Tiny close button
especially in the POS.

# 79. Responsive Design Rule

Every new component must be tested at minimum against:
- Small Mobile
- Mobile
- Tablet
- Desktop
- Large Desktop

A feature is not complete if it works only on desktop.

# 80. Mobile Overflow Rule

No page should produce unintended horizontal scrolling.
Exceptions may exist for intentionally scrollable tables.
The overall application must never have accidental horizontal overflow.

# 81. Dark Mode

Dark mode is NOT required for the MVP unless explicitly introduced later.
Do not build a dark theme as part of the initial implementation.

# 82. Images

Images should only be used when they provide value.
For POS products, images are optional.

If images are used:
- Optimize them
- Provide fallbacks
- Avoid huge file sizes
- Maintain consistent aspect ratio

# 83. Responsive Images

Images must not break layouts on mobile.
Use appropriate: width, height, aspect ratio, object-fit.

# 84. Design Consistency Rules

The AI must NOT create:
One style of button on Products, another on Expenses, another on POS.
There must be one design language.

# 85. Component Reuse

Before creating a new UI component, check whether an existing component can be reused.

Preferred:
Shared Button, Shared Input, Shared Table, Shared Dialog, Shared Badge
rather than creating duplicates.

# 86. Avoid Generic Admin Templates

The UI must not look like:
10 cards + 3 charts + huge sidebar + random gradients + unnecessary statistics
simply because that is common in AI-generated dashboards.
Every element must have a purpose.

# 87. Information Density

The application should have moderate information density.
Too little: Huge empty spaces
Too much: Everything packed together

The target is: Easy scanning + Efficient use of space

# 88. Professionalism

Professionalism comes from:
- Consistency
- Spacing
- Typography
- Alignment
- Hierarchy
- Predictable interactions

It does NOT require:
- Fancy gradients
- 3D effects
- Excessive animations
- Complex illustrations

# 89. Financial UI Rules

Financial values must be visually easy to scan.
Use: Rs. 25,000, Rs. 7,500, Rs. 17,500
Keep currency formatting consistent.

# 90. Positive / Negative Values

Where appropriate:
Income / Sales: Positive visual treatment
Expenses: Neutral or appropriate negative treatment
Loss / Error: Danger treatment

Do not overuse green/red.

# 91. UX for Shop Owner

Assume the user may be:
- Busy
- Standing
- Using one hand
- Working on a small phone
- In a noisy shop
- Performing repeated sales

Therefore: Large important actions, Short forms, Fast navigation, Clear feedback, Minimal typing are critical.

# 92. POS Repetition

The POS workflow may happen dozens or hundreds of times per day.
Therefore optimize: Product discovery, Quantity adjustment, Checkout, Payment, New sale before optimizing less frequently used features.

# 93. Keyboard Support

On desktop POS, useful keyboard shortcuts may be added later.
Do not implement shortcuts unless they are clearly documented and tested.

# 94. Error Prevention

Prefer preventing errors rather than explaining them afterward.
Examples: Disable checkout when cart is empty, Prevent invalid quantities, Prevent negative prices, Require valid expense amounts.

# 95. Progressive Disclosure

Do not show advanced options immediately. Show the simple workflow first.
Advanced functionality can be revealed through: More, Advanced Filters, Details when genuinely necessary.

# 96. No Unnecessary Complexity

Do NOT add:
Multi-level menus, Complex dashboards, Advanced accounting, CRM, Customer loyalty, AI analytics, Multi-store management, Supplier ERP
unless explicitly required by a future specification.

# 97. UX Definition of Done

A UI feature is complete when:
- It works on mobile.
- It works on desktop.
- It follows the design system.
- It has clear hierarchy.
- It has loading states.
- It has error states.
- It has empty states where applicable.
- Forms have validation feedback.
- Destructive actions are protected.
- Touch targets are usable.
- Accessibility has been considered.
- No accidental overflow exists.

# 98. AI Design Rules

Before creating any UI, the AI must ask:
- Does this feature already have a design pattern?
- Does a reusable component already exist?
- Is this information actually useful?
- Can the workflow be simpler?
- Does it work on mobile?
- Does it match the existing visual language?

# 99. AI UI Anti-Patterns

The AI must NOT:
❌ Create random colors
❌ Create random fonts
❌ Create random spacing
❌ Create excessive cards
❌ Create unnecessary charts
❌ Add decorative gradients everywhere
❌ Add excessive animations
❌ Create desktop-only tables
❌ Use tiny mobile buttons
❌ Create giant forms
❌ Hide important information behind unnecessary menus
❌ Add features not defined in requirements
❌ Create duplicate components
❌ Turn every screen into a dashboard

# 100. Golden UI Principle

Every screen must answer:
What does the shop owner need to do here, and what is the fastest clear way to let them do it?
If an element does not help answer that question, it should probably not exist.

# 101. Final Design Direction

The final application should feel like:
A modern mobile-first shop management system with a professional business interface, simple POS, clean Excel-like tables, clear financial information, and extremely straightforward workflows.

It should NOT feel like:
A complex ERP, a generic admin template, a developer dashboard, an academic CRUD project, an AI-generated UI showcase.

# 102. Final UI/UX Rule

When in doubt:
Simpler > More Features
Clear > Decorative
Fast > Fancy
Consistent > Creative
Mobile-friendly > Desktop-only
Useful > Impressive

The application must prioritize the shop owner's daily workflow above everything else.
