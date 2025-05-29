import {
    createContext,
    useEffect,
    useRef,
    ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import env from '../config/env';

import { useAuth } from './AuthContext';
import { useAgents } from './AgentsContext';

interface ConnectionStatusPayload {
  status: string;
  workspaceId: string;
}

interface ChannelConnectionStatusUpdatePayload {
  agentId: string;
  channelId: string;
  connectionStatus: string;
}

interface ErrorPayload {
  message: string;
}

interface SocketContextType {}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: SocketProviderProps) {
  const SOCKET_SERVER_URL: string = env.SOCKET_SERVER_URL || 'http://localhost:3000';

  const socketRef = useRef<Socket | null>(null);

  const { user } = useAuth();
  const { syncAgentChannelConnectionUpdate } = useAgents();

  useEffect(() => {
    const handleSocketConnect = () => {
      console.log('Connected to Socket.IO server!');
    };

    const handleSocketDisconnect = () => {
      console.log('Disconnected from Socket.IO server!');
    };

    const handleSocketConnectionStatus = (data: ConnectionStatusPayload) => {
      console.log(`Connection Status: ${data.status}`);
      if (data.workspaceId) {
        console.log(`My Workspace ID: ${data.workspaceId}`);
      }
    };

    const handleChannelConnectionStatusUpdate = (data: ChannelConnectionStatusUpdatePayload) => {
        syncAgentChannelConnectionUpdate(data.agentId, data.channelId, data.connectionStatus);
    }

    const handleSocketError = (error: ErrorPayload) => {
      console.error('Socket error:', error);
    };

    if (user) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        auth: { workspaceId: user.workspaceId }
        // transports: ['websocket'], // Forçar websocket, por exemplo
      });
  
      socketRef.current.on('connect', handleSocketConnect);
      socketRef.current.on('disconnect', handleSocketDisconnect);
      socketRef.current.on('connectionStatus', handleSocketConnectionStatus);
      socketRef.current.on('channelConnectionStatusUpdate', handleChannelConnectionStatusUpdate)  
      socketRef.current.on('error', handleSocketError);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off('connect', handleSocketConnect);
          socketRef.current.off('disconnect', handleSocketDisconnect);
          socketRef.current.off('connectionStatus', handleSocketConnectionStatus);
          socketRef.current.off('channelConnectionStatusUpdate', handleChannelConnectionStatusUpdate)  
          socketRef.current.off('error', handleSocketError);

          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }

  }, [user?.id]);


  const contextValue: SocketContextType = {};

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}