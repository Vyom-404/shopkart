import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addToWishlist } from '../services/api';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function ProductCard({ product, isWishlisted = false, onWishlistAdded }) {
  const [saved, setSaved] = useState(isWishlisted);
  const [saving, setSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  useEffect(() => setSaved(isWishlisted), [isWishlisted]);

  async function handleAddToWishlist() {
    if (saving || saved) return;
    setSaving(true);
    setWishlistError('');
    try {
      await addToWishlist(product._id);
      setSaved(true);
      onWishlistAdded?.(product._id);
    } catch (error) {
      if (error.response?.status === 409) {
        setSaved(true);
        onWishlistAdded?.(product._id);
      } else {
        setWishlistError('Unable to save product. Please try again.');
      }
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
        <button className="wishlist-action" type="button" onClick={handleAddToWishlist} disabled={saving || saved}>
          {saving ? '⏳ Saving...' : saved ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
        </button>
        {wishlistError && <p className="wishlist-action-error" role="alert">{wishlistError}</p>}
      </div>
    </article>
  );
}
