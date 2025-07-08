import { useState, SyntheticEvent } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Person, Security, Visibility } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import UserProfileTab from './components/UserProfileTab';
import UserSecurityTab from './components/UserSecurityTab';
import UserPermissionsTab from './components/UserPermissionsTab';
import { usePrivateEmailService } from '../../hooks/usePrivateEmailService';
import LoadingBackdrop from '../../components/LoadingBackdrop';

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  return value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;
}

export default function UserDetails() {
  const { user, token } = useAuth();
  const { resendVerificationEmail, loading } = usePrivateEmailService(token as string);
  
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => setTabIndex(newValue);

  const handleResendVerificationEmail = () => {
    if (!user?.emailVerified) {
      resendVerificationEmail();
    }
  };
  
  return (
    <Card variant="outlined" sx={{ width: '100%', bgcolor: theme.palette.background.default }}>
      <CardContent>
        {/* User header info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar src={user?.avatar} sx={{ width: 80, height: 80 }}>
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography variant="body2">{user?.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              { isMediumScreen && (
                <Tooltip title={user?.emailVerified ? '' : 'Resend verification email'}>
                  <Chip
                    variant="outlined"
                    label={user?.emailVerified ? 'Verified' : 'Unverified'}
                    color={user?.emailVerified ? 'success' : 'warning'}
                    onClick={handleResendVerificationEmail}
                  />
                </Tooltip>
              )}
              {user?.provider && (
                <Tooltip title={user?.provider == 'password'
                  ? 'Your credentials are securely stored on our servers using encryption.'
                  : 'Your credentials are securely stored on the provider.'
                }>
                  <Chip
                    variant='outlined'
                    label={`Signed-in in using ${user.provider == 'password' ? 'our platform' : user.provider}`}
                    color={ user.provider == 'password' ? 'info' : 'primary'}
                  />                  
                </Tooltip>
              )}
              {user?.role?.name && (
                <Tooltip title={user.role.description}>
                  <Chip label={`ROLE ${user.role.name}`} />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Visibility />} label="Permissions" />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <UserProfileTab />
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <UserSecurityTab />
        </TabPanel>

        <TabPanel value={tabIndex} index={2}>
          <UserPermissionsTab
            rolePermissions={user?.rolePermissions || []}
            userPermissions={user?.userPermissions || []}
          />
        </TabPanel>
      </CardContent>

      <LoadingBackdrop open={loading} />
    </Card>
  );
}
