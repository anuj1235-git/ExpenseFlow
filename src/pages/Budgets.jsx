import {
  useState
}
from 'react';
import {
  Plus,
  Trash2
}
from 'lucide-react';
import {
  useExpense
}
from '../context/ExpenseContext';
import {
  totalExpense
}
from '../utils/calculations';
import {
  formatCurrency
}
from '../utils/formatCurrency';
import {
  expenseCategories
}
from '../data/categories';
import Modal from '../components/ui/Modal';
export default function Budgets() {
  const {
    budgets,
    addBudget,
    deleteBudget,
    transactions
  }
=useExpense();
const [open,
setOpen]=useState(false),
[category,
setCategory]=useState('Food'),
[amount,
setAmount]=useState('');
const spentBy=c=>transactions.filter(t=>t.type==='expense'&&t.category===c).reduce((s,
t)=>s+Number(t.amount),
0);
return <><div className="page-title"><div><p className="eyebrow">Plan & Control</p><h1>Budgets</h1></div><button className="btn primary" onClick= {
  ()=>setOpen(true)
}
><Plus size= {
  18
}
/> Set Budget</button></div><div className="budget-grid"> {
  Object.keys(budgets).length?Object.entries(budgets).map(([c,
  b])=> {
    const spent=spentBy(c),
    pct=Math.min(100,
    spent/b*100),
    state=pct>=100?'over':pct>=80?'warn':'';
    return <section className="card budget-card" key= {
      c
    }
  ><div className="budget-head"><div><h3> {
    c
  }
</h3><small> {
  formatCurrency(spent)
}
spent of {
  formatCurrency(b)
}
</small></div><button className="icon-btn danger" onClick= {
  ()=>deleteBudget(c)
}
><Trash2 size= {
  16
}
/></button></div><div className="progress"><span className= {
  state
}
style= {
  {
    width:`${pct}%`
  }
}
/></div><div className="budget-meta"><span> {
  pct.toFixed(0)
}
% used</span><strong className= {
  state
}
> {
  spent>b?'Exceeded':formatCurrency(b-spent)+' remaining'
}
</strong></div> {
  state&&<div className= {
    `notice ${state}`
  }
> {
  state==='warn'?'Budget is 80%+ used.':'Budget exceeded.'
}
</div>
}
</section>
}
) : <div className="empty full-span"><h3>No budgets yet</h3><p>Create category budgets to keep spending on track.</p></div>
}
</div><Modal open= {
  open
}
title="Set monthly budget" onClose= {
  ()=>setOpen(false)
}
actions= {
  <><button className="btn secondary" onClick= {
    ()=>setOpen(false)
  }
>Cancel</button><button className="btn primary" onClick= {
  ()=> {
    if(Number(amount)>0) {
      addBudget( {
        category,
        amount
      }
    );
    setAmount('');
    setOpen(false)
  }
}
}
>Save Budget</button></>
}
><div className="form-grid"><label>Category<select value= {
  category
}
onChange= {
  e=>setCategory(e.target.value)
}
> {
  expenseCategories.map(c=><option key= {
    c
  }
> {
  c
}
</option>)
}
</select></label><label>Budget Amount<input type="number" min="1" value= {
  amount
}
onChange= {
  e=>setAmount(e.target.value)
}
placeholder="0"/></label></div></Modal></>
}
