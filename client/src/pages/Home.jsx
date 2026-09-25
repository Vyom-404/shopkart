import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Detail({ label, value, icon }) { return <div className="detail"><span className="detail-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>; }

export default function Home() {
  const { customer } = useOutletContext();
  const name = customer.fullName.split(' ')[0];
  return <div className="home-page"><Navbar customer={customer} /><main className="home-content">
    <section className="welcome">
      <div><p className="eyebrow dark">YOUR SHOPKART SPACE</p><h1>Good to see you,<br /><em>{name}.</em></h1><p>Your account is all set. Discover things that make the ordinary feel a little more considered.</p><button className="dark-button">Explore the collection <span>→</span></button></div>
      <div className="hero-art" aria-hidden="true"><span className="arch" /><span className="sun" /><span className="leaf leaf-a">✦</span><span className="leaf leaf-b">✦</span><span className="vase" /></div>
    </section>
    <section className="profile-section">
      <div className="section-heading"><div><p className="eyebrow dark">ACCOUNT DETAILS</p><h2>Your profile</h2></div><span className="status"><i /> Account active</span></div>
      <div className="details-card"><Detail icon="♙" label="FULL NAME" value={customer.fullName} /><Detail icon="@" label="EMAIL ADDRESS" value={customer.email} /><Detail icon="◌" label="PHONE NUMBER" value={customer.phone} /></div>
    </section>
    <section className="perks"><p>SHOPKART MEMBERSHIP</p><div><span>01</span><strong>Thoughtfully<br />selected</strong><span>02</span><strong>Made for your<br />everyday</strong><span>03</span><strong>A little delight,<br />delivered</strong></div></section>
  </main></div>;
}
