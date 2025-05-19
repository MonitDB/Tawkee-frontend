import { useLocation, useNavigate } from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import DashboardIcon from '@mui/icons-material/Dashboard';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatIcon from '@mui/icons-material/Chat';
import ContactIcon from '@mui/icons-material/Contacts';

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
// import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
// import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Dashboard', icon: <DashboardIcon /> },
  { text: 'Agents', icon: <SupportAgentIcon /> },
  { text: 'Team', icon: <GroupsIcon /> },
  { text: 'Chats', icon: <ChatIcon /> },
  { text: 'Contact', icon: <ContactIcon /> },
];

const secondaryListItems = [
  { text: 'Billing', icon: <ReceiptLongIcon /> },
  { text: 'Settings', icon: <SettingsRoundedIcon /> },
  // { text: 'About', icon: <InfoRoundedIcon /> },
  // { text: 'Feedback', icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const routeKeyMap: Record<number, string> = {
    0: '/',
    1: '/agents',
    2: '/chats',
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ display: 'block' }}
            onClick={() => navigate(routeKeyMap[index])}
          >
            <ListItemButton selected={routeKeyMap[index] == location.pathname}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
