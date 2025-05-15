import { useEffect, useState } from 'react';

import {
  useAgents,
  Agent,
  AgentSettings,
  AgentInput,
  AIModel,
  GroupingTime,
  AgentCommunicationType,
  AgentType,
} from '../../context/AgentsContext';

import LoadingBackdrop from '../../components/LoadingBackdrop';

import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Tooltip,
  Chip,
  Grid,
  useTheme,
  DialogProps,
  MenuItem,
  Box,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import {
  DeleteForever,
  Refresh,
  MapsUgcOutlined,
  LinkOff,
} from '@mui/icons-material';
import { useHttpResponse } from '../../context/ResponseNotifier';
import QRCodeBackdrop from '../../components/QRCodeBackdrop';
import { useChannelService } from '../../hooks/useChannelService';
import { useAuth } from '../../context/AuthContext';
import ActionMenu from './components/ActionMenu';

type AgentWrapper = {
  agent: Agent;
  settings: AgentSettings;
};

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

const agentCommunicationDescriptions: Record<AgentCommunicationType, string> = {
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
  [AgentType.PERSONAL]:
    'Casual and friendly interaction with an informal tone.',
};

export default function Agents() {
  const theme = useTheme();

  const {
    agents,
    createAgent,
    updateAgent,
    deleteAgent,
    activateAgent,
    deactivateAgent,
    updateAgentSettings,
    loading,
  } = useAgents();

  const [open, setOpen] = useState(false);

  const blankAgentInput: AgentInput = {
    name: '',
    behavior: '',
    avatar: undefined,
    communicationType: AgentCommunicationType.FORMAL,
    type: AgentType.SALE,
    jobName: '',
    jobSite: '',
    jobDescription: '',
  };

  const [selectedAgent, setSelectedAgent] = useState<Agent | AgentInput>(
    blankAgentInput
  );

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSettings, setSelectedSettings] =
    useState<AgentSettings | null>(null);
  const [settingsAgentId, setSettingsAgentId] = useState<string | null>(null);

  const [channelsOpen, setChannelsOpen] = useState(false);
  const [channelsAgentId, setChannelsAgentId] = useState<string | null>(null);
  const [channelsAgentActive, setChannelsAgentActive] = useState<
    boolean | null
  >(null);

  const [typeOfModalOpened, setTypeOfModalOpened] = useState<string | null>(
    null
  );

  const handleOpenModal = (agent?: Agent) => {
    if (agent == undefined) {
      setTypeOfModalOpened('Create');
    } else {
      setTypeOfModalOpened('Edit');
    }

    setSelectedAgent(agent || blankAgentInput);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedAgent(blankAgentInput);
  };

  const handleSave = async (selectedAgent: Agent | AgentInput) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, workspaceId, isActive, ...agentInput } =
        selectedAgent as Agent;

      if (typeOfModalOpened === 'Create') {
        await createAgent(agentInput as AgentInput);
      } else {
        await updateAgent(id, agentInput);
      }
    } finally {
      handleCloseModal();
    }
  };

  const handleDelete = (id: string) => {
    deleteAgent(id);
  };

  const handleToggleActive = (agent: Agent) => {
    agent.isActive ? deactivateAgent(agent.id) : activateAgent(agent.id);
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

  const handleOpenChannels = (agentId: string, agentIsActive: boolean) => {
    setChannelsAgentId(agentId);
    setChannelsAgentActive(agentIsActive);
    setChannelsOpen(true);
  };

  const handleCloseChannels = () => {
    setChannelsOpen(false);
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
    <>
      <Typography variant="h4" gutterBottom>
        Agent Manager
      </Typography>
      <Button variant="contained" onClick={() => handleOpenModal()}>
        Create New Agent
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Job</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Communication</TableCell>
              <TableCell>Behavior</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((item: AgentWrapper) => {
              const { agent, settings } = item;

              return (
                <TableRow
                  key={agent.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.3s',
                    border: '2px solid transparent',
                    '&:hover': {
                      backgroundColor: agent.isActive
                        ? theme.palette.action.hover
                        : 'transparent',
                      borderLeft: agent.isActive
                        ? `2px solid ${theme.palette.info.dark}`
                        : `2px solid ${theme.palette.action.selected}`,
                      borderRight: agent.isActive
                        ? `2px solid ${theme.palette.info.dark}`
                        : `2px solid ${theme.palette.action.selected}`,
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      color: agent.isActive ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    <TruncatedText text={agent.name} maxChars={20} />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: agent.isActive ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    <TruncatedText text={agent.jobName} maxChars={10} />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: agent.isActive ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    <Tooltip
                      title={
                        agentCommunicationDescriptions[agent.communicationType]
                      }
                    >
                      <Chip label={agent.type} />
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: agent.isActive ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    <Tooltip title={agentTypeDescriptions[agent.type]}>
                      <Chip label={agent.communicationType} />
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: agent.isActive ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    <TruncatedText text={agent.behavior} />
                  </TableCell>

                  <TableCell
                    sx={{
                      color: agent.isActive ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    <ActionMenu
                      agent={agent}
                      settings={settings}
                      handleOpenModal={handleOpenModal}
                      handleDelete={handleDelete}
                      handleOpenChannels={handleOpenChannels}
                      handleOpenSettings={handleOpenSettings}
                      theme={theme}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      color: agent.isActive ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    <Tooltip
                      placement="left"
                      title="When inactive, the Agent will not respond to messages"
                    >
                      <Switch
                        checked={agent.isActive}
                        onChange={() => handleToggleActive(agent)}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {agents.length == 0 && (
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: 'text.primary', padding: '20px' }}
        >
          No agent yet
        </Typography>
      )}

      <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>{`${typeOfModalOpened} Agent`}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                variant="standard"
                margin="dense"
                fullWidth
                label="Name"
                value={selectedAgent?.name || ''}
                onChange={(e) =>
                  setSelectedAgent((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
                  )
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                variant="standard"
                margin="dense"
                fullWidth
                label="Behavior"
                multiline
                value={selectedAgent?.behavior || ''}
                onChange={(e) =>
                  setSelectedAgent((prev) =>
                    prev ? { ...prev, behavior: e.target.value } : prev
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                variant="standard"
                select
                margin="dense"
                fullWidth
                label="Communication Type"
                value={selectedAgent?.communicationType || ''}
                onChange={(e) =>
                  setSelectedAgent((prev) =>
                    prev
                      ? {
                          ...prev,
                          communicationType: e.target
                            .value as AgentCommunicationType,
                        }
                      : prev
                  )
                }
              >
                {Object.values(AgentCommunicationType).map(
                  (communicationType) => (
                    <MenuItem key={communicationType} value={communicationType}>
                      <Tooltip
                        title={
                          agentCommunicationDescriptions[communicationType]
                        }
                        placement="right"
                      >
                        <span>{communicationType}</span>
                      </Tooltip>
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                variant="standard"
                select
                margin="dense"
                fullWidth
                label="Type"
                value={selectedAgent?.type || ''}
                onChange={(e) =>
                  setSelectedAgent((prev) =>
                    prev ? { ...prev, type: e.target.value as AgentType } : prev
                  )
                }
              >
                {Object.values(AgentType).map((type) => (
                  <MenuItem key={type} value={type}>
                    <Tooltip
                      title={agentTypeDescriptions[type]}
                      placement="right"
                    >
                      <span>{type}</span>
                    </Tooltip>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                variant="standard"
                margin="dense"
                fullWidth
                label="Job Name"
                value={selectedAgent?.jobName || ''}
                onChange={(e) =>
                  setSelectedAgent((prev) =>
                    prev ? { ...prev, jobName: e.target.value } : prev
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                variant="standard"
                margin="dense"
                fullWidth
                label="Job Site"
                value={selectedAgent?.jobSite || ''}
                onChange={(e) =>
                  setSelectedAgent((prev) =>
                    prev ? { ...prev, jobSite: e.target.value } : prev
                  )
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                variant="standard"
                margin="dense"
                fullWidth
                label="Job Description"
                multiline
                minRows={3}
                value={selectedAgent?.jobDescription || ''}
                onChange={(e) =>
                  setSelectedAgent((prev) =>
                    prev ? { ...prev, jobDescription: e.target.value } : prev
                  )
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={() => handleSave(selectedAgent)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={settingsOpen}
        onClose={handleCloseSettings}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Agent Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                variant="standard"
                margin="dense"
                fullWidth
                label="Timezone"
                value={selectedSettings?.timezone || ''}
                onChange={(e) =>
                  setSelectedSettings((prev) =>
                    prev ? { ...prev, timezone: e.target.value } : prev
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                variant="standard"
                margin="dense"
                select
                fullWidth
                label="Preferred Model"
                value={selectedSettings?.preferredModel || ''}
                onChange={(e) =>
                  setSelectedSettings((prev) =>
                    prev
                      ? { ...prev, preferredModel: e.target.value as AIModel }
                      : prev
                  )
                }
              >
                {Object.values(AIModel).map((model) => (
                  <MenuItem key={model} value={model}>
                    <Tooltip title={modelDescriptions[model]} placement="right">
                      <span>{model}</span>
                    </Tooltip>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                variant="standard"
                margin="dense"
                select
                fullWidth
                label="Message Grouping Time"
                value={selectedSettings?.messageGroupingTime || ''}
                onChange={(e) =>
                  setSelectedSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          messageGroupingTime: e.target.value as GroupingTime,
                        }
                      : prev
                  )
                }
              >
                {Object.values(GroupingTime).map((group) => (
                  <MenuItem key={group} value={group}>
                    <Tooltip
                      title={groupingDescriptions[group]}
                      placement="right"
                    >
                      <span>{group}</span>
                    </Tooltip>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}></Grid>
            <Grid size={{ xs: 12, md: 3 }}></Grid>
            <Grid size={{ xs: 12, md: 3 }}></Grid>
            <Grid size={{ xs: 12, md: 3 }}></Grid>
            <Grid size={{ xs: 12, md: 3 }}></Grid>
          </Grid>
          <Divider />
          {settingsOptions.map(({ key, label, description }) => (
            <Tooltip key={key} title={description} placement="right">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}
              >
                <Typography>{label}</Typography>
                <Switch
                  checked={
                    (selectedSettings?.[
                      key as keyof AgentSettings
                    ] as boolean) || false
                  }
                  onChange={(e) =>
                    setSelectedSettings((prev) =>
                      prev ? { ...prev, [key]: e.target.checked } : prev
                    )
                  }
                />
              </div>
            </Tooltip>
          ))}
          <Divider />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ChannelsDialog
        agentId={channelsAgentId as string}
        agentIsActive={channelsAgentActive as boolean}
        open={channelsOpen}
        onClose={handleCloseChannels}
        fullWidth
        maxWidth="sm"
      />

      <LoadingBackdrop open={loading} />
    </>
  );
}

interface ChannelsDialogProps extends DialogProps {
  agentId: string;
  agentIsActive: boolean;
  open: boolean;
  onClose: () => void;
}

function ChannelsDialog({
  agentId,
  agentIsActive,
  open,
  onClose,
}: ChannelsDialogProps) {
  const { notify } = useHttpResponse();
  const theme = useTheme();

  const { token } = useAuth();
  const {
    channels,
    getChannelsForAgent,
    createChannel,
    getQRCode,
    disconnectChannel,
    deleteChannel,
    loading,
  } = useChannelService(token as string);

  const [newChannelName, setNewChannelName] = useState('');
  const [QRCode, setQRCode] = useState<string | null>(null);

  const handleDisconnect = (channelId: string) => {
    disconnectChannel(channelId);
  };

  const handleDeleteChannel = (channelId: string) => {
    deleteChannel(channelId);
  };

  const handleCreateChannel = () => {
    if (newChannelName) {
      // Assuming you have a method to create a new channel
      createChannel(agentId, newChannelName, 'WHATSAPP');
      setNewChannelName('');
    } else {
      notify('Please name your channel first.', 'warning');
    }
  };

  const handleRefreshQrCode = async (channelId: string) => {
    const { qrCode } = await getQRCode(channelId);
    setQRCode(qrCode);
  };

  const handleCloseQRCodeBackdrop = () => {
    setQRCode(null);
  };

  useEffect(() => {
    const handleGetChannelsForAgent = async (agentId: string) => {
      await getChannelsForAgent(agentId);
    };

    if (agentId) {
      handleGetChannelsForAgent(agentId);
    }
  }, [agentId, getChannelsForAgent]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Agent Channels</DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={2}
          sx={{ display: 'flex', alignItems: 'center', margin: 2 }}
        >
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              variant="standard"
              label="New Channel Name"
              margin="dense"
              fullWidth
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              variant="standard"
              label="Channel Type"
              margin="dense"
              disabled
              fullWidth
              value="WHATSAPP"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <IconButton onClick={handleCreateChannel}>
              <Tooltip title="Create Channel">
                <MapsUgcOutlined />
              </Tooltip>
            </IconButton>
          </Grid>
        </Grid>
        <Grid>
          {channels.map((channel) => (
            <Card
              key={channel.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                p: 1.5,
                boxShadow: 3,
                borderLeft: `6px solid ${
                  channel.connected
                    ? agentIsActive
                      ? theme.palette.success.main
                      : theme.palette.warning.main
                    : theme.palette.error.main
                }`,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: channel.connected
                        ? agentIsActive
                          ? theme.palette.success.main
                          : theme.palette.warning.main
                        : theme.palette.error.main,
                      mr: 1,
                    }}
                  />
                  <Typography variant="h6" component="div">
                    {channel.name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'flex', gap: '8px' }}
                >
                  <Chip label={channel.type} />
                  <Divider orientation="vertical" flexItem />
                  <Chip
                    color={
                      channel.connected
                        ? agentIsActive
                          ? 'success'
                          : 'warning'
                        : 'error'
                    }
                    label={
                      channel.connected
                        ? agentIsActive
                          ? 'Connected'
                          : 'Connected but inactive'
                        : 'Disconnected'
                    }
                  />
                </Typography>
              </CardContent>
              <CardActions>
                {channel.connected ? (
                  <IconButton
                    onClick={() => handleDisconnect(channel.id)}
                    color="primary"
                  >
                    <Tooltip title="Disconnect">
                      <LinkOff />
                    </Tooltip>
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => handleRefreshQrCode(channel.id)}
                    color="primary"
                  >
                    <Tooltip title="Refresh QR Code To Connect">
                      <Refresh />
                    </Tooltip>
                  </IconButton>
                )}
                <IconButton
                  disabled={channel.connected}
                  onClick={() => handleDeleteChannel(channel.id)}
                  color="error"
                >
                  <Tooltip title="Delete Channel">
                    <DeleteForever />
                  </Tooltip>
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Exit
        </Button>
      </DialogActions>

      <LoadingBackdrop open={loading} />
      <QRCodeBackdrop
        open={typeof QRCode == 'string'}
        base64={QRCode as string}
        onClose={handleCloseQRCodeBackdrop}
      />
    </Dialog>
  );
}
