import { BrowserRouter } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import AppRoutes from './app.routes';
import AuthRoutes from './auth.routes';

export function Routes() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated ? <AppRoutes /> : <AuthRoutes />}
    </BrowserRouter>
  );
}
