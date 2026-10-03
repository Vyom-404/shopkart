import { Link } from 'react-router-dom';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function WishlistCard({ product, removing, onRemove }) {
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
        <button className="wishlist-action remove-wishlist" type="button" onClick={() => onRemove(product._id)} disabled={removing}>
          {removing ? 'Removing...' : 'Remove from Wishlist'}
        </button>
      </div>
    </article>
  );
}
