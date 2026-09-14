import { useState } from 'react';
import { Plus, Pencil, Trash2, Target, CheckCircle2, Clock } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatCurrency';
import Modal from '../components/ui/Modal';

const BLANK = {
  name: '',
  targetAmount: '',
  savedAmount: '',
  targetDate: '',
  notes: '',
};

function GoalForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState(initial || BLANK);
  const [err, setErr] = useState('');

  const change = e => setF(x => ({ ...x, [e.target.name]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) { setErr('Goal name is required.'); return; }
    if (Number(f.targetAmount) <= 0) { setErr('Target amount must be greater than 0.'); return; }
    const saved = Number(f.savedAmount) || 0;
    if (saved < 0) { setErr('Saved amount cannot be negative.'); return; }
    if (saved > Number(f.targetAmount)) { setErr('Saved amount cannot exceed target amount.'); return; }
    setErr('');
    onSubmit({
      ...f,
      targetAmount: Number(f.targetAmount),
      savedAmount: saved,
    });
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      {err && <div className="form-error full">{err}</div>}

      <label className="full">
        Goal Name
        <input
          name="name"
          value={f.name}
          onChange={change}
          placeholder="e.g. Emergency Fund"
          maxLength={60}
        />
      </label>

      <label>
        Target Amount
        <input
          name="targetAmount"
          type="number"
          min="1"
          step="1"
          value={f.targetAmount}
          onChange={change}
          placeholder="0"
        />
      </label>

      <label>
        Already Saved
        <input
          name="savedAmount"
          type="number"
          min="0"
          step="1"
          value={f.savedAmount}
          onChange={change}
          placeholder="0"
        />
      </label>

      <label>
        Target Date
        <input
          name="targetDate"
          type="date"
          value={f.targetDate}
          onChange={change}
          min={new Date().toISOString().slice(0, 10)}
        />
      </label>

      <label>
        Notes
        <input
          name="notes"
          value={f.notes}
          onChange={change}
          placeholder="Optional"
        />
      </label>

      <div className="form-actions full">
        <button className="btn secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn primary">{initial ? 'Update Goal' : 'Create Goal'}</button>
      </div>
    </form>
  );
}

function daysLeft(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function GoalCard({ goal, onEdit, onDelete }) {
  const pct = Math.min(100, goal.targetAmount > 0
    ? (goal.savedAmount / goal.targetAmount) * 100
    : 0);
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const done = pct >= 100;
  const days = daysLeft(goal.targetDate);

  const barColor = done
    ? '#16a34a'
    : pct >= 75
    ? '#0891b2'
    : pct >= 40
    ? '#7c3aed'
    : '#f59e0b';

  return (
    <section className="card goal-card">
      <div className="goal-card-head">
        <div className="goal-icon" style={{ background: barColor + '18', color: barColor }}>
          {done ? <CheckCircle2 size={20} /> : <Target size={20} />}
        </div>
        <div className="goal-title">
          <h3>{goal.name}</h3>
          {goal.targetDate && (
            <small className={days !== null && days < 0 ? 'overdue' : ''}>
              {days === null ? '' : days < 0
                ? `${Math.abs(days)} days overdue`
                : days === 0
                ? 'Due today'
                : `${days} days left`}
            </small>
          )}
        </div>
        <div className="goal-actions">
          <button className="icon-btn" onClick={() => onEdit(goal)} aria-label="Edit goal">
            <Pencil size={15} />
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(goal.id)} aria-label="Delete goal">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="goal-progress-wrap">
        <div className="progress">
          <span style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <div className="goal-pct" style={{ color: barColor }}>
          {pct.toFixed(0)}%
        </div>
      </div>

      {/* Amounts */}
      <div className="goal-amounts">
        <div>
          <span>Saved</span>
          <strong>{formatCurrency(goal.savedAmount)}</strong>
        </div>
        <div>
          <span>Target</span>
          <strong>{formatCurrency(goal.targetAmount)}</strong>
        </div>
        <div>
          <span>Remaining</span>
          <strong className={done ? 'positive' : ''}>{done ? 'Achieved!' : formatCurrency(remaining)}</strong>
        </div>
      </div>

      {/* Daily savings suggestion */}
      {!done && days !== null && days > 0 && remaining > 0 && (
        <div className="notice goal-suggestion">
          <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
          Save {formatCurrency(Math.ceil(remaining / days))} / day to reach your goal on time.
        </div>
      )}

      {goal.notes && <p className="goal-notes">{goal.notes}</p>}
    </section>
  );
}

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useExpense();
  const [openForm, setOpenForm]   = useState(false);
  const [edit, setEdit]           = useState(null);
  const [del,  setDel]            = useState(null);

  const achieved = goals.filter(g => g.savedAmount >= g.targetAmount).length;

  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">Track Progress</p>
          <h1>Goals</h1>
        </div>
        <button className="btn primary" onClick={() => setOpenForm(true)}>
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Stats strip */}
      {goals.length > 0 && (
        <div className="goals-stats">
          <div className="goal-stat">
            <strong>{goals.length}</strong><span>Total Goals</span>
          </div>
          <div className="goal-stat">
            <strong className="positive">{achieved}</strong><span>Achieved</span>
          </div>
          <div className="goal-stat">
            <strong>{goals.length - achieved}</strong><span>In Progress</span>
          </div>
          <div className="goal-stat">
            <strong>{formatCurrency(goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0))}</strong>
            <span>Total Target</span>
          </div>
          <div className="goal-stat">
            <strong className="positive">
              {formatCurrency(goals.reduce((s, g) => s + Number(g.savedAmount || 0), 0))}
            </strong>
            <span>Total Saved</span>
          </div>
        </div>
      )}

      {/* Goal cards grid */}
      {goals.length ? (
        <div className="goals-grid">
          {goals.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={g => { setEdit(g); setOpenForm(false); }}
              onDelete={id => setDel(id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty card" style={{ marginTop: 8 }}>
          <div className="empty-icon"><Target size={22} /></div>
          <h3>No goals yet</h3>
          <p>Set a financial goal — emergency fund, vacation, new laptop — and track your progress.</p>
          <button className="btn primary" style={{ margin: '12px auto 0' }} onClick={() => setOpenForm(true)}>
            <Plus size={16} /> Create your first goal
          </button>
        </div>
      )}

      {/* Create modal */}
      <Modal open={openForm} title="New Goal" onClose={() => setOpenForm(false)}>
        <GoalForm
          onSubmit={g => { addGoal(g); setOpenForm(false); }}
          onCancel={() => setOpenForm(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!edit} title="Edit Goal" onClose={() => setEdit(null)}>
        <GoalForm
          initial={edit}
          onSubmit={g => { updateGoal(g); setEdit(null); }}
          onCancel={() => setEdit(null)}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!del}
        title="Delete goal?"
        onClose={() => setDel(null)}
        actions={
          <>
            <button className="btn secondary" onClick={() => setDel(null)}>Cancel</button>
            <button className="btn danger-btn" onClick={() => { deleteGoal(del); setDel(null); }}>
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this goal? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
