import {
  Link
}
from 'react-router-dom';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  Plus
}
from 'lucide-react';
import {
  useExpense
}
from '../context/ExpenseContext';
import {
  formatCurrency
}
from '../utils/formatCurrency';
import SummaryCard from '../components/ui/SummaryCard';
import {
  categoryTotals
}
from '../utils/calculations';
import {
  CategoryChart
}
from '../components/charts/Charts';
export default function Dashboard() {
  const {
    transactions,
    budgets,
    totalIncome,
    totalExpense,
    totalBalance
  }
=useExpense();
const spent=totalExpense;
const budgetTotal=Object.values(budgets).reduce((a,
b)=>a+Number(b),
0);
const recent=transactions.slice(0,
5);
return <><div className="page-title"><div><p className="eyebrow">Overview</p><h1>Dashboard</h1></div><Link className="btn primary" to="/add-transaction"><Plus size= {
  18
}
/> Add Transaction</Link></div><div className="summary-grid"><SummaryCard title="Total Balance" value= {
  formatCurrency(totalBalance)
}
icon= {
  Wallet
}
meta="Current balance"/><SummaryCard title="Total Income" value= {
  formatCurrency(totalIncome)
}
icon= {
  ArrowDownToLine
}
meta="All income"/><SummaryCard title="Total Expenses" value= {
  formatCurrency(totalExpense)
}
icon= {
  ArrowUpFromLine
}
meta="All expenses" positive= {
  false
}
/><SummaryCard title="Remaining Budget" value= {
  formatCurrency(Math.max(0,
  budgetTotal-spent))
}
icon= {
  PiggyBank
}
meta= {
  budgetTotal?`${Math.round(spent/budgetTotal*100)}% used`:'No budget set'
}
/></div><div className="two-col"><section className="card"><div className="card-head"><h2>Recent Transactions</h2><Link to="/transactions">View all</Link></div> {
  recent.length?<div className="recent-list"> {
    recent.map(t=><div className="recent-row" key= {
      t.id
    }
  ><div className="recent-avatar"> {
    t.category[0]
  }
</div><div><strong> {
  t.description||t.category
}
</strong><small> {
  t.category
}
· {
  t.date
}
</small></div><b className= {
  t.type==='income'?'income':'expense'
}
> {
  t.type==='income'?'+':'-'
}
{
  formatCurrency(t.amount)
}
</b></div>)
}
</div>:<div className="empty"><h3>No transactions yet</h3></div>
}
</section><section className="card"><div className="card-head"><h2>Spending by Category</h2><Link to="/analytics">Details</Link></div> {
  transactions.length?<CategoryChart data= {
    categoryTotals(transactions)
  }
/>:<div className="empty"><h3>No analytics yet</h3></div>
}
</section></div></>
}
