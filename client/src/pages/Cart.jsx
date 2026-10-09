import { Link, useOutletContext } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import BrandMark from '../components/BrandMark';

const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;
const FREE_DELIVERY_THRESHOLD = 2000;

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
  const deliveryUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const deliveryProgress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  return <div className="home-page"><Navbar customer={customer} /><main className="cart-page cart-page-layout">
    <header className="cart-page-heading"><div><p className="eyebrow">YOUR SELECTION</p><h1 className="page-title">Shopping bag<span>.</span></h1></div>{!cartLoading && !cartError && cartItems.length > 0 && <p>{totalItems} {totalItems === 1 ? 'piece' : 'pieces'} in your bag</p>}</header>
    {cartLoading ? <p className="state-message" role="status">Loading your cart...</p>
      : cartError ? <section className="cart-state-error" role="alert"><p>Unable to load your cart.</p><button className="dark-button" type="button" onClick={refreshCart}>Try Again <span>↻</span></button></section>
        : cartItems.length === 0 ? <section className="cart-empty"><BrandMark className="empty-brand-mark" decorative /><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><Link className="dark-button" to="/products">Browse Products <span>→</span></Link></section>
          : <div className="cart-layout">
            <section className="cart-items-list" aria-label="Cart items">
              {cartItems.map((item) => <CartItem key={item.product._id} item={item} pending={isProductPending(item.product._id)} onQuantityChange={updateQuantity} onRemove={removeFromCart} />)}
            </section>
            <aside className="order-summary">
              <p className="eyebrow dark">YOUR BAG, AT A GLANCE</p>
              <h2>Order summary</h2>
              <div className="summary-product-list" aria-label="Item price breakdown">
                {cartItems.map(({ product, quantity }) => <div className="summary-product" key={product._id}>
                  <span><strong>{product.name}</strong><small>{quantity} × {formatPrice(product.price)}</small></span>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                </div>)}
              </div>
              <div className="summary-row"><span>Items in your bag</span><span>{totalItems}</span></div>
              <div className="summary-row summary-total"><strong>Subtotal</strong><strong>{formatPrice(subtotal)}</strong></div>
              <div className="delivery-perk">
                <div className="delivery-perk-copy"><BrandMark className="delivery-perk-mark" decorative /><span><strong>{deliveryUnlocked ? 'Complimentary delivery unlocked' : 'Complimentary delivery'}</strong><small>{deliveryUnlocked ? 'Your order qualifies.' : `Add ${formatPrice(deliveryRemaining)} more to qualify.`}</small></span></div>
                <div className="delivery-progress" role="progressbar" aria-label="Progress toward complimentary delivery" aria-valuemin="0" aria-valuemax={FREE_DELIVERY_THRESHOLD} aria-valuenow={Math.min(subtotal, FREE_DELIVERY_THRESHOLD)}><span style={{ width: `${deliveryProgress}%` }} /></div>
              </div>
              <p className="delivery-note">Any delivery charges are confirmed at checkout.</p>
              <Link className="dark-button checkout-button" to="/checkout">Proceed to Checkout <span>→</span></Link>
            </aside>
          </div>}
  </main></div>;
}
