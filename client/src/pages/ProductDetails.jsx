import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProduct, getWishlist, toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function ProductDetails() {
  const { id } = useParams();
  const { customer } = useOutletContext();
  const { addToCart, cartItems, isProductPending } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cartActionError, setCartActionError] = useState('');
  const [saved, setSaved] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getProduct(id).then(({ data }) => { if (active) setProduct(data.product); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    getWishlist()
      .then(({ data }) => {
        if (active) setSaved(data.wishlist.some((item) => item._id === id));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [id]);

  const adding = product ? isProductPending(product._id) : false;
  const cartQuantity = product ? (cartItems.find((item) => item.product._id === product._id)?.quantity || 0) : 0;
  const inCart = cartQuantity > 0;
  const stockLimitReached = product ? product.stock < 1 || cartQuantity >= product.stock : false;

  async function handleAddToCart() {
    if (!product) return;
    setCartActionError('');
    try {
      await addToCart(product._id);
    } catch (requestError) {
      setCartActionError(requestError.response?.data?.message || 'Unable to add product to cart. Please try again.');
    }
  }

  async function handleToggleWishlist() {
    if (!product || wishlistSaving) return;
    setWishlistSaving(true);
    setWishlistError('');
    try {
      const { data } = await toggleWishlist(product._id);
      setSaved(data.saved);
    } catch {
      setWishlistError('Unable to update wishlist. Please try again.');
    } finally {
      setWishlistSaving(false);
    }
  }

  return <div className="home-page"><Navbar customer={customer} /><main className="products-content">
    <Link className="back-link" to="/products">← Back to products</Link>
    {loading ? <p className="state-message" role="status">Loading product...</p>
      : error ? <p className="state-message form-error" role="alert">Something went wrong while loading products.</p>
        : product ? <article className="product-detail">
          <img src={product.image} alt={product.name} />
          <div><p className="product-category">{product.category}</p><h1 className="page-title">{product.name}</h1>
            <p className="detail-description">{product.description}</p><strong className="product-price detail-price">{formatPrice(product.price)}</strong>
            <p className="stock-status">{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
            <div className="detail-actions">
              <button className="dark-button detail-cart-button" type="button" disabled={adding || stockLimitReached} onClick={handleAddToCart}>{adding ? 'Adding...' : stockLimitReached ? (product.stock <= 0 ? 'Out of Stock' : 'Stock Limit Reached') : inCart ? `Add Another · ${cartQuantity} in cart` : 'Add to Cart'} <span>→</span></button>
              <button className={`detail-wishlist-button${saved ? ' is-saved' : ''}`} type="button" onClick={handleToggleWishlist} disabled={wishlistSaving} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved}>{wishlistSaving ? 'Saving…' : <><span aria-hidden="true">{saved ? '♥' : '♡'}</span> {saved ? 'Saved to Wishlist' : 'Add to Wishlist'}</>}</button>
            </div>
            {cartActionError && <p className="form-error" role="alert">{cartActionError}</p>}
            {wishlistError && <p className="form-error" role="alert">{wishlistError}</p>}
          </div>
        </article> : <p className="state-message">Product not found.</p>}
  </main></div>;
}
