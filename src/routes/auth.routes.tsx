import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import Loading from '../pages/Loading';
import MarketingPage from '../pages/Marketing';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import OAuthCallbackPage from '../pages/OAuthCallback';
import VerifyAccount from '../pages/VerifyAccount';
import ResetPassword from '../pages/ResetPassword';

export default function AuthRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route key="0" path="/" element={<MarketingPage />} />
        <Route key="1" path="/sign-in" element={<SignIn />} />
        <Route key="2" path="/sign-up" element={<SignUp />} />
        <Route
          key="3"
          path="/auth/oauth-result"
          element={<OAuthCallbackPage />}
        />

        <Route key="4" path="/verify-email" element={<VerifyAccount />} />
        <Route key="5" path="/reset-password" element={<ResetPassword />} />

        <Route key="*" path="*" element={<MarketingPage />} />
      </Routes>
    </Suspense>
  );
}
