import { Link } from 'react-router-dom';

export default function AuthShell({ children, title, intro, alternate }) {
  return (
    <main className="auth-page">
      <section className="auth-aside">
        <Link className="brand light-brand" to="/login"><span className="brand-mark">S</span>shopkart</Link>
        <div className="aside-copy">
          <p className="eyebrow">THE GOOD THINGS, CLOSER</p>
          <h1>Everyday finds,<br /><em>beautifully</em> chosen.</h1>
          <p>A more thoughtful way to shop for the life you’re building.</p>
        </div>
        <div className="aside-orb orb-one" /><div className="aside-orb orb-two" />
        <p className="aside-foot">CURATED FOR YOUR EVERYDAY</p>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow dark">SHOPKART ACCOUNT</p>
          <h2>{title}</h2>
          <p className="intro">{intro}</p>
          {children}
          <p className="alternate">{alternate.text} <Link to={alternate.to}>{alternate.link}</Link></p>
        </div>
      </section>
    </main>
  );
}
