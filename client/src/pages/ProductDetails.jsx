import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProduct } from '../services/api';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function ProductDetails() {
  const { id } = useParams();
  const { customer } = useOutletContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getProduct(id).then(({ data }) => { if (active) setProduct(data.product); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return <div className="home-page"><Navbar customer={customer} /><main className="products-content">
    <Link className="back-link" to="/products">← Back to products</Link>
    {loading ? <p className="state-message" role="status">Loading product...</p>
      : error ? <p className="state-message form-error" role="alert">Something went wrong while loading products.</p>
        : product ? <article className="product-detail">
          <img src={product.image} alt={product.name} />
          <div><p className="product-category">{product.category}</p><h1 className="page-title">{product.name}</h1>
            <p className="detail-description">{product.description}</p><strong className="product-price detail-price">{formatPrice(product.price)}</strong>
            <p className="stock-status">{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
            <button className="dark-button" type="button" disabled={product.stock <= 0}>Add to Cart <span>→</span></button>
          </div>
        </article> : <p className="state-message">Product not found.</p>}
  </main></div>;
}
