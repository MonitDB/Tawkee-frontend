import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '../../../context/AuthContext';
import { Agent, useAgents } from '../../../context/AgentsContext';

import { useChatService } from '../../../hooks/useChatService';

import {
  ChatDto,
  PaginatedInteractionsWithMessagesResponseDto,
} from '../../../services/chatService';

import { ChatMenu } from './ChatMenu';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

interface ChatListProps {
  selectedChat: ChatDto | null;
  setSelectedChat: Dispatch<SetStateAction<ChatDto | null>>;
}

const formatDate = (date: number) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export function ChatList({ selectedChat, setSelectedChat }: ChatListProps) {
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
    stopChatHumanAttendance,
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
    return (
      chats?.filter((chat) => {
        const matchesSearch =
          !deferredSearchQuery ||
          chat.userName
            ?.toLowerCase()
            .includes(deferredSearchQuery.toLowerCase()) ||
          chat.title
            ?.toLowerCase()
            .includes(deferredSearchQuery.toLowerCase()) ||
          chat.agentName
            ?.toLowerCase()
            .includes(deferredSearchQuery.toLowerCase());

        if (tab === 1) return matchesSearch && !chat.read;
        if (tab === 2) return matchesSearch && chat.humanTalk;
        if (tab === 3) return matchesSearch && chat.finished;
        return matchesSearch;
      }) || []
    );
  }, [chats, tab, deferredSearchQuery]);

  const handleChatSelect = async (chat: ChatDto) => {
    const agentOfChat = agents.find(
      (wrapper) => wrapper.agent.id == chat.agentId
    )?.agent as Agent;

    const paginatedInteractions = agentOfChat.paginatedChats?.data.find(
      (existingChat) => existingChat.id == chat.id
    )?.paginatedInteractions as PaginatedInteractionsWithMessagesResponseDto;

    let chatWithInteractions;
    if ((paginatedInteractions?.data?.length || 0) > 0) {
      chatWithInteractions = {
        ...chat,
        paginatedInteractions,
      };
    } else {
      try {
        const response = await fetchInteractionsWithMessagesOfChat({
          chatId: chat.id,
          page: 1,
        });

        chatWithInteractions = {
          ...chat,
          paginatedInteractions:
            response as PaginatedInteractionsWithMessagesResponseDto,
        };
      } catch {
        chatWithInteractions = null;
      }
    }

    setSelectedChat(chatWithInteractions);
  };

  const handleMarkChatResolution = (chatId: string, chatFinished: boolean) => {
    {
      chatFinished ? unfinishChat(chatId) : finishChat(chatId);
    }
  };

  const handleStopHumanAttedance = (chatId: string) => {
    stopChatHumanAttendance(chatId);
  };

  const handleDelete = async (chatId: string) => {
    await deleteChat(chatId);
  };

  const fetchChatList = useCallback(async () => {
    try {
      const response = await fetchChats(user?.workspaceId as string, chatPage);
      setChats(response?.data as ChatDto[]);
      setTotalChats(response?.meta?.total as number);
    } catch {
      setChats([]);
      setTotalChats(0);
    }
  }, [fetchChats, user?.workspaceId, chatPage]);

  useEffect(() => {
    const hasPaginatedChats = agents.some(
      (wrapper) => wrapper.agent?.paginatedChats != undefined
    );

    if (agents.length == 0 || hasPaginatedChats) {
      const chats =
        agents.flatMap(
          (wrapper) => wrapper.agent?.paginatedChats?.data || []
        ) || [];
      const totalChatAmount = agents.reduce((sum, wrapper) => {
        const total = wrapper.agent?.paginatedChats?.meta?.total;
        return sum + (typeof total === 'number' ? total : 0);
      }, 0);
      setChats(chats);
      setTotalChats(totalChatAmount);

      if (selectedChat != undefined) {
        setSelectedChat(
          chats?.find((chat) => chat.id == selectedChat.id) || null
        );
      }
    } else {
      fetchChatList();
    }
  }, [fetchChatList, agents]);

  useEffect(() => {
    if (chatPage == 1) return;

    fetchChatList();
  }, [fetchChatList, chatPage]);

  useEffect(() => {
    async function markChatAsRead(chatId: string) {
      await readChat(chatId);
    }

    if (selectedChat && !selectedChat.read) {
      markChatAsRead(selectedChat.id);
    }
  }, [selectedChat]);

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
                          •{' '}
                          {formatDate(
                            chat?.latestMessage?.createdAt || chat.createdAt
                          )}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
              <ChatMenu
                chat={chat}
                handleMarkChatResolution={handleMarkChatResolution}
                handleStopHumanAttendance={handleStopHumanAttedance}
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
            variant={chats?.length === totalChats ? 'text' : 'outlined'}
            onClick={() => setChatPage((prevState) => prevState + 1)}
            disabled={chats?.length === totalChats}
          >
            {chats?.length === totalChats
              ? 'No more data to fetch'
              : 'Fetch more...'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
