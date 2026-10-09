import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProduct } from '../services/api';
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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getProduct(id).then(({ data }) => { if (active) setProduct(data.product); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
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

  return <div className="home-page"><Navbar customer={customer} /><main className="products-content">
    <Link className="back-link" to="/products">← Back to products</Link>
    {loading ? <p className="state-message" role="status">Loading product...</p>
      : error ? <p className="state-message form-error" role="alert">Something went wrong while loading products.</p>
        : product ? <article className="product-detail">
          <img src={product.image} alt={product.name} />
          <div><p className="product-category">{product.category}</p><h1 className="page-title">{product.name}</h1>
            <p className="detail-description">{product.description}</p><strong className="product-price detail-price">{formatPrice(product.price)}</strong>
            <p className="stock-status">{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
            <button className="dark-button" type="button" disabled={adding || stockLimitReached} onClick={handleAddToCart}>{adding ? 'Adding...' : stockLimitReached ? (product.stock <= 0 ? 'Out of Stock' : 'Stock Limit Reached') : inCart ? 'Add Another' : 'Add to Cart'} <span>→</span></button>
            {cartActionError && <p className="form-error" role="alert">{cartActionError}</p>}
          </div>
        </article> : <p className="state-message">Product not found.</p>}
  </main></div>;
}
