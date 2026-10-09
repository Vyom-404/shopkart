import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function Home() {
  return <div className="home-page"><Navbar /><main className="home-content shop-home-content">
    <section className="welcome shop-hero">
      <div className="shop-hero-copy"><p className="eyebrow">SHOPKART / CURATED GOODS</p><h1>Everyday,<br /><em>considered.</em></h1><p>Well-made pieces for your home, your work, and the rituals in between.</p><Link className="dark-button" to="/products">Explore the collection <span>↗</span></Link></div>
      <div className="hero-art" aria-hidden="true"><span className="art-label">A STUDY IN<br />GOOD LIVING</span><span className="arch" /><span className="sun" /><span className="leaf leaf-a">✳</span><span className="leaf leaf-b">✳</span><span className="vase" /></div>
    </section>
    <section className="shop-highlights" aria-label="ShopKart highlights">
      <div><span>01</span><strong>Considered finds</strong><p>Useful pieces with a little extra thought.</p></div>
      <div><span>02</span><strong>Made for every day</strong><p>Good design that fits into real life.</p></div>
      <div><span>03</span><strong>A better kind of browse</strong><p>Take your time and find what feels right.</p></div>
    </section>
    <section className="home-shop-cta"><div><p className="eyebrow dark">A GOOD PLACE TO START</p><h2>Something lovely<br /><em>is just around the corner.</em></h2></div><Link className="outline-button" to="/products">Explore all products <span>↗</span></Link></section>
  </main></div>;
}
