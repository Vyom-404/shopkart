import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../services/api';

/**
 * Route-level authentication guard. It checks the HttpOnly cookie with the API
 * before rendering any protected child route.
 */
export default function ProtectedRoute() {
  const location = useLocation();
  const [state, setState] = useState({ checking: true, customer: null });

  useEffect(() => {
    let mounted = true;

    api.get('/customers/me')
      .then(({ data }) => {
        if (mounted) setState({ checking: false, customer: data });
      })
      .catch(() => {
        if (mounted) setState({ checking: false, customer: null });
      });

    return () => { mounted = false; };
  }, []);

  if (state.checking) {
    return <div className="loading-page"><span className="loader" />Checking your session…</div>;
  }

  if (!state.customer) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet context={{ customer: state.customer }} />;
}
