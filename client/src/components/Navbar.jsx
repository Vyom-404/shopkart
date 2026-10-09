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
      <div className="announcement-bar"><span className="announcement-mark">✳</span> Good things, made for everyday <span className="announcement-divider">/</span> Free delivery on orders over ₹1,999</div>
      <header className="navbar">
        <Link className="brand" to="/home"><span className="brand-mark">s</span><span>shopkart<span className="brand-period">.</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/home" end className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Shop</NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Discover</NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`} aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'product' : 'products'}`}><span>Wishlist</span><span className="nav-count">{wishlistCount}</span></NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-products nav-cart${isActive ? ' active' : ''}`}><span>Cart</span><span className="nav-count">{totalItems}</span></NavLink>
        </nav>
        <div className="nav-right">
          <NavLink to="/profile" className={({ isActive }) => `profile-nav${isActive ? ' active' : ''}`}><span className="profile-nav-icon" aria-hidden="true">♙</span><span>Profile</span></NavLink>
        </div>
      </header>
    </>
  );
}
