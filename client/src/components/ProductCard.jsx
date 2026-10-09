import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import BrandMark from './BrandMark';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function ProductCard({ product, isWishlisted = false, onWishlistAdded }) {
  const { cartItems, addToCart, isProductPending } = useCart();
  const [saved, setSaved] = useState(isWishlisted);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const [cartActionError, setCartActionError] = useState('');
  const adding = isProductPending(product._id);
  const cartQuantity = cartItems.find((item) => item.product._id === product._id)?.quantity || 0;
  const inCart = cartQuantity > 0;
  const stockLimitReached = product.stock < 1 || cartQuantity >= product.stock;

  useEffect(() => setSaved(isWishlisted), [isWishlisted]);

  async function handleToggleWishlist() {
    if (wishlistSaving) return;
    setWishlistSaving(true);
    setWishlistError('');
    try {
      const { data } = await toggleWishlist(product._id);
      setSaved(data.saved);
      onWishlistAdded?.(product._id, data.saved);
    } catch {
      setWishlistError('Unable to update wishlist. Please try again.');
    } finally {
      setWishlistSaving(false);
    }
  }

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link className="product-image-link" to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
          <img className="product-image" src={product.image} alt={product.name} width="800" height="900" loading="lazy" decoding="async" />
          <span className="image-view-mark" aria-hidden="true">↗</span>
        </Link>
        <button className={`wishlist-action${saved ? ' is-saved' : ''}`} type="button" onClick={handleToggleWishlist} disabled={wishlistSaving} aria-label={wishlistSaving ? 'Saving to wishlist' : saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved} title={saved ? 'Remove from wishlist' : 'Add to wishlist'}>
          {wishlistSaving ? <span className="heart-saving">···</span> : saved ? '♥' : '♡'}
        </button>
        <span className="media-category">{product.category}</span>
      </div>
      <div className="product-card-content">
        <div className="product-title-row"><h2>{product.name}</h2><BrandMark className="product-index" decorative /></div>
        <div className="product-price-row"><strong className="product-price">{formatPrice(product.price)}</strong><span className={`stock-status${product.stock < 1 ? ' sold-out' : ''}`}><i />{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</span></div>
        <Link className="product-link" to={`/products/${product._id}`}>Explore piece <span aria-hidden="true">↗</span></Link>
        <button className="cart-action" type="button" disabled={adding || stockLimitReached} onClick={async () => {
          setCartActionError('');
          try { await addToCart(product._id); }
          catch (error) { setCartActionError(error.response?.data?.message || 'Unable to add product to cart. Please try again.'); }
        }}>
          {adding ? 'Adding to your cart…' : stockLimitReached ? (product.stock < 1 ? 'Currently unavailable' : 'Stock limit reached') : inCart ? `Add another · ${cartQuantity} in cart` : 'Add to cart'}
          <span aria-hidden="true">{adding ? '…' : '↗'}</span>
        </button>
        {(wishlistError || cartActionError) && <p className="wishlist-action-error" role="alert">{wishlistError || cartActionError}</p>}
      </div>
    </article>
  );
}
