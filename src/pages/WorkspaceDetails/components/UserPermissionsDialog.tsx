import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  Switch,
  useTheme,
  useColorScheme,
  useMediaQuery,
  Theme,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

import { useAuth, User } from '../../../context/AuthContext';
import { useDashboardService } from '../../../hooks/useDashboardService';

interface UserPermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  userData: User;
}

export default function UserPermissionsDialog({
  open,
  onClose,
  userData,
}: UserPermissionsDialogProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { token, can } = useAuth();
  const { updateUserPermissions, loading } = useDashboardService(token as string);

  const canEditUserPermissionAsAdmin = can('EDIT_USER_PERMISSION_AS_ADMIN', 'WORKSPACE');

  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Initial state for editablePermissions, starts with an empty array
  const [editablePermissions, setEditablePermissions] = useState<{
    resource: string;
    action: string;
    description?: string;
    allowed?: boolean;
  }[]>([]);

  useEffect(() => {
    const mergedPermissions = userData.rolePermissions.map((rolePerm) => {
      // Find the corresponding user permission, if it exists
      const userPerm = userData.userPermissions.find(
        (userPerm) =>
          userPerm.resource === rolePerm.resource &&
          userPerm.action === rolePerm.action
      );

      return {
        resource: rolePerm.resource,
        action: rolePerm.action,
        description: rolePerm.description,
        allowed: userPerm ? userPerm.allowed : undefined, // If there's no user permission, leave it undefined
      };
    });

    setEditablePermissions(mergedPermissions);  // Set the merged data to the state
  }, [userData]);

  const formatDate = (dateStr: string) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(dateStr).getTime();
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 7) {
      return new Date(dateStr).toLocaleString('en-US', {
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
  };

  const handlePermissionChange = (index: number, value: boolean) => {
    setEditablePermissions((prev) => {
      const updated = [...prev];
      updated[index].allowed = value;
      return updated;
    });
  };

  const handleSave = async () => {
    await updateUserPermissions({ userId: userData.id, userPermissions: editablePermissions });
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Permissions</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* User Details */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" fontWeight="bold">Name</Typography>
            <TextField value={userData.name} disabled fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" fontWeight="bold">Email</Typography>
            <TextField value={userData.email} disabled fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="body2" fontWeight="bold">Email Verified</Typography>
            <TextField value={userData.emailVerified ? 'Yes' : 'No'} disabled fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" fontWeight="bold">Created At</Typography>
            <TextField value={formatDate(userData.createdAt as string)} disabled fullWidth multiline />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" fontWeight="bold">Role</Typography>
            <TextField value={userData.role.name} disabled fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <Typography variant="body2" fontWeight="bold">Role Description</Typography>
            <TextField value={userData.role.description} disabled fullWidth multiline />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" fontWeight="bold">Last Updated</Typography>
            <TextField value={userData.updatedAt ? formatDate(userData.updatedAt) : '---'} disabled fullWidth multiline />
          </Grid>

          {/* Permissions */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant='subtitle1' fontWeight='bold'>{userData.role.name} PERMISSIONS</Typography>

              <Typography variant='subtitle1' sx={{ textAlign: 'right'}}>
                {
                  userData.userPermissions.filter(perm => !perm.allowed).length === 0
                    ? 'No permission denied'
                    : userData.userPermissions.filter(perm => !perm.allowed).length === 1
                    ? '1 permission denied'
                    : userData.userPermissions.filter(perm => !perm.allowed).length === userData.rolePermissions.length
                    ? 'All permissions denied'
                    : `${userData.userPermissions.filter(perm => !perm.allowed).length} permissions denied`
                }
              </Typography>
            </Box>

            {editablePermissions.map((permission, index) => (
              <Card key={index} sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                padding: 2,
                width: '100%'
              }}>
                <CardContent sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  width: '100%'
                }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{
                      textDecoration: permission.allowed === false ? 'line-through' : 'none',
                    }}
                    color={permission.allowed === false ? 'textSecondary' : 'info'}
                  >
                    {index + 1}
                  </Typography>

                  { !isSmallScreen && (
                    <>
                      <Divider orientation="vertical" flexItem />
    
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          textDecoration: permission.allowed === false ? 'line-through' : 'none',
                        }}
                        color={permission.allowed === false ? 'textSecondary' : 'textPrimary'}
                      >
                        {permission.resource}
                      </Typography>
    
                    </>
                  )}

                  <Divider orientation="vertical" flexItem />

                  <Typography 
                    variant="caption" 
                    sx={{ 
                      width: '100%', 
                      textDecoration: permission.allowed === false ? 'line-through' : 'none',
                    }}
                    color={permission.allowed === false ? 'textSecondary' : 'textPrimary'}
                  >
                    {permission.description}
                  </Typography>
                  { isEditing && (
                    <>
                      <Divider orientation="vertical" flexItem />
                      
                      <Typography sx={{ width: 80}} >
                        {permission.allowed === false ? 'Denied' : 'Allowed'}
                      </Typography>
                      
                      <Switch
                        checked={!(permission.allowed === false)}
                        onChange={(e) => handlePermissionChange(index, e.target.checked)}
                        sx={{
                          ml: 2,
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8a2be2',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                            { backgroundColor: '#8a2be2' },
                          '& .MuiSwitch-switchBase': {
                            color:
                              resolvedMode == 'dark'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                          },
                        }}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button
          variant={ isEditing ? 'contained' : 'outlined'}
          size="small"
          onClick={() => {
            isEditing ? handleSave() : setIsEditing(true)
          }}
          disabled={loading
            ? true
            : !canEditUserPermissionAsAdmin
          }
          sx={{
            '&.Mui-disabled': {
              color:
                resolvedMode == 'dark'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[500],
            },
          }}
        >
          { isEditing ? 'Save' : 'Edit'}
        </Button>
        { !canEditUserPermissionAsAdmin && (
          <Tooltip title="Your admin privileges to edit user permissions of any workspace has been denied.">
            <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
          </Tooltip>              
        )}
      </DialogActions>
    </Dialog>
  );
}
