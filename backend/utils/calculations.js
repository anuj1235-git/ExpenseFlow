'use strict';

/**
 * Server-side financial calculations used by the analytics controller.
 * Mirrors the logic in frontend/src/utils/calculations.js so that
 * both sides stay consistent when comparing figures.
 *
 * All functions accept arrays of plain Transaction objects (Mongoose docs
 * or lean objects) unless stated otherwise.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sum the `amount` field of items that pass a predicate. */
const sumBy = (items, pred) =>
  (items || [])
    .filter(pred)
    .reduce((s, t) => s + Number(t.amount || 0), 0);

/** Total income across a transaction array. */
const totalIncome = (ts) => sumBy(ts, (t) => t.type === 'income');

/** Total expenses across a transaction array. */
const totalExpense = (ts) => sumBy(ts, (t) => t.type === 'expense');

/** Net balance (income − expense). */
const balance = (ts) => totalIncome(ts) - totalExpense(ts);

/**
 * Savings rate as a percentage of income.
 * Returns 0 when there is no income.
 */
const savingsRate = (ts) => {
  const inc = totalIncome(ts);
  return inc ? ((inc - totalExpense(ts)) / inc) * 100 : 0;
};

/**
 * Return a 'YYYY-MM' string for a given date value
 * (accepts Date objects, ISO strings, or anything new Date() understands).
 */
const monthKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
};

/** Filter transactions to those whose date falls in a given 'YYYY-MM' key. */
const txInMonth = (ts, key) =>
  (ts || []).filter((t) => monthKey(t.date) === key);

/**
 * Group transactions by category and sum their amounts.
 * Returns [{ name, value }] sorted descending by value.
 *
 * @param {object[]} ts   - transaction array
 * @param {string}   type - 'expense' | 'income' | 'all'
 */
const categoryTotals = (ts, type = 'expense') => {
  const filtered = type === 'all' ? ts : (ts || []).filter((t) => t.type === type);
  const acc = {};
  for (const t of filtered) {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0);
  }
  return Object.entries(acc)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Build a per-month summary for a given year.
 * Returns an array of 12 objects (one per month, Jan → Dec):
 *   { month, monthName, income, expense, savings, savingsRate }
 *
 * @param {object[]} ts   - full transaction array for the user
 * @param {number}   year - e.g. 2026
 */
const monthlySummary = (ts, year) => {
  const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return MONTH_NAMES.map((monthName, idx) => {
    const month = idx + 1;
    const key   = `${year}-${String(month).padStart(2, '0')}`;
    const slice = txInMonth(ts, key);
    const inc   = totalIncome(slice);
    const exp   = totalExpense(slice);
    return {
      month,
      monthName,
      key,
      income     : inc,
      expense    : exp,
      savings    : inc - exp,
      savingsRate: inc ? ((inc - exp) / inc) * 100 : 0,
    };
  });
};

/**
 * Average daily spend for expense transactions.
 * Counts distinct calendar days that have at least one expense.
 */
const avgDailySpend = (ts) => {
  const expenses = (ts || []).filter((t) => t.type === 'expense');
  if (!expenses.length) return 0;
  const days = new Set(expenses.map((t) => new Date(t.date).toISOString().slice(0, 10))).size;
  return totalExpense(expenses) / days;
};

/** Name of the category with the highest total expense across all time. */
const topCategory = (ts) => {
  const cats = categoryTotals(ts, 'expense');
  if (!cats.length) return null;
  return cats[0].name; // already sorted desc
};

/** Percentage change between two numbers; null when prev === 0. */
const pctChange = (curr, prev) =>
  prev === 0 ? null : ((curr - prev) / prev) * 100;

/**
 * Day-of-week spending breakdown.
 * Returns [{ name: 'Sun'…'Sat', value }]
 */
const spendByDow = (ts) => {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const acc   = Array(7).fill(0);
  (ts || [])
    .filter((t) => t.type === 'expense')
    .forEach((t) => { acc[new Date(t.date).getDay()] += Number(t.amount || 0); });
  return names.map((name, i) => ({ name, value: acc[i] }));
};

/** The day-of-week object with the highest total spend. */
const peakSpendDay = (ts) => {
  const dow = spendByDow(ts);
  return dow.reduce((a, b) => (b.value > a.value ? b : a), dow[0]);
};

module.exports = {
  sumBy,
  totalIncome,
  totalExpense,
  balance,
  savingsRate,
  monthKey,
  txInMonth,
  categoryTotals,
  monthlySummary,
  avgDailySpend,
  topCategory,
  pctChange,
  spendByDow,
  peakSpendDay,
};
