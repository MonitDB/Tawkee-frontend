import { useState, useCallback, useMemo } from 'react';
import { ChatService } from '../services/chatService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';

export const useChatService = (token: string) => {
  const { notify } = useHttpResponse();
  const { syncAgentChats } = useAgents();

  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [totalChats, setTotalChats] = useState<number>(0);

  const [interactionLoading, setInteractionLoading] = useState<boolean>(false);
  const [totalInteractions, setTotalInteractions] = useState<number>(0);

  const service = useMemo(
    () => new ChatService({ token, apiUrl: env.API_URL }),
    [token, env.API_URL]
  );

  const fetchChats = useCallback(
    async (workspaceId: string, page: number) => {
      try {
        setChatLoading(true);
        const response = await service.findAll({ workspaceId, page, pageSize: 3 });
        setTotalChats(response.meta.total);
        syncAgentChats(response.data);

        return response.data;
      } catch (error) {
        notify(
          error instanceof Error ? error.message : 'Unknown error',
          'error'
        );
        return null;
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify]
  );

  const fetchInteractionsWithMessagesOfChat = useCallback(
    async (chatId: string, page: number) => {
      try {
        setInteractionLoading(true);
        const response = await service.findInteractionsWithMessages({ chatId, page, pageSize: 3 });
        setTotalInteractions(response.meta.total);
        // syncAgentChats(response.data);

        return response.data;
      } catch (error) {
        notify(
          error instanceof Error ? error.message : 'Unknown error',
          'error'
        );
        return null;
      } finally {
        setInteractionLoading(false);
      }
    },
    [service, notify]
  );

  return {
    fetchChats,
    totalChats,
    chatLoading,

    fetchInteractionsWithMessagesOfChat,
    totalInteractions,
    interactionLoading
  };
};
