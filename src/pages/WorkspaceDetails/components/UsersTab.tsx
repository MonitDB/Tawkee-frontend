import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  ListItemText,
  Tooltip,
  Stack,
  Chip,
  Divider,
  useMediaQuery,
  Theme,
  useTheme,
} from '@mui/material';
import { User } from '../../../context/AuthContext';
import UserPermissionsDialog from './UserPermissionsDialog'; // Assuming this is the path to your dialog component

function relativeTime(date: string | number) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // If the event happened more than a week ago, return an absolute date.
  if (days >= 7) {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

interface UsersTabProps {
  users: User[];
}

export default function UsersTab({ users }: UsersTabProps) {
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dialog handling functions
  const handleOpenDialog = (user: User) => {
    setSelectedUser(user); // Set selected user
    setOpenDialog(true); // Open dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
    setSelectedUser(null); // Reset selected user
  };

  // Media query hooks
  const theme = useTheme();
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );
  const isMediumScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );
  const isLargeScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('lg')
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Workspace Users
      </Typography>

      {users.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No users linked to this workspace.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid key={user.id} size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  margin: `${theme.spacing(2)} 0`,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenDialog(user)} // Open dialog when card is clicked
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 2,
                    }}
                  >
                    <Avatar src={user.avatar || undefined}>
                      {user.name?.[0] || '?'}
                    </Avatar>

                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}
                    >
                      <ListItemText
                        primary={user.name}
                        secondary={
                          <Tooltip title={user.email}>
                            <span>{user.email}</span>
                          </Tooltip>
                        }
                      />
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          color: user.emailVerified ? 'green' : 'orange',
                          fontWeight: 'medium',
                        }}
                      >
                        {user.emailVerified ? '(Verified)' : '(Unverified)'}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'center', mt: 1 }}
                    >
                      {!isMediumScreen ? (
                        <Card
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography>Role</Typography>

                          <Chip
                            variant="outlined"
                            color="primary"
                            label={user.role.name}
                          />

                          <Divider orientation="vertical" flexItem />

                          <Typography variant="caption">
                            {user.userPermissions.filter(
                              (perm) => !perm.allowed
                            ).length === 0
                              ? 'No permission denied'
                              : user.userPermissions.filter(
                                    (perm) => !perm.allowed
                                  ).length === 1
                                ? '1 permission denied'
                                : user.userPermissions.filter(
                                      (perm) => !perm.allowed
                                    ).length === user.rolePermissions.length
                                  ? 'All permissions denied'
                                  : `${user.userPermissions.filter((perm) => !perm.allowed).length} permissions denied`}
                          </Typography>
                        </Card>
                      ) : (
                        <Chip
                          variant="outlined"
                          color="primary"
                          label={user.role.name}
                        />
                      )}
                    </Stack>

                    {/* Created At */}
                    {!isLargeScreen && user.createdAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ m: 2 }}
                      >
                        Created {relativeTime(user.createdAt)}
                      </Typography>
                    )}

                    {/* Updated At */}
                    {!isSmallScreen && user.updatedAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ m: 2 }}
                      >
                        Last updated {relativeTime(user.updatedAt)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* User Permissions Dialog */}
      {selectedUser && (
        <UserPermissionsDialog
          open={openDialog}
          onClose={handleCloseDialog}
          userData={selectedUser} // Pass selected user to the dialog
        />
      )}
    </Box>
  );
}
