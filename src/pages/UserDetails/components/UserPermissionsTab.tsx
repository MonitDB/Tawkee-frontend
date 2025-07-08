// UserPermissionsTab.tsx
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Theme } from '@mui/material/styles';

interface Permission {
  action: string;
  resource: string;
  description?: string;
}

interface UserPermission extends Permission {
  allowed?: boolean;
}

export default function UserPermissionsTab({
  rolePermissions,
  userPermissions,
}: {
  rolePermissions: Permission[];
  userPermissions: UserPermission[];
}) {
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [editablePermissions, setEditablePermissions] = useState<UserPermission[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>('ALL');

  useEffect(() => {
    const mergedPermissions = rolePermissions.map((rolePerm) => {
      const userPerm = userPermissions.find(
        (userPerm) =>
          userPerm.resource === rolePerm.resource &&
          userPerm.action === rolePerm.action
      );

      return {
        resource: rolePerm.resource,
        action: rolePerm.action,
        description: rolePerm.description,
        allowed: userPerm ? userPerm.allowed : undefined,
      };
    });

    setEditablePermissions(mergedPermissions.filter(perm => perm.allowed == undefined || perm.allowed == true));
  }, [rolePermissions, userPermissions]);

  const resourceList = ['ALL', ...Array.from(new Set(editablePermissions.map(p => p.resource)))];

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedResource(newValue);
  };

  const filteredPermissions = selectedResource === 'ALL'
    ? editablePermissions
    : editablePermissions.filter(p => p.resource === selectedResource);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant='subtitle1' fontWeight='bold'>Permissions</Typography>
        </Box>

        <Tabs
          value={selectedResource}
          onChange={handleTabChange}
          variant="scrollable"
          // scrollButtons="auto"
          // sx={{
          //   '& .MuiTab-root': {
          //     textTransform: 'none',
          //     minWidth: 100,
          //     fontSize: '0.9rem',
          //     padding: '8px 16px',
          //   },
          // }}
        >
          {resourceList.map((resource) => (
            <Tab key={resource} label={resource} value={resource} sx={{ fontSize: { xs: 10, sm: 12, md: 16 } }} />
          ))}
        </Tabs>
      </Grid>

      <Grid size={{ xs: 12 }}>
        {filteredPermissions.map((permission, index) => (
          <Card key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, padding: 2, width: '100%' }}>
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
                sx={{ textDecoration: permission.allowed === false ? 'line-through' : 'none' }}
                color={permission.allowed === false ? 'textSecondary' : 'info'}
              >
                {index + 1}
              </Typography>

              {!isSmallScreen && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Typography
                    variant="caption"
                    sx={{ textDecoration: permission.allowed === false ? 'line-through' : 'none' }}
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

              { !isSmallScreen && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Typography sx={{ width: 80 }}>
                    {permission.allowed === false ? 'Denied' : 'Allowed'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid>
  );
}
