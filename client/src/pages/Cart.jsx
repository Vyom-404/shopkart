import { Link, useOutletContext } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function Cart() {
  const { customer } = useOutletContext();
  const {
    cartItems,
    cartLoading,
    cartError,
    totalItems,
    subtotal,
    refreshCart,
    updateQuantity,
    removeFromCart,
    isProductPending
  } = useCart();

  return <div className="home-page"><Navbar customer={customer} /><main className="cart-page cart-page-layout">
    <header className="cart-page-heading"><div><p className="eyebrow">YOUR SELECTION</p><h1 className="page-title">Shopping bag<span>.</span></h1></div>{!cartLoading && !cartError && cartItems.length > 0 && <p>{totalItems} {totalItems === 1 ? 'piece' : 'pieces'} in your bag</p>}</header>
    {cartLoading ? <p className="state-message" role="status">Loading your cart...</p>
      : cartError ? <section className="cart-state-error" role="alert"><p>Unable to load your cart.</p><button className="dark-button" type="button" onClick={refreshCart}>Try Again <span>↻</span></button></section>
        : cartItems.length === 0 ? <section className="cart-empty"><div aria-hidden="true">🛒</div><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><Link className="dark-button" to="/products">Browse Products <span>→</span></Link></section>
          : <div className="cart-layout">
            <section className="cart-items-list" aria-label="Cart items">
              {cartItems.map((item) => <CartItem key={item.product._id} item={item} pending={isProductPending(item.product._id)} onQuantityChange={updateQuantity} onRemove={removeFromCart} />)}
            </section>
            <aside className="order-summary">
              <p className="eyebrow dark">ORDER SUMMARY</p>
              <h2>Summary</h2>
              <div className="summary-row"><span>Items</span><span>{totalItems}</span></div>
              <div className="summary-row summary-total"><strong>Subtotal</strong><strong>{formatPrice(subtotal)}</strong></div>
              <Link className="dark-button checkout-button" to="/checkout">Proceed to Checkout <span>→</span></Link>
            </aside>
          </div>}
  </main></div>;
}
