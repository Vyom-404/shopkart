import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import api from '../services/api';

const initial = { fullName: '', email: '', password: '', phone: '' };
export default function Register() {
  const navigate = useNavigate(); const [form, setForm] = useState(initial); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault(); setError('');
    if (Object.values(form).some((value) => !value.trim())) return setError('Please complete every field.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    if (form.password.length < 6) return setError('Your password must be at least 6 characters.');
    setLoading(true);
    try { await api.post('/customers/register', { ...form, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() }); navigate('/login', { replace: true, state: { registered: true } }); }
    catch (err) {
      setError(err.response?.data?.message || 'Cannot reach the ShopKart API. Start the backend server and try again.');
    }
    finally { setLoading(false); }
  }
  return <AuthShell title="Make it yours." intro="A few details and you’re ready to start shopping." alternate={{ text: 'Already have an account?', to: '/login', link: 'Sign in' }}>
    <form className="form register-form" onSubmit={submit} noValidate>
      {error && <div className="form-error" role="alert">{error}</div>}
      <label>Full name<input name="fullName" value={form.fullName} onChange={update} placeholder="Avery Johnson" autoComplete="name" /></label>
      <label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" /></label>
      <div className="form-row"><label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="6+ characters" autoComplete="new-password" /></label><label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} placeholder="98765 43210" autoComplete="tel" /></label></div>
      <button className="primary-button" disabled={loading}>{loading ? 'Creating account…' : 'Create account'} <span>→</span></button>
    </form>
  </AuthShell>;
}
