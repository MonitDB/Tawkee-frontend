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
  Stack,
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

  const isMdUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();

  const { user, token, isLoggingOutRef, can } = useAuth();

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
  const [workspaceIsActive, setWorkspaceIsActive] = useState<boolean>(user?.workspaceIsActive || false);
  const [workspaceOptions, setWorkspaceOptions] = useState<
  { id: string; name: string; isActive: boolean, email: string | null }[]
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

  const [agentLimitState, setAgentLimitState] = useState<number | 'UNLIMITED' | undefined>(
    user?.subscription?.agentLimitOverrides?.explicitlySet
      ? user?.subscription?.agentLimitOverrides?.value
      : user?.plan?.agentLimit
  )

  const agentLimit = userBelongsToSelectedWorkspace
    ? user?.subscription?.agentLimitOverrides?.explicitlySet
      ? user?.subscription?.agentLimitOverrides?.value
      : user?.plan?.agentLimit
    : agentLimitState;

  const handleWorkspaceChange = (event: SelectChangeEvent<string | null>) => {
    setWorkspaceId(event.target.value);
    setWorkspaceIsActive(
      workspaceOptions && event.target.value
        ? workspaceOptions.find(ws => ws.id === event.target.value)?.isActive ?? false
        : false
    );
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
      await deleteAgent(id);
      return;
    }

    if (!userBelongsToSelectedWorkspace) {
      try {
        const deletedPermanently: boolean = await deleteAgentsOfOtherWorkspaces(id);

        if (deletedPermanently) {
          setAgentsState(previousAgentsWrapper => previousAgentsWrapper.filter(wrapper => {
            return wrapper.agent.id != id;
          }));

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
          }));
          setMetaState({
            ...metaState,
            total: metaState.total - 1
          })          
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
        }));
        setMetaState({
          ...metaState,
          total: metaState.total + 1
        });

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

    if (agentActivityStatus == false && userBelongsToSelectedWorkspace &&
      (agentLimit != 'UNLIMITED' && agents.filter(wrapper => wrapper.agent.isActive).length >= (agentLimit as number))
    ) {
      notify(`You cannot have more than ${agentLimit} active agent(s) at once!`, 'warning');
      return;
    }

    if (agentActivityStatus == false && !userBelongsToSelectedWorkspace &&
      (agentLimit != 'UNLIMITED' && agentsState.filter(wrapper => wrapper.agent.isActive).length >= (agentLimit as number))
    ) {
      notify(`This workspace cannot have more than ${agentLimit} active agent(s) at once!`, 'warning');
      return;
    }

    try {
      agentActivityStatus
        ? await deactivateAgent(agentId)
        : await activateAgent(agentId);      

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

    if (!isLoggingOutRef.current && userIsAdmin) {
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
      setAgentLimitState(response.subscriptionLimits?.agentLimit);
    }
    
    if (!userBelongsToSelectedWorkspace) {
      fetchAgentsData(workspaceId as string);
    }

  }, [userBelongsToSelectedWorkspace, workspaceId]);

  return (
    <Card variant="outlined" sx={{ margin: '0 auto', width: '100%' }}>
      <CardContent>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                value={workspaceOptions.some(w => w.id === workspaceId) ? workspaceId : ''}
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
                    
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 4,
              gap: 3
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
                disabled={workspaceIsActive
                  ? userBelongsToSelectedWorkspace
                    ? !canCreate
                      ? true
                      : (agentLimit != 'UNLIMITED' && meta.total >= (agentLimit as number))
                    : true
                      ? !workspaceIsActive
                      : (agentLimit != 'UNLIMITED' && metaState.total >= (agentLimit as number))
                  : true
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
              { !workspaceIsActive && userBelongsToSelectedWorkspace && (
                <Tooltip title="Your workspace is not active." placement='left-start'>
                  <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='error' />
                </Tooltip>
              )}
              { !workspaceIsActive && !userBelongsToSelectedWorkspace && (
                <Tooltip title="This workspace is not active." placement='left-start'>
                  <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='error' />
                </Tooltip>
              )}

              { workspaceIsActive && userBelongsToSelectedWorkspace
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

          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3
          }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create, train and manage your AI agents
            </Typography>

            <Stack>
              <Typography variant="body1" color="text.secondary" textAlign="end">
                {agentLimit === 'UNLIMITED' || agentLimit === null
                  ? 'Your subscription allows working with unlimited agents.'
                  : agentLimit === 0
                    ? 'Your subscription does not allow creating or activating agents.'
                    : agentLimit === 1
                      ? 'Your subscription allows working with up to one agent.'
                      : `Your subscription allows working with up to ${agentLimit} agents.`
                }
              </Typography>
              <Typography 
                variant="body1"
                color={
                  agentLimit === 'UNLIMITED' || agentLimit === null
                    ? "text.primary"
                    : userBelongsToSelectedWorkspace
                      ? meta.total > (agentLimit as number)
                        ? "error"
                        : "text.primary"
                      : metaState.total > (agentLimit as number)
                        ? "error"
                        : "text.primary"
                }
                fontWeight="bold"
                textAlign="end"
              >
                {agentLimit === 'UNLIMITED' || agentLimit === null
                  ? `${userBelongsToSelectedWorkspace ? meta.total : metaState.total} agents in use.`
                  : agentLimit === 0
                    ? ''
                    : `${userBelongsToSelectedWorkspace ? meta.total || 'None' : metaState.total || 'None'} of ${agentLimit} in use.`
                }
                {
                  (agentLimit !== 'UNLIMITED' && agentLimit !== null) && userBelongsToSelectedWorkspace
                    ? meta.total > (agentLimit as number) && (
                      <Tooltip title="You will not be able to keep all existing agents active at the same time.">
                        <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='error' />
                      </Tooltip>
                    )
                    : metaState.total > (agentLimit as number) && (
                      <Tooltip title="This workspace cannot keep all existing agents active at the same time.">
                        <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='error' />
                      </Tooltip>
                    )
                }
                
              </Typography>
            </Stack>
          </Box>

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
                    {isLgUp && (
                      <Tooltip
                        title={agentTypeDescriptions[agent.type]}
                        placement="top"
                      >
                        <Chip label={agent.type} />
                      </Tooltip>
                    )}
                    {isLgUp && (
                      <TruncatedText
                        text={
                          agent.behavior
                            ? agent.behavior
                            : agent.jobDescription
                              ? agent.jobDescription
                              : ''
                        }
                        maxChars={15}
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
