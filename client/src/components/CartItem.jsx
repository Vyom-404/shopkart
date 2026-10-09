import { useState } from 'react';
import { Link } from 'react-router-dom';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function CartItem({ item, pending, onQuantityChange, onRemove }) {
  const [error, setError] = useState('');
  const { product, quantity } = item;

  async function changeQuantity(nextQuantity) {
    setError('');
    try {
      await onQuantityChange(product._id, nextQuantity);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update quantity. Please try again.');
    }
  }

  async function removeItem() {
    setError('');
    try {
      await onRemove(product._id);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove product. Please try again.');
    }
  }

  return (
    <article className="cart-item">
      <Link className="cart-item-image" to={`/products/${product._id}`}>
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="cart-item-details">
        <p className="product-category">{product.category}</p>
        <h2><Link to={`/products/${product._id}`}>{product.name}</Link></h2>
        <strong>{formatPrice(product.price)}</strong>
        <p className="stock-status">{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</p>
        <div className="cart-item-actions">
          <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
            <button type="button" aria-label="Decrease quantity" disabled={pending || quantity <= 1} onClick={() => changeQuantity(quantity - 1)}>−</button>
            <span>{quantity}</span>
            <button type="button" aria-label="Increase quantity" disabled={pending || quantity >= product.stock} onClick={() => changeQuantity(quantity + 1)}>+</button>
          </div>
          <button className="remove-cart-item" type="button" disabled={pending} onClick={removeItem}>
            {pending ? 'Updating...' : 'Remove'}
          </button>
        </div>
        <p className="cart-line-total">Item total: {formatPrice(product.price * quantity)}</p>
        {error && <p className="cart-action-error" role="alert">{error}</p>}
      </div>
    </article>
  );
}
