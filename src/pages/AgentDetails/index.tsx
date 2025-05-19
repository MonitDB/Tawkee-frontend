import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Agent, AgentType, useAgents } from '../../context/AgentsContext';
import { Channel } from '../../services/channelService';

import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  Grid,
  Tab,
  Tabs,
  useTheme,
  Button,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Hub as HubIcon,
} from '@mui/icons-material';
import { useChannelService } from '../../hooks/useChannelService';
import { useAuth } from '../../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AgentDetails() {
  const theme = useTheme();
  const params = useParams();
//   const [searchParams] = useSearchParams();

  const { paginatedAgents, updateAgent, loading } = useAgents();
  const { agents } = paginatedAgents;

  const [currentTab, setCurrentTab] = useState(0);
  const [agentData, setAgentData] = useState<Agent | null>(null);

  const [agentNameError, setAgentNameError] = useState<boolean>(false);
  const [agentNameErrorMessage, setAgentNameErrorMessage] =
    useState<string>('');
  const [agentBehaviorValue, setAgentBehaviorValue] = useState<string>("");

  const { token } = useAuth();
  const { getQRCode, loading: channelQRCodeLoading } = useChannelService(token as string);
  const [QRCode, setQRCode] = useState<string | undefined>(undefined);


  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleChangeAgentBehavior = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAgentBehaviorValue(event.target.value);
  }

  const validateInputs = () => {
    const agentName = document.getElementById('agent-name') as HTMLInputElement;
    const agentBehavior = document.getElementById(
      'agent-behavior'
    ) as HTMLInputElement;

    let isValid = true;

    if (!agentName.value) {
      setAgentNameError(true);
      setAgentNameErrorMessage('Agent name should not be left blank.');
      isValid = false;
    } else {
      setAgentNameError(false);
      setAgentNameErrorMessage('');
    }

    if (agentBehavior.value.length > 3000) {
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (agentNameError || agentBehaviorValue.length > 3000) {
      return;
    }
    const data = new FormData(event.currentTarget);

    try {
        updateAgent(params.agentId as string, {
            name: data.get('agent-name') as string || undefined,
            behavior: data.get('agent-behavior') as string || undefined,
            type: data.get('agent-type') as AgentType || undefined
        })
    } catch (error) {
      return;
    }
  };

  const handleRefreshQrCode = async (channelId: string) => {
    const { qrCode } = await getQRCode(channelId);
    setQRCode(qrCode as string);
  };


  useEffect(() => {
    if (params.agentId) {
        const agent = agents.find(
            (wrapper) => wrapper.agent.id === params.agentId
        )?.agent;
        
        if (agent) {
            setAgentData(agent);    
            setAgentBehaviorValue(agent.behavior);

            const disconnectedToAnyChannel = agent.channels.find((channel: Channel) => !channel.connected);

            if (disconnectedToAnyChannel) {
                setCurrentTab(4);
                handleRefreshQrCode(disconnectedToAnyChannel.id);
            }
        }
    }

    // const tabName = searchParams.get('tabName');
    // if (tabName) {
    //     if (tabName === 'training') {
    //         setCurrentTab(2);
    //     } else if (tabName === 'intentions') {
    //         setCurrentTab(3);
    //     } else if (tabName === 'settings') {
    //         setCurrentTab(5);
    //     }
    // }


  }, [params.agentId, agents])

  if (!agentData) {
    return <></>
  } else {
    return (
    <Card
        variant="outlined"
        sx={{ height: '100%', bgcolor: theme.palette.background.default }}
    >
        <CardContent sx={{ height: '100%', overflowY: 'hidden' }}>
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
            {/* Agent Header */}
            <Grid size={{ xs: 12 }}>
                <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}
                >
                <Avatar src={agentData.avatar} sx={{ width: 100, height: 100 }}>
                    {agentData.name[0]}
                </Avatar>
                <Box>
                    <Typography variant="h4">{agentData.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                    color={agentData.isActive
                        ? agentData.channels.filter((channel: Channel) => channel.connected).length > 0
                        ? 'success'
                        : 'warning'
                        : 'error'
                    }
                    label={agentData.isActive
                        ? agentData.channels.filter((channel: Channel) => channel.connected).length > 0
                        ? 'ACTIVE & CONNECTED'
                        : 'ACTIVE BUT DISCONNECTED'
                        : 'INACTIVE'
                    }
                    />
                    <Chip label={agentData.communicationType} />
                    <Chip label={agentData.type} />
                    </Box>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                    <Button variant="contained" color="primary">
                    Chat with {agentData.name}
                    </Button>
                </Box>
                </Box>
            </Grid>

            {/* Navigation */}
            <Grid size={{ xs: 12 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab icon={<PersonIcon />} label="Profile" />
                <Tab icon={<WorkIcon />} label="Work" />
                <Tab icon={<SchoolIcon />} label="Training" />
                <Tab icon={<PsychologyIcon />} label="Intentions" />
                <Tab icon={<HubIcon />} label="Integrations" />
                <Tab icon={<SettingsIcon />} label="Settings" />
                </Tabs>
            </Grid>

            {/* Content */}
            <Grid size={{ xs: 12 }}>
                <TabPanel value={currentTab} index={0}>
                <Typography variant="h6" gutterBottom>
                    Personal Information
                </Typography>
                <Grid
                    container
                    spacing={3}
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl sx={{ width: '100%' }}>
                            <FormLabel htmlFor="agent-name">Name</FormLabel>
                            <TextField
                                error={agentNameError}
                                defaultValue={agentData.name}
                                helperText={agentNameErrorMessage}
                                id="agent-name"
                                name="agent-name"
                                autoFocus
                                required
                                fullWidth
                                variant="outlined"
                                color={agentNameError ? 'error' : 'primary'}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl sx={{ width: '100%' }}>
                            <FormLabel htmlFor="agent-type">Type</FormLabel>
                            <TextField
                                defaultValue={agentData.type}
                                id="agent-type"
                                name="agent-type"
                                select
                                required
                                fullWidth
                                variant="outlined"
                            >
                            {Object.values(AgentType).map((type) => (
                                <MenuItem key={type} value={type}>
                                {type}
                                </MenuItem>
                            ))}
                            </TextField>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControl sx={{ width: '100%' }}>
                            <FormLabel htmlFor="agent-behavior">Behavior</FormLabel>
                            <TextField
                                error={agentBehaviorValue.length > 3000}
                                defaultValue={agentData.behavior}
                                id="agent-behavior"
                                name="agent-behavior"
                                required
                                fullWidth
                                multiline
                                rows={6}
                                variant="outlined"
                                helperText={`${agentBehaviorValue.length}/3000`}
                                onChange={handleChangeAgentBehavior}
                                color={agentBehaviorValue.length > 3000 ? 'error' : 'primary'}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 9 }}>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                        <Button
                            type="submit"
                            fullWidth
                            variant={loading ? 'outlined' : 'contained'}
                            onClick={validateInputs}
                            disabled={loading}
                        >
                            Save
                        </Button>
                    </Grid>
                </Grid>
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                <Typography variant="h6" gutterBottom>
                    Work Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                        Company/Organization
                    </Typography>
                    <Typography variant="body1">{agentData.jobName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                        Role Description
                    </Typography>
                    <Typography variant="body1">
                        {agentData.jobDescription}
                    </Typography>
                    </Grid>
                </Grid>
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                <Typography variant="h6">Training Content</Typography>
                </TabPanel>

                <TabPanel value={currentTab} index={3}>
                <Typography variant="h6">Agent Intentions</Typography>
                </TabPanel>

                <TabPanel value={currentTab} index={4}>
                    { agentData.channels.find(channel => !channel.connected) && (
                        <>
                            <Grid container spacing={3}>
                                <Typography variant="h6">Connect Agent To Your WhatsApp</Typography>
                                <Grid size={{ xs: 12 }}>
                                    <Box
                                        sx={{
                                            maxWidth: '90%',
                                            height: '70vh',
                                            padding: 3,
                                            boxShadow: 3,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            bgcolor: 'background.paper',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        { channelQRCodeLoading
                                            ? (
                                                <CircularProgress />
                                            )
                                            : (
                                                <img
                                                    src={QRCode}
                                                    alt="QR Code"
                                                    style={{
                                                        display: 'block',
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        borderRadius: 'inherit',
                                                        color: 'black'
                                                    }}
                                                />
                                            )
                                        }
                                    </Box>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </TabPanel>

                <TabPanel value={currentTab} index={5}>
                <Typography variant="h6">Agent Settings</Typography>
                </TabPanel>
            </Grid>
            </Grid>
        </Box>
        </CardContent>
    </Card>
    );
  }
}
