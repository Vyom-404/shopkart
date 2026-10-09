import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { advanceOrderStatus, getOrders } from '../services/api';

const formatPrice = price => `₹${Number(price).toLocaleString('en-IN')}`;
const formatDate = date => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const nextStatus = { PLACED: 'CONFIRMED', CONFIRMED: 'SHIPPED', SHIPPED: 'DELIVERED' };

export default function Orders() {
  const { customer } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await getOrders();
      setOrders(data.orders);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function handleAdvance(order) {
    const status = nextStatus[order.status];
    if (!status) return;
    setUpdatingId(order._id);
    try {
      const { data } = await advanceOrderStatus(order._id, status);
      setOrders(current => current.map(item => item._id === order._id ? data.order : item));
    } catch {
      setError(true);
    } finally {
      setUpdatingId('');
    }
  }

  return <div className="home-page"><Navbar customer={customer} /><main className="products-content orders-page">
    <p className="eyebrow dark">THE STORY SO FAR</p><h1 className="page-title">My Orders</h1>
    {loading ? <p className="state-message" role="status">Loading your orders...</p>
      : error ? <section className="orders-empty" role="alert"><h2>We couldn't load your orders.</h2><p>Please check your connection and try again.</p><button className="dark-button" type="button" onClick={loadOrders}>Try Again <span>↻</span></button></section>
        : orders.length === 0 ? <section className="orders-empty"><div aria-hidden="true">✳</div><h2>No orders yet</h2><p>Your purchases will find a home here. Start with something you love.</p><Link className="dark-button" to="/products">Start Shopping <span>→</span></Link></section>
          : <section className="orders-list" aria-label="Your orders">{orders.map(order => <article className="order-card" key={order._id}>
            <header className="order-card-header"><div><p className="eyebrow dark">ORDER #{order._id.slice(-8).toUpperCase()}</p><time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time></div><span className={`order-status status-${order.status.toLowerCase().replaceAll('_', '-')}`}>{order.status.replaceAll('_', ' ')}</span></header>
            <div className="order-card-items">{order.items.map((item, index) => <div className="order-list-item" key={`${item.product}-${index}`}>
              {item.image && <img src={item.image} alt="" />}
              <span>{item.name} <small>× {item.quantity}</small></span><strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>)}</div>
            <footer className="order-card-footer"><div><span>Total</span><strong>{formatPrice(order.totalAmount)}</strong></div><Link className="outline-button" to={`/orders/${order._id}`}>View Details <span>↗</span></Link></footer>
            {import.meta.env.DEV && nextStatus[order.status] && <button className="dev-status-button" type="button" disabled={updatingId === order._id} onClick={() => handleAdvance(order)}>{updatingId === order._id ? 'Updating…' : `Dev: advance to ${nextStatus[order.status]}`}</button>}
          </article>)}</section>}
  </main></div>;
}
