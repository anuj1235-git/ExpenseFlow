import {
  useMemo,
  useState
}
from 'react';
import {
  useExpense
}
from '../context/ExpenseContext';
import {
  monthlyTransactions,
  categoryTotals,
  totalIncome,
  totalExpense
}
from '../utils/calculations';
import {
  formatCurrency
}
from '../utils/formatCurrency';
import SummaryCard from '../components/ui/SummaryCard';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank
}
from 'lucide-react';
export default function MonthlySummary() {
  const {
    transactions
  }
=useExpense();
const now=new Date();
const [key,
setKey]=useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
const list=monthlyTransactions(transactions,
key),
inc=totalIncome(list),
exp=totalExpense(list),
cats=categoryTotals(list),
top=cats.sort((a,
b)=>b.value-a.value)[0];
const avg=exp?exp/new Date(now.getFullYear(),
now.getMonth()+1,
0).getDate():0;
return <><div className="page-title"><div><p className="eyebrow">Review</p><h1>Monthly Summary</h1></div><input className="month-input" type="month" value= {
  key
}
onChange= {
  e=>setKey(e.target.value)
}
/></div><div className="summary-grid"><SummaryCard title="Total Income" value= {
  formatCurrency(inc)
}
icon= {
  ArrowDownToLine
}
meta="Selected month"/><SummaryCard title="Total Expenses" value= {
  formatCurrency(exp)
}
icon= {
  ArrowUpFromLine
}
meta="Selected month" positive= {
  false
}
/><SummaryCard title="Net Savings" value= {
  formatCurrency(inc-exp)
}
icon= {
  PiggyBank
}
meta= {
  inc?`${((inc-exp)/inc*100).toFixed(1)}% savings rate`:'No income'
}
/><SummaryCard title="Transactions" value= {
  list.length
}
icon= {
  Wallet
}
meta= {
  `Avg. daily spend ${formatCurrency(avg)}`
}
/></div><section className="card"><div className="card-head"><h2>Monthly Insights</h2></div><div className="insight-grid"><div><span>Highest spending category</span><strong> {
  top?.name||'—'
}
</strong><small> {
  top?formatCurrency(top.value):'No expenses'
}
</small></div><div><span>Net result</span><strong> {
  formatCurrency(inc-exp)
}
</strong><small>Income minus expenses</small></div><div><span>Transaction count</span><strong> {
  list.length
}
</strong><small>For selected month</small></div></div></section></>
}
