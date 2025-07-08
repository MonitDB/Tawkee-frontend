import { SyntheticEvent, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Typography,
  useTheme,
  Tooltip,
  Chip,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Group as GroupIcon,
  Receipt as ReceiptIcon,
  WorkspacePremium as WorkspacePremiumIcon
} from '@mui/icons-material';

import LoadingBackdrop from '../../components/LoadingBackdrop';
import WorkspaceOverviewTab from './components/WorkspaceOverviewTab';
import UsersTab from './components/UsersTab';
import SubscriptionTab, { Subscription } from './components/SubscriptionTab';

import { useDashboardService } from '../../hooks/useDashboardService';
import { useAuth } from '../../context/AuthContext';
import { subscriptionColors, SubscriptionStatus, Workspace } from '../Workspaces';
import WorkspaceBadge from '../../components/WorkspaceBadge';

function TabPanel({ children, value, index }: any) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

export default function WorkspaceDetails() {
  const theme = useTheme();
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const { fetchDetailedWorkspace } = useDashboardService(token as string);

  const [currentTab, setCurrentTab] = useState(0);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    navigate(location.pathname, { replace: true });
  };

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!workspaceId) return;
      const data = await fetchDetailedWorkspace(workspaceId);
      setWorkspace(data);
    };

    loadWorkspace();
  }, [workspaceId, fetchDetailedWorkspace]);

  if (!workspace) return <LoadingBackdrop open={true} />;

  return (
    <Card variant="outlined" sx={{ bgcolor: theme.palette.background.default }}>
      <CardContent sx={{ height: '100%', overflowY: 'auto' }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(-1)}
              >
                &larr; Go back to Workspaces
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ width: 100, height: 100 }}>
                  {workspace.name[0]}
                </Avatar>
                <Box>
                  <WorkspaceBadge
                    workspaceName={workspace.name}
                    workspaceId={workspaceId as string}
                    workspaceIsActive={workspace.isActive}
                  />
                  <Typography color="text.secondary">
                    Created at {new Date(workspace.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Tooltip title={`Workspace ID: ${workspace.id}`}>
                      <Chip
                        label={workspace.id.substring(0, 5) + '...'}
                        variant="outlined"
                        color="secondary"
                      />
                    </Tooltip>
                    {workspace.subscription?.plan?.name && (
                      <Tooltip title="Current plan">
                        <Chip
                          label={`${workspace.subscription.plan.name} Plan`}
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                    {workspace.subscription?.status && (
                      <Tooltip title="Subscription status">
                        <Chip
                          label={isXs ? workspace.subscription.status : `SUBSCRIPTION ${workspace.subscription.status}`}
                          color={subscriptionColors[workspace.subscription.status as SubscriptionStatus]}
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab icon={<WorkspacePremiumIcon />} label="Overview" />
                <Tab icon={<GroupIcon />} label="Users" />
                <Tab icon={<ReceiptIcon />} label="Subscription" />
              </Tabs>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TabPanel value={currentTab} index={0}>
                <WorkspaceOverviewTab workspace={workspace} />
              </TabPanel>
              <TabPanel value={currentTab} index={1}>
                <UsersTab users={workspace.users ?? []} />
              </TabPanel>
              <TabPanel value={currentTab} index={2}>
                <SubscriptionTab subscription={workspace.subscription as Subscription} />
              </TabPanel>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <LoadingBackdrop open={false} />
    </Card>
  );
}
