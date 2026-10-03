import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleWishlist } from '../services/api';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function ProductCard({ product, isWishlisted = false, onWishlistAdded }) {
  const [saved, setSaved] = useState(isWishlisted);
  const [saving, setSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  useEffect(() => setSaved(isWishlisted), [isWishlisted]);

  async function handleToggleWishlist() {
    if (saving) return;
    setSaving(true);
    setWishlistError('');
    try {
      const { data } = await toggleWishlist(product._id);
      setSaved(data.saved);
      onWishlistAdded?.(product._id, data.saved);
    } catch {
      setWishlistError('Unable to update wishlist. Please try again.');
    } finally {
      setSaving(false);
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
        <button className="wishlist-action" type="button" onClick={handleToggleWishlist} disabled={saving}>
          {saving ? '⏳ Saving...' : saved ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
        </button>
        {wishlistError && <p className="wishlist-action-error" role="alert">{wishlistError}</p>}
      </div>
    </article>
  );
}
