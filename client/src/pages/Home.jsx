import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts, getWishlist } from '../services/api';
import BrandMark from '../components/BrandMark';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getProducts(), getWishlist()]).then(([productResult, wishlistResult]) => {
      if (!active) return;
      if (productResult.status === 'fulfilled') setProducts(productResult.value.data.products.slice(0, 5));
      if (wishlistResult.status === 'fulfilled') setWishlistIds(wishlistResult.value.data.wishlist.map(product => product._id));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  function markWishlisted(productId, saved) {
    setWishlistIds(current => saved
      ? (current.includes(productId) ? current : [...current, productId])
      : current.filter(id => id !== productId));
  }

  const heroProduct = products[0];
  return <div className="home-page"><Navbar /><main className="store-home">
    <section className="home-hero">
      <div className="home-hero-copy"><p className="eyebrow">THE AROVA EDIT <span> / 01</span></p><h1>For the life<br />you <em>love living.</em></h1><p>Discover thoughtfully chosen pieces that make everyday feel a little more extraordinary.</p><Link className="dark-button" to="/products">Discover the collection <span>↗</span></Link><div className="hero-footnote"><span>01 — 05</span><span>OBJECTS FOR EVERYDAY LIVING</span></div></div>
      <div className="home-hero-visual">
        {heroProduct ? <Link to={`/products/${heroProduct._id}`} aria-label={`Discover ${heroProduct.name}`}><img src={heroProduct.image} alt={heroProduct.name} width="1200" height="1080" fetchPriority="high" decoding="async" /><span className="hero-product-note"><small>THE EDIT / 01</small><strong>{heroProduct.name}</strong><span>₹{Number(heroProduct.price).toLocaleString('en-IN')} <b aria-hidden="true">↗</b></span></span></Link> : <div className="hero-image-placeholder"><span>OBJECTS<br />WITH INTENTION</span></div>}
        <span className="hero-side-note">AROVA — EST. 2024</span>
      </div>
      <a className="hero-scroll" href="#featured">SCROLL TO DISCOVER <span>↓</span></a>
    </section>
    <section className="home-values" aria-label="Arova values"><p>THE ART OF EVERYDAY</p><span>Thoughtful design</span><BrandMark className="values-brand-mark" decorative /><span>Made to be lived with</span><BrandMark className="values-brand-mark" decorative /><span>Chosen with care</span></section>
    <section className="featured-section" id="featured">
      <div className="section-title-row"><div><p className="eyebrow">A FEW GOOD THINGS</p><h2>Selected for you<span>.</span></h2></div><Link className="text-link" to="/products">View all pieces <span>↗</span></Link></div>
      {loading ? <p className="state-message" role="status">Curating your edit…</p> : products.length === 0 ? <div className="home-empty"><p>The collection is being prepared.</p><Link to="/products">Explore the catalogue ↗</Link></div> : <div className="product-grid home-featured-grid">{products.slice(0, 4).map(product => <ProductCard key={product._id} product={product} isWishlisted={wishlistIds.includes(product._id)} onWishlistAdded={markWishlisted} />)}</div>}
      <div className="featured-bottom"><span>AN EVER-CHANGING COLLECTION</span><Link to="/products">Explore the complete collection <span>↗</span></Link></div>
    </section>
    <section className="home-note"><p className="eyebrow">A NOTE ON GOOD DESIGN</p><h2>Objects that earn<br />their place in your life.</h2><Link className="outline-button" to="/products">Find your next favourite <span>↗</span></Link></section>
  </main></div>;
}
