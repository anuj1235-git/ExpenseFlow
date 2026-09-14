import {
  useState
}
from 'react';
import {
  Link,
  useNavigate
}
from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  WalletCards,
  BarChart3,
  ShieldCheck
}
from 'lucide-react';
import {
  useAuth
}
from '../context/AuthContext';
export default function Login() {
  const navigate =
  useNavigate();
  const {
    login
  }
= useAuth();
const [
email,
setEmail
] = useState('');
const [
password,
setPassword
] = useState('');
const [
showPassword,
setShowPassword
] = useState(false);
const [
error,
setError
] = useState('');
function handleSubmit(e) {
  e.preventDefault();
  setError('');
  if (!email.trim()) {
    setError(
    'Please enter your email address.'
    );
    return;
  }
if (!password) {
  setError(
  'Please enter your password.'
  );
  return;
}
try {
  login( {
    email,
    password
  }
);
navigate('/');
}
catch (err) {
  setError(
  err.message ||
  'Unable to sign in. Please try again.'
  );
}
}
return (
<div className="auth-page">
<section className="auth-brand-panel">
<div className="auth-brand">
<div className="auth-logo">
₹
</div>
<div>
<strong>
ExpenseFlow
</strong>
<span>
Personal Finance
</span>
</div>
</div>
<div className="auth-hero">
<p className="auth-eyebrow">
PERSONAL FINANCE,
SIMPLIFIED
</p>
<h1>
Take control of your
money,
one expense
at a time.
</h1>
<p className="auth-description">
Track spending,
manage
budgets and understand your
financial habits from one
beautiful dashboard.
</p>
<div className="auth-features">
<div>
<WalletCards
size= {
  18
}
/>
<span>
Track every transaction
</span>
</div>
<div>
<BarChart3
size= {
  18
}
/>
<span>
Understand your spending
</span>
</div>
<div>
<ShieldCheck
size= {
  18
}
/>
<span>
Your data stays in your browser
</span>
</div>
</div>
</div>
</section>
<section className="auth-form-panel">
<div className="auth-form-wrap">
<div className="mobile-auth-brand">
<div className="auth-logo">
₹
</div>
<strong>
ExpenseFlow
</strong>
</div>
<p className="auth-eyebrow">
WELCOME BACK
</p>
<h2>
Sign in to your account
</h2>
<form
className="auth-form"
onSubmit= {
  handleSubmit
}
> {
  error && (
  <div
  className="auth-error"
  role="alert"
  > {
    error
  }
</div>
)
}
<label>
Email address
<div className="input-icon">
<Mail
size= {
  18
}
/>
<input
type="email"
value= {
  email
}
onChange= {
  (e) =>
  setEmail(
  e.target.value
  )
}
placeholder="you@example.com"
autoComplete="email"
/>
</div>
</label>
<label>
Password
<div className="input-icon">
<Lock
size= {
  18
}
/>
<input
type= {
  showPassword
  ? 'text'
  : 'password'
}
value= {
  password
}
onChange= {
  (e) =>
  setPassword(
  e.target.value
  )
}
placeholder="Enter your password"
autoComplete="current-password"
/>
<button
type="button"
className="password-toggle"
onClick= {
  () =>
  setShowPassword(
  !showPassword
  )
}
aria-label= {
  showPassword
  ? 'Hide password'
  : 'Show password'
}
> {
  showPassword ? (
  <EyeOff
  size= {
    18
  }
/>
) : (
<Eye
size= {
  18
}
/>
)
}
</button>
</div>
</label>
<button
className="auth-submit"
type="submit"
>
Sign In
<ArrowRight
size= {
  18
}
/>
</button>
<p className="auth-switch">
Don't have an account?{' '}

              <Link to="/signup">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
