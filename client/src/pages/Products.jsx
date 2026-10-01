import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts } from '../services/api';

export default function Products() {
  const { customer } = useOutletContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return <div className="home-page"><Navbar customer={customer} /><main className="products-content">
    <p className="eyebrow dark">SHOPKART COLLECTION</p><h1 className="page-title">Find your next favorite.</h1>
    <SearchBar search={search} category={category} onSearchChange={setSearch} onCategoryChange={setCategory} />
    {loading ? <p className="state-message" role="status">Loading products...</p>
      : error ? <p className="state-message form-error" role="alert">Something went wrong while loading products.</p>
        : products.length === 0 ? <p className="state-message">No products found.</p>
          : <section className="product-grid" aria-label="Products">{products.map((product) => <ProductCard key={product._id} product={product} />)}</section>}
  </main></div>;
}
