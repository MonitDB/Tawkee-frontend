import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import AppPageLayout from '../components/AppPageLayout';

import Loading from '../pages/Loading';
// import Dashboard from '../pages/Dashboard';
import Agents from '../pages/Agents';
import OAuthCallbackPage from '../pages/OAuthCallback';
import VerifyAccount from '../pages/VerifyAccount';
import ResetPassword from '../pages/ResetPassword';
import AgentDetails from '../pages/AgentDetails';

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          key="0"
          path="/"
          element={
            <AppPageLayout>
              {/* <Dashboard /> */}
              <Agents />
            </AppPageLayout>
          }
        />
        <Route
          key="1"
          path="/agents"
          element={
            <AppPageLayout>
              <Agents />
            </AppPageLayout>
          }
        />
        {/* <Route
          key="2"
          path="/agents/:agentId/channels"
          element={
            <AppPageLayout>
              <Dashboard />
            </AppPageLayout>
          }
        /> */}

        <Route
          key="3"
          path="/agents/:agentId/:tabName"
          element={
            <AppPageLayout segment="Agent Details">
              <AgentDetails />
            </AppPageLayout>
          }
        />

        {/* <Route
          key="4"
          path="/chats"
          element={
            <AppPageLayout>
              <Dashboard />
            </AppPageLayout>
          }
        /> */}
        <Route
          key="5"
          path="/auth/oauth-result"
          element={<OAuthCallbackPage />}
        />

        <Route key="6" path="/verify-email" element={<VerifyAccount />} />
        <Route key="7" path="/reset-password" element={<ResetPassword />} />

        <Route
          key="*"
          path="*"
          element={
            <AppPageLayout>
              <Agents />
            </AppPageLayout>
          }
        />
      </Routes>
    </Suspense>
  );
}
