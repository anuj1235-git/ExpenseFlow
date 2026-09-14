# ExpenseFlow — Personal Finance Dashboard

> A production-style personal finance management application built with React, featuring user authentication, transaction management, budget tracking, financial analytics, goal tracking, and data import/export — all powered by LocalStorage with full user-data isolation.

<br/>

## Author

**Anuj Kumar Singh**
Frontend Developer · React · JavaScript · UI/UX

<br/>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Authentication Flow](#authentication-flow)
- [State Management](#state-management)
- [LocalStorage Architecture](#localstorage-architecture)
- [Data Import / Export](#data-import--export)
- [Pages & Routes](#pages--routes)
- [Component Breakdown](#component-breakdown)
- [Utility Layer](#utility-layer)
- [Responsive Design](#responsive-design)
- [Theme System](#theme-system)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Security Notice](#security-notice)

---

## Overview

ExpenseFlow is a comprehensive personal finance dashboard that goes well beyond a basic CRUD app. It is designed as a portfolio-quality frontend project demonstrating real-world React patterns: user-scoped data isolation, multi-layer context management, derived financial insights, advanced filtering with `useMemo`, goal tracking with progress visualization, and a fully responsive layout with dark/light/system theme support.

---

## Features

### Authentication
- Signup with duplicate email detection and input validation
- Login with separate "email not found" vs "wrong password" error messages
- Persistent sessions via `localStorage` (survives page refresh)
- Protected routes — unauthenticated users are redirected to `/login`
- Logout from sidebar and settings
- Delete account — removes user credentials and all associated data

### Transaction Management
- Add, edit, and delete income and expense transactions
- Click any transaction row to open a full **Transaction Detail Modal** (description, category, date, payment method, notes)
- Edit and delete directly from the detail modal

### Advanced Filtering & Sorting
- Search across description, category, payment method, and notes
- Filter by type (income / expense) and category
- **Advanced filters panel**: payment method, date range (from / to), amount range (min / max)
- Active filter count badge on the toggle button
- 6 sort options: Newest, Oldest, Highest Amount, Lowest Amount, A→Z, Z→A
- One-click Reset — only visible when filters are active

### Dashboard
- Total balance, income, expenses, and budget utilization summary cards
- Recent transactions list
- Category spending chart

### Budget Tracking
- Set per-category monthly budgets
- Real-time progress bars with three states: Healthy / Warning (80%+) / Exceeded (100%+)
- Inline notices for budget alerts

### Financial Goals
- Create, edit, and delete savings goals
- Per-goal progress bar with dynamic color (yellow → blue → green based on completion)
- Days remaining countdown — turns red when overdue
- Daily savings suggestion: *"Save ₹X/day to reach your goal on time"*
- Stats strip: total goals, achieved, in progress, total target, total saved

### Financial Insights (Analytics)
Automatically generated from your data — no AI or API:
- Month-over-month spending change (% increase or decrease)
- Savings rate with health classification (Excellent / Warning / Low)
- Top spending category with trend vs last month
- Average daily spend for the current month
- Peak spending day of the week
- Zero-expense encouragement

### Analytics Charts
- Expense by category (pie/donut)
- Monthly expenses (bar chart, last 6 months)
- Income vs Expense trend (line chart, last 6 months)

### Monthly Summary
- Month-picker to browse any past month
- Income, expense, and balance for selected month
- Category breakdown for that month

### Data Management (Settings)
- Export transactions as **CSV**
- Export transactions as **JSON**
- **Import JSON** — accepts bare array `[...]` or `{ transactions: [...] }` shape; merges without duplicating existing records; shows success count or validation error
- **Load Sample Data** — resets to built-in dataset (with confirmation)
- **Clear All Data** — removes transactions, budgets, and goals (with confirmation)

### Appearance & Preferences
- Light / Dark / System theme toggle — persists across sessions
- Currency selector: INR ₹ / USD $ / EUR € / GBP £ — used across all formatted values

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Routing | React Router v7 |
| State Management | React Context API + `useMemo` / `useCallback` |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Custom CSS3 (no UI framework) |
| Build Tool | Vite |
| Persistence | Browser LocalStorage |
| Language | JavaScript ES6+ |

---

## Project Structure

```
ExpenseFlow-Final/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                     # App entry point, provider composition
    ├── App.jsx                      # Route definitions
    │
    ├── components/
    │   ├── auth/
    │   │   ├── AuthLayout.jsx       # Two-panel auth page wrapper
    │   │   └── ProtectedRoute.jsx   # Redirects unauthenticated users
    │   ├── charts/
    │   │   └── Charts.jsx           # CategoryChart, MonthlyBar, IncomeExpenseLine
    │   ├── layout/
    │   │   └── AppLayout.jsx        # Sidebar nav, topbar, mobile menu
    │   ├── transactions/
    │   │   ├── TransactionForm.jsx  # Add/edit form with validation
    │   │   ├── TransactionList.jsx  # Sortable table with row-click view
    │   │   └── TransactionDetailModal.jsx  # Full transaction detail view
    │   └── ui/
    │       ├── Modal.jsx            # Reusable modal with backdrop dismiss
    │       └── SummaryCard.jsx      # Dashboard stat card
    │
    ├── context/
    │   ├── AuthContext.jsx          # Auth state, signup/login/logout/deleteAccount
    │   ├── ExpenseContext.jsx       # Transactions, budgets, goals, persistence
    │   └── ThemeContext.jsx         # Light/dark/system theme
    │
    ├── data/
    │   ├── categories.js            # Expense/income categories, payment methods
    │   └── sampleData.js           # First-run sample transactions
    │
    ├── pages/
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── Dashboard.jsx
    │   ├── Transactions.jsx         # Full filter/sort UI
    │   ├── AddTransaction.jsx
    │   ├── Budgets.jsx
    │   ├── Goals.jsx                # Goals CRUD + progress tracking
    │   ├── Analytics.jsx            # Charts + Financial Insights
    │   ├── MonthlySummary.jsx
    │   └── Settings.jsx
    │
    ├── styles/
    │   ├── index.css               # Global styles, components, dark mode
    │   └── auth.css                # Auth page specific styles
    │
    └── utils/
        ├── calculations.js         # Financial math + insight helpers
        ├── formatCurrency.js       # Intl.NumberFormat currency formatting
        └── storage.js              # localStorage read/write/remove wrappers
```

---

## Architecture

```
main.jsx
  └── BrowserRouter
        └── AuthProvider          (user session, auth functions)
              └── ThemeProvider   (theme preference)
                    └── ExpenseProvider   (transactions, budgets, goals)
                          └── App
                                ├── /login    → Login
                                ├── /signup   → Signup
                                └── ProtectedRoute
                                      └── AppLayout (sidebar + topbar)
                                            ├── /              → Dashboard
                                            ├── /transactions  → Transactions
                                            ├── /add-transaction → AddTransaction
                                            ├── /budgets       → Budgets
                                            ├── /goals         → Goals
                                            ├── /analytics     → Analytics
                                            ├── /monthly-summary → MonthlySummary
                                            └── /settings      → Settings
```

Provider order is intentional: `AuthProvider` must wrap `ExpenseProvider` because `ExpenseContext` reads `user.id` from `AuthContext` to scope all storage keys.

---

## Authentication Flow

```
Signup
  → validate (name, email, password)
  → check duplicate email in expenseflow_users[]
  → generate unique id: Date.now() + random string
  → persist full user to expenseflow_users[]
  → write session (id, name, email) to expenseflow_current_user
  → setUser(sessionUser) → ProtectedRoute allows access

Login
  → normalize email (trim + lowercase)
  → check email exists → throws "No account found" if not
  → check password match → throws "Incorrect password" if not
  → write session → setUser

Logout / Delete Account
  → remove expenseflow_current_user
  → (delete only) remove user from expenseflow_users[]
  → (delete only) remove all user-scoped data keys
  → setUser(null) → ProtectedRoute redirects to /login
```

---

## State Management

### AuthContext
Holds `user` (session object or `null`). Exposes: `signup`, `login`, `logout`, `deleteAccount`.

### ExpenseContext
Derives storage keys from `user.id` so data is always user-scoped. Holds:
- `transactions` — full array, persisted on every mutation
- `budgets` — `{ [category]: amount }` object
- `goals` — array of goal objects

Exposes mutations: `addTransaction`, `updateTransaction`, `deleteTransaction`, `addBudget`, `deleteBudget`, `addGoal`, `updateGoal`, `deleteGoal`, `clearAll`, `importTransactions`, `loadSampleData`.

Derived values computed via `useMemo`: `totalIncome`, `totalExpense`, `totalBalance`.

### ThemeContext
Holds `theme` (`'light' | 'dark' | 'system'`). Writes `data-theme` attribute on `<html>` and persists to `expenseflow_settings`.

---

## LocalStorage Architecture

All keys are namespaced to prevent collisions:

```
expenseflow_users                        → array of all registered user objects
expenseflow_current_user                 → active session (no password)

expenseflow_{userId}_transactions        → user's transaction array
expenseflow_{userId}_budgets             → user's budget object
expenseflow_{userId}_goals               → user's goals array
expenseflow_{userId}_settings            → user's currency / theme preferences
```

This means multiple users can have accounts on the same browser with fully isolated data. Deleting an account removes all of that user's keys.

---

## Data Import / Export

### Export JSON
Downloads `expenseflow-data.json` containing `{ transactions: [...] }`.

### Export CSV
Downloads `expenseflow-transactions.csv` with columns: Date, Type, Amount, Category, Description, Payment Method.

### Import JSON
Accepts two shapes:
```json
[{ "type": "expense", "amount": 1500, ... }]          // bare array
{ "transactions": [{ "type": "expense", ... }] }       // export format
```
Validates that every record has `type` and `amount`. Merges with existing data — records with duplicate `id` values are skipped. Displays success count or a descriptive error message.

### Load Sample Data
Resets transactions to the built-in dataset and clears budgets and goals (requires confirmation).

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Email + password login |
| `/signup` | Signup | Registration with validation |
| `/` | Dashboard | Summary cards, recent transactions, category chart |
| `/transactions` | Transactions | Full CRUD + advanced filters + detail modal |
| `/add-transaction` | AddTransaction | Dedicated add form |
| `/budgets` | Budgets | Budget cards with progress bars |
| `/goals` | Goals | Goal cards with progress, countdown, suggestions |
| `/analytics` | Analytics | Financial insights + 3 charts |
| `/monthly-summary` | MonthlySummary | Month-picker summary view |
| `/settings` | Settings | Account, appearance, currency, data management |

---

## Component Breakdown

### `TransactionList`
Renders a responsive table. Accepts `onView`, `onEdit`, `onDelete` props. Row clicks trigger `onView`. Action buttons use `e.stopPropagation()` to avoid triggering the row click.

### `TransactionDetailModal`
Shows a color-coded amount hero (green for income, red for expense) followed by labeled detail rows for all transaction fields. Provides Edit and Delete actions.

### `TransactionForm`
Controlled form for add/edit. Category options change dynamically based on selected type. Validates amount > 0, category selected, and date present.

### `Modal`
Reusable modal with backdrop click-to-dismiss, close button, optional `actions` slot, and accessible markup.

### `GoalCard`
Shows progress bar (color shifts: yellow → blue → green), days remaining (red when overdue), saved/target/remaining amounts, and a daily savings rate suggestion.

### `AppLayout`
CSS Grid shell: 250px sidebar + fluid main. Mobile: sidebar hides, top menu button opens it as a fixed overlay.

---

## Utility Layer

### `calculations.js`
```
totalIncome(ts)           → sum of income transactions
totalExpense(ts)          → sum of expense transactions
balance(ts)               → income - expense
savingsRate(ts)           → (income - expense) / income × 100
categoryTotals(ts, type)  → [{ name, value }] for charts
monthKey(date)            → "YYYY-MM"
monthlyTransactions(ts, key) → transactions in a month
txInMonth(ts, key)        → alias for monthlyTransactions
currentMonthKey()         → current month as "YYYY-MM"
prevMonthKey()            → previous month as "YYYY-MM"
avgDailySpend(ts)         → total expense / unique spending days
topCategory(ts)           → name of highest-spend category
pctChange(curr, prev)     → % change, null if prev is 0
spendByDow(ts)            → [{ name, value }] by day of week
peakSpendDay(ts)          → { name, value } of highest-spend day
uid()                     → unique id string
```

### `formatCurrency.js`
Wraps `Intl.NumberFormat` for INR (`en-IN` locale) and USD/EUR/GBP (`en-US` locale). Accepts `(value, currency)`.

### `storage.js`
Three thin wrappers around `localStorage` with `try/catch`:
- `readStorage(key, fallback)` — parse JSON or return fallback
- `writeStorage(key, value)` — serialize to JSON
- `removeStorage(key)` — `localStorage.removeItem`

---

## Responsive Design

| Breakpoint | Layout |
|---|---|
| > 1000px | 4-column summary grid |
| 800–1000px | 2-column summary grid |
| < 800px | Single column, sidebar hidden, mobile menu button shown |
| < 500px | Single column goals grid, 2-column goal amounts |

The sidebar appears as a fixed overlay on mobile and closes on nav link click.

---

## Theme System

Three modes stored in `expenseflow_settings`:
- **Light** — default white/grey palette
- **Dark** — deep navy background (`#0b1120`), dark cards (`#111827`)
- **System** — follows OS `prefers-color-scheme`

Dark mode is implemented via a `data-theme="dark"` attribute on `<html>`, targeted by CSS selectors throughout `index.css`. Every component — tables, modals, forms, charts, cards, dropdowns, badges — has a corresponding dark mode rule.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/anujkumarsingh/expenseflow.git
cd expenseflow

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

To try the app immediately, create an account on the signup page — sample data is loaded automatically on first login.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server (hot reload) |
| `npm run build` | Build for production to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Security Notice

> **This project uses browser LocalStorage for authentication and data persistence.**
>
> Passwords are stored in plaintext in `localStorage` and are not encrypted or hashed. This is intentional for a frontend-only portfolio project and is sufficient for demonstrating authentication UX patterns.
>
> **This must not be used as a production authentication system.** A real deployment requires a backend with secure password hashing (bcrypt/argon2), session management (JWT or HTTP-only cookies), HTTPS, and a proper database.

---

## License

MIT © 2026 Anuj Kumar Singh
