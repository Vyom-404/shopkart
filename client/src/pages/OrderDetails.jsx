import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrder } from '../services/api';

const formatPrice = price => `₹${Number(price).toLocaleString('en-IN')}`;
const formatDate = date => new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function OrderDetails() {
  const { id } = useParams();
  const { customer } = useOutletContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getOrder(id)
      .then(({ data }) => { if (active) setOrder(data.order); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return <div className="home-page"><Navbar customer={customer} /><main className="products-content order-details-page">
    <Link className="back-link" to="/orders">← Back to my orders</Link>
    {loading ? <p className="state-message" role="status">Loading order...</p>
      : error || !order ? <section className="orders-empty" role="alert"><h2>We couldn't find this order.</h2><p>It may not exist or may not belong to your account.</p><Link className="dark-button" to="/orders">View My Orders <span>→</span></Link></section>
        : <>
          <section className="order-success-banner"><span className="success-mark" aria-hidden="true">✓</span><div><p className="eyebrow">{order.paymentStatus === 'PAID' ? 'PAYMENT CONFIRMED' : 'ORDER DETAILS'}</p><h1>{order.paymentStatus === 'PAID' ? 'Order placed successfully.' : 'Your order'}</h1><p>{order.paymentStatus === 'PAID' ? 'Thanks for shopping with ShopKart. Your order is saved.' : 'Payment is still pending for this order.'}</p></div></section>
          <div className="order-details-grid">
            <section className="order-detail-panel"><div className="order-detail-heading"><div><p className="eyebrow dark">ORDER #{order._id}</p><time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time></div><span className={`order-status status-${order.status.toLowerCase().replaceAll('_', '-')}`}>{order.status.replaceAll('_', ' ')}</span></div>
              <div className="order-detail-items">{order.items.map((item, index) => <article className="order-detail-item" key={`${item.product}-${index}`}>
                {item.image && <img src={item.image} alt="" />}
                <div><h2>{item.name}</h2><p>{item.quantity} × {formatPrice(item.price)}</p></div><strong>{formatPrice(item.price * item.quantity)}</strong>
              </article>)}</div>
              <div className="summary-row summary-total"><strong>Total paid</strong><strong>{formatPrice(order.totalAmount)}</strong></div>
            </section>
            <aside className="shipping-detail-panel"><p className="eyebrow dark">DELIVERING TO</p><h2>{order.shippingAddress.fullName}</h2><p>{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p><p>{order.shippingAddress.phone}</p></aside>
          </div>
          <div className="order-success-actions"><Link className="dark-button" to="/orders">View My Orders <span>→</span></Link><Link className="outline-button" to="/products">Continue Shopping <span>↗</span></Link></div>
        </>}
  </main></div>;
}
