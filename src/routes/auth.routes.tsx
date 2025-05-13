import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import Loading from '../pages/Loading';
import MarketingPage from '../pages/Marketing';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import OAuthCallbackPage from '../pages/OAuthCallback';


export function AuthRoutes() {
    return (
        <Suspense fallback={<Loading/>}>
            <Routes>
                <Route key='0' path='/' element={<MarketingPage />} />
                <Route key='1' path='/sign-in' element={<SignIn />} />
                <Route key='2' path='/sign-up' element={<SignUp />} />
                <Route key='3' path='/auth/oauth-result' element={<OAuthCallbackPage />} />

                <Route key='*' path='*' element={<MarketingPage />} />
            </Routes>
        </Suspense>
    );
}