import { useState } from 'react';

import { useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import { tabsClasses } from '@mui/material/Tabs';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SideMenuMobile from './SideMenuMobile';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from './shared-theme/ColorModeIconDropdown';

import DashboardIcon from '@mui/icons-material/Dashboard';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatIcon from '@mui/icons-material/Chat';
import ContactIcon from '@mui/icons-material/Contacts';

import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import CreditsBadge from './CreditsBadge';
import WorkspaceBadge from './WorkspaceBadge';

const ListItems = {
  Dashboard: <DashboardIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  Agents: <SupportAgentIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  Team: <GroupsIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  Chats: <ChatIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  Contact: <ContactIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  Billing: <ReceiptLongIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  Settings: <SettingsRoundedIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  About: <InfoRoundedIcon color="inherit" sx={{ fontSize: '1rem' }} />,
  Feedback: <HelpRoundedIcon color="inherit" sx={{ fontSize: '1rem' }} />,
};

const Toolbar = styled(MuiToolbar)({
  width: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'center',
  gap: '12px',
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: '8px',
    p: '8px',
    pb: 0,
  },
});

export default function AppNavbar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'auto', md: 'none' },
        boxShadow: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: 'var(--template-frame-height, 0px)',
      }}
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexGrow: 1,
            width: '100%',
            gap: 1,
          }}
        >
          <WorkspaceBadge />
          <CreditsBadge />

          <ColorModeIconDropdown />
          <MenuButton aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuRoundedIcon />
          </MenuButton>
          <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export function CustomIcon({ location }: { location: keyof typeof ListItems }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '1.5rem',
        height: '1.5rem',
        bgcolor: 'black',
        borderRadius: '999px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'hsla(210, 100%, 95%, 0.9)',
        border: '1px solid',
        borderColor: 'hsl(210, 100%, 55%)',
        boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
      }}
    >
      {ListItems[location]}
    </Box>
  );
}
