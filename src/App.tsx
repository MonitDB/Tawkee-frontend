import { HttpResponseProvider } from './context/ResponseNotifier';
import { AuthProvider } from './context/AuthContext';
import { AgentsProvider } from './context/AgentsContext';

import { Routes } from './routes';
import { SocketProvider } from './context/SocketContext';

export default function App() {
  return (
    <HttpResponseProvider>
      <AuthProvider>
        <AgentsProvider>
          <SocketProvider>
              <Routes />
          </SocketProvider>
        </AgentsProvider>
      </AuthProvider>
    </HttpResponseProvider>
  );
}
