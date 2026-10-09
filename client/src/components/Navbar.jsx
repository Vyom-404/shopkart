import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar({ customer }) {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const initials = customer.fullName.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();

  async function handleLogout() {
    try {
      await api.post('/customers/logout');
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <>
      <div className="announcement-bar"><span className="announcement-mark">✳</span> Good things, made for everyday <span className="announcement-divider">/</span> Free delivery on orders over ₹1,999</div>
      <header className="navbar">
        <Link className="brand" to="/home"><span className="brand-mark">s</span><span>shopkart<span className="brand-period">.</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/products" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Discover</NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Wishlist</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-products nav-cart${isActive ? ' active' : ''}`}><span>Cart</span><span className="nav-count">{totalItems}</span></NavLink>
        </nav>
        <div className="nav-right">
          <span className="hello">Hi, {customer.fullName.split(' ')[0]}</span>
          <span className="avatar" aria-label={`${customer.fullName}'s profile`}>{initials}</span>
          <button className="logout" onClick={handleLogout}>Sign out <span aria-hidden="true">↗</span></button>
        </div>
      </header>
    </>
  );
}
