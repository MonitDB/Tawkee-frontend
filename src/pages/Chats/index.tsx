import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useChatService } from '../../hooks/useChatService';

import { ChatList } from './components/ChatList';
import { EmptyState } from './components/EmptyState';
import { ChatDetails } from './components/ChatDetails';

import {
  ChatDto,
  InteractionWithMessagesDto,
  PaginatedInteractionsWithMessagesResponseDto,
} from '../../services/chatService';

import { Box, Card, CardContent } from '@mui/material';
import { useAgents } from '../../context/AgentsContext';
import { useSearchParams } from 'react-router-dom';

export default function Chats() {
  const { token, user } = useAuth();
  const { paginatedAgents } = useAgents();
  const { agents } = paginatedAgents;

  const {
    interactionLoading,
    fetchInteractionsWithMessagesOfChat,
    fetchChats,
  } = useChatService(token as string);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const chats = agents.flatMap(
    (wrapper) => wrapper.agent.paginatedChats?.data || []
  );

  const [totalChats, setTotalChats] = useState<number>(0);
  const [chatPage, setChatPage] = useState<number>(1);

  const [searchParams] = useSearchParams();
  const chatIdParam = searchParams.get('chatId');

  const handleFetchMoreInteractions = async (selectedChat: ChatDto) => {
    const currentMeta = selectedChat?.paginatedInteractions?.meta;
    const currentPage = currentMeta?.page || 0;
    const totalPages = currentMeta?.totalPages;

    if (totalPages !== undefined && currentPage >= totalPages) return;

    const pageToFetch = currentPage + 1;

    try {
      const response = await fetchInteractionsWithMessagesOfChat({
        chatId: selectedChat.id,
        page: pageToFetch,
      });

      if (!response || !response.data || !response.meta) {
        console.error(`Failed to fetch page ${pageToFetch}`);
        return;
      }

      const newInteractionsData = response.data;
      const newMeta = response.meta;
      const existingInteractionsData =
        selectedChat.paginatedInteractions?.data || [];

      const newInteractionsMap = new Map(
        newInteractionsData.map((i) => [i.id, i])
      );
      const existingIds = new Set(existingInteractionsData.map((i) => i.id));
      const merged: InteractionWithMessagesDto[] = [];

      // Add new interactions first (prepend)
      newInteractionsData.forEach((i) => {
        if (!existingIds.has(i.id)) {
          merged.push(i);
        }
      });

      // Add existing interactions, updating any from new data if needed
      existingInteractionsData.forEach((i) => {
        if (newInteractionsMap.has(i.id)) {
          merged.push(newInteractionsMap.get(i.id)!);
        } else {
          merged.push(i);
        }
      });

      // Sort chronologically by startAt (assumes ISO 8601 string or Date)
      merged.sort(
        (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
      );

      const updatedChat: ChatDto = {
        ...selectedChat,
        paginatedInteractions: {
          data: merged,
          meta: newMeta,
        },
      };

      setSelectedChatId(updatedChat.id);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchChatList = useCallback(async () => {
    try {
      const response = await fetchChats(user?.workspaceId as string, chatPage);

      setTotalChats(response?.meta?.total || 0);
    } catch {
      setTotalChats(0);
    }
  }, [fetchChats, user?.workspaceId, chatPage]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  // Select chat from query param if it exists
  useEffect(() => {
    if (!chatIdParam || selectedChatId || chats.length === 0) return;

    const chat = chats.find((c) => c.id === chatIdParam);
    if (chat) {
      (async () => {
        try {
          (await fetchInteractionsWithMessagesOfChat({
            chatId: chat.id,
            page: 1,
          })) as PaginatedInteractionsWithMessagesResponseDto;

          setSelectedChatId(chat.id);
        } catch (err) {
          console.error('Failed to fetch chat by chatId param:', err);
        }
      })();
    }
  }, [chatIdParam, chats, selectedChatId, fetchInteractionsWithMessagesOfChat]);

  const selectedChat = chats.find((chat) => chat.id == selectedChatId) || null;

  return (
    <Card
      variant="outlined"
      sx={{ margin: '0 auto', width: '100%', height: 'calc(100vh - 110px)' }}
    >
      <CardContent
        sx={{ p: 0, height: 'calc(100vh - 110px)', '&:last-child': { pb: 0 } }}
      >
        <Box sx={{ display: 'flex', height: '100%' }}>
          <Box
            sx={{
              minWidth: 100,
              maxWidth: '30vw',
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <ChatList
              selectedChat={selectedChat}
              setSelectedChatId={setSelectedChatId}
              chats={chats}
              totalChats={totalChats}
              setChatPage={setChatPage}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            {selectedChat ? (
              <ChatDetails
                selectedChat={selectedChat}
                totalInteractions={
                  selectedChat.paginatedInteractions?.meta?.total || 0
                }
                interactionLoading={interactionLoading}
                onScrollToTop={() => handleFetchMoreInteractions(selectedChat)}
              />
            ) : (
              <EmptyState interactionLoading={interactionLoading} />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
