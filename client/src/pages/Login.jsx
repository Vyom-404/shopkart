import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault(); setError('');
    if (!form.email || !form.password) return setError('Please enter your email and password.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    setLoading(true);
    try {
      await api.post('/customers/login', { ...form, email: form.email.trim().toLowerCase() });
      navigate(location.state?.from || '/home', { replace: true });
    }
    catch (err) {
      setError(err.response?.status === 401
        ? 'Invalid credentials. Please check your email and password.'
        : (err.response?.data?.message || 'Cannot reach the ShopKart API. Start the backend server and try again.'));
    }
    finally { setLoading(false); }
  }
  return <AuthShell title="Welcome back." intro="Sign in to pick up where you left off." alternate={{ text: 'New to ShopKart?', to: '/register', link: 'Create an account' }}>
    <form className="form" onSubmit={submit} noValidate>
      {error && <div className="form-error" role="alert">{error}</div>}
      <label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" /></label>
      <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="Your password" autoComplete="current-password" /></label>
      <button className="primary-button" disabled={loading}>{loading ? 'Signing you in…' : 'Sign in'} <span>→</span></button>
    </form>
  </AuthShell>;
}
