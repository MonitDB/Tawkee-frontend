import Stack from '@mui/material/Stack';
// import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
// import MenuButton from './MenuButton';
import ColorModeIconDropdown from './shared-theme/ColorModeIconDropdown';
import CreditsBadge from './CreditsBadge';
import { Box } from '@mui/material';
import WorkspaceBadge from './WorkspaceBadge';
import { useAuth } from '../context/AuthContext';

export default function Header({
  overrideLatestSegment,
}: {
  overrideLatestSegment?: string;
}) {
  const { user } = useAuth();

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs overrideLatestSegment={overrideLatestSegment || ''} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <WorkspaceBadge
          workspaceId={user?.workspaceId}
          workspaceName={user?.workspaceName}
          workspaceIsActive={user?.workspaceIsActive}
        />
        <CreditsBadge />
        {/* <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton> */}
        <ColorModeIconDropdown />
      </Box>
    </Stack>
  );
}
