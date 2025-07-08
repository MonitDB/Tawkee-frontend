import { MouseEvent, useState } from 'react'; // Adicionado useState
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu'; // Adicionado Menu
import MenuItem from '@mui/material/MenuItem'; // Adicionado MenuItem
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
// import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
// import MenuButton from './MenuButton'; // Presumindo que este é um componente personalizado
import MenuContent from './MenuContent'; // Presumindo que este é um componente personalizado
// import CardAlert from './CardAlert'; // Presumindo que este é um componente personalizado
import { useAuth } from '../context/AuthContext';
import { usePrivateEmailService } from '../hooks/usePrivateEmailService';
import LoadingBackdrop from './LoadingBackdrop';
import { useNavigate } from 'react-router-dom';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

interface User {
  id?: string;
  name?: string;
  avatar?: string;
  email?: string;
  emailVerified?: boolean;
}

export default function SideMenuMobile({
  open,
  toggleDrawer,
}: SideMenuMobileProps) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth() as {
    user: User | null;
    token: string;
    logout: () => void;
  };
  const { resendVerificationEmail, loading } = usePrivateEmailService(token);

  // Estado para o Menu de verificação
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
  };

  const handleResendVerificationEmail = () => {
    resendVerificationEmail();
    handleMenuClose(); // Fechar o menu após a ação
  };

  function stringToColor(string: string) {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function stringAvatar(name: string | undefined) {
    if (!name)
      return {
        sx: {
          bgcolor: stringToColor('undefined'),
        },
        children: 'UN',
      };
    const parts = name.trim().split(/\s+/);
    const firstInitial = parts[0]?.[0]?.toUpperCase() || '';
    const lastInitial =
      parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() : '';
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${firstInitial}${lastInitial}`,
    };
  }

  let verificationBadge = null;
  if (user) {
    if (user.emailVerified) {
      verificationBadge = (
        <Typography
          component="span"
          variant="caption"
          sx={{
            color: 'green',
            ml: 0.5,
            fontWeight: 'medium',
            lineHeight: 'normal',
          }}
        >
          (verified)
        </Typography>
      );
    } else {
      verificationBadge = (
        <>
          <Typography
            component="span"
            variant="caption"
            sx={{
              color: 'warning.main',
              ml: 0.5,
              cursor: 'pointer',
              fontWeight: 'medium',
              lineHeight: 'normal',
            }}
            onClick={handleMenuClick} // Abrir menu ao clicar
            aria-controls={openMenu ? 'verification-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
          >
            (unverified)
          </Typography>
          <Menu
            id="verification-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'verification-status',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem
              onClick={handleResendVerificationEmail}
              sx={{ fontSize: '0.875rem' }}
            >
              Resend verification email
            </MenuItem>
          </Menu>
        </>
      );
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack
          direction="row"
          sx={{ p: 2, pb: 0, gap: 1, alignItems: 'center' }}
        >
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              src={user?.avatar}
              alt={user?.name || 'User Name'}
              {...stringAvatar(user?.name as string)}
              sx={{ width: 36, height: 36 }}
            />
            <Stack direction="column" alignItems="flex-start">
              <Typography
                component="p"
                variant="h6"
                sx={{ lineHeight: 1.2 }}
                id="verification-status"
              >
                {user?.name || 'User Name'}
              </Typography>
              {verificationBadge}
            </Stack>
          </Stack>
          {/* <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton> */}
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        {/* <CardAlert /> */}
        <Stack sx={{ p: 2 }}>
          <Button
            variant="text"
            fullWidth
            onClick={() => navigate(`/${user?.id}`)}
          >
            My Account
          </Button>
        </Stack>

        <Divider />

        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
      <LoadingBackdrop open={loading} />
    </Drawer>
  );
}
