import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Channel } from '../../../services/channelService';
import { Workspace } from '../../Workspaces';

interface WorkspaceOverviewTabProps {
  workspace: Workspace;
}

export default function WorkspaceOverviewTab({ workspace }: WorkspaceOverviewTabProps) {
  const agents = workspace?.agents;
  const users = workspace?.users;

  const activeConnectedAgents = agents?.filter(
    (agent) => agent.isActive && agent.channels?.some((c: Channel) => c.connected)
  );
  const activeDisconnectedAgents = agents?.filter(
    (agent) => agent.isActive && !agent.channels?.some((c: Channel) => c.connected)
  );
  const inactiveAgents = agents?.filter((agent) => !agent.isActive);

  const planCredits = workspace?.workspacePlanCredits ?? 0;
  const extraCredits = workspace?.workspaceExtraCredits ?? 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Workspace Summary
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 90, gap: 2 }}>
              <PeopleAltIcon fontSize="large" />
              <Box>
                <Typography variant="h5">{users?.length || 0}</Typography>
                <Typography color="text.secondary">Users</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 90, gap: 2 }}>
              <MonetizationOnIcon fontSize="large" color="primary" />
              <Box>
                <Typography variant="h5">{planCredits.toLocaleString()}</Typography>
                <Typography color="text.secondary">Remaining Plan Credits</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 90, gap: 2 }}>
              <MonetizationOnIcon fontSize="large" color="secondary" />
              <Box>
                <Typography variant="h5">{extraCredits.toLocaleString()}</Typography>
                <Typography color="text.secondary">Remaining Extra Credits</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 90, gap: 2 }}>
              <SmartToyIcon fontSize="large" color="success" />
              <Box>
                <Typography variant="h5">{activeConnectedAgents?.length || 0}</Typography>
                <Typography color="text.secondary">Active & Connected Agents</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 90, gap: 2 }}>
              <SmartToyIcon fontSize="large" color="warning" />
              <Box>
                <Typography variant="h5">{activeDisconnectedAgents?.length || 0}</Typography>
                <Typography color="text.secondary">Active but Disconnected</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 90, gap: 2 }}>
              <HighlightOffIcon fontSize="large" color="error" />
              <Box>
                <Typography variant="h5">{inactiveAgents?.length || 0}</Typography>
                <Typography color="text.secondary">Inactive Agents</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
