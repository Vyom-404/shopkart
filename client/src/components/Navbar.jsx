import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getWishlist } from '../services/api';

export default function Navbar() {
  const { totalItems } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlistCount = useCallback(async () => {
    try {
      const { data } = await getWishlist();
      setWishlistCount(data.wishlist.length);
    } catch {
      // Keep the last known count if the wishlist request temporarily fails.
    }
  }, []);

  useEffect(() => {
    refreshWishlistCount();
    window.addEventListener('shopkart:wishlist-updated', refreshWishlistCount);
    return () => window.removeEventListener('shopkart:wishlist-updated', refreshWishlistCount);
  }, [refreshWishlistCount]);

  return (
    <>
      <div className="announcement-bar"><span>COMPLIMENTARY DELIVERY</span><span className="announcement-divider">—</span><span>ON ORDERS OVER ₹1,999</span></div>
      <header className="navbar">
        <Link className="brand" to="/home"><span className="brand-mark" aria-hidden="true">A</span><span>arova<span className="brand-period">.</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/home" end className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Collection</NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Orders</NavLink>
        </nav>
        <div className="nav-right">
          <NavLink to="/wishlist" className={({ isActive }) => `nav-action${isActive ? ' active' : ''}`} aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'product' : 'products'}`} title="Wishlist"><svg className="nav-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 8.8c0 4.1-8.4 10-8.4 10s-8.4-5.9-8.4-10a4.4 4.4 0 0 1 8.4-1.8 4.4 4.4 0 0 1 8.4 1.8Z" /></svg><span className="nav-count">{wishlistCount}</span></NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-action${isActive ? ' active' : ''}`} aria-label={`Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`} title="Cart"><svg className="nav-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16l-1 12H5L4 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg><span className="nav-count">{totalItems}</span></NavLink>
          <NavLink to="/profile" className={({ isActive }) => `profile-nav${isActive ? ' active' : ''}`} aria-label="Profile" title="Profile"><svg className="profile-nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" /><path d="M5.8 20c.5-3.4 2.6-5.2 6.2-5.2s5.7 1.8 6.2 5.2" /></svg></NavLink>
        </div>
      </header>
    </>
  );
}
