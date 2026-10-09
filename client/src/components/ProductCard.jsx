import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

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
      <Link className="product-image-link" to={`/products/${product._id}`} aria-label={`View ${product.name}`}>
        <img className="product-image" src={product.image} alt={product.name} />
      </Link>
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <strong className="product-price">{formatPrice(product.price)}</strong>
        <p className="stock-status">{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
        <Link className="product-link" to={`/products/${product._id}`}>View Details <span aria-hidden="true">→</span></Link>
        <button className="wishlist-action" type="button" onClick={handleToggleWishlist} disabled={wishlistSaving}>
          {wishlistSaving ? 'Saving...' : saved ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
        </button>
        {wishlistError && <p className="wishlist-action-error" role="alert">{wishlistError}</p>}
        <button className="cart-action" type="button" disabled={adding || stockLimitReached} onClick={async () => {
          setCartActionError('');
          try { await addToCart(product._id); }
          catch (error) { setCartActionError(error.response?.data?.message || 'Unable to add product to cart. Please try again.'); }
        }}>
          {adding ? 'Adding...' : stockLimitReached ? (product.stock < 1 ? 'Out of Stock' : 'Stock Limit Reached') : inCart ? 'Add Another' : 'Add to Cart'}
        </button>
        {cartActionError && <p className="wishlist-action-error" role="alert">{cartActionError}</p>}
      </div>
    </article>
  );
}
