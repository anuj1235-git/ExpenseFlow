import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, UserRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name           : '',
    email          : '',
    password       : '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  // Already logged in — redirect to dashboard
  if (user) return <Navigate to="/" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name    : form.name,
        email   : form.email,
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="GET STARTED" subtitle="Create your ExpenseFlow account">
      <form className="auth-form" onSubmit={submit}>
        {error && <div className="auth-error">{error}</div>}

        <label>
          Full name
          <div className="input-icon">
            <UserRound size={17} />
            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Your name"
              autoComplete="name"
              required
              disabled={loading}
            />
          </div>
        </label>

        <label>
          Email address
          <div className="input-icon">
            <Mail size={17} />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
        </label>

        <label>
          Password
          <div className="input-icon">
            <Lock size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={change}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        <label>
          Confirm password
          <div className="input-icon">
            <Lock size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={change}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>
        </label>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading
            ? 'Creating account…'
            : <> Create Account <ArrowRight size={18} /> </>}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
