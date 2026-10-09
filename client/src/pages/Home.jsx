import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function Home() {
  return <div className="home-page"><Navbar /><main className="home-content shop-home-content">
    <section className="welcome shop-hero">
      <div className="shop-hero-copy"><p className="eyebrow">THE SHOPKART EDIT <span>—</span> EVERYDAY, REIMAGINED</p><h1>Find your next<br /><em>everyday favourite.</em></h1><p>Thoughtful finds for the little rituals, big plans, and everything in between.</p><Link className="dark-button" to="/products">Shop the collection <span>→</span></Link></div>
      <div className="hero-art" aria-hidden="true"><span className="art-label">GOOD THINGS<br />LIVE HERE</span><span className="arch" /><span className="sun" /><span className="leaf leaf-a">✦</span><span className="leaf leaf-b">✦</span><span className="vase" /></div>
    </section>
    <section className="shop-highlights" aria-label="ShopKart highlights">
      <div><span>01</span><strong>Considered finds</strong><p>Useful pieces with a little extra thought.</p></div>
      <div><span>02</span><strong>Made for every day</strong><p>Good design that fits into real life.</p></div>
      <div><span>03</span><strong>A better kind of browse</strong><p>Take your time and find what feels right.</p></div>
    </section>
    <section className="home-shop-cta"><div><p className="eyebrow dark">A GOOD PLACE TO START</p><h2>Something lovely<br /><em>is just around the corner.</em></h2></div><Link className="outline-button" to="/products">Explore all products <span>↗</span></Link></section>
  </main></div>;
}
