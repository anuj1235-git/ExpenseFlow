/**
 * Analytics API service
 * Wraps all /api/analytics endpoints.
 */

import api from './api';

/**
 * All-time summary: totalIncome, totalExpense, balance, savingsRate,
 * currentMonth figures, and budget totals.
 * Powers the Dashboard summary cards.
 */
export async function getSummary() {
  const res = await api.get('/analytics/summary');
  return res.data; // { totalIncome, totalExpense, balance, ... }
}

/**
 * Monthly income/expense/savings breakdown for a full year.
 * Returns 12 objects (Jan–Dec).
 *
 * @param {number} year  e.g. 2026
 * @returns {{ year: number, months: object[] }}
 */
export async function getMonthly(year) {
  const res = await api.get('/analytics/monthly', { params: { year } });
  return res.data; // { year, months: [{ month, monthName, key, income, expense, savings, savingsRate }] }
}

/**
 * Category-wise spending totals (for the pie chart).
 *
 * @param {{ month?: number, year?: number, type?: 'expense'|'income'|'all' }} params
 * @returns {{ categories: [{ name, value }][], type, month, year }}
 */
export async function getCategories(params = {}) {
  const res = await api.get('/analytics/categories', { params });
  return res.data;
}

/**
 * Trend insights: current/prev month comparison, top category, peak day,
 * last-6-months chart data.
 * Powers Analytics.jsx.
 */
export async function getTrends() {
  const res = await api.get('/analytics/trends');
  return res.data;
}

/**
 * Export all transactions as a clean array.
 * Used for JSON and CSV export in Settings.
 *
 * @returns {{ transactions: object[], count: number }}
 */
export async function getExport() {
  const res = await api.get('/analytics/export');
  return res.data; // { transactions, count }
}
