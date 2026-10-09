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
    <header className="collection-heading"><div><p className="eyebrow">SHOPKART / THE COLLECTION</p><h1>Considered<br /><em>objects.</em></h1></div><p>Useful, beautiful, made for the rhythm of everyday life.</p></header>
    <div className="collection-layout">
      <aside className="collection-sidebar" aria-label="Product filters">
        <p className="sidebar-caption">REFINE YOUR SEARCH</p>
        <SearchBar search={search} category={category} onSearchChange={setSearch} onCategoryChange={setCategory} />
        <div className="sidebar-note"><span>THE SHOPKART PROMISE</span><p>Thoughtful finds. Current prices. Stock checked as you shop.</p></div>
      </aside>
      <section className="collection-results" aria-label="Product results">
        <div className="collection-toolbar"><span>{loading ? 'Gathering the collection…' : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`}</span><span>CURATED FOR EVERYDAY <i>✳</i></span></div>
        {loading ? <p className="state-message" role="status">Loading products...</p>
          : error ? <p className="state-message form-error" role="alert">Something went wrong while loading products.</p>
            : products.length === 0 ? <p className="state-message collection-empty">No pieces match this search. Try another term or category.</p>
              : <div className="product-grid" aria-label="Products">{products.map((product) => <ProductCard key={product._id} product={product} isWishlisted={wishlistIds.includes(product._id)} onWishlistAdded={markWishlisted} />)}</div>}
      </section>
    </div>
  </main></div>;
}
