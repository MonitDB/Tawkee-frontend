import { useState, useCallback, useMemo } from 'react';
import { ChatService } from '../services/chatService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';

export const useChatService = (token: string) => {
  const { notify } = useHttpResponse();
  const {
    syncAgentChats,
    syncAgentChatFinishStatus,
    syncAgentChatRead,
    syncAgentChatHumanTalkStatus,
    syncAgentChatDeletion,

    syncAgentChatInteractions,
  } = useAgents();

  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [interactionLoading, setInteractionLoading] = useState<boolean>(false);

  const service = useMemo(
    () => new ChatService({ token, apiUrl: env.API_URL }),
    [token, env.API_URL]
  );

  const fetchChats = useCallback(
    async (workspaceId: string, page: number) => {
      try {
        setChatLoading(true);
        const response = await service.findAll({
          workspaceId,
          page,
          pageSize: 3,
        });
        syncAgentChats(response);

        return response;
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

  const finishChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.finishChat(chatId);
        syncAgentChatFinishStatus(chatId, true);

        notify('Chat marked as finished!', 'info');
        return response;
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

  const unfinishChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.unfinishChat(chatId);
        syncAgentChatFinishStatus(chatId, false);

        notify('Chat marked as unread!', 'info');
        return response;
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

  const readChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        console.log('reading chat...')
        const response = await service.readChat(chatId);
        syncAgentChatRead(chatId);

        return response;
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

  const startChatHumanAttendance = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.startHumanAttendanceChat(chatId);
        syncAgentChatHumanTalkStatus(chatId, true);

        notify('Started human attendance in chat!', 'info');
        return response;
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

  const stopChatHumanAttendance = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.stopHumanAttendanceChat(chatId);
        syncAgentChatHumanTalkStatus(chatId, false);

        notify('Stopped human attendance in chat!', 'info');
        return response;
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

  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.deleteChat(chatId);
        syncAgentChatDeletion(chatId);

        notify('Chat deleted successfully!', 'success');
        return response;
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
    async ({ chatId, page }: { chatId: string; page: number }) => {
      try {
        setInteractionLoading(true);
        console.log('fetching interactions...')
        const response = await service.findInteractionsWithMessages({
          chatId,
          page,
          pageSize: 1,
        });
        syncAgentChatInteractions(chatId, response);

        return response;
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
    finishChat,
    unfinishChat,
    readChat,
    startChatHumanAttendance,
    stopChatHumanAttendance,
    deleteChat,
    chatLoading,

    fetchInteractionsWithMessagesOfChat,
    interactionLoading,
  };
};
