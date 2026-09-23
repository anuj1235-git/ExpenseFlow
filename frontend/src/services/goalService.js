/**
 * Goal API service
 * Wraps all /api/goals endpoints.
 */

import api from './api';

/**
 * Get all goals for the current user.
 * @returns {object[]} Array of goal documents
 */
export async function getGoals() {
  const res = await api.get('/goals');
  return res.data.goals;
}

/**
 * Create a new goal.
 * @param {{ name, targetAmount, savedAmount?, targetDate?, notes? }} data
 * @returns {object} Created goal document
 */
export async function createGoal(data) {
  const res = await api.post('/goals', data);
  return res.data.goal;
}

/**
 * Update an existing goal.
 * @param {string} id   - MongoDB _id of the goal
 * @param {object} data - Fields to update (all optional)
 * @returns {object} Updated goal document
 */
export async function updateGoal(id, data) {
  const res = await api.put(`/goals/${id}`, data);
  return res.data.goal;
}

/**
 * Delete a goal.
 * @param {string} id
 */
export async function deleteGoal(id) {
  const res = await api.delete(`/goals/${id}`);
  return res;
}
