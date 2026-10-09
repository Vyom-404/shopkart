import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProduct, getWishlist, toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customer } = useOutletContext();
  const { addToCart, cartItems, isProductPending } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cartActionError, setCartActionError] = useState('');
  const [saved, setSaved] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);
  const [showBuyNowPrompt, setShowBuyNowPrompt] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getProduct(id).then(({ data }) => { if (active) setProduct(data.product); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => setBuyNowQuantity(1), [id]);

  useEffect(() => {
    if (!showBuyNowPrompt) return undefined;
    const closeOnEscape = event => {
      if (event.key === 'Escape') setShowBuyNowPrompt(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showBuyNowPrompt]);

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

  function handleBuyNow() {
    setBuyNowQuantity(1);
    setShowBuyNowPrompt(true);
  }

  function continueToCheckout() {
    if (!product || !Number.isInteger(buyNowQuantity) || buyNowQuantity < 1 || buyNowQuantity > product.stock) return;
    navigate('/checkout', { state: { buyNow: {
      productId: product._id,
      quantity: buyNowQuantity,
      preview: { name: product.name, image: product.image, price: product.price }
    } } });
  }

  return <div className="home-page"><Navbar customer={customer} /><main className="product-detail-page">
    <div className="detail-breadcrumb"><Link className="back-link" to="/products">Shop all pieces</Link><span>/</span><span>Details</span></div>
    {loading ? <p className="state-message" role="status">Loading product...</p>
      : error ? <p className="state-message form-error" role="alert">Something went wrong while loading products.</p>
        : product ? <article className="product-detail">
          <div className="product-detail-gallery"><img src={product.image} alt={product.name} width="1200" height="1296" decoding="async" /><span className="gallery-index">AROVA / OBJECTS FOR EVERYDAY</span></div>
          <section className="product-detail-info"><p className="product-category">{product.category}</p><p className="detail-reference">OBJECT NO. {product._id.slice(-5).toUpperCase()}</p><h1 className="page-title">{product.name}</h1>
            <p className="detail-description">{product.description}</p><div className="detail-price-row"><strong className="product-price detail-price">{formatPrice(product.price)}</strong><p className={`stock-status${product.stock < 1 ? ' sold-out' : ''}`}><i />{product.stock > 0 ? `${product.stock} available` : 'Currently unavailable'}</p></div>
            <div className="detail-divider" />
            <div className="detail-actions">
              <button className="dark-button detail-cart-button" type="button" disabled={adding || stockLimitReached} onClick={handleAddToCart}>{adding ? 'Adding...' : stockLimitReached ? (product.stock <= 0 ? 'Out of Stock' : 'Stock Limit Reached') : inCart ? `Add Another · ${cartQuantity} in cart` : 'Add to Cart'} <span>→</span></button>
              <button className="dark-button buy-now-button" type="button" disabled={product.stock < 1} onClick={handleBuyNow}>Buy Now <span>→</span></button>
              <button className={`detail-wishlist-button${saved ? ' is-saved' : ''}`} type="button" onClick={handleToggleWishlist} disabled={wishlistSaving} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved}>{wishlistSaving ? 'Saving…' : <><span aria-hidden="true">{saved ? '♥' : '♡'}</span> {saved ? 'Saved to Wishlist' : 'Add to Wishlist'}</>}</button>
            </div>
            {cartActionError && <p className="form-error" role="alert">{cartActionError}</p>}
            {wishlistError && <p className="form-error" role="alert">{wishlistError}</p>}
            <div className="detail-assurance"><span>PRODUCT DETAILS</span><span>LIVE STOCK</span><span>ORDER HISTORY</span></div>
          </section>
        </article> : <p className="state-message">Product not found.</p>}
    {showBuyNowPrompt && product && <div className="buy-now-overlay" onMouseDown={event => {
      if (event.target === event.currentTarget) setShowBuyNowPrompt(false);
    }}>
      <section className="buy-now-dialog" role="dialog" aria-modal="true" aria-labelledby="buy-now-title">
        <button className="buy-now-close" type="button" onClick={() => setShowBuyNowPrompt(false)} aria-label="Close quantity prompt">×</button>
        <p className="eyebrow">READY TO ORDER</p>
        <h2 id="buy-now-title">Choose quantity<span>.</span></h2>
        <p className="buy-now-product-name">{product.name}</p>
        <label className="buy-now-quantity">QUANTITY
          <input autoFocus type="number" min="1" max={product.stock} step="1" value={buyNowQuantity} disabled={product.stock < 1} onChange={event => {
            const value = Number(event.target.value);
            setBuyNowQuantity(Number.isInteger(value) ? Math.min(Math.max(1, value), product.stock || 1) : 1);
          }} aria-label={`Quantity to buy for ${product.name}`} />
          <span>{product.stock} available</span>
        </label>
        <div className="buy-now-dialog-actions">
          <button className="outline-button" type="button" onClick={() => setShowBuyNowPrompt(false)}>Cancel</button>
          <button className="dark-button" type="button" disabled={product.stock < 1} onClick={continueToCheckout}>Continue to checkout <span>→</span></button>
        </div>
      </section>
    </div>}
  </main></div>;
}
