import { useLocation, useNavigate } from 'react-router-dom';
import { useAgents } from '../context/AgentsContext';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import DashboardIcon from '@mui/icons-material/Dashboard';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChatIcon from '@mui/icons-material/Chat';
import { Badge, ListItemAvatar } from '@mui/material';

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAuth } from '../context/AuthContext';

const mainListItems = [
  { text: 'Dashboard', icon: <DashboardIcon /> },
  { text: 'Plans', icon: <SubscriptionsIcon />, role: 'ADMIN' },  // Add role condition here
  { text: 'Workspaces', icon: <WorkspacesIcon />, role: 'ADMIN' }, // Add role condition here
  { text: 'Agents', icon: <SupportAgentIcon /> },
  { text: 'Chats', icon: <ChatIcon /> },
];

const secondaryListItems = [
  { text: 'Billing', icon: <ReceiptLongIcon /> },
];

export default function MenuContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { paginatedAgents } = useAgents();
  const { agents } = paginatedAgents;

  const routePrimaryKeyMap: Record<number, string> = {
    0: '/',
    1: '/plans',
    2: '/workspaces',
    3: '/agents',
    4: '/chats'
  };

  const routeSecondaryKeyMap: Record<number, string> = {
    0: '/billing'
  };

  const totalUnreadCount = agents.reduce((total, wrapper) => {
    const chats = wrapper.agent?.paginatedChats?.data;
    if (!chats) return total;

    const agentUnread = chats.reduce(
      (sum, chat) => sum + ((!chat.finished && chat.unReadCount) || 0),
      0
    );
    return total + agentUnread;
  }, 0);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => {
          // Only include "Plans" and "Workspaces" if the user's role is "ADMIN"
          if (item.role && user?.role.name !== item.role) {
            return null;
          }
          return (
            <ListItem
              key={index}
              disablePadding
              sx={{ display: 'block' }}
              onClick={() => navigate(routePrimaryKeyMap[index])}
            >
              <ListItemButton selected={routePrimaryKeyMap[index] == location.pathname}>
                {item.text == 'Chats' ? (
                  <>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemAvatar>
                      <Badge
                        badgeContent={totalUnreadCount}
                        color="error"
                        invisible={totalUnreadCount === 0}
                      >
                        <ListItemText primary={item.text} />
                      </Badge>
                    </ListItemAvatar>
                  </>
                ) : (
                  <>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding sx={{ display: 'block' }}
            onClick={() => navigate(routeSecondaryKeyMap[index])}
          >
            <ListItemButton selected={routeSecondaryKeyMap[index] == location.pathname}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
