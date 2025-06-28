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
import Chats from '../pages/Chats';
import Dashboard from '../pages/Dashboard';
import Billing from '../pages/Billing';
import SubscriptionUpdated from '../pages/SubscriptionUpdated';
import Workspaces from '../pages/Workspaces';
import WorkspaceDetails from '../pages/WorkspaceDetails';
import Plans from '../pages/Plans';

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          key="0"
          path="/"
          element={
            <AppPageLayout>
              <Dashboard />
            </AppPageLayout>
          }
        />
        <Route
          key="1"
          path="/plans"
          element={
            <AppPageLayout>
              <Plans />
            </AppPageLayout>
          }
        />

        <Route
          key="2"
          path="/workspaces"
          element={
            <AppPageLayout>
              <Workspaces />
            </AppPageLayout>
          }
        />

        <Route
          key="3"
          path="/workspace/:workspaceId"
          element={
            <AppPageLayout segment="Workspace Details">
              <WorkspaceDetails />
            </AppPageLayout>
          }
        />

        <Route
          key="4"
          path="/agents"
          element={
            <AppPageLayout>
              <Agents />
            </AppPageLayout>
          }
        />

        <Route
          key="5"
          path="/agents/:agentId"
          element={
            <AppPageLayout segment="Agent Details">
              <AgentDetails />
            </AppPageLayout>
          }
        />

        <Route
          key="6"
          path="/chats"
          element={
            <AppPageLayout>
              <Chats />
            </AppPageLayout>
          }
        />

        <Route
          key="7"
          path="/billing"
          element={
            <AppPageLayout>
              <Billing />
            </AppPageLayout>
          }
        />

        <Route
          key="8"
          path="/auth/oauth-result"
          element={<OAuthCallbackPage />}
        />

        <Route key="9" path="/verify-email" element={<VerifyAccount />} />
        <Route key="10" path="/reset-password" element={<ResetPassword />} />
        <Route key="11" path="/billing-success" element={<SubscriptionUpdated />} />

        <Route
          key="*"
          path="*"
          element={
            <AppPageLayout>
              <Dashboard />
            </AppPageLayout>
          }
        />
      </Routes>
    </Suspense>
  );
}
