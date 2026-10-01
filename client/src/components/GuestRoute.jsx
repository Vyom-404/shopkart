import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../services/api';

export default function GuestRoute() {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/customers/me')
      .then(() => { if (active) setAuthenticated(true); })
      .catch(() => { if (active) setAuthenticated(false); });
    return () => { active = false; };
  }, []);

  if (authenticated === null) {
    return <div className="loading-page"><span className="loader" />Checking your session…</div>;
  }

  return authenticated ? <Navigate to="/home" replace /> : <Outlet />;
}
