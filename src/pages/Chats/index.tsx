import { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

import { useChatService } from '../../hooks/useChatService';

import { ChatList } from './components/ChatList';
import { EmptyState } from './components/EmptyState';
import { ChatDetails } from './components/ChatDetails';

import {
  ChatDto,
  InteractionWithMessagesDto,
} from '../../services/chatService';

import { Box, Card, CardContent } from '@mui/material';

export default function Chats() {
  const { token } = useAuth();
  const { interactionLoading, fetchInteractionsWithMessagesOfChat } =
    useChatService(token as string);

  const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);

  const handleFetchMoreInteractions = async (selectedChat: ChatDto) => {
    // Get current pagination metadata from the selected chat
    const currentMeta = selectedChat?.paginatedInteractions?.meta;
    const currentPage = currentMeta?.page || 0; // Use current page from meta
    const totalPages = currentMeta?.totalPages;

    // console.log(`handleFetchMoreInteractions called. Current page in meta: ${currentPage}, Total pages: ${totalPages}`);

    // Check if we are already on the last page based on totalPages
    if (totalPages !== undefined && currentPage >= totalPages) {
      // console.log("Already fetched all pages.");
      return;
    }

    // Determine the next page number to fetch.
    // Based on user confirmation, we use the interactionPage state + 1.
    // This implies interactionPage state likely holds the number of the *last successfully fetched page*.
    const pageToFetch = currentPage + 1;
    // console.log(`Attempting to fetch page: ${pageToFetch}`);

    // Fetch the next page of interactions
    try {
      const response = await fetchInteractionsWithMessagesOfChat({
        chatId: selectedChat.id,
        page: pageToFetch,
      });

      // Check if the response is valid
      if (!response || !response.data || !response.meta) {
        console.error(
          `Failed to fetch interactions for page ${pageToFetch} or response format is invalid.`
        );
        // Consider how to handle this - maybe reset interactionPage state if the call failed?
        return;
      }

      // --- Update State and Merge Data ---
      const newInteractionsData = response.data;
      const newMeta = response.meta; // Use the meta from the latest response
      const existingInteractionsData =
        selectedChat.paginatedInteractions?.data || [];

      // --- Data Merging Logic ---
      // Merge strategy: Update existing items if IDs match in new data, add truly new items, keep old items not in new data.

      // 1. Create a map of new interactions for efficient lookup
      const newInteractionsMap = new Map(
        newInteractionsData.map((interaction) => [interaction.id, interaction])
      );

      // 2. Create a set of existing IDs for efficient lookup
      const existingInteractionIds = new Set(
        existingInteractionsData.map((interaction) => interaction.id)
      );

      // 3. Build the merged list
      const mergedInteractionsData: InteractionWithMessagesDto[] = [];
      const processedNewIds = new Set<string>();

      // Iterate through existing interactions
      existingInteractionsData.forEach((existingInteraction) => {
        if (newInteractionsMap.has(existingInteraction.id)) {
          // If exists in new data, use the new version (update)
          mergedInteractionsData.push(
            newInteractionsMap.get(existingInteraction.id)!
          );
          processedNewIds.add(existingInteraction.id);
        } else {
          // If not in new data, keep the existing version
          mergedInteractionsData.push(existingInteraction);
        }
      });

      // Add any remaining new interactions that weren't used for updates (truly new)
      newInteractionsData.forEach((newInteraction) => {
        if (!existingInteractionIds.has(newInteraction.id)) {
          mergedInteractionsData.push(newInteraction);
        }
      });
      // --- End of Data Merging Logic ---

      // Prepare the updated chat object with merged data and new meta
      const updatedChat: ChatDto = {
        ...selectedChat,
        paginatedInteractions: {
          data: mergedInteractionsData,
          meta: newMeta, // Replace meta completely with the latest response meta
        },
      };

      // Update the selected chat state
      setSelectedChat(updatedChat);
      // console.log(`Updated chat ${selectedChat.id}. Fetched page ${newMeta.page}. Total interactions now: ${mergedInteractionsData.length}. Meta updated.`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{ margin: '0 auto', width: '100%', height: 'calc(100vh - 110px)' }}
    >
      <CardContent
        sx={{ p: 0, height: 'calc(100vh - 110px)', '&:last-child': { pb: 0 } }}
      >
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Chat List */}
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
              setSelectedChat={setSelectedChat}
            />
          </Box>

          {/* Chat Detail or Empty State */}
          <Box sx={{ flex: 1 }}>
            {selectedChat ? (
              <ChatDetails
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
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
