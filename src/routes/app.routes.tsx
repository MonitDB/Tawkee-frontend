import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import AppPageLayout from '../components/AppPageLayout';

import Loading from '../pages/Loading';
import Dashboard from '../pages/Dashboard';
import Agents from '../pages/Agents';


export function AppRoutes() {
    return (
        <Suspense fallback={<Loading/>}>
            <Routes>
                <Route key='0' path='/' element={<AppPageLayout><Dashboard /></AppPageLayout>} />
                <Route key='1' path='/agents' element={<AppPageLayout><Agents /></AppPageLayout>} />
                <Route key='2' path='/agents/:agentId/channels' element={<Dashboard />} />
                <Route key='3' path='/chats' element={<Dashboard />} />
            </Routes>
        </Suspense>
    );
}