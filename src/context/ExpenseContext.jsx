import {
  createContext,
  useContext,
  useMemo,
  useState
}
from 'react';
import {
  readStorage,
  writeStorage,
  removeStorage
}
from '../utils/storage';
import {
  sampleTransactions
}
from '../data/sampleData';
import {
  totalIncome,
  totalExpense,
  balance,
  uid
}
from '../utils/calculations';
import {
  useAuth
}
from './AuthContext';
const C = createContext();
export function ExpenseProvider( {
  children
}
) {
  const {
    user
  }
= useAuth();
const prefix = user ? `expenseflow_${user.id}` : 'expenseflow_guest';
const transactionKey = `${prefix}_transactions`;
const budgetKey = `${prefix}_budgets`;
const goalKey = `${prefix}_goals`;
const [transactions,
setTransactions] = useState([]);
const [budgets,
setBudgets] = useState( {
}
);
const [goals,
setGoals] = useState([]);
// Reset/load when account changes.
useState(() => {
  if (user) {
    const existing = readStorage(transactionKey,
    null);
    setTransactions(existing ?? sampleTransactions);
    setBudgets(readStorage(budgetKey,
    {
    }
  ));
  setGoals(readStorage(goalKey,
  []));
}
else {
  setTransactions([]);
  setBudgets( {
  }
);
setGoals([]);
}
}
);
// The provider can be mounted before auth changes; derive a fresh key by
// keeping all writes scoped to the current user's id.
const persistTransactions = (next) => {
  setTransactions(next);
  writeStorage(transactionKey,
  next);
}
;
const addTransaction = (t) => persistTransactions([ {
  ...t,
  id: uid()
}
,
...transactions]);
const updateTransaction = (t) => persistTransactions(transactions.map((x) => x.id === t.id ? t : x));
const deleteTransaction = (id) => persistTransactions(transactions.filter((t) => t.id !== id));
const addBudget = (b) => {
  const next = {
    ...budgets,
    [b.category]: Number(b.amount)
  }
;
setBudgets(next);
writeStorage(budgetKey,
next);
}
;
const deleteBudget = (category) => {
  const next = {
    ...budgets
  }
;
delete next[category];
setBudgets(next);
writeStorage(budgetKey,
next);
}
;
const addGoal = (g) => {
  const next = [...goals,
  {
    ...g,
    id: uid()
  }
];
setGoals(next);
writeStorage(goalKey,
next);
}
;
const updateGoal = (g) => {
  const next = goals.map((x) => x.id === g.id ? g : x);
  setGoals(next);
  writeStorage(goalKey, next);
};
const deleteGoal = (id) => {
  const next = goals.filter((g) => g.id !== id);
  setGoals(next);
  writeStorage(goalKey, next);
};
const clearAll = () => {
  setTransactions([]);
  setBudgets( {
  }
);
setGoals([]);
removeStorage(transactionKey);
removeStorage(budgetKey);
removeStorage(goalKey);
}
;
// Replace all transactions with imported ones (merges unique ids to avoid duplicates)
const importTransactions = (incoming) => {
  const existingIds = new Set(transactions.map((t) => t.id));
  const merged = [
    ...incoming.filter((t) => !existingIds.has(t.id)),
    ...transactions,
  ];
  persistTransactions(merged);
}
;
// Reset transactions to the built-in sample data set
const loadSampleData = () => {
  persistTransactions(sampleTransactions);
  setBudgets({});
  setGoals([]);
  writeStorage(budgetKey, {});
  writeStorage(goalKey, []);
}
;
const value = useMemo(() => ( {
  transactions,
  budgets,
  goals,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addBudget,
  deleteBudget,
  addGoal,
  updateGoal,
  deleteGoal,
  clearAll,
  importTransactions,
  loadSampleData,
  totalIncome: totalIncome(transactions),
  totalExpense: totalExpense(transactions),
  totalBalance: balance(transactions),
}
),
[transactions,
budgets,
goals,
transactionKey,
budgetKey,
goalKey]);
return <C.Provider value= {
  value
}
> {
  children
}
</C.Provider>;
}
export const useExpense = () => useContext(C);
