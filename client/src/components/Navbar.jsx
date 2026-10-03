import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getWishlist } from '../services/api';

export default function Navbar({ customer }) {
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(null);
  const initials = customer.fullName.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    let active = true;
    const loadWishlistCount = async () => {
      try {
        const { data } = await getWishlist();
        if (active) setWishlistCount(data.count);
      } catch {
        if (active) setWishlistCount(null);
      }
    };
    loadWishlistCount();
    window.addEventListener('shopkart:wishlist-updated', loadWishlistCount);
    return () => {
      active = false;
      window.removeEventListener('shopkart:wishlist-updated', loadWishlistCount);
    };
  }, []);

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
        <Link className="nav-products" to="/products">Products</Link>
        <Link className="nav-products" to="/wishlist">Wishlist{wishlistCount === null ? '' : ` (${wishlistCount})`}</Link>
        <span className="hello">Hello, {customer.fullName.split(' ')[0]}</span>
        <span className="avatar" aria-label={`${customer.fullName}'s profile`}>{initials}</span>
        <button className="logout" onClick={handleLogout}>Log out <span aria-hidden="true">↗</span></button>
      </div>
    </header>
  );
}
