import {
  WalletCards,
  ShieldCheck,
  BarChart3
}
from 'lucide-react';
import "../../styles/auth.css";
export default function AuthLayout( {
  children,
  title,
  subtitle
}
) {
  return (
  <div className="auth-page">
  <div className="auth-brand-panel">
  <div className="auth-brand">
  <div className="auth-logo">₹</div>
  <div>
  <strong>ExpenseFlow</strong>
  <span>Personal Finance</span>
  </div>
  </div>
  <div className="auth-hero">
  <p className="eyebrow auth-eyebrow">PERSONAL FINANCE,
  SIMPLIFIED</p>
  <h1>Take control of your money,
  one expense at a time.</h1>
  <p className="auth-description">
  Track spending,
  manage budgets and understand your financial habits
  from one beautiful dashboard.
  </p>
  <div className="auth-features">
  <div><WalletCards size= {
    18
  }
/><span>Track every transaction</span></div>
<div><BarChart3 size= {
  18
}
/><span>Understand your spending</span></div>
<div><ShieldCheck size= {
  18
}
/><span>Your data stays in your browser</span></div>
</div>
</div>
</div>
<div className="auth-form-panel">
<div className="auth-form-wrap">
<div className="mobile-auth-brand">
<div className="auth-logo">₹</div>
<strong>ExpenseFlow</strong>
</div>
<p className="eyebrow"> {
  title
}
</p>
<h2> {
  subtitle
}
</h2> {
  children
}
</div>
</div>
</div>
);
}
