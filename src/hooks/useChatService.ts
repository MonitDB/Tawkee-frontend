import { useState, useCallback, useMemo } from 'react';
import { ChatService } from '../services/chatService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';
import { useAuth } from '../context/AuthContext';

export const useChatService = (token: string) => {
  const { notify } = useHttpResponse(); // Destructure handleTokenExpirationError
  const { user, handleTokenExpirationError } = useAuth();
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
    () =>
      new ChatService({
        token,
        apiUrl: env.API_URL,
        userId: user?.id as string,
      }),
    [token, env.API_URL, user?.id]
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
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const finishChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.finishChat(chatId);
        syncAgentChatFinishStatus(chatId, true);

        notify('Chat marked as finished!', 'info');
        return response;
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const unfinishChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.unfinishChat(chatId);
        syncAgentChatFinishStatus(chatId, false);

        notify('Chat marked as unfinished!', 'info');
        return response;
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const readChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.readChat(chatId);
        syncAgentChatRead(chatId);

        return response;
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const startChatHumanAttendance = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.startHumanAttendanceChat(chatId);
        syncAgentChatHumanTalkStatus(chatId, true);

        notify('Started human attendance in chat!', 'info');
        return response;
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const stopChatHumanAttendance = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.stopHumanAttendanceChat(chatId);
        syncAgentChatHumanTalkStatus(chatId, false);

        notify('Stopped human attendance in chat!', 'info');
        return response;
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        setChatLoading(true);
        const response = await service.deleteChat(chatId);
        syncAgentChatDeletion(chatId);

        notify('Chat deleted successfully!', 'success');
        return response;
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setChatLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const fetchInteractionsWithMessagesOfChat = useCallback(
    async ({ chatId, page }: { chatId: string; page: number }) => {
      try {
        setInteractionLoading(true);
        const response = await service.findInteractionsWithMessages({
          chatId,
          page,
          pageSize: 1,
        });
        syncAgentChatInteractions(chatId, response);

        return response;
      } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
          // Handling network failures or fetch-specific errors
          if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Network error. Please check your internet connection.';
          } else {
            errorMessage = `Error: ${error.message}`;
          }
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
      } finally {
        setInteractionLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
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
