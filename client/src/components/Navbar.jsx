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
        <Link className="brand" to="/home"><span className="brand-mark">S</span><span>shopkart<span className="brand-period">.</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/home" end className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Collection</NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Orders</NavLink>
        </nav>
        <div className="nav-right">
          <NavLink to="/wishlist" className={({ isActive }) => `nav-action${isActive ? ' active' : ''}`} aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'product' : 'products'}`} title="Wishlist"><span className="nav-action-icon" aria-hidden="true">♡</span><span className="nav-count">{wishlistCount}</span></NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-action${isActive ? ' active' : ''}`} aria-label={`Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`} title="Cart"><span className="nav-action-icon nav-bag-icon" aria-hidden="true">▱</span><span className="nav-count">{totalItems}</span></NavLink>
          <NavLink to="/profile" className={({ isActive }) => `profile-nav${isActive ? ' active' : ''}`} aria-label="Profile" title="Profile"><span className="profile-nav-icon" aria-hidden="true">S</span></NavLink>
        </div>
      </header>
    </>
  );
}
