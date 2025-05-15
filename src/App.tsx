import { HttpResponseProvider } from './context/ResponseNotifier';
import { AuthProvider } from './context/AuthContext';
import { AgentsProvider } from './context/AgentsContext';

import { Routes } from './routes';

export default function App() {
  return (
    <HttpResponseProvider>
      <AuthProvider>
        <AgentsProvider>
          <Routes />
        </AgentsProvider>
      </AuthProvider>
    </HttpResponseProvider>
  );
}
