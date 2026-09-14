import {
  useState
}
from 'react';
import {
  expenseCategories,
  incomeCategories,
  paymentMethods
}
from '../../data/categories';
const blank= {
  type:'expense',
  amount:'',
  category:'',
  description:'',
  date:new Date().toISOString().slice(0,
  10),
  paymentMethod:'UPI',
  notes:''
}
;
export default function TransactionForm( {
  initial,
  onSubmit,
  onCancel
}
) {
  const [f,
  setF]=useState(initial||blank);
  const [err,
  setErr]=useState('');
  const cats=f.type==='income'?incomeCategories:expenseCategories;
  function change(e) {
    const {
      name,
      value
    }
  =e.target;
  setF(x=>( {
    ...x,
    [name]:value,
    ...(name==='type'? {
      category:''
    }
  : {
  }
)
}
))
}
function submit(e) {
  e.preventDefault();
  if(!f.type||!f.category||!f.date||Number(f.amount)<=0) {
    setErr('Please enter a valid amount, type, category and date.');
    return
  }
setErr('');
onSubmit( {
  ...f,
  amount:Number(f.amount)
}
)
}
return <form className="form-grid" onSubmit= {
  submit
}
> {
  err&&<div className="form-error full"> {
    err
  }
</div>
}
<label>Type<select name="type" value= {
  f.type
}
onChange= {
  change
}
><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Amount<input name="amount" type="number" min="0.01" step="0.01" value= {
  f.amount
}
onChange= {
  change
}
placeholder="0"/></label><label>Category<select name="category" value= {
  f.category
}
onChange= {
  change
}
><option value="">Select category</option> {
  cats.map(c=><option key= {
    c
  }
> {
  c
}
</option>)
}
</select></label><label>Date<input name="date" type="date" value= {
  f.date
}
onChange= {
  change
}
/></label><label>Description<input name="description" value= {
  f.description
}
onChange= {
  change
}
placeholder="e.g. Grocery shopping"/></label><label>Payment Method<select name="paymentMethod" value= {
  f.paymentMethod
}
onChange= {
  change
}
> {
  paymentMethods.map(x=><option key= {
    x
  }
> {
  x
}
</option>)
}
</select></label><label className="full">Notes<textarea name="notes" value= {
  f.notes
}
onChange= {
  change
}
rows="3" placeholder="Optional notes"/></label><div className="form-actions full"><button className="btn secondary" type="button" onClick= {
  onCancel
}
>Cancel</button><button className="btn primary"> {
  initial?'Update':'Add'
}
Transaction</button></div></form>
}
