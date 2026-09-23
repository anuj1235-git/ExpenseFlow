import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import * as txService     from '../services/transactionService';
import * as budgetService from '../services/budgetService';
import * as goalService   from '../services/goalService';
import { sampleTransactions } from '../data/sampleData';
import { totalIncome, totalExpense } from '../utils/calculations';

const C = createContext();

/**
 * ExpenseProvider — API-backed data context.
 *
 * Public surface (unchanged from the LocalStorage version so all pages
 * and components continue to work without modification):
 *
 *   transactions  Transaction[]
 *   budgets       { [category]: number }   ← kept as flat object for UI compat
 *   goals         Goal[]
 *   loading       boolean
 *   error         string | null
 *
 *   addTransaction(t)       → Promise
 *   updateTransaction(t)    → Promise
 *   deleteTransaction(id)   → Promise
 *   addBudget({ category, amount })   → Promise
 *   deleteBudget(category)            → Promise
 *   addGoal(g)        → Promise
 *   updateGoal(g)     → Promise
 *   deleteGoal(id)    → Promise
 *   clearAll()        → Promise
 *   importTransactions(incoming[])    → Promise
 *   loadSampleData()  → Promise
 *
 *   totalIncome   number  (derived)
 *   totalExpense  number  (derived)
 *   totalBalance  number  (derived)
 */
export function ExpenseProvider({ children }) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [budgets,      setBudgets]      = useState({}); // { [category]: amount }
  const [goals,        setGoals]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  // ── Load all data whenever the user changes ──────────────────────────────
  useEffect(() => {
    if (!user) {
      // Logged out — wipe local state
      setTransactions([]);
      setBudgets({});
      setGoals([]);
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all three in parallel
        const [txRes, budgetRes, goalRes] = await Promise.all([
          txService.getTransactions({ limit: 1000 }),   // load up to 1000 for client-side filtering
          budgetService.getBudgets(),
          goalService.getGoals(),
        ]);

        if (cancelled) return;

        // txRes shape: { success, data: { transactions }, currentPage, totalPages, totalTransactions }
        setTransactions(txRes.data?.transactions ?? []);

        // budgetRes shape: { budgets: [{ _id, category, amount, spent, remaining, percentUsed }] }
        // Convert to flat { [category]: amount } object to keep UI compatibility
        const flatBudgets = {};
        (budgetRes.budgets ?? []).forEach((b) => {
          flatBudgets[b.category] = b.amount;
        });
        setBudgets(flatBudgets);

        setGoals(goalRes ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Transactions ──────────────────────────────────────────────────────────

  const addTransaction = useCallback(async (t) => {
    const created = await txService.createTransaction(t);
    // Normalise: backend returns _id, frontend uses id; keep both
    const normalised = { ...created, id: created._id?.toString() ?? created.id };
    setTransactions((prev) => [normalised, ...prev]);
    return normalised;
  }, []);

  const updateTransaction = useCallback(async (t) => {
    const updated = await txService.updateTransaction(t._id ?? t.id, t);
    const normalised = { ...updated, id: updated._id?.toString() ?? updated.id };
    setTransactions((prev) =>
      prev.map((x) =>
        (x._id ?? x.id)?.toString() === (normalised._id ?? normalised.id)?.toString()
          ? normalised
          : x
      )
    );
    return normalised;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    await txService.deleteTransaction(id);
    setTransactions((prev) =>
      prev.filter((x) => (x._id ?? x.id)?.toString() !== id?.toString())
    );
  }, []);

  // ── Budgets ───────────────────────────────────────────────────────────────

  const addBudget = useCallback(async ({ category, amount }) => {
    await budgetService.upsertBudget({ category, amount: Number(amount) });
    setBudgets((prev) => ({ ...prev, [category]: Number(amount) }));
  }, []);

  const deleteBudget = useCallback(async (category) => {
    await budgetService.deleteBudgetByCategory(category);
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  }, []);

  // ── Goals ─────────────────────────────────────────────────────────────────

  const addGoal = useCallback(async (g) => {
    const created = await goalService.createGoal(g);
    const normalised = { ...created, id: created._id?.toString() ?? created.id };
    setGoals((prev) => [normalised, ...prev]);
    return normalised;
  }, []);

  const updateGoal = useCallback(async (g) => {
    const updated = await goalService.updateGoal(g._id ?? g.id, g);
    const normalised = { ...updated, id: updated._id?.toString() ?? updated.id };
    setGoals((prev) =>
      prev.map((x) =>
        (x._id ?? x.id)?.toString() === (normalised._id ?? normalised.id)?.toString()
          ? normalised
          : x
      )
    );
    return normalised;
  }, []);

  const deleteGoal = useCallback(async (id) => {
    await goalService.deleteGoal(id);
    setGoals((prev) =>
      prev.filter((x) => (x._id ?? x.id)?.toString() !== id?.toString())
    );
  }, []);

  // ── Bulk operations ───────────────────────────────────────────────────────

  /**
   * Clear all transactions, budgets and goals for the current user.
   * Deletes each transaction individually — no dedicated "clear-all" API endpoint
   * needed (the backend enforces ownership on each delete).
   */
  const clearAll = useCallback(async () => {
    // Delete all transactions in parallel batches of 10
    const ids = transactions.map((t) => t._id ?? t.id);
    for (let i = 0; i < ids.length; i += 10) {
      await Promise.all(ids.slice(i, i + 10).map((id) => txService.deleteTransaction(id)));
    }
    // Delete all budgets by category
    for (const category of Object.keys(budgets)) {
      await budgetService.deleteBudgetByCategory(category);
    }
    // Delete all goals
    for (const g of goals) {
      await goalService.deleteGoal(g._id ?? g.id);
    }
    setTransactions([]);
    setBudgets({});
    setGoals([]);
  }, [transactions, budgets, goals]);

  /**
   * Import an array of transactions (from the LocalStorage migration flow
   * or a JSON file upload). Deduplication is handled server-side.
   */
  const importTransactions = useCallback(async (incoming) => {
    await txService.importTransactions(incoming);
    // Reload fresh from the server so we have proper _id values
    const res = await txService.getTransactions({ limit: 1000 });
    setTransactions(res.data?.transactions ?? []);
  }, []);

  /**
   * Load the built-in sample data set.
   * Creates all sample transactions on the backend, then refreshes state.
   */
  const loadSampleData = useCallback(async () => {
    // Remove existing data first
    const ids = transactions.map((t) => t._id ?? t.id);
    for (let i = 0; i < ids.length; i += 10) {
      await Promise.all(ids.slice(i, i + 10).map((id) => txService.deleteTransaction(id)));
    }
    // Import sample transactions
    await txService.importTransactions(sampleTransactions);
    // Clear budgets and goals
    for (const category of Object.keys(budgets)) {
      await budgetService.deleteBudgetByCategory(category);
    }
    for (const g of goals) {
      await goalService.deleteGoal(g._id ?? g.id);
    }
    // Reload from server
    const res = await txService.getTransactions({ limit: 1000 });
    setTransactions(res.data?.transactions ?? []);
    setBudgets({});
    setGoals([]);
  }, [transactions, budgets, goals]);

  // ── Derived totals (kept for Dashboard + other consumers) ────────────────
  const inc = useMemo(() => totalIncome(transactions),  [transactions]);
  const exp = useMemo(() => totalExpense(transactions), [transactions]);
  const bal = useMemo(() => inc - exp,                  [inc, exp]);

  const value = useMemo(
    () => ({
      // Data
      transactions,
      budgets,
      goals,
      loading,
      error,
      // Transactions
      addTransaction,
      updateTransaction,
      deleteTransaction,
      // Budgets
      addBudget,
      deleteBudget,
      // Goals
      addGoal,
      updateGoal,
      deleteGoal,
      // Bulk
      clearAll,
      importTransactions,
      loadSampleData,
      // Derived (kept identical to old API)
      totalIncome : inc,
      totalExpense: exp,
      totalBalance: bal,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, budgets, goals, loading, error, inc, exp, bal]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useExpense = () => useContext(C);
