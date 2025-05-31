import {
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
  useDeferredValue,
  useMemo,
  MouseEvent,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';

import { useAuth } from '../../context/AuthContext';

import { useChatService } from '../../hooks/useChatService';

import {
  ChatDto,
  InteractionStatus,
  InteractionWithMessagesDto,
  PaginatedInteractionsWithMessagesResponseDto,
} from '../../services/chatService';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tabs,
  Tab,
  useTheme,
  styled,
  Chip,
  Card,
  CardContent,
  Badge,
  IconButton,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  Stack,
  Button,
  LinearProgress,
  useMediaQuery,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Agent, useAgents } from '../../context/AgentsContext';

const InteractionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  '&::before, &::after': {
    borderColor: theme.palette.primary.main,
  },
}));

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
      return 'info';
    default:
      return 'default';
  }
};

const formatDate = (date: number) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

interface ChatDetailsProps {
  selectedChat: ChatDto;
  setSelectedChat: Dispatch<SetStateAction<ChatDto | null>>;
  totalInteractions: number;
  interactionLoading: boolean;
  onScrollToTop?: () => void;
}

interface ChatMenuProps {
  chat: ChatDto;
  handleMarkChatResolution: (chatId: string, chatFinished: boolean) => void;
  handleDelete: (chatId: string) => void;
}

function ChatMenu({
  chat,
  handleMarkChatResolution,
  handleDelete,
}: ChatMenuProps) {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<EventTarget | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: MouseEvent<HTMLLIElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleMenuItemClick = (
    event: MouseEvent<HTMLLIElement>,
    action: () => void
  ) => {
    handleClose(event);
    action();
  };

  return (
    <>
      <Tooltip title="Actions">
        <IconButton
          aria-label="more"
          aria-controls={open ? 'chat-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="chat-menu"
        anchorEl={anchorEl as Element}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () =>
              handleMarkChatResolution(chat.id, chat.finished)
            )
          }
        >
          <ListItemIcon>
            {chat.finished ? (
              <ScheduleIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            Mark as {chat.finished ? 'Unread' : 'Finished'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () => handleDelete(chat.id))
          }
        >
          <ListItemIcon>
            <DeleteIcon
              sx={{ color: theme.palette.error.main }}
              fontSize="small"
            />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

interface ChatListProps {
  selectedChat: ChatDto | null;
  setSelectedChat: Dispatch<SetStateAction<ChatDto | null>>;
}

function ChatList({ selectedChat, setSelectedChat }: ChatListProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // or 'md', 'lg', etc.

  const { token, user } = useAuth();
  const { paginatedAgents } = useAgents();

  const { agents } = paginatedAgents;

  const {
    fetchChats,
    finishChat,
    unfinishChat,
    readChat,
    deleteChat,
    chatLoading,

    fetchInteractionsWithMessagesOfChat,
  } = useChatService(token as string);

  const [tab, setTab] = useState(0);

  const [chats, setChats] = useState<ChatDto[]>([]);
  const [totalChats, setTotalChats] = useState<number>(0);

  const [chatPage, setChatPage] = useState<number>(1);

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setSelectedChat(null);
  };

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesSearch =
        !deferredSearchQuery ||
        chat.userName
          ?.toLowerCase()
          .includes(deferredSearchQuery.toLowerCase()) ||
        chat.title?.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        chat.agentName
          ?.toLowerCase()
          .includes(deferredSearchQuery.toLowerCase());

      if (tab === 1) return matchesSearch && !chat.read;
      if (tab === 2) return matchesSearch && chat.humanTalk;
      if (tab === 3) return matchesSearch && chat.finished;
      return matchesSearch;
    });
  }, [chats, tab, deferredSearchQuery]);

  const handleChatSelect = async (chat: ChatDto) => {
    console.log('handling Chat selection...')
    const agentOfChat = agents.find(
      (wrapper) => wrapper.agent.id == chat.agentId
    )?.agent as Agent;

    const paginatedInteractions = agentOfChat.paginatedChats?.data.find(
      (existingChat) => existingChat.id == chat.id
    )?.paginatedInteractions as PaginatedInteractionsWithMessagesResponseDto;

    console.log(paginatedInteractions);

    let chatWithInteractions;
    if ((paginatedInteractions?.data?.length || 0) > 0) {
      chatWithInteractions = {
        ...chat,
        paginatedInteractions,
      };
    } else {
      const response = await fetchInteractionsWithMessagesOfChat({
        chatId: chat.id,
        page: 1,
      });
      await readChat(chat.id);

      chatWithInteractions = {
        ...chat,
        paginatedInteractions:
          response as PaginatedInteractionsWithMessagesResponseDto,
      };
    }

    setSelectedChat(chatWithInteractions);
  };

  const handleMarkChatResolution = (chatId: string, chatFinished: boolean) => {
    {
      chatFinished ? unfinishChat(chatId) : finishChat(chatId);
    }
  };

  const handleDelete = (chatId: string) => {
    deleteChat(chatId);
  };

  useEffect(() => {
    async function fetchChatList() {
      const response = await fetchChats(user?.workspaceId as string, chatPage);
      setChats(response?.data as ChatDto[]);
      setTotalChats(response?.meta?.total as number);
    }

    const chats = agents.flatMap(
      (wrapper) => wrapper.agent?.paginatedChats?.data || []
    );
    const totalChatAmount = agents.reduce((sum, wrapper) => {
      const total = wrapper.agent?.paginatedChats?.meta?.total;
      return sum + (typeof total === 'number' ? total : 0);
    }, 0);

    if (chats.length > 0) {
      setChats(chats);
      setTotalChats(totalChatAmount);
    } else {
      fetchChatList();
    }
  }, [fetchChats, agents]);

  useEffect(() => {
    if (chatPage == 1) return;

    async function fetchChatList() {
      const response = await fetchChats(user?.workspaceId as string, chatPage);
      setChats(response?.data as ChatDto[]);
      setTotalChats(response?.meta.total as number);
    }

    fetchChatList();
  }, [fetchChats, chatPage]);

  return (
    <Box
      sx={{
        height: 'calc(100% - 50px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          variant="h4"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
        >
          <Box
            sx={{
              width: '1.5rem',
              height: '1.5rem',
              bgcolor: 'black',
              borderRadius: '999px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'hsla(210, 100%, 95%, 0.9)',
              border: '1px solid',
              borderColor: 'hsl(210, 100%, 55%)',
              boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
            }}
          >
            <ChatIcon color="inherit" sx={{ fontSize: '1rem' }} />
          </Box>
          Chats
        </Typography>

        {!isSmallScreen && (
          <TextField
            fullWidth
            placeholder="Search chats by phone, client or agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}

        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            marginBottom: theme.spacing(3),
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 100,
              fontSize: '0.9rem',
              padding: '8px 16px',
            },
          }}
        >
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Human" />
          <Tab label="Finished" />
        </Tabs>
      </Box>

      {chatLoading && (
        <LinearProgress
          color="secondary"
          sx={{ width: '100%', mt: 1, mb: 1 }}
        />
      )}

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ p: 0 }}>
          {filteredChats.map((chat) => (
            <ListItem
              key={chat.id}
              sx={{
                cursor: 'pointer',
                borderBottom: 1,
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                backgroundColor:
                  selectedChat?.id === chat.id
                    ? 'action.selected'
                    : 'transparent',
              }}
              onClick={() => handleChatSelect(chat)}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={chat.unReadCount}
                  color="error"
                  invisible={chat.unReadCount === 0 || chat.finished}
                >
                  <Avatar
                    src={chat.userPicture || undefined}
                    alt={chat.userName}
                  >
                    {chat.userName?.[0] || <PersonIcon />}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" noWrap>
                      {chat.userName || chat.title}
                    </Typography>
                    {!isSmallScreen && (
                      <Typography variant="subtitle2" noWrap>
                        {chat.agentName}
                      </Typography>
                    )}
                    {chat.humanTalk && (
                      <Chip size="small" label="Human" color="warning" />
                    )}
                    {chat.finished && (
                      <Chip size="small" label="Finished" color="success" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {chat.latestMessage?.text || 'No messages'}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <PhoneIcon
                        sx={{ fontSize: 12, color: 'text.secondary' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {chat.whatsappPhone}
                      </Typography>
                      {!isSmallScreen && (
                        <Typography variant="caption" color="text.secondary">
                          • {formatDate(chat.createdAt)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
              <ChatMenu
                chat={chat}
                handleMarkChatResolution={handleMarkChatResolution}
                handleDelete={handleDelete}
              />
            </ListItem>
          ))}
        </List>

        {filteredChats.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No chats found
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            padding: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            variant={chats.length === totalChats ? 'text' : 'outlined'}
            onClick={() => setChatPage((prevState) => prevState + 1)}
            disabled={chats.length === totalChats}
          >
            {chats.length === totalChats
              ? 'No more data to fetch'
              : 'Fetch more...'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function ChatDetails({
  selectedChat,
  setSelectedChat,
  totalInteractions,
  interactionLoading,
  onScrollToTop,
}: ChatDetailsProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const { token } = useAuth();
  const { startChatHumanAttendance, chatLoading } = useChatService(
    token as string
  );

  // Remove useDeferredValue - direct state is faster for input
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      // This would normally send the message
      setNewMessage('');
    }
  }, [newMessage]);

  const handleStartHumanAttendance = useCallback(async (chatId: string) => {
    await startChatHumanAttendance(chatId);

    setSelectedChat((prevState) => {
      if (prevState === null) return null;

      const updatedPaginatedInteractions = prevState.paginatedInteractions
        ? {
            ...prevState.paginatedInteractions,
            data: prevState.paginatedInteractions.data.map(
              (interaction, index) => {
                if (
                  index ===
                  (prevState.paginatedInteractions?.data.length || 0) - 1
                ) {
                  return {
                    ...interaction,
                    status: 'WAITING' as InteractionStatus,
                  };
                }
                return interaction;
              }
            ),
          }
        : prevState.paginatedInteractions;

      return {
        ...prevState,
        humanTalk: true,
        finished: false,
        paginatedInteractions: updatedPaginatedInteractions,
      };
    });
  }, [startChatHumanAttendance, setSelectedChat]);

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
  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
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
      setScrollState(prevState => {
        const isAtTop = containerTop <= 5;
        let currentInteractionIndex = prevState.visibleInteraction;

        // Only recalculate visible interaction if needed
        if (Math.abs(containerTop - (container as any).lastScrollTop || 0) > 50) {
          Object.entries(interactionRefs.current).forEach(([index, element]) => {
            if (element) {
              const elementTop = element.offsetTop - container.offsetTop;
              const elementBottom = elementTop + element.offsetHeight;

              if (elementTop <= viewportBottom && elementBottom >= viewportTop) {
                const visibleTop = Math.max(elementTop, viewportTop);
                const visibleBottom = Math.min(elementBottom, viewportBottom);
                const visibleHeight = visibleBottom - visibleTop;

                const elementHeight = element.offsetHeight;
                const visibilityRatio = visibleHeight / elementHeight;
                const viewportFillRatio = visibleHeight / containerHeight;

                if (visibilityRatio > 0.5 || viewportFillRatio > 0.5) {
                  currentInteractionIndex = parseInt(index);
                }
              }
            }
          });
          (container as any).lastScrollTop = containerTop;
        }

        // Store scroll preservation data when near the top
        if (isAtTop || containerTop < 100) {
          const currentElement = interactionRefs.current[currentInteractionIndex];
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

        return {
          visibleInteraction: currentInteractionIndex,
          showFloatingIndicator: true,
          hasTriggeredTopCallback: isAtTop ? true : false,
        };
      });

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to hide indicator
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollState(prev => ({ ...prev, showFloatingIndicator: false }));
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
      container.scrollTop = container.scrollHeight;
    }
  }, [selectedChat.id]);

  // Memoize current date calculation
  const currentDate = useMemo(() => {
    if (
      !selectedChat.paginatedInteractions?.data ||
      selectedChat.paginatedInteractions?.data.length === 0
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

  // Memoize message input section to prevent unnecessary re-renders
  const messageInputSection = useMemo(() => (
    <Paper
      sx={{
        p: 2,
        borderRadius: 0,
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        gap: 1,
        flexDirection: 'column',
      }}
    >
      {chatLoading && (
        <LinearProgress color="secondary" sx={{ width: '100%' }} />
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {selectedChat.humanTalk ? (
          <>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              multiline
              maxRows={4}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <SendIcon />
            </IconButton>
          </>
        ) : (
          <>
            {!isLargeScreen && (
              <Typography>
                Chat held by Agent {selectedChat.agentName}
              </Typography>
            )}
            <Button
              variant="outlined"
              onClick={() => handleStartHumanAttendance(selectedChat.id)}
              disabled={chatLoading}
            >
              {!isSmallScreen
                ? chatLoading
                  ? 'Wait a moment...'
                  : 'Start Human Attendance'
                : chatLoading
                  ? 'Wait...'
                  : 'Start attendance'}
            </Button>
          </>
        )}
      </Box>
    </Paper>
  ), [
    chatLoading,
    selectedChat.humanTalk,
    selectedChat.agentName,
    selectedChat.id,
    newMessage,
    handleSendMessage,
    handleStartHumanAttendance,
    isLargeScreen,
    isSmallScreen,
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
      {selectedChat.paginatedInteractions?.data &&
        selectedChat.paginatedInteractions?.data.length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              top: '75%',
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
              flexDirection: 'column',
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
              sx={{ fontWeight: 500, fontSize: '0.875rem' }}
            >
              {currentDate}
            </Typography>

            <Chip
              size="small"
              icon={getInteractionStatusIcon(
                selectedChat.paginatedInteractions?.data[scrollState.visibleInteraction]
                  ?.status
              )}
              label={`Interaction #${selectedChat.paginatedInteractions.meta.total - ((selectedChat?.paginatedInteractions?.data?.length || 0) - 1 - scrollState.visibleInteraction)} - ${selectedChat.paginatedInteractions?.data[scrollState.visibleInteraction]?.status}`}
              color={getInteractionStatusColor(
                selectedChat.paginatedInteractions?.data[scrollState.visibleInteraction]
                  ?.status
              )}
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
          selectedChat.paginatedInteractions?.data.map(
            (interaction, interactionIndex) => (
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
                              message.role === 'user' ? 'row-reverse' : 'row',
                            alignItems: 'flex-start',
                            gap: 1,
                          }}
                        >
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
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems:
                                message.role === 'user'
                                  ? 'flex-end'
                                  : 'flex-start',
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth: '70%',
                                padding: theme.spacing(1, 2),
                                borderRadius: theme.spacing(2),
                                marginBottom: theme.spacing(0.5),
                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                                backgroundColor: isUser
                                  ? theme.palette.primary.main
                                  : theme.palette.grey[100],
                                color: isUser ? '' : theme.palette.text.primary,
                                wordBreak: 'break-word',
                              }}
                            >
                              <Typography variant="body2">
                                {message.text}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ px: 1 }}
                            >
                              {time}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )
          )}
      </Box>

      {/* Message Input */}
      {messageInputSection}
    </Box>
  );
}

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
  };

  const renderEmptyState = () => (
    <>
      {interactionLoading && (
        <LinearProgress color="secondary" sx={{ width: '100%' }} />
      )}
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            opacity: 0.7,
          }}
        >
          <ChatIcon sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Chat Moderation
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          Monitor in real time the responses that your agents are sending to
          your clients, take over the conversation if necessary, or wait for an
          agent to request your help.
        </Typography>
      </Box>
    </>
  );

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
              renderEmptyState()
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
