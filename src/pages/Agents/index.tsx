import { Dispatch, SetStateAction, useState } from 'react';
import {
  useAgents,
  AgentSettings,
  AIModel,
  GroupingTime,
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
  MenuItem,
  useTheme,
  styled,
  Chip,
  Card,
  CardContent,
  Tooltip,
  useColorScheme,
  Menu,
  Pagination,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useNavigate } from 'react-router-dom';
import CreateAgentDialog from './components/CreateAgentDialog';
import AgentSettingsDialog from './components/AgentSettingsDialog';
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

const modelDescriptions: Record<AIModel, string> = {
  [AIModel.GPT_4]: 'GPT-4: General-purpose large language model.',
  [AIModel.GPT_4_O]: 'GPT-4o: Multimodal model (vision, text, audio).',
  [AIModel.GPT_4_O_MINI]: 'GPT-4o-mini: Lightweight version of GPT-4o.',
  [AIModel.GPT_4_1_MINI]: 'GPT-4.1-mini: Efficient GPT-4.1 variant.',
  [AIModel.GPT_4_1]: 'GPT-4.1: Enhanced version with better reasoning.',
};

const groupingDescriptions: Record<GroupingTime, string> = {
  [GroupingTime.NO_GROUP]: 'No grouping applied — raw data points.',
  [GroupingTime.FIVE_SEC]: 'Group data by 5-second intervals.',
  [GroupingTime.TEN_SEC]: 'Group data by 10-second intervals.',
  [GroupingTime.THIRD_SEC]:
    'Group data by 1/3 second intervals — high frequency.',
  [GroupingTime.ONE_MINUTE]:
    'Group data by 1-minute intervals — good for summaries.',
};

const settingsOptions = [
  {
    key: 'enabledHumanTransfer',
    label: 'Enable Human Transfer',
    description:
      'Allows the AI to transfer the conversation to a human agent when needed.',
  },
  {
    key: 'enabledReminder',
    label: 'Enable Reminder',
    description:
      'Sends automated reminder messages after a period of user inactivity.',
  },
  {
    key: 'splitMessages',
    label: 'Split Messages',
    description:
      'Breaks long messages into smaller parts to improve readability.',
  },
  {
    key: 'enabledEmoji',
    label: 'Enable Emoji',
    description: 'Allows the use of emojis in the conversation.',
  },
  {
    key: 'limitSubjects',
    label: 'Limit Subjects',
    description: 'Restricts user input to a predefined set of topics.',
  },
];

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
    updateAgentSettings,
    loading,
    paginatedAgents,
    setPage,
  } = useAgents();

  const { agents, meta } = paginatedAgents;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const filteredAgents = agents.filter((wrapper) => {
    if (tab === 1) return wrapper.agent.isActive;
    if (tab === 2) return !wrapper.agent.isActive;
    return true;
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const [open, setOpen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSettings, setSelectedSettings] =
    useState<AgentSettings | null>(null);
  const [settingsAgentId, setSettingsAgentId] = useState<string | null>(null);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteAgent(id);
  };

  const handleOpenSettings = (agentId: string, settings: AgentSettings) => {
    setSettingsAgentId(agentId);
    setSelectedSettings(settings);
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setSelectedSettings(null);
    setSettingsAgentId(null);
  };

  const handleSaveSettings = () => {
    if (!selectedSettings || settingsAgentId === null) return;

    updateAgentSettings(settingsAgentId, selectedSettings);

    handleCloseSettings();
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

  // Add these inside your Agents component
  const { mode, systemMode } = useColorScheme();

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  // Estado para o Menu de verificação
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    agentId: string
  ) => {
    setSettingsAgentId(agentId);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateToAgentDetails = () => {
    navigate(`/agents/${settingsAgentId}`);
  };

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
            {filteredAgents.map(({ agent, settings }) => (
              <Card
                key={agent.id}
                sx={{
                  margin: `${theme.spacing(2)} 0`,
                  '&:hover': {
                    backgroundColor:
                      resolvedMode == 'dark'
                        ? theme.palette.action.hover
                        : theme.palette.action.focus,
                  },
                }}
              >
                <>
                  <CardContent>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={agent.avatar} alt={agent.name}>
                          {agent.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        onClick={(event) => handleMenuClick(event, agent.id)}
                        sx={{ cursor: 'pointer' }}
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: theme.spacing(1),
                            }}
                          >
                            {agent.name}
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
                          </Box>
                        }
                      />
                      <ActionMenu
                        agent={agent}
                        settings={settings}
                        handleDelete={handleDelete}
                        handleOpenSettings={handleOpenSettings}
                        theme={theme}
                      />
                    </ListItem>
                  </CardContent>
                  <Menu
                    id="edit-menu"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                  >
                    <MenuItem
                      onClick={handleNavigateToAgentDetails}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      Edit Agent
                    </MenuItem>
                  </Menu>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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

          <AgentSettingsDialog
            open={settingsOpen}
            onClose={handleCloseSettings}
            onSave={handleSaveSettings}
            settings={selectedSettings as AgentSettings}
            setSettings={
              setSelectedSettings as Dispatch<SetStateAction<AgentSettings>>
            }
            modelDescriptions={modelDescriptions}
            groupingDescriptions={groupingDescriptions}
            settingsOptions={settingsOptions}
          />

          <LoadingBackdrop open={loading} />
        </Box>
      </CardContent>
    </Card>
  );
}
