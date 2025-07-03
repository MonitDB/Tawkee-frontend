import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
import {
  useAgents,
  AgentCommunicationType,
  AgentType,
} from '../../context/AgentsContext';

import LoadingBackdrop from '../../components/LoadingBackdrop';
import ActionMenu from './components/ActionMenu';

import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tabs,
  Tab,
  useTheme,
  styled,
  Chip,
  Card,
  CardContent,
  Tooltip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  useColorScheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useNavigate } from 'react-router-dom';
import CreateAgentDialog from './components/CreateAgentDialog';
import { Channel } from '../../services/channelService';
import { useAuth } from '../../context/AuthContext';
import { useHttpResponse } from '../../context/ResponseNotifier';
import { useDashboardService } from '../../hooks/useDashboardService';

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

export const agentCommunicationDescriptions: Record<
  AgentCommunicationType,
  string
> = {
  [AgentCommunicationType.FORMAL]:
    'Uses polite and professional language at all times.',
  [AgentCommunicationType.NORMAL]: 'Maintains a balanced and neutral tone.',
  [AgentCommunicationType.RELAXED]:
    'Communicates in a casual and friendly way.',
};

export const agentTypeDescriptions: Record<AgentType, string> = {
  [AgentType.SUPPORT]:
    'Technical or customer support with a formal and helpful tone.',
  [AgentType.SALE]:
    'Sales-oriented communication with a persuasive and clear tone.',
  [AgentType.PERSONAL]: 'Support on personal tasks with a helpful tone.',
};

const agentActivityDescriptions: Record<number, string> = {
  0: 'The agent is shutdown and will not respond to messages even when connected to channels.',
  1: 'The agent is ready to connect to channels and respond to messages on your behalf.',
  2: 'The agent is connected to channels and ready to respond to messages.',
};

export default function Agents() {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const { user, token, can } = useAuth();
  const { notify } = useHttpResponse();
  
  const canView = can('VIEW', 'AGENT');
  const canViewAsAdmin = can('VIEW_AS_ADMIN', 'AGENT');
  const canCreate = can('CREATE', 'AGENT');
  const canCreateAsAdmin = can('CREATE_AS_ADMIN', 'AGENT');
  const canActivate = can('ACTIVATE', 'AGENT');
  const canActivateAsAdmin = can('ACTIVATE_AS_ADMIN', 'AGENT');
  const canDelete = can('DELETE', 'AGENT');
  const canDeleteAsAdmin = can('DELETE_AS_ADMIN', 'AGENT');

  const userIsAdmin = user?.role.name === 'ADMIN';
  const [workspaceId, setWorkspaceId] = useState<string | null>(user?.workspaceId ?? null);
  const [workspaceOptions, setWorkspaceOptions] = useState<
    { id: string; name: string; email: string | null }[]
  >([]);

  const [tab, setTab] = useState(0);
  const {
    deleteAgent,
    activateAgent,
    deactivateAgent,
    paginatedAgents,
    setPage,
    loading,
  } = useAgents();

  const { fetchAllWorkspacesBasicInfo  } = useDashboardService(token as string);

  const { agents, meta } = paginatedAgents;

  const handleWorkspaceChange = (event: SelectChangeEvent<string | null>) => {
    setWorkspaceId(event.target.value);
  }; 

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const filteredAgents = agents.filter((wrapper) => {
    if (tab === 1) return wrapper.agent.isActive;
    if (tab === 2) return !wrapper.agent.isActive;
    return true;
  });

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (userBelongsToSelectedWorkspace && !canDelete) {
      notify('You cannot delete agents of the workspace!', 'warning');
      return;
    }

    if (!userBelongsToSelectedWorkspace && !canDeleteAsAdmin) {
      notify('Your admin privileges to delete agents of any workspace has been revoked!', 'warning');
      return;
    }

    deleteAgent(id);
  };

  const handleActivateOrDeactivate = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    agentActivityStatus: boolean,
    agentId: string
  ) => {
    event.stopPropagation();
    if (userBelongsToSelectedWorkspace && !canActivate) {
      notify('You do not have permission to activate/deactivate agents of the workspace.', 'warning');
      return;
    }

    if (!userBelongsToSelectedWorkspace && !canActivateAsAdmin) {
      notify('Your admin privileges to activate/deactivate agents of any workspace has been revoked.', 'warning');
      return;
    }
    
    agentActivityStatus
      ? deactivateAgent(agentId)
      : activateAgent(agentId);
  }

  const handleOpenSettings = (agentId: string) => {
    navigate(`/agents/${agentId}?tabName=settings`);
  };

  function TruncatedText({
    text,
    maxChars = 40,
  }: {
    text: string;
    maxChars?: number;
  }) {
    const truncated =
      text.length > maxChars ? text.slice(0, maxChars) + '…' : text;

    return (
      <Tooltip title={text}>
        <Typography noWrap>{truncated}</Typography>
      </Tooltip>
    );
  }

  // Handle unauthorized access to the page
  useEffect(() => {
    if (!canView) {
      notify('You do not have permission to view Agents of your workspace.', 'warning');
      navigate('/');
    }
  }, [canView]);  

  // Fetch list of workspaces
  useEffect(() => {

    if (userIsAdmin) {
      // Fetch list of all workspaces
      const fetchOptions = async () => {
        try {
          const all = await fetchAllWorkspacesBasicInfo();
          setWorkspaceOptions(all);
        } catch (err) {
          console.error('Failed to load workspace options:', err);
        }
      };
      fetchOptions();
    }

  }, [canViewAsAdmin, fetchAllWorkspacesBasicInfo]);   

  const userBelongsToSelectedWorkspace = user?.workspaceId === workspaceId;

  return (
    <Card variant="outlined" sx={{ margin: '0 auto', width: '100%' }}>
      <CardContent>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Box
                sx={{
                  width: '1.5rem',
                  height: '1.5rem',
                  bgcolor: 'black',
                  borderRadius: '999px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'hsla(210, 100%, 95%, 0.9)',
                  border: '1px solid',
                  borderColor: 'hsl(210, 100%, 55%)',
                  boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
                }}
              >
                <SupportAgentIcon color="inherit" sx={{ fontSize: '1rem' }} />
              </Box>
              Agents
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              { userIsAdmin && (
                <FormControl variant='standard' fullWidth error={!workspaceId} required>
                  <InputLabel>
                    Select a Workspace
                    { !canViewAsAdmin && (
                      <Tooltip title="Your admin privileges to view Agents of other workspaces has been revoked.">
                        <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                      </Tooltip>
                    )}
                  </InputLabel>
                  <Select
                    label="Select a Workspace"
                    value={workspaceId}
                    onChange={handleWorkspaceChange}
                    sx={{ p: 1 }}
                    disabled={!canViewAsAdmin}
                  >
                    {workspaceOptions.map((workspace) => (
                      <MenuItem key={workspace.id} value={workspace.id}>
                        {`${workspace.name}${workspace.email ? ` (${workspace.email})` : ` (${workspace.id})`}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
                disabled={userBelongsToSelectedWorkspace
                  ? !canCreate
                  : !canCreateAsAdmin
                }
                sx={{
                  height: '100%',
                  '&.Mui-disabled': {
                      color:
                      resolvedMode == 'dark'
                          ? theme.palette.grey[400]
                          : theme.palette.grey[500],
                  },
                }}
              >
                Create Agent
              </Button>
              { userBelongsToSelectedWorkspace
                ? !canCreate && (
                  <Tooltip title="You cannot create agents on the workspace.">
                    <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                  </Tooltip>
                ) : !canCreateAsAdmin && (
                  <Tooltip title="Your admin privileges to create Agents of other workspaces has been revoked.">
                    <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                  </Tooltip>
                )
              }
            </Box>

          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create, train and manage your AI agents
          </Typography>

          <StyledTabs value={tab} onChange={handleTabChange}>
            <Tab label="All" />
            <Tab label="Actives" />
            <Tab label="Inactives" />
          </StyledTabs>

          <List>
            {filteredAgents.map(({ agent }) => (
              <Card
                key={agent.id}
                variant="outlined"
                sx={{
                  margin: `${theme.spacing(2)} 0`,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/agents/${agent.id}`)}
              >
                <>
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: theme.spacing(1),
                    }}
                  >
                    <ListItem
                      sx={{ width: 'fit-content', whiteSpace: 'nowrap' }}
                    >
                      <ListItemAvatar>
                        <Avatar src={agent.avatar} alt={agent.name}>
                          {agent.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{ cursor: 'pointer' }}
                        primary={<Box>{agent.name}</Box>}
                      />
                    </ListItem>
                    <Tooltip
                      title={
                        agentActivityDescriptions[
                          agent.isActive
                            ? agent.channels.find(
                                (channel: Channel) => channel.connected
                              )
                              ? 2
                              : 1
                            : 0
                        ]
                      }
                      onClick={(event) => handleActivateOrDeactivate(event, agent.isActive, agent.id)}                     
                    >
                      <Chip
                        color={
                          agent.isActive
                            ? agent.channels.find(
                                (channel: Channel) => channel.connected
                              )
                              ? 'success'
                              : 'warning'
                            : 'error'
                        }
                        label={
                          agent.isActive
                            ? agent.channels.find(
                                (channel: Channel) => channel.connected
                              )
                              ? 'ACTIVE & CONNECTED'
                              : 'ACTIVE BUT DISCONNECTED'
                            : 'INACTIVE'
                        }
                      />
                    </Tooltip>
                    {isMdUp && (
                      <Tooltip
                        title={
                          agentCommunicationDescriptions[
                            agent.communicationType
                          ]
                        }
                        placement="top"
                      >
                        <Chip label={agent.communicationType} />
                      </Tooltip>
                    )}
                    {isMdUp && (
                      <Tooltip
                        title={agentTypeDescriptions[agent.type]}
                        placement="top"
                      >
                        <Chip label={agent.type} />
                      </Tooltip>
                    )}
                    {isMdUp && (
                      <TruncatedText
                        text={
                          agent.behavior
                            ? agent.behavior
                            : agent.jobDescription
                              ? agent.jobDescription
                              : ''
                        }
                        maxChars={50}
                      />
                    )}
                    <ActionMenu
                      agent={agent}
                      handleDelete={handleDelete}
                      handleActivateOrDeactivate={handleActivateOrDeactivate}
                      handleOpenSettings={handleOpenSettings}
                      theme={theme}
                    />
                  </CardContent>
                </>
              </Card>
            ))}
          </List>

          {agents.length === 0 ? (
            <Typography
              variant="h6"
              sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}
            >
              No agent found.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Typography sx={{ mr: 2 }}>
                Total: {filteredAgents.length} agents
              </Typography>
              <Pagination
                count={meta.totalPages}
                page={meta.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          <CreateAgentDialog
            open={open}
            onClose={handleCloseModal}
            agentTypeDescriptions={agentTypeDescriptions}
          />

          <LoadingBackdrop open={loading} />
        </Box>
      </CardContent>
    </Card>
  );
}
