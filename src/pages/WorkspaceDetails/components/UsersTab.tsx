import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { User } from '../../../context/AuthContext';

interface UsersTabProps {
  users: User[];
}

export default function UsersTab({ users }: UsersTabProps) {
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
            <Grid key={user.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={user.avatar || undefined}>
                        {user.name?.[0] || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <Tooltip title={user.email}>
                          <span>{user.email}</span>
                        </Tooltip>
                      }
                    />
                  </ListItem>
                  {user?.createdAt && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 7 }}
                    >
                      Created at{' '}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
