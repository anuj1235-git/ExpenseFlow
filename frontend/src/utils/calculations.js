export const sumBy=(items,
pred)=>(items||[]).filter(pred).reduce((s,
t)=>s+Number(t.amount||0),
0);
export const totalIncome=ts=>sumBy(ts,
t=>t.type==='income');
export const totalExpense=ts=>sumBy(ts,
t=>t.type==='expense');
export const balance=ts=>totalIncome(ts)-totalExpense(ts);
export const savingsRate=ts=> {
  const i=totalIncome(ts);
  return i?((i-totalExpense(ts))/i)*100:0
}
;
export const monthKey=d=> {
  const x=new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`
}
;
export const monthlyTransactions=(ts,
key)=>(ts||[]).filter(t=>monthKey(t.date)===key);
export const categoryTotals=(ts,
type='expense')=>Object.entries((ts||[]).filter(t=>t.type===type).reduce((a,
t)=>(a[t.category]=(a[t.category]||0)+Number(t.amount||0),
a),
{
}
)).map(([name,
value])=>( {
  name,
  value
}
));
export const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

// ── Financial Insights helpers ──────────────────────────────────────────────

/** All transactions in a given YYYY-MM month */
export const txInMonth=(ts,key)=>(ts||[]).filter(t=>monthKey(t.date)===key);

/** Current and previous month keys relative to today */
export const currentMonthKey=()=>monthKey(new Date().toISOString());
export const prevMonthKey=()=>{
  const d=new Date();
  d.setMonth(d.getMonth()-1);
  return monthKey(d.toISOString());
};

/** Average daily spend for a set of transactions (expense only) */
export const avgDailySpend=(ts)=>{
  const expenses=(ts||[]).filter(t=>t.type==='expense');
  if(!expenses.length)return 0;
  const days=new Set(expenses.map(t=>t.date.slice(0,10))).size;
  return totalExpense(expenses)/days;
};

/** Top spending category name */
export const topCategory=(ts)=>{
  const cats=categoryTotals(ts,'expense');
  if(!cats.length)return null;
  return cats.reduce((a,b)=>b.value>a.value?b:a).name;
};

/** % change between two numbers — positive = increase */
export const pctChange=(curr,prev)=>prev===0?null:((curr-prev)/prev)*100;

/** Day-of-week spending breakdown (0=Sun … 6=Sat) */
export const spendByDow=(ts)=>{
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const acc=Array(7).fill(0);
  (ts||[]).filter(t=>t.type==='expense').forEach(t=>{
    acc[new Date(t.date).getDay()]+=Number(t.amount||0);
  });
  return days.map((name,i)=>({name,value:acc[i]}));
};

/** Which day of the week has the highest spend */
export const peakSpendDay=(ts)=>{
  const dow=spendByDow(ts);
  return dow.reduce((a,b)=>b.value>a.value?b:a,dow[0]);
};
