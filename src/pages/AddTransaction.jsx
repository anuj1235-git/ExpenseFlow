import {
  useNavigate
}
from 'react-router-dom';
import {
  useExpense
}
from '../context/ExpenseContext';
import TransactionForm from '../components/transactions/TransactionForm';
export default function AddTransaction() {
  const nav=useNavigate();
  const {
    addTransaction
  }
=useExpense();
return <><div className="page-title"><div><p className="eyebrow">New Entry</p><h1>Add Transaction</h1></div></div><section className="card form-card"><TransactionForm onSubmit= {
  t=> {
    addTransaction(t);
    nav('/transactions')
  }
}
onCancel= {
  ()=>nav('/transactions')
}
/></section></>
}
