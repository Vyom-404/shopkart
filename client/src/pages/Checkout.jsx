import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import BrandMark from '../components/BrandMark';

const initialAddress = customer => ({
  fullName: customer?.fullName || '',
  phone: customer?.phone || '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: ''
});

const formatPrice = price => `₹${Number(price).toLocaleString('en-IN')}`;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise(resolve => {
    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { customer } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNow = location.state?.buyNow || null;
  const { cartItems, cartLoading, cartError, totalItems, subtotal, refreshCart, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState(() => initialAddress(customer));
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [checkoutReview, setCheckoutReview] = useState(null);

  function validateAddress() {
    const nextErrors = {};
    for (const [field, value] of Object.entries(shippingAddress)) {
      if (!value.trim()) nextErrors[field] = 'This field is required.';
    }
    const normalizedPhone = shippingAddress.phone.trim().replace(/[\s()-]/g, '');
    if (shippingAddress.phone.trim() && !/^\+?[1-9]\d{9,14}$/.test(normalizedPhone)) {
      nextErrors.phone = 'Enter a valid phone number with 10 to 15 digits.';
    }
    if (shippingAddress.pincode.trim() && !/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      nextErrors.pincode = 'Pincode must contain 6 digits.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setShippingAddress(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: '' }));
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    setPaymentError('');
    if (!validateAddress()) return;
    setPlacingOrder(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setPaymentError('Payment checkout could not be loaded. Check your connection and try again.');
        return;
      }

      const { data } = await createPaymentOrder(shippingAddress, buyNow);
      setCheckoutReview({ items: data.items, totalAmount: data.totalAmount });
      let paymentResponseReceived = false;
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Arova',
        description: 'Arova Order',
        order_id: data.razorpayOrderId,
        prefill: { name: shippingAddress.fullName, contact: shippingAddress.phone },
        theme: { color: '#247362' },
        handler: async response => {
          paymentResponseReceived = true;
          setVerifyingPayment(true);
          setPaymentError('');
          try {
            await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (!buyNow) clearCart();
            navigate(`/order-success/${data.shopKartOrderId}`, { replace: true });
          } catch (error) {
            setPaymentError(error.response?.data?.message || 'We could not verify the payment yet. Your cart has been kept. Please try again.');
          } finally {
            setVerifyingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!paymentResponseReceived) setPaymentError('Payment was cancelled. Your cart is unchanged.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', response => {
        paymentResponseReceived = true;
        setPaymentError(response.error?.description || 'Payment failed. Your cart has not been cleared. Please try again.');
      });
      paymentObject.open();
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Unable to start checkout. Your items have not been changed.');
    } finally {
      setPlacingOrder(false);
    }
  }

  return <div className="home-page"><Navbar /><main className="checkout-page checkout-page-layout">
    <Link className="back-link" to={buyNow ? `/products/${buyNow.productId}` : '/cart'}>← {buyNow ? 'Return to product' : 'Return to shopping bag'}</Link>
    <header className="checkout-heading"><div><p className="eyebrow">A FEW FINAL DETAILS</p><h1 className="page-title">Checkout<span>.</span></h1></div><div className="checkout-progress" aria-label="Checkout steps"><span className="current"><i>01</i> Delivery</span><span><i>02</i> Review</span><span><i>03</i> Payment</span></div></header>
    {(!buyNow && cartLoading) ? <p className="state-message" role="status">Loading your cart...</p>
      : (!buyNow && cartError) ? <section className="cart-state-error" role="alert"><p>Unable to load your cart.</p><button className="dark-button" type="button" onClick={refreshCart}>Try Again <span>↻</span></button></section>
        : (!buyNow && cartItems.length === 0) ? <section className="cart-empty"><BrandMark className="empty-brand-mark" decorative /><h2>Your cart is empty</h2><p>Add something you love before checking out.</p><Link className="dark-button" to="/products">Browse Products <span>→</span></Link></section>
          : <form className="checkout-layout" onSubmit={handlePlaceOrder} noValidate>
            <section className="shipping-panel">
              <p className="eyebrow dark">DELIVERY DETAILS</p><h2>Where should we send it?</h2>
              <div className="checkout-fields">
                <label className="checkout-field">Full name<input name="fullName" value={shippingAddress.fullName} onChange={handleChange} autoComplete="name" aria-invalid={Boolean(errors.fullName)} />{errors.fullName && <small role="alert">{errors.fullName}</small>}</label>
                <label className="checkout-field">Phone number<input name="phone" type="tel" value={shippingAddress.phone} onChange={handleChange} autoComplete="tel" aria-invalid={Boolean(errors.phone)} />{errors.phone && <small role="alert">{errors.phone}</small>}</label>
                <label className="checkout-field checkout-field-wide">Address line<input name="addressLine1" value={shippingAddress.addressLine1} onChange={handleChange} autoComplete="street-address" aria-invalid={Boolean(errors.addressLine1)} />{errors.addressLine1 && <small role="alert">{errors.addressLine1}</small>}</label>
                <label className="checkout-field">City<input name="city" value={shippingAddress.city} onChange={handleChange} autoComplete="address-level2" aria-invalid={Boolean(errors.city)} />{errors.city && <small role="alert">{errors.city}</small>}</label>
                <label className="checkout-field">State<input name="state" value={shippingAddress.state} onChange={handleChange} autoComplete="address-level1" aria-invalid={Boolean(errors.state)} />{errors.state && <small role="alert">{errors.state}</small>}</label>
                <label className="checkout-field">Pincode<input name="pincode" inputMode="numeric" maxLength={6} value={shippingAddress.pincode} onChange={handleChange} autoComplete="postal-code" aria-invalid={Boolean(errors.pincode)} />{errors.pincode && <small role="alert">{errors.pincode}</small>}</label>
              </div>
            </section>
            <aside className="checkout-summary">
              <p className="eyebrow dark">YOUR ORDER</p><h2>Order summary</h2>
              <div className="checkout-summary-items">{(checkoutReview?.items || (buyNow ? [{ product: buyNow.productId, ...buyNow.preview, quantity: buyNow.quantity }] : cartItems.map(item => ({ ...item, name: item.product.name, image: item.product.image, price: item.product.price })))).map(item => <div className="checkout-summary-item" key={item.product._id || item.product}>
                <img src={item.image} alt="" />
                <div><strong>{item.name}</strong><small>Qty {item.quantity} × {formatPrice(item.price)}</small></div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>)}</div>
              <div className="summary-row"><span>Items</span><span>{checkoutReview ? checkoutReview.items.reduce((sum, item) => sum + item.quantity, 0) : buyNow ? buyNow.quantity : totalItems}</span></div>
              <div className="summary-row summary-total"><strong>Total</strong><strong>{formatPrice(checkoutReview?.totalAmount ?? (buyNow ? buyNow.preview.price * buyNow.quantity : subtotal))}</strong></div>
              {paymentError && <p className="checkout-error" role="alert">{paymentError}</p>}
              <button className="dark-button checkout-button" type="submit" disabled={placingOrder || verifyingPayment}>
                {verifyingPayment ? 'Verifying payment…' : placingOrder ? 'Preparing secure checkout…' : 'Place Order'} <span aria-hidden="true">→</span>
              </button>
              <p className="checkout-note">Secure payment powered by Razorpay Test Mode.</p>
            </aside>
          </form>}
  </main></div>;
}
