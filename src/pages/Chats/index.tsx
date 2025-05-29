import { SyntheticEvent, useEffect, useRef, useState, useDeferredValue, useMemo } from 'react';

import { useAuth } from '../../context/AuthContext';

import { useChatService } from '../../hooks/useChatService';

import { ChatDto, InteractionStatus, InteractionWithMessagesDto } from '../../services/chatService';

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
} from '@mui/icons-material';
import { useAgents } from '../../context/AgentsContext';

const InteractionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  '&::before, &::after': {
    borderColor: theme.palette.primary.main,
  },
}));

// Mock data
// const mockChats: ChatDto[] = [
//   {
//     id: '1',
//     title: 'Customer Support',
//     name: 'João Silva',
//     contextId: 'ctx-1',
//     userName: 'João Silva',
//     userPicture: null,
//     whatsappPhone: '+55 11 99999-9999',
//     humanTalk: false,
//     read: true,
//     finished: false,
//     unReadCount: 2,
//     workspaceId: 'ws-1',
//     agentId: 'agent-1',
//     createdAt: '2024-05-28T10:00:00Z',
//     updatedAt: '2024-05-28T15:30:00Z',
//     agent: {
//       id: 'agent-1',
//       name: 'Support Agent',
//       avatar: null,
//     },
//     interactions: [
//       {
//         id: 'int-1',
//         status: 'RESOLVED',
//         startAt: '2024-05-28T10:00:00Z',
//         resolvedAt: '2024-05-28T10:45:00Z',
//         messages: [
//           {
//             id: 'msg-1',
//             text: 'Hello, I need help with my order',
//             role: 'user',
//             userName: 'João Silva',
//             createdAt: '2024-05-28T10:00:00Z',
//           },
//           {
//             id: 'msg-2',
//             text: 'Hi! I\'d be happy to help you with your order. Could you please provide your order number?',
//             role: 'assistant',
//             createdAt: '2024-05-28T10:01:00Z',
//           },
//           {
//             id: 'msg-3',
//             text: 'It\'s #12345',
//             role: 'user',
//             userName: 'João Silva',
//             createdAt: '2024-05-28T10:02:00Z',
//           },
//           {
//             id: 'msg-4',
//             text: 'Perfect! I can see your order here. It was shipped yesterday and should arrive tomorrow. Here\'s your tracking number: ABC123456789',
//             role: 'assistant',
//             createdAt: '2024-05-28T10:03:00Z',
//           },
//         ]
//       },
//       {
//         id: 'int-2',
//         status: 'RUNNING',
//         startAt: '2024-05-28T15:00:00Z',
//         messages: [
//           {
//             id: 'msg-5',
//             text: 'Hi again, I have another question',
//             role: 'user',
//             userName: 'João Silva',
//             createdAt: '2024-05-28T15:00:00Z',
//           },
//           {
//             id: 'msg-6',
//             text: 'Hello again! I\'m here to help. What can I assist you with?',
//             role: 'assistant',
//             createdAt: '2024-05-28T15:01:00Z',
//           },
//         ]
//       }
//     ]
//   },
//   {
//     id: '2',
//     title: 'Product Inquiry',
//     name: 'Maria Santos',
//     contextId: 'ctx-2',
//     userName: 'Maria Santos',
//     userPicture: null,
//     whatsappPhone: '+55 11 88888-8888',
//     humanTalk: true,
//     read: false,
//     finished: true,
//     unReadCount: 0,
//     workspaceId: 'ws-1',
//     agentId: 'agent-2',
//     createdAt: '2024-05-28T09:00:00Z',
//     updatedAt: '2024-05-28T14:00:00Z',
//     agent: {
//       id: 'agent-2',
//       name: 'Sales Agent',
//       avatar: null,
//     },
//     interactions: [
//       {
//         id: 'int-3',
//         status: 'TRANSFERRED',
//         startAt: '2024-05-28T09:00:00Z',
//         transferAt: '2024-05-28T09:30:00Z',
//         messages: [
//           {
//             id: 'msg-7',
//             text: 'I\'m interested in your premium package',
//             role: 'user',
//             userName: 'Maria Santos',
//             createdAt: '2024-05-28T09:00:00Z',
//           },
//           {
//             id: 'msg-8',
//             text: 'Great! Let me connect you with a human specialist who can provide detailed information about our premium package.',
//             role: 'assistant',
//             createdAt: '2024-05-28T09:01:00Z',
//           },
//         ]
//       }
//     ]
//   },
//   {
//     id: '3',
//     title: 'Technical Issue',
//     name: 'Pedro Costa',
//     contextId: 'ctx-3',
//     userName: 'Pedro Costa',
//     userPicture: null,
//     whatsappPhone: '+55 11 77777-7777',
//     humanTalk: false,
//     read: true,
//     finished: false,
//     unReadCount: 1,
//     workspaceId: 'ws-1',
//     agentId: 'agent-1',
//     createdAt: '2024-05-28T08:00:00Z',
//     updatedAt: '2024-05-28T16:00:00Z',
//     agent: {
//       id: 'agent-1',
//       name: 'Support Agent',
//       avatar: null,
//     },
//     interactions: [
//       {
//         id: 'int-4',
//         status: 'RUNNING',
//         startAt: '2024-05-28T16:00:00Z',
//         messages: [
//           {
//             id: 'msg-9',
//             text: 'The app is crashing when I try to login',
//             role: 'user',
//             userName: 'Pedro Costa',
//             createdAt: '2024-05-28T16:00:00Z',
//           },
//         ]
//       }
//     ]
//   },
// ];

const getInteractionStatusIcon = (status: InteractionStatus) => {
  switch (status) {
    case 'RESOLVED':
      return <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    case 'RUNNING':
      return <ScheduleIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
    case 'TRANSFERRED':
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
    case 'TRANSFERRED':
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
    minute: '2-digit'
  }).format(new Date(date));
};

interface ChatDetailsProps {
  selectedChat: ChatDto;
  totalInteractions: number,
  interactionLoading: boolean
}

function ChatDetails({selectedChat, totalInteractions, interactionLoading}: ChatDetailsProps) {
  const theme = useTheme();
  
  const [newMessage, setNewMessage] = useState('');
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // This would normally send the message
      setNewMessage('');
    }
  };

  const [visibleInteraction, setVisibleInteraction] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const interactionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  // Format date and time separately
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (messageDate.getTime() === today.getTime()) {
      return { date: 'Today', time: timeString };
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return { date: 'Yesterday', time: timeString };
    } else {
      return { 
        date: date.toLocaleDateString([], { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        }), 
        time: timeString 
      };
    }
  };

  // Track visible interaction while scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      
      const container = messagesContainerRef.current;
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const viewportTop = containerTop;
      const viewportBottom = containerTop + containerHeight;
      
      let currentInteractionIndex = 0;
      
      // Find the interaction that is most visible in the viewport
      Object.entries(interactionRefs.current).forEach(([index, element]) => {
        if (element) {
          const elementTop = element.offsetTop - container.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;
          
          // Check if this interaction is visible in the viewport
          if (elementTop <= viewportBottom && elementBottom >= viewportTop) {
            // Calculate how much of this interaction is visible
            const visibleTop = Math.max(elementTop, viewportTop);
            const visibleBottom = Math.min(elementBottom, viewportBottom);
            const visibleHeight = visibleBottom - visibleTop;
            
            // If more than 50% of the interaction is visible, or if the interaction
            // takes up more than 50% of the viewport, consider it the current one
            const elementHeight = element.offsetHeight;
            const visibilityRatio = visibleHeight / elementHeight;
            const viewportFillRatio = visibleHeight / containerHeight;
            
            if (visibilityRatio > 0.5 || viewportFillRatio > 0.5) {
              currentInteractionIndex = parseInt(index);
            }
          }
        }
      });
      
      setVisibleInteraction(currentInteractionIndex);
    };
    
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [selectedChat.interactions]);

  // Get current date for floating indicator
  const getCurrentDate = () => {
    if (!selectedChat.interactions || selectedChat.interactions.length === 0) return '';
    
    const currentInteraction = selectedChat.interactions[visibleInteraction];
    if (!currentInteraction || !currentInteraction.messages || currentInteraction.messages.length === 0) return '';
    
    // Get the first message's date from the current interaction
    const firstMessage = currentInteraction.messages[0];
    const { date } = formatDateTime(firstMessage.createdAt);
    return date;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Chat Header */}
      <Paper sx={{ p: 2, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={selectedChat.userPicture || undefined} alt={selectedChat.userName}>
            {selectedChat.userName?.[0] || <PersonIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{selectedChat.userName || selectedChat.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {selectedChat.whatsappPhone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Attended by Agent {selectedChat?.interactions?.[0]?.agentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {totalInteractions} interaction{totalInteractions > 1 ? 's' : ''}
              </Typography>
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
      {selectedChat.interactions && selectedChat.interactions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: 140,
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
          }}
        >
          {/* Date */}
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
            {getCurrentDate()}
          </Typography>
          
          {/* Interaction Chip */}
          {selectedChat.interactions.length > 1 && (
            <Chip
              size="small"
              icon={getInteractionStatusIcon(selectedChat.interactions[visibleInteraction]?.status)}
              label={`Interaction ${visibleInteraction + 1} - ${selectedChat.interactions[visibleInteraction]?.status}`}
              color={getInteractionStatusColor(selectedChat.interactions[visibleInteraction]?.status)}
              sx={{ backgroundColor: 'background.paper' }}
            />
          )}
        </Paper>
      )}

      {/* Messages Area */}
      {interactionLoading && <LinearProgress color='secondary' sx={{ width: '100%' }} />}
      <Box 
        ref={messagesContainerRef}
        sx={{ flex: 1, overflow: 'auto', p: 2 }}
      >
        {selectedChat.interactions && selectedChat.interactions.map((interaction, interactionIndex) => (
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
                label={`Interaction ${interactionIndex + 1} - ${interaction.status}`}
                color={getInteractionStatusColor(interaction.status)}
                sx={{ backgroundColor: 'background.paper' }}
              />
            </InteractionDivider>

            {/* Messages in this interaction */}
            <Stack spacing={1} sx={{ mb: 3 }}>
              {interaction.messages.map((message, messageIndex) => {
                const isUser: boolean = message.role === 'user';
                const { date, time } = formatDateTime(message.createdAt);
                
                // Show date separator for first message of the day
                const showDateSeparator = messageIndex === 0 || 
                  (messageIndex > 0 && 
                   formatDateTime(interaction.messages[messageIndex - 1].createdAt).date !== date);

                return (
                  <Box key={message.id}>
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
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
                    
                    {/* Message */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32 }}
                        src={message.role === 'user' ? selectedChat.userPicture || undefined : selectedChat.avatar || undefined}
                      >
                        {message.role === 'user' ? (
                          <PersonIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <BotIcon sx={{ fontSize: 18 }} />
                        )}
                      </Avatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <Box sx={{
                            maxWidth: '70%',
                            padding: theme.spacing(1, 2),
                            borderRadius: theme.spacing(2),
                            marginBottom: theme.spacing(0.5),
                            alignSelf: isUser ? 'flex-end' : 'flex-start',
                            backgroundColor: isUser 
                                ? theme.palette.primary.main 
                                : theme.palette.grey[100],
                            color: isUser 
                                ? '' 
                                : theme.palette.text.primary,
                            wordBreak: 'break-word',                        
                        }}>
                          <Typography variant="body2">{message.text}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                          {time}
                        </Typography>
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
      <Paper sx={{ p: 2, borderRadius: 0, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
        </Box>
      </Paper>
    </Box>
  ); 
};

export default function Chats() {
  const { token, user } = useAuth();
  const { paginatedAgents } = useAgents();

  const { agents } = paginatedAgents;

  const { 
    fetchChats,
    totalChats,
    chatLoading,

    fetchInteractionsWithMessagesOfChat,
    totalInteractions,
    interactionLoading
  } = useChatService(token as string);
  
  const theme = useTheme();

  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const [chats, setChats] = useState<ChatDto[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatDto | null>(null);
  const [chatPage, setChatPage] = useState<number>(1);

  const [interactioPage, setInteractionPage] = useState<number>(1);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setSelectedChat(null);
  };

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesSearch = !deferredSearchQuery || 
        chat.userName?.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        chat.title?.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        chat.agentName?.toLowerCase().includes(deferredSearchQuery.toLowerCase());

      if (tab === 1) return matchesSearch && !chat.read;
      if (tab === 2) return matchesSearch && chat.humanTalk;
      if (tab === 3) return matchesSearch && chat.finished;
      return matchesSearch;
    });
  }, [chats, tab, deferredSearchQuery]);

  const handleChatSelect = async (chat: ChatDto) => {
    const interactionData = await fetchInteractionsWithMessagesOfChat(chat.id, interactioPage);

    const chatWithInteractions = {
      ...chat,
      interactions: interactionData as InteractionWithMessagesDto[]
    };

    setSelectedChat(chatWithInteractions);
  };

  const renderChatList = () => (
    <Box sx={{ height: '83vh', display: 'flex', flexDirection: 'column' }}>
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

        <TextField
          fullWidth
          placeholder="Search chats..."
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

      { chatLoading && <LinearProgress color='secondary' sx={{ width: '100%', mt: 1, mb: 1 }} /> }
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
                backgroundColor: selectedChat?.id === chat.id ? 'action.selected' : 'transparent',
              }}
              onClick={() => handleChatSelect(chat)}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={chat.unReadCount}
                  color="error"
                  invisible={chat.unReadCount === 0}
                >
                  <Avatar src={chat.userPicture || undefined} alt={chat.userName}>
                    {chat.userName?.[0] || <PersonIcon />}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', gap: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {chat.userName || chat.title}
                    </Typography>
                    <Typography variant='subtitle2' noWrap>
                      {chat.agentName}
                    </Typography>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {chat.whatsappPhone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        • {formatDate(chat.createdAt)}
                      </Typography>                      
                    </Box>
                  </Box>
                }
              />
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
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

        <Box sx={{ padding: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Button
            variant={chats.length === totalChats ? 'text' : 'outlined'}
            onClick={() => setChatPage(prevState => prevState + 1)}
            disabled={chats.length === totalChats}
          >
            {chats.length === totalChats ? 'No more data to fetch' : 'Fetch more...'}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        height: '83vh',
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
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        Monitor in real time the responses that your agents are sending to your clients,
        take over the conversation if necessary, or wait for an agent to request your help.
      </Typography>
    </Box>
  );

  useEffect(() => {
    async function fetchChatList() {
      const chatData = await fetchChats(user?.workspaceId as string, chatPage);
      setChats(chatData as ChatDto[]);
    }

    const chats = agents.flatMap(wrapper => wrapper.agent?.chats || []);

    if (chats.length > 0) {
        setChats(chats);
    } else {
        fetchChatList();
    }

  }, [fetchChats, agents])

  useEffect(() => {
    if (chatPage == 1) return;

    async function fetchChatList() {
      const chatData = await fetchChats(user?.workspaceId as string, chatPage);
      setChats(chatData as ChatDto[]);
    }

    fetchChatList();

  }, [fetchChats, chatPage])

  return (
    <Card variant="outlined" sx={{ margin: '0 auto', width: '100%', height: '83vh' }}>
      <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Chat List */}
          <Box sx={{ width: 400, borderRight: 1, borderColor: 'divider' }}>
            {renderChatList()}
          </Box>
          
          {/* Chat Detail or Empty State */}
          <Box sx={{ flex: 1 }}>
            {selectedChat
              ? <ChatDetails
                  selectedChat={selectedChat}
                  totalInteractions={totalInteractions}
                  interactionLoading={interactionLoading}
                />
              : renderEmptyState()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}