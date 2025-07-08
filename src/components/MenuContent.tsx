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

export default function MenuContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const { can } = useAuth();
  const { paginatedAgents } = useAgents();
  const { agents } = paginatedAgents;

  const canViewDashboardPage = 
    can('VIEW_INTERACTIONS', 'DASHBOARD') ||
    can('VIEW_CREDIT_REMAINING', 'DASHBOARD') ||
    can('VIEW_CREDIT_USAGE', 'DASHBOARD');

  const canViewPlansPage = can('VIEW_AS_ADMIN', 'PLAN');
  const canViewWorkspacesPage = can('VIEW_AS_ADMIN', 'WORKSPACE');
  const canViewAgentsPage = can('VIEW', 'AGENT');
  const canViewChatsPage = can('VIEW_LIST', 'CHAT');

  const mainListItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, permission: canViewDashboardPage },
    { text: 'Plans', icon: <SubscriptionsIcon />,   permission: canViewPlansPage },
    { text: 'Workspaces', icon: <WorkspacesIcon />, permission: canViewWorkspacesPage },
    { text: 'Agents', icon: <SupportAgentIcon />, permission: canViewAgentsPage },
    { text: 'Chats', icon: <ChatIcon />, permission: canViewChatsPage },
  ];

  const canViewBilling = can('VIEW', 'BILLING');

  const secondaryListItems = [
    { text: 'Billing', icon: <ReceiptLongIcon />, permission: canViewBilling },
  ];

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
          // Remove item if user has been denied access...
          if (!item.permission) {
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
        {secondaryListItems.map((item, index) => {
          // Remove item if user has been denied access...
          if (!item.permission) {
            return null;
          }
          
          return (
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
          );
        })}
      </List>
    </Stack>
  );
}
