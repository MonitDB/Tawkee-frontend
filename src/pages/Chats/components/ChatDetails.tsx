import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatDto, InteractionStatus } from '../../../services/chatService';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { useChatService } from '../../../hooks/useChatService';

import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import ChatInput from './ChatInput';
import { useAgents } from '../../../context/AgentsContext';

// Helper function for throttling
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const getInteractionStatusIcon = (status: InteractionStatus) => {
  switch (status) {
    case 'RESOLVED':
      return <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    case 'RUNNING':
      return <ScheduleIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
    case 'WAITING':
      return <ErrorIcon sx={{ fontSize: 16, color: 'info.main' }} />;
    default:
      return <ScheduleIcon sx={{ fontSize: 16, color: 'grey.500' }} />;
  }
};

const getInteractionStatusColor = (status: InteractionStatus) => {
  switch (status) {
    case 'RESOLVED':
      return 'success';
    case 'RUNNING':
      return 'warning';
    case 'WAITING':
      return 'error';
    default:
      return 'default';
  }
};

const InteractionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  '&::before, &::after': {
    borderColor: theme.palette.primary.main,
  },
}));

interface ChatDetailsProps {
  selectedChat: ChatDto;
  totalInteractions: number;
  interactionLoading: boolean;
  onScrollToTop?: () => void;
}

export function ChatDetails({
  selectedChat,
  totalInteractions,
  interactionLoading,
  onScrollToTop,
}: ChatDetailsProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const { token } = useAuth();
  const { syncAgentMessageChatUpdate } = useAgents();
  const { startChatHumanAttendance, chatLoading } = useChatService(
    token as string
  );

  const handleStartHumanAttendance = useCallback(
    async (chatId: string) => {
      try {
        await startChatHumanAttendance(chatId);
      } catch (error) {
        console.log(error);
      }
    },
    [startChatHumanAttendance]
  );

  // Separate scroll-related state to minimize re-renders
  const [scrollState, setScrollState] = useState({
    visibleInteraction: 0,
    showFloatingIndicator: false,
    hasTriggeredTopCallback: false,
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const interactionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const scrollTimeoutRef = useRef<number | null>(null);

  // Scroll preservation state
  const preservationRef = useRef({
    interactionIndex: 0,
    relativeScrollOffset: 0,
    shouldPreserve: false,
  });
  const prevInteractionsLength = useRef(
    selectedChat.paginatedInteractions?.data?.length || 0
  );

  // Memoize formatDateTime to avoid recreating on every render
  const formatDateTime = useCallback((input: number) => {
    const date = new Date(input);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const timeString = date.toLocaleTimeString(['en-US'], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (messageDate.getTime() === today.getTime()) {
      return { date: 'Today', time: timeString };
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return { date: 'Yesterday', time: timeString };
    } else {
      return {
        date: date.toLocaleDateString(['en-US'], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year:
            date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        }),
        time: timeString,
      };
    }
  }, []);

  // Handle scroll preservation when interactions change
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !selectedChat.paginatedInteractions?.data) return;

    const currentLength = selectedChat.paginatedInteractions?.data.length;
    const lengthDifference = currentLength - prevInteractionsLength.current;

    if (lengthDifference > 0 && preservationRef.current.shouldPreserve) {
      const targetInteractionIndex =
        preservationRef.current.interactionIndex + lengthDifference;
      const targetInteractionElement =
        interactionRefs.current[targetInteractionIndex];

      if (targetInteractionElement) {
        const targetTop =
          targetInteractionElement.offsetTop - container.offsetTop;
        const newScrollPosition =
          targetTop - preservationRef.current.relativeScrollOffset;

        container.scrollTop = Math.max(0, newScrollPosition);
      }

      preservationRef.current.shouldPreserve = false;
    }

    prevInteractionsLength.current = currentLength;
  }, [selectedChat.paginatedInteractions?.data]);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(
    throttle(() => {
      if (!messagesContainerRef.current) return;

      const container = messagesContainerRef.current;
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const viewportTop = containerTop;
      const viewportBottom = containerTop + containerHeight;

      // Batch state updates to minimize re-renders
      setScrollState((prevState) => {
        const isAtTop = containerTop <= 5;
        let currentInteractionIndex = prevState.visibleInteraction; // Default to previous state

        // --- Start of Corrected Logic for visibleInteraction ---
        let newVisibleInteractionIndex = prevState.visibleInteraction; // Start with previous
        let minDistance = Infinity;
        let foundVisible = false;

        const interactionIndices = Object.keys(interactionRefs.current)
          .map(Number)
          .sort((a, b) => a - b); // Ensure sorted order

        for (const index of interactionIndices) {
          const element = interactionRefs.current[index];
          if (element) {
            const elementTop = element.offsetTop - container.offsetTop;
            const elementBottom = elementTop + element.offsetHeight;

            // Check if any part of the element is within the viewport
            if (elementTop < viewportBottom && elementBottom > viewportTop) {
              foundVisible = true;
              // Calculate distance from element top to viewport top
              const distance = Math.abs(elementTop - viewportTop);

              // Find the element whose top is closest to the viewport top
              if (distance < minDistance) {
                minDistance = distance;
                newVisibleInteractionIndex = index;
              }
            } else if (foundVisible) {
              // Optimization: If we've already found visible elements and this one is completely below,
              // we can stop searching as elements are sorted by position.
              break;
            }
          }
        }

        // Handle edge case: Scrolled to the very bottom
        if (
          containerTop + containerHeight >= container.scrollHeight - 5 &&
          interactionIndices.length > 0
        ) {
          newVisibleInteractionIndex =
            interactionIndices[interactionIndices.length - 1];
        }
        // Handle edge case: Scrolled to the very top
        else if (containerTop <= 5 && interactionIndices.length > 0) {
          newVisibleInteractionIndex = interactionIndices[0];
        }

        currentInteractionIndex = newVisibleInteractionIndex; // Update the variable used later
        // --- End of Corrected Logic for visibleInteraction ---

        // Store scroll preservation data when near the top
        if (isAtTop || containerTop < 100) {
          const currentElement =
            interactionRefs.current[currentInteractionIndex];
          if (currentElement) {
            preservationRef.current = {
              interactionIndex: currentInteractionIndex,
              relativeScrollOffset:
                currentElement.offsetTop - container.offsetTop - containerTop,
              shouldPreserve: true,
            };
          }
        }

        // Handle top callback
        if (isAtTop && !prevState.hasTriggeredTopCallback && onScrollToTop) {
          onScrollToTop();
        }

        // Only update state if the visible interaction actually changed
        if (
          currentInteractionIndex !== prevState.visibleInteraction ||
          !prevState.showFloatingIndicator ||
          isAtTop !== prevState.hasTriggeredTopCallback
        ) {
          return {
            visibleInteraction: currentInteractionIndex,
            showFloatingIndicator: true,
            hasTriggeredTopCallback: isAtTop ? true : false,
          };
        }

        // If nothing changed relevant to the indicator, return previous state to avoid re-render
        return prevState;
      });

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to hide indicator
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollState((prev) => ({ ...prev, showFloatingIndicator: false }));
      }, 2000);
    }, 16), // ~60fps throttling
    [onScrollToTop]
  );

  // Track visible interaction while scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call

      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom on chat change
  useEffect(() => {
    if (
      messagesContainerRef.current &&
      selectedChat.paginatedInteractions?.data &&
      selectedChat.paginatedInteractions?.data.length > 0
    ) {
      const container = messagesContainerRef.current;
      // Only scroll to bottom if not preserving scroll position
      if (preservationRef.current?.shouldPreserve) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [selectedChat.id, selectedChat.paginatedInteractions?.data]);

  // Memoize current date calculation
  const currentDate = useMemo(() => {
    if (
      !selectedChat.paginatedInteractions?.data ||
      selectedChat.paginatedInteractions?.data.length === 0 ||
      scrollState.visibleInteraction < 0 || // Add check for valid index
      scrollState.visibleInteraction >=
        selectedChat.paginatedInteractions.data.length
    )
      return '';

    const currentInteraction =
      selectedChat.paginatedInteractions?.data[scrollState.visibleInteraction];
    if (
      !currentInteraction ||
      !currentInteraction.messages ||
      currentInteraction.messages.length === 0
    )
      return '';

    const firstMessage = currentInteraction.messages[0];
    const { date } = formatDateTime(firstMessage.createdAt);
    return date;
  }, [
    selectedChat.paginatedInteractions?.data,
    scrollState.visibleInteraction,
    formatDateTime,
  ]);

  // Memoize current interaction details for the floating indicator
  const currentFloatingInteraction = useMemo(() => {
    if (
      !selectedChat.paginatedInteractions?.data ||
      selectedChat.paginatedInteractions?.data.length === 0 ||
      scrollState.visibleInteraction < 0 ||
      scrollState.visibleInteraction >=
        selectedChat.paginatedInteractions.data.length
    ) {
      return null;
    }
    return selectedChat.paginatedInteractions.data[
      scrollState.visibleInteraction
    ];
  }, [
    selectedChat.paginatedInteractions?.data,
    scrollState.visibleInteraction,
  ]);

  return (
    <Box
      sx={{
        height: 'calc(100% - 50px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Chat Header */}
      <Paper
        sx={{ p: 2, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={selectedChat.userPicture || undefined}
            alt={selectedChat.userName}
          >
            {selectedChat.userName?.[0] || <PersonIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {selectedChat.userName || selectedChat.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {selectedChat.whatsappPhone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Agent {selectedChat.agentName}
              </Typography>
              {!isSmallScreen && (
                <Typography variant="body2" color="text.secondary">
                  • {totalInteractions} interaction
                  {totalInteractions > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedChat.humanTalk && (
              <Chip size="small" label="Human Talk" color="warning" />
            )}
            {selectedChat.finished && (
              <Chip size="small" label="Finished" color="success" />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Floating Date and Interaction Indicator */}
      {currentFloatingInteraction && (
        <Paper
          sx={{
            position: 'absolute',
            top: 60, // Adjust as needed
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            opacity: scrollState.showFloatingIndicator ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: scrollState.showFloatingIndicator ? 'auto' : 'none',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
          >
            {currentDate}
          </Typography>

          <Chip
            size="small"
            icon={getInteractionStatusIcon(currentFloatingInteraction.status)}
            label={`Interaction #${(selectedChat?.paginatedInteractions?.meta?.total || 0) - ((selectedChat?.paginatedInteractions?.data?.length || 0) - 1 - scrollState.visibleInteraction)} - ${currentFloatingInteraction.status}`}
            color={getInteractionStatusColor(currentFloatingInteraction.status)}
            sx={{ backgroundColor: 'background.paper' }}
          />
        </Paper>
      )}

      {/* Messages Area */}
      {interactionLoading && (
        <LinearProgress color="secondary" sx={{ width: '100%' }} />
      )}
      <Box ref={messagesContainerRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {selectedChat.paginatedInteractions?.data &&
          [...(selectedChat?.paginatedInteractions?.data || [])]
            .reverse()
            .map((interaction, interactionIndex) => (
              <Box
                key={interaction.id}
                ref={(el: HTMLDivElement | null) => {
                  interactionRefs.current[interactionIndex] = el;
                }}
              >
                {/* Interaction Header */}
                <InteractionDivider>
                  <Chip
                    size="small"
                    icon={getInteractionStatusIcon(interaction.status)}
                    label={`Interaction #${(selectedChat?.paginatedInteractions?.meta?.total || 0) - ((selectedChat?.paginatedInteractions?.data?.length || 0) - 1 - interactionIndex)} - ${interaction.status}`}
                    color={getInteractionStatusColor(interaction.status)}
                    sx={{ backgroundColor: 'background.paper' }}
                  />
                </InteractionDivider>

                {/* Messages in this interaction */}
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {interaction.messages.map((message, messageIndex) => {
                    const isUser: boolean = message.role === 'user';
                    const { date, time } = formatDateTime(message.createdAt);

                    const showDateSeparator =
                      messageIndex === 0 ||
                      (messageIndex > 0 &&
                        formatDateTime(
                          interaction.messages[messageIndex - 1].createdAt
                        ).date !== date);

                    return (
                      <Box key={message.id}>
                        {showDateSeparator && (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              my: 2,
                            }}
                          >
                            <Chip
                              label={date}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                        )}

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection:
                              message.role === 'system'
                                ? 'column'
                                : message.role === 'user'
                                  ? 'row'
                                  : 'row-reverse',
                            alignItems:
                              message.role === 'system'
                                ? 'center'
                                : 'flex-start',
                            gap: message.role === 'system' ? 0.5 : 1,
                          }}
                        >
                          {message.role !== 'system' && (
                            <Avatar
                              sx={{ width: 32, height: 32 }}
                              src={
                                message.role === 'user'
                                  ? selectedChat.userPicture || undefined
                                  : selectedChat.avatar || undefined
                              }
                            >
                              {message.role === 'user' ? (
                                <PersonIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <BotIcon sx={{ fontSize: 18 }} />
                              )}
                            </Avatar>
                          )}

                          <Box
                            sx={{
                              width:
                                message.role === 'system'
                                  ? '100%'
                                  : 'fit-content',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems:
                                message.role === 'system'
                                  ? 'center'
                                  : message.role === 'user'
                                    ? 'flex-start'
                                    : 'flex-end',
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth:
                                  message.role === 'system' ? '300px' : '350px',
                                padding:
                                  message.role === 'system'
                                    ? theme.spacing(0.5, 1.5)
                                    : theme.spacing(1, 2),
                                borderRadius:
                                  message.role === 'system'
                                    ? theme.spacing(1)
                                    : theme.spacing(2),
                                marginBottom: theme.spacing(0.5),
                                alignSelf:
                                  message.role === 'system'
                                    ? 'center'
                                    : isUser
                                      ? 'flex-start'
                                      : 'flex-end',
                                backgroundColor:
                                  message.role === 'system'
                                    ? theme.palette.grey[200]
                                    : isUser
                                      ? theme.palette.primary.main
                                      : theme.palette.grey[100],
                                color:
                                  message.role === 'system'
                                    ? theme.palette.text.secondary
                                    : isUser
                                      ? ''
                                      : theme.palette.text.primary,
                                wordBreak: 'initial',
                                textAlign:
                                  message.role === 'system' ? 'center' : 'left',
                              }}
                            >
                              <Typography
                                variant={
                                  message.role === 'system'
                                    ? 'caption'
                                    : 'body2'
                                }
                                sx={{
                                  fontStyle:
                                    message.role === 'system'
                                      ? 'italic'
                                      : 'normal',
                                  fontWeight:
                                    message.role === 'system' ? 500 : 'normal',
                                }}
                              >
                                {message.text}
                              </Typography>
                            </Box>

                            {message.role !== 'system' && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ px: 1 }}
                              >
                                {time}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
      </Box>

      {/* Message Input */}
      <ChatInput
        selectedChat={selectedChat}
        chatLoading={chatLoading}
        isLargeScreen={isLargeScreen}
        isSmallScreen={isSmallScreen}
        handleStartHumanAttendance={handleStartHumanAttendance}
        onMessageSent={(data) => {
          syncAgentMessageChatUpdate(data);
          console.log(data);
        }}
      />
    </Box>
  );
}
