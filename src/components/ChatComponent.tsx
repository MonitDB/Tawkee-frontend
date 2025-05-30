import {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
  FocusEvent,
} from 'react';
import { io, Socket } from 'socket.io-client';

// Tipos para as mensagens
interface ChatMessage {
  content: string;
  senderId?: string;
  chatId: string;
  timestamp: string | Date;
}

interface DirectMessage {
  content: string;
  senderId?: string;
  recipientId: string;
  timestamp: string | Date;
}

interface ConnectionStatusPayload {
  status: string;
  clientId?: string;
}

interface ChatNotification {
  chatId: string;
  message: string;
}

interface ErrorPayload {
  message: string;
}

interface ClientNotification {
  text: string;
  time: string;
}

// Configura a URL do seu servidor Socket.IO
const SOCKET_SERVER_URL: string =
  import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3000';

let socket: Socket;

export default function ChatComponent() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [messageInput, setMessageInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);

  const addNotification = useCallback((text: string) => {
    setNotifications((prev) => [
      ...prev,
      { text, time: new Date().toLocaleTimeString() },
    ]);
  }, []);

  useEffect(() => {
    socket = io(SOCKET_SERVER_URL, {
      // transports: ['websocket'], // Forçar websocket, por exemplo
    });

    socket.on('connect', () => {
      setIsConnected(true);
      addNotification('Conectado ao servidor Socket.IO!');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addNotification('Desconectado do servidor Socket.IO.');
      setClientId(null);
    });

    socket.on('connectionStatus', (data: ConnectionStatusPayload) => {
      addNotification(`Status da conexão: ${data.status}`);
      if (data.clientId) {
        setClientId(data.clientId);
        addNotification(`Meu Client ID: ${data.clientId}`);
      }
    });

    socket.on('newMessageInChat', (message: ChatMessage) => {
      addNotification(
        `Nova mensagem no chat ${message.chatId} de ${message.senderId || 'desconhecido'}: ${message.content}`
      );
      // Adicionar a mensagem apenas se for do chat atual que o usuário está visualizando
      // Ou você pode ter uma lógica mais complexa para armazenar mensagens de múltiplos chats
      // Usando uma função de callback para setCurrentChatId para pegar o valor mais recente
      setCurrentChatId((prevCurrentChatId) => {
        if (message.chatId === prevCurrentChatId) {
          setChatMessages((prevMessages) => [...prevMessages, message]);
        }
        return prevCurrentChatId;
      });
    });

    socket.on('directMessage', (message: DirectMessage) => {
      addNotification(
        `Mensagem direta de ${message.senderId || 'desconhecido'}: ${message.content}`
      );
      setDirectMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('joinedChat', (data: ChatNotification) => {
      addNotification(data.message);
    });

    socket.on('leftChat', (data: ChatNotification) => {
      addNotification(data.message);
    });

    socket.on('error', (error: ErrorPayload) => {
      addNotification(`Erro do servidor: ${error.message}`);
      console.error('Socket error:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [addNotification]);

  const handleJoinChat = (chatIdToJoin: string) => {
    if (!socket || !isConnected) {
      addNotification('Não conectado ao servidor.');
      return;
    }
    if (!chatIdToJoin) {
      addNotification('Por favor, insira um ID de Chat para entrar.');
      return;
    }
    socket.emit('joinChat', { chatId: chatIdToJoin });
    setCurrentChatId(chatIdToJoin);
    setChatMessages([]);
    addNotification(`Tentando entrar no chat: ${chatIdToJoin}`);
  };

  const handleLeaveChat = () => {
    if (!socket || !isConnected || !currentChatId) {
      addNotification('Não conectado ou não está em um chat.');
      return;
    }
    socket.emit('leaveChat', { chatId: currentChatId });
    addNotification(`Saindo do chat: ${currentChatId}`);
    setCurrentChatId('');
    setChatMessages([]);
  };

  const handleSendMessageToChat = () => {
    if (!socket || !isConnected || !currentChatId || !messageInput.trim()) {
      addNotification('Não conectado, não está em um chat ou mensagem vazia.');
      return;
    }
    socket.emit('sendMessageToChat', {
      chatId: currentChatId,
      content: messageInput,
    });
    addNotification(`Enviando para ${currentChatId}: ${messageInput}`);
    setMessageInput('');
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(event.target.value);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessageToChat();
    }
  };

  const handleChatIdBlur = (event: FocusEvent<HTMLInputElement>) => {
    handleJoinChat(event.target.value);
  };

  return (
    <div>
      <h1>Socket.IO Chat com React e Vite (TypeScript)</h1>
      <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      {clientId && <p>Seu Client ID: {clientId}</p>}

      <div>
        <h2>Notificações / Logs do Cliente</h2>
        <ul
          style={{
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          {notifications.map((notif, index) => (
            <li key={index}>
              <em>{notif.time}:</em> {notif.text}
            </li>
          ))}
        </ul>
      </div>

      <hr />

      <div>
        <h2>Gerenciamento de Chat</h2>
        <input
          type="text"
          placeholder="ID do Chat para Entrar"
          onBlur={handleChatIdBlur}
          defaultValue={currentChatId} // Considerar controlar este input se precisar de mais flexibilidade
        />
        {currentChatId && (
          <button onClick={handleLeaveChat} style={{ marginLeft: '10px' }}>
            Sair do Chat ({currentChatId})
          </button>
        )}
      </div>

      {currentChatId && (
        <div>
          <h3>Mensagens do Chat: {currentChatId}</h3>
          <div
            style={{
              height: '200px',
              overflowY: 'scroll',
              border: '1px solid #eee',
              padding: '10px',
              marginBottom: '10px',
            }}
          >
            {chatMessages.length === 0 && (
              <p>Nenhuma mensagem neste chat ainda.</p>
            )}
            {chatMessages.map((msg, index) => (
              <div key={index}>
                <strong>
                  {msg.senderId === clientId
                    ? 'Você'
                    : msg.senderId || 'Desconhecido'}
                  :
                </strong>{' '}
                {msg.content} (
                <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>)
              </div>
            ))}
          </div>
          <input
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSendMessageToChat}>Enviar Mensagem</button>
        </div>
      )}
      {!currentChatId && (
        <p>Entre em um chat para enviar e receber mensagens.</p>
      )}

      <hr />

      <div>
        <h3>Mensagens Diretas Recebidas</h3>
        <div
          style={{
            height: '150px',
            overflowY: 'scroll',
            border: '1px solid #eee',
            padding: '10px',
          }}
        >
          {directMessages.length === 0 && (
            <p>Nenhuma mensagem direta recebida.</p>
          )}
          {directMessages.map((msg, index) => (
            <div key={index}>
              <strong>De: {msg.senderId || 'Desconhecido'}:</strong>{' '}
              {msg.content} (
              <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
