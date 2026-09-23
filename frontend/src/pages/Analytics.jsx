import { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Minus,
  Lightbulb, CalendarDays, ShoppingBag,
  PiggyBank, Activity, Award
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import {
  categoryTotals,
  currentMonthKey,
  prevMonthKey,
  txInMonth,
  totalIncome,
  totalExpense,
  savingsRate,
  avgDailySpend,
  topCategory,
  pctChange,
  peakSpendDay,
} from '../utils/calculations';
import { formatCurrency } from '../utils/formatCurrency';
import { CategoryChart, MonthlyBar, IncomeExpenseLine } from '../components/charts/Charts';

export default function Analytics() {
  const { transactions } = useExpense();

  const cat = categoryTotals(transactions);

  const months = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const k = t.date.slice(0, 7);
      if (!map[k]) map[k] = { name: k.slice(5), income: 0, expense: 0 };
      map[k][t.type] += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name)).slice(-6);
  }, [transactions]);

  // ── Insight calculations ──────────────────────────────────────────────────
  const curKey  = currentMonthKey();
  const prevKey = prevMonthKey();
  const curTx   = useMemo(() => txInMonth(transactions, curKey),  [transactions, curKey]);
  const prevTx  = useMemo(() => txInMonth(transactions, prevKey), [transactions, prevKey]);

  const curExpense  = totalExpense(curTx);
  const prevExpense = totalExpense(prevTx);
  const curIncome   = totalIncome(curTx);
  const expChange   = pctChange(curExpense, prevExpense);
  const savings     = savingsRate(curTx);
  const dailyAvg    = avgDailySpend(curTx);
  const topCat      = topCategory(transactions);
  const peakDay     = peakSpendDay(transactions);

  // Category shift: compare this-month vs last-month for top category
  const topCatCur  = useMemo(() =>
    curTx.filter(t => t.type === 'expense' && t.category === topCat)
         .reduce((s, t) => s + Number(t.amount), 0),
    [curTx, topCat]);
  const topCatPrev = useMemo(() =>
    prevTx.filter(t => t.type === 'expense' && t.category === topCat)
          .reduce((s, t) => s + Number(t.amount), 0),
    [prevTx, topCat]);
  const topCatChange = pctChange(topCatCur, topCatPrev);

  const insights = useMemo(() => {
    const list = [];

    if (expChange !== null) {
      if (expChange > 0) {
        list.push({
          icon: TrendingUp,
          color: '#dc2626',
          text: `You spent ${Math.abs(expChange).toFixed(1)}% more this month than last month (${formatCurrency(curExpense)} vs ${formatCurrency(prevExpense)}).`,
        });
      } else if (expChange < 0) {
        list.push({
          icon: TrendingDown,
          color: '#16a34a',
          text: `Great job — you cut spending by ${Math.abs(expChange).toFixed(1)}% compared to last month (${formatCurrency(curExpense)} vs ${formatCurrency(prevExpense)}).`,
        });
      } else {
        list.push({
          icon: Minus,
          color: '#64748b',
          text: `Your spending is the same as last month (${formatCurrency(curExpense)}).`,
        });
      }
    }

    if (savings > 0) {
      list.push({
        icon: PiggyBank,
        color: savings >= 30 ? '#16a34a' : savings >= 15 ? '#d97706' : '#dc2626',
        text: savings >= 30
          ? `Excellent! You saved ${savings.toFixed(1)}% of your income this month.`
          : savings >= 15
          ? `You saved ${savings.toFixed(1)}% of your income this month. Aim for 30%+.`
          : `You only saved ${savings.toFixed(1)}% of your income this month. Try to reduce expenses.`,
      });
    }

    if (topCat) {
      const catMsg = topCatChange !== null && Math.abs(topCatChange) >= 5
        ? ` — ${topCatChange > 0 ? 'up' : 'down'} ${Math.abs(topCatChange).toFixed(1)}% vs last month`
        : '';
      list.push({
        icon: ShoppingBag,
        color: '#7c3aed',
        text: `Your highest spending category is ${topCat}${catMsg}.`,
      });
    }

    if (dailyAvg > 0) {
      list.push({
        icon: CalendarDays,
        color: '#0891b2',
        text: `Your average daily spending this month is ${formatCurrency(dailyAvg)}.`,
      });
    }

    if (peakDay && peakDay.value > 0) {
      list.push({
        icon: Activity,
        color: '#ea580c',
        text: `You spend the most on ${peakDay.name}s — ${formatCurrency(peakDay.value)} total across all time.`,
      });
    }

    if (curIncome > 0 && curExpense === 0) {
      list.push({
        icon: Award,
        color: '#16a34a',
        text: `No expenses recorded this month yet. Keep it up!`,
      });
    }

    return list;
  }, [expChange, savings, topCat, topCatChange, dailyAvg, peakDay, curExpense, prevExpense, curIncome]);

  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">Insights</p>
          <h1>Analytics</h1>
        </div>
      </div>

      {/* ── Financial Insights ── */}
      {insights.length > 0 && (
        <section className="card insights-card">
          <div className="card-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={18} color="#f59e0b" /> Financial Insights
            </h2>
          </div>
          <div className="insights-grid">
            {insights.map((ins, i) => (
              <div className="insight-item" key={i}>
                <div className="insight-icon" style={{ background: ins.color + '18', color: ins.color }}>
                  <ins.icon size={18} />
                </div>
                <p>{ins.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Charts ── */}
      <div className="chart-grid" style={{ marginTop: 20 }}>
        <section className="card">
          <div className="card-head"><h2>Expense by Category</h2></div>
          <CategoryChart data={cat} />
        </section>
        <section className="card">
          <div className="card-head"><h2>Monthly Expenses</h2></div>
          <MonthlyBar data={months} />
        </section>
        <section className="card full-span">
          <div className="card-head"><h2>Income vs Expense</h2></div>
          <IncomeExpenseLine data={months} />
        </section>
      </div>
    </>
  );
}
