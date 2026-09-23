/**
 * Budget API service
 * Wraps all /api/budgets endpoints.
 */

import api from './api';

/**
 * Get all budgets for a given month/year, each enriched with spent/remaining.
 * Defaults to current month/year if params are omitted.
 *
 * @param {{ month?: number, year?: number }} params
 * @returns {{ budgets: object[], month: number, year: number }}
 */
export async function getBudgets(params = {}) {
  const res = await api.get('/budgets', { params });
  return res.data; // { budgets, month, year }
}

/**
 * Create or update a budget for a (category, month, year) combination.
 * Mirrors the frontend addBudget() which overwrites the existing one.
 *
 * @param {{ category: string, amount: number, month?: number, year?: number }} data
 * @returns {object} Saved budget document (enriched with spent/remaining)
 */
export async function upsertBudget(data) {
  const res = await api.post('/budgets', data);
  return res.data.budget;
}

/**
 * Update the amount of an existing budget by its MongoDB _id.
 * @param {string} id
 * @param {number} amount
 */
export async function updateBudget(id, amount) {
  const res = await api.put(`/budgets/${id}`, { amount });
  return res.data.budget;
}

/**
 * Delete a budget by its MongoDB _id.
 * @param {string} id
 */
export async function deleteBudgetById(id) {
  const res = await api.delete(`/budgets/${id}`);
  return res;
}

/**
 * Delete a budget by category name for the current month/year.
 * Mirrors the frontend deleteBudget(category) call.
 *
 * @param {string} category
 * @param {{ month?: number, year?: number }} params
 */
export async function deleteBudgetByCategory(category, params = {}) {
  const res = await api.delete(`/budgets/category/${encodeURIComponent(category)}`, { params });
  return res;
}
