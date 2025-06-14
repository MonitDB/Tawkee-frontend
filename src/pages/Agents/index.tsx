import { ChangeEvent, SyntheticEvent, useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useNavigate } from 'react-router-dom';
import CreateAgentDialog from './components/CreateAgentDialog';
import { Channel } from '../../services/channelService';

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
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const {
    deleteAgent,
    activateAgent,
    deactivateAgent,
    paginatedAgents,
    setPage,
    loading,
  } = useAgents();

  const { agents, meta } = paginatedAgents;

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
    deleteAgent(id);
  };

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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              Create Agent
            </Button>
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
                      onClick={(event) => {
                        event.stopPropagation();
                        agent.isActive
                          ? deactivateAgent(agent.id)
                          : activateAgent(agent.id);
                      }}
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
