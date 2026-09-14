import {
  useState
}
from 'react';
import {
  Link,
  Navigate,
  useNavigate
}
from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserRound,
  ArrowRight
}
from 'lucide-react';
import {
  useAuth
}
from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
export default function Signup() {
  const {
    user,
    signup
  }
= useAuth();
const navigate = useNavigate();
const [form,
setForm] = useState( {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
}
);
const [showPassword,
setShowPassword] = useState(false);
const [error,
setError] = useState('');
if (user) return <Navigate to="/" replace />;
const submit = (e) => {
  e.preventDefault();
  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match.');
    return;
  }
const result = signup(form);
if (!result.ok) {
  setError(result.error);
  return;
}
navigate('/',
{
  replace: true
}
);
}
;
return (
<AuthLayout title="GET STARTED" subtitle="Create your ExpenseFlow account">
<form className="auth-form" onSubmit= {
  submit
}
> {
  error && <div className="auth-error"> {
    error
  }
</div>
}
<label>
Full name
<div className="input-icon">
<UserRound size= {
  17
}
/>
<input
value= {
  form.name
}
onChange= {
  (e) => setForm( {
    ...form,
    name: e.target.value
  }
)
}
placeholder="Your name"
autoComplete="name"
required
/>
</div>
</label>
<label>
Email address
<div className="input-icon">
<Mail size= {
  17
}
/>
<input
type="email"
value= {
  form.email
}
onChange= {
  (e) => setForm( {
    ...form,
    email: e.target.value
  }
)
}
placeholder="you@example.com"
autoComplete="email"
required
/>
</div>
</label>
<label>
Password
<div className="input-icon">
<Lock size= {
  17
}
/>
<input
type= {
  showPassword ? 'text' : 'password'
}
value= {
  form.password
}
onChange= {
  (e) => setForm( {
    ...form,
    password: e.target.value
  }
)
}
placeholder="At least 6 characters"
autoComplete="new-password"
minLength= {
  6
}
required
/>
<button type="button" className="password-toggle" onClick= {
  () => setShowPassword(!showPassword)
}
aria-label="Show password"> {
  showPassword ? <EyeOff size= {
    17
  }
/> : <Eye size= {
  17
}
/>
}
</button>
</div>
</label>
<label>
Confirm password
<div className="input-icon">
<Lock size= {
  17
}
/>
<input
type= {
  showPassword ? 'text' : 'password'
}
value= {
  form.confirmPassword
}
onChange= {
  (e) => setForm( {
    ...form,
    confirmPassword: e.target.value
  }
)
}
placeholder="Repeat your password"
autoComplete="new-password"
required
/>
</div>
</label>
<button className="auth-submit" type="submit">
Create Account <ArrowRight size= {
  18
}
/>
</button>
<p className="auth-switch">
Already have an account? <Link to="/login">Sign in</Link>
</p>
</form>
</AuthLayout>
);
}
