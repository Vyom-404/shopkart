import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts, getWishlist } from '../services/api';

export default function Products() {
  const { customer } = useOutletContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    let active = true;
    getWishlist()
      .then(({ data }) => {
        if (active) setWishlistIds((current) => [...new Set([...current, ...data.wishlist.map((product) => product._id)])]);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  function markWishlisted(productId, saved) {
    setWishlistIds((current) => saved
      ? (current.includes(productId) ? current : [...current, productId])
      : current.filter((id) => id !== productId));
  }

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await getProducts({ ...(search.trim() ? { search: search.trim() } : {}), ...(category ? { category } : {}) });
        if (active) setProducts(data.products);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search, category]);

  return <div className="home-page"><Navbar customer={customer} /><main className="collection-page">
    <header className="collection-heading"><div><p className="eyebrow">SHOPKART / THE COLLECTION</p><h1>Find your<br /><em>favourite.</em></h1></div><p>Good design for everyday living, selected with care.</p></header>
    <section className="collection-tools" aria-label="Find products"><SearchBar search={search} category={category} onSearchChange={setSearch} onCategoryChange={setCategory} /><span className="collection-count">{loading ? 'Loading collection…' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}</span></section>
    <section className="collection-results" aria-label="Product results">
      {loading ? <p className="state-message" role="status">Loading products...</p>
        : error ? <p className="state-message form-error" role="alert">Something went wrong while loading products.</p>
          : products.length === 0 ? <p className="state-message collection-empty">No products match this search. Try another term or category.</p>
            : <div className="product-grid" aria-label="Products">{products.map((product) => <ProductCard key={product._id} product={product} isWishlisted={wishlistIds.includes(product._id)} onWishlistAdded={markWishlisted} />)}</div>}
    </section>
  </main></div>;
}
