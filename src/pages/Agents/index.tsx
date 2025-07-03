import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
import {
  useAgents,
  AgentCommunicationType,
  AgentType,
  AgentWrapper,
  PaginatedAgentWrapper,
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
  3: 'The agent is shutdown and has been deleted, but is still able to be restored.'
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
  
  const userBelongsToSelectedWorkspace = user?.workspaceId === workspaceId;

  const [tab, setTab] = useState(0);
  const {
    deleteAgent,
    activateAgent,
    deactivateAgent,
    paginatedAgents,
    setPage,
    loading,

    fetchAgentsOfOtherWorkspaces,
    deleteAgentsOfOtherWorkspaces,
    restoreAgentsOfOtherWorkspaces
  } = useAgents();

  const { fetchAllWorkspacesBasicInfo  } = useDashboardService(token as string);

  const { agents, meta } = paginatedAgents;

  const [agentsState, setAgentsState] = useState<AgentWrapper[]>(agents);
  const [metaState, setMetaState] = useState<PaginatedAgentWrapper['meta']>(meta);

  const handleWorkspaceChange = (event: SelectChangeEvent<string | null>) => {
    setWorkspaceId(event.target.value);
  }; 

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const filteredAgents = userBelongsToSelectedWorkspace ? (
    agents.filter((wrapper) => {
      if (tab === 1) return wrapper.agent.isActive;
      if (tab === 2) return !wrapper.agent.isActive;
      return true;
    })
  ) : (
    agentsState.filter((wrapper) => {
        if (tab === 1) return wrapper.agent.isActive;
        if (tab === 2) return !wrapper.agent.isActive;
        return true;
      })    
  );

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);

    if (!userBelongsToSelectedWorkspace) {
      const fetchAgentsData = async (workspaceId: string) => {
        const response = await fetchAgentsOfOtherWorkspaces(workspaceId) as PaginatedAgentWrapper;
        setAgentsState(response.agents);
        setMetaState(response.meta);
      }
      
      fetchAgentsData(workspaceId as string);
    }
  };

  const handleDelete = async (id: string) => {
    if (userBelongsToSelectedWorkspace && !canDelete) {
      notify('You cannot delete agents of the workspace!', 'warning');
      return;
    }

    if (!userBelongsToSelectedWorkspace && !canDeleteAsAdmin) {
      notify('Your admin privileges to delete agents of any workspace has been revoked!', 'warning');
      return;
    }

    if (userBelongsToSelectedWorkspace) {
      deleteAgent(id);
      return;
    }

    if (!userBelongsToSelectedWorkspace) {
      try {
        const deletedPermanently: boolean = await deleteAgentsOfOtherWorkspaces(id);

        if (deletedPermanently) {
          setAgentsState(previousAgentsWrapper => previousAgentsWrapper.filter(wrapper => {
            return wrapper.agent.id != id;
          }))
        } else {
          setAgentsState(previousAgentsWrapper => previousAgentsWrapper.map(wrapper => {
            if (wrapper.agent.id === id) return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                isActive: false,
                isDeleted: true
              }
            };
    
            return wrapper;
          }))
        }

      } catch {

      }
    }   
  };

  const handleRestore = (id: string) => {
    if (!userBelongsToSelectedWorkspace && !canDeleteAsAdmin) {
      notify('Your admin privileges to restore agents of any workspace has been revoked!', 'warning');
      return;
    }

    if (!userBelongsToSelectedWorkspace) {
      try {
        restoreAgentsOfOtherWorkspaces(id);

        setAgentsState(previousAgentsWrapper => previousAgentsWrapper.map(wrapper => {
          if (wrapper.agent.id === id) return {
            ...wrapper,
            agent: {
              ...wrapper.agent,
              isDeleted: false
            }
          };
  
          return wrapper;
        }))

      } catch {

      }
    }   
  };

  const handleActivateOrDeactivate = async (
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
    
    try {
      agentActivityStatus
        ? deactivateAgent(agentId)
        : activateAgent(agentId);
  
      if (!userBelongsToSelectedWorkspace) {
        setAgentsState(previousAgentsWrapper => previousAgentsWrapper.map(wrapper => {
          if (wrapper.agent.id === agentId) return {
            ...wrapper,
            agent: {
              ...wrapper.agent,
              isActive: !agentActivityStatus
            }
          };
  
          return wrapper;
        }))
      }
    } catch {

    }
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

  // Fetch agent data of selected workspace (if admin is viewing other workspaces data)
  useEffect(() => {
    const fetchAgentsData = async (workspaceId: string) => {
      const response = await fetchAgentsOfOtherWorkspaces(workspaceId) as PaginatedAgentWrapper;
      setAgentsState(response.agents);
      setMetaState(response.meta);
    }
    
    if (!userBelongsToSelectedWorkspace) {
      fetchAgentsData(workspaceId as string);
    }

  }, [userBelongsToSelectedWorkspace, workspaceId]);

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
              gap: 1
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
                    value={workspaceOptions.some(w => w.id === workspaceId) ? workspaceId : ''}                    onChange={handleWorkspaceChange}
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
                  color: agent.isDeleted ? theme.palette.text.secondary : 'textPrimary',
                  textDecoration: agent.isDeleted ? 'line-through' : 'none',
                  '&:hover': {
                    backgroundColor: agent.isDeleted ? 'transparent' : 'action.hover',
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
                          agent.isDeleted
                            ? 3
                            : agent.isActive
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
                          agent.isDeleted
                            ? 'default'
                            : agent.isActive
                              ? agent.channels.find(
                                  (channel: Channel) => channel.connected
                                )
                                ? 'success'
                                : 'warning'
                              : 'error'
                        }
                        label={
                          agent.isDeleted
                            ? 'DELETED'
                            : agent.isActive
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
                      handleRestore={handleRestore}
                      handleOpenSettings={handleOpenSettings}
                      theme={theme}
                    />
                  </CardContent>
                </>
              </Card>
            ))}
          </List>

          {filteredAgents.length === 0 ? (
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
                count={userBelongsToSelectedWorkspace ? meta.totalPages : metaState.totalPages}
                page={userBelongsToSelectedWorkspace ? meta.page : metaState.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          <CreateAgentDialog
            open={open}
            onClose={handleCloseModal}
            agentTypeDescriptions={agentTypeDescriptions}
            userBelongsToSelectedWorkspace={userBelongsToSelectedWorkspace}
            workspaceId={workspaceId as string}
          />

          <LoadingBackdrop open={loading} />
        </Box>
      </CardContent>
    </Card>
  );
}
