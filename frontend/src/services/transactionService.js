/**
 * Transaction API service
 * Wraps all /api/transactions endpoints.
 */

import api from './api';

/**
 * Fetch paginated + filtered transactions.
 *
 * @param {object} params - Any combination of:
 *   search, type, category, paymentMethod,
 *   startDate, endDate, amtMin, amtMax,
 *   sort, page, limit
 * @returns {{ transactions, currentPage, totalPages, totalTransactions }}
 */
export async function getTransactions(params = {}) {
  const res = await api.get('/transactions', { params });
  return res; // { success, data: { transactions }, currentPage, totalPages, totalTransactions }
}

/**
 * Fetch a single transaction by its MongoDB _id.
 * @param {string} id
 */
export async function getTransactionById(id) {
  const res = await api.get(`/transactions/${id}`);
  return res.data.transaction;
}

/**
 * Create a new transaction.
 * @param {{ type, amount, category, date, description?, paymentMethod?, notes? }} data
 * @returns {object} Created transaction document
 */
export async function createTransaction(data) {
  const res = await api.post('/transactions', data);
  return res.data.transaction;
}

/**
 * Update an existing transaction.
 * @param {string} id  - MongoDB _id of the transaction
 * @param {object} data - Fields to update (all optional)
 * @returns {object} Updated transaction document
 */
export async function updateTransaction(id, data) {
  const res = await api.put(`/transactions/${id}`, data);
  return res.data.transaction;
}

/**
 * Delete a transaction.
 * @param {string} id
 */
export async function deleteTransaction(id) {
  const res = await api.delete(`/transactions/${id}`);
  return res; // { success, message }
}

/**
 * Bulk-import transactions from LocalStorage migration.
 * The backend deduplicates by skipping records it cannot save.
 *
 * @param {object[]} transactions - Array of transaction objects from LocalStorage
 * @returns {{ imported: number, skipped: number }}
 */
export async function importTransactions(transactions) {
  const res = await api.post('/transactions/import', { transactions });
  return res.data; // { imported, skipped }
}
