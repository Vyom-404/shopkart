import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Detail({ label, value, icon }) {
  return <div className="detail"><span className="detail-icon">{icon}</span><div><small>{label}</small><strong>{value || 'Not provided'}</strong></div></div>;
}

export default function Profile() {
  const { customer } = useOutletContext();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post('/customers/logout');
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return <div className="home-page"><Navbar /><main className="profile-content">
    <div className="profile-heading"><div><p className="eyebrow dark">YOUR ACCOUNT</p><h1 className="page-title">Profile<span>.</span></h1><p className="profile-intro">Your ShopKart details, all in one place.</p></div><button className="logout profile-logout" onClick={handleLogout}>Sign out <span aria-hidden="true">↗</span></button></div>
    <section className="profile-card" aria-label="Account details">
      <div className="profile-card-top"><span className="profile-avatar" aria-hidden="true">{customer.fullName.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</span><div><p className="eyebrow dark">SHOPKART MEMBER</p><h2>{customer.fullName}</h2></div><span className="status"><i /> Account active</span></div>
      <div className="details-card"><Detail icon="@" label="EMAIL ADDRESS" value={customer.email} /><Detail icon="◌" label="PHONE NUMBER" value={customer.phone} /></div>
    </section>
  </main></div>;
}
