import { useState, SyntheticEvent, ChangeEvent, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  useTheme,
  Pagination,
  styled,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import { Agent } from '../../context/AgentsContext';
import { useAuth, User } from '../../context/AuthContext';
import { Subscription } from '../WorkspaceDetails/components/SubscriptionTab';
import { useNavigate } from 'react-router-dom';
import { useDashboardService } from '../../hooks/useDashboardService';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID';

export interface Workspace {
  email: any;
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
  workspacePlanCredits: number,
  workspaceExtraCredits: number,
  subscription: Partial<Subscription>;
  agents?: Partial<Agent>[];
  users?: User[];
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 100,
    fontSize: '0.9rem',
    padding: '8px 16px',
  },
}));

const statusColors = new Map<boolean, 'success' | 'error'>([
  [true, 'success'],
  [false, 'error'],
]);

export const subscriptionColors: Record<SubscriptionStatus, 'success' | 'warning' | 'default' | 'error'> = {
  TRIAL: 'default',
  ACTIVE: 'success',
  PAST_DUE: 'error',
  CANCELED: 'warning',
  INCOMPLETE: 'error',
  INCOMPLETE_EXPIRED: 'error',
  UNPAID: 'error',
};

export default function Workspaces() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { fetchWorkspaceList } = useDashboardService(token as string);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setPage(1);
  };

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleClickWorkspace = (id: string) => {
    navigate(`/workspace/${id}`);
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const response = await fetchWorkspaceList({ page });
      setWorkspaces(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    };

    fetchWorkspaces();
  }, [page, fetchWorkspaceList]);

  const filteredWorkspaces = workspaces?.filter((workspace) => {
    if (tab === 1) return workspace.isActive;
    if (tab === 2) return !workspace.isActive;
    return true;
  }) || [];

  return (
    <Card variant="outlined" sx={{ margin: '0 auto', width: '100%' }}>
      <CardContent>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: '1.5rem',
                  height: '1.5rem',
                  bgcolor: 'black',
                  borderRadius: '999px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'hsla(210, 100%, 95%, 0.9)',
                  border: '1px solid',
                  borderColor: 'hsl(210, 100%, 55%)',
                  boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
                }}
              >
                <WorkspacesIcon color="inherit" sx={{ fontSize: '1rem' }} />
              </Box>
              Workspaces
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage existing workspaces, billing plans and settings
          </Typography>

          <StyledTabs value={tab} onChange={handleTabChange}>
            <Tab label="All" />
            <Tab label="Actives" />
            <Tab label="Inactives" />
          </StyledTabs>

          <List>
            {filteredWorkspaces.map((workspace) => (
              <Tooltip key={workspace.id} title={workspace.id} arrow placement="top">
                <Card
                  variant="outlined"
                  sx={{ margin: `${theme.spacing(2)} 0`, '&:hover': { backgroundColor: 'action.hover' }, cursor: 'pointer' }}
                  onClick={() => handleClickWorkspace(workspace.id)}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing(1) }}>
                    <ListItem>
                      <Avatar>{workspace.name[0]}</Avatar>
                      <ListItemText
                        sx={{ ml: 2 }}
                        primary={` ${workspace.name}${workspace?.email ? ' - ' + workspace?.email : ''}`}
                        secondary={`Created: ${new Date(workspace.createdAt).toLocaleString('en-US', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}`}
                      />
                    </ListItem>

                    {workspace?.subscription?.plan && (
                      <Chip label={`${workspace.subscription.plan.name} Plan`} variant="outlined" />
                    )}

                    {workspace?.subscription?.status && (
                      <Chip
                        label={`SUBSCRIPTION ${workspace.subscription.status}`}
                        color={subscriptionColors[workspace.subscription.status as SubscriptionStatus]}
                      />
                    )}

                    <Chip
                      label={workspace.isActive ? 'ACTIVE' : 'INACTIVE'}
                      color={statusColors.get(workspace.isActive)}
                    />
                  </CardContent>
                </Card>
              </Tooltip>
            ))}
          </List>

          {filteredWorkspaces.length === 0 ? (
            <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
              No workspace found.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
              <Typography sx={{ mr: 2 }}>
                Page {page} of {totalPages} | Total: {totalItems} workspaces
              </Typography>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          )}

          <LoadingBackdrop open={false} />
        </Box>
      </CardContent>
    </Card>
  );
}
