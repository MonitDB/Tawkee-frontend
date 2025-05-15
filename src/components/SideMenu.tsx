import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';
import TawkeeLogo from './TawkeeLogo';
import { usePrivateEmailService } from '../hooks/usePrivateEmailService';
import LoadingBackdrop from './LoadingBackdrop';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

interface User {
  name?: string;
  email?: string;
  emailVerified?: boolean;
}

export default function SideMenu() {
  const { user, token } = useAuth() as { user: User | null; token: string };
  const { resendVerificationEmail, loading } = usePrivateEmailService(token);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  // Atualizada para lidar com nome indefinido, como no componente anterior
  function stringAvatar(name: string | undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '')
      return {
        sx: {
          bgcolor: stringToColor('undefined'),
        },
        children: 'UN', // Ou alguma outra inicial padrão
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
            fontWeight: 'medium',
            lineHeight: 'normal',
            display: 'block',
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
              cursor: 'pointer',
              fontWeight: 'medium',
              lineHeight: 'normal',
              display: 'block',
            }}
            onClick={handleMenuClick}
            aria-controls={openMenu ? 'verification-menu-sidemenu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
          >
            (unverified)
          </Typography>
          <Menu
            id="verification-menu-sidemenu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'user-name-sidemenu',
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
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
          mt: 'calc(var(--template-frame-height, 0px))', // Ajustado para aplicar o margin top ao paper
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          // mt: 'calc(var(--template-frame-height, 0px) + 4px)', // Movido para o paper do Drawer
          p: 1.5,
          alignItems: 'center', // Para alinhar o logo se houver outros elementos
        }}
      >
        <TawkeeLogo />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
        <CardAlert />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          // sizes="small" // Prop não padrão, usar sx para tamanho
          alt={user?.name || 'User Avatar'}
          {...stringAvatar(user?.name)} // Removido 'as string' pois stringAvatar agora lida com undefined
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto', overflow: 'hidden' }}>
          {' '}
          {/* Adicionado overflow: hidden para nomes longos */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              lineHeight: '16px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            id="user-name-sidemenu"
          >
            {user?.name || 'User Name'}
          </Typography>
          {/* Badge de verificação adicionado abaixo do nome e acima do email */}
          {verificationBadge}
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user?.email || 'user.email@example.com'}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
      <LoadingBackdrop open={loading} />
    </Drawer>
  );
}
