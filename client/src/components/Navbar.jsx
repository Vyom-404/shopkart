import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  return (
    <>
      <div className="announcement-bar"><span className="announcement-mark">✳</span> Good things, made for everyday <span className="announcement-divider">/</span> Free delivery on orders over ₹1,999</div>
      <header className="navbar">
        <Link className="brand" to="/home"><span className="brand-mark">s</span><span>shopkart<span className="brand-period">.</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/home" end className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Shop</NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Discover</NavLink>
          <NavLink to="/wishlist" className={({ isActive }) => `nav-products${isActive ? ' active' : ''}`}>Wishlist</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-products nav-cart${isActive ? ' active' : ''}`}><span>Cart</span><span className="nav-count">{totalItems}</span></NavLink>
        </nav>
        <div className="nav-right">
          <NavLink to="/profile" className={({ isActive }) => `profile-nav${isActive ? ' active' : ''}`}><span className="profile-nav-icon" aria-hidden="true">♙</span><span>Profile</span></NavLink>
        </div>
      </header>
    </>
  );
}
