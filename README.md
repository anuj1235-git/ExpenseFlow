# ExpenseFlow – Personal Expense Tracker

Production-style frontend expense tracker built with React, JavaScript ES6+, HTML5, CSS3, React Router, Context API, LocalStorage, Recharts and Lucide React.

## Features
- Login and signup flow with protected routes
- User-specific LocalStorage data isolation
- Logout and account display
- Income/expense CRUD
- Search and category/type filters
- Dashboard statistics
- Category and monthly analytics
- Monthly summary
- Category budgets with 80% and 100% warnings
- Light/dark/system appearance selection
- INR/USD/EUR/GBP currency preference
- CSV and JSON export
- Delete confirmation
- Responsive desktop/tablet/mobile layout
- LocalStorage persistence
- Realistic first-run sample data

## Install
```bash
npm install
npm run dev
```

## Structure
`components/` reusable UI, layout, forms and charts; `pages/` routed screens; `context/` global state; `utils/` persistence/calculation helpers; `data/` categories and sample data.

## Skills Demonstrated
React.js, JavaScript ES6+, HTML5, CSS3, React Hooks, Context API, React Router, LocalStorage, CRUD Operations, Data Visualization, Responsive Design, State Management, Form Validation, Component Architecture.

## Future Improvements
Recurring transactions, financial goals, import flow, notifications, pagination, richer month-over-month comparisons and automated testing.


> **Authentication note:** This version uses LocalStorage for frontend-only demo authentication. Passwords are not encrypted and this must not be used as a production authentication system. A real deployment should use a backend/auth provider with secure password hashing and sessions.
