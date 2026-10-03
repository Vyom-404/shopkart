import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { getWishlist, removeFromWishlist } from '../services/api';

export default function Wishlist() {
  const { customer } = useOutletContext();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [removingId, setRemovingId] = useState('');
  const [removeError, setRemoveError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getWishlist()
      .then(({ data }) => { if (active) setWishlist(data.wishlist); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  async function handleRemove(productId) {
    setRemovingId(productId);
    setRemoveError('');
    try {
      await removeFromWishlist(productId);
      setWishlist((items) => items.filter((product) => product._id !== productId));
    } catch {
      setRemoveError('Unable to remove product. Please try again.');
    } finally {
      setRemovingId('');
    }
  }

  return <div className="home-page"><Navbar customer={customer} /><main className="products-content wishlist-content">
    <p className="eyebrow dark">YOUR SAVED FINDS</p>
    <h1 className="page-title">My Wishlist</h1>
    {!loading && !error && <p className="wishlist-count">{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</p>}
    {loading ? <p className="state-message" role="status">Loading your wishlist...</p>
      : error ? <section className="wishlist-error" role="alert"><h2>Something went wrong.</h2><p>We couldn't load your wishlist.</p><button className="dark-button" type="button" onClick={() => setRetry((value) => value + 1)}>Try Again <span>↻</span></button></section>
        : wishlist.length === 0 ? <section className="wishlist-empty"><div aria-hidden="true">❤️</div><h2>Your wishlist is empty</h2><p>Save products you love and find them here later.</p><Link className="dark-button" to="/products">Browse Products <span>→</span></Link></section>
          : <>{removeError && <p className="form-error" role="alert">{removeError}</p>}<section className="product-grid" aria-label="Wishlist products">{wishlist.map((product) => <WishlistCard key={product._id} product={product} removing={removingId === product._id} onRemove={handleRemove} />)}</section></>}
  </main></div>;
}
