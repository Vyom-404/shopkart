import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Navbar({ customer }) {
  const navigate = useNavigate();
  const initials = customer.fullName.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();

  async function handleLogout() {
    try {
      await api.post('/customers/logout');
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/home"><span className="brand-mark">S</span>shopkart</Link>
      <div className="nav-right">
        <span className="hello">Hello, {customer.fullName.split(' ')[0]}</span>
        <span className="avatar" aria-label={`${customer.fullName}'s profile`}>{initials}</span>
        <button className="logout" onClick={handleLogout}>Log out <span aria-hidden="true">↗</span></button>
      </div>
    </header>
  );
}
