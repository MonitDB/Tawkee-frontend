import { SyntheticEvent, ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Keep necessary imports from original file
import { useAuth } from '../../context/AuthContext';
import { Agent, AgentSettings, useAgents } from '../../context/AgentsContext';
import { useChannelService } from '../../hooks/useChannelService';
import { Channel } from '../../services/channelService';
import LoadingBackdrop from '../../components/LoadingBackdrop';
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
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Hub as HubIcon,
} from '@mui/icons-material';

// Import the newly created TabPanel components
import ProfileTabPanel from './components/ProfileTabPanel';
import WorkTabPanel from './components/WorkTabPanel';
import TrainingTabPanel from './components/TrainingTabPanel';
// import IntentionsTabPanel from './components/IntentionsTabPanel';
import IntegrationsTabPanel from './components/IntegrationsTabPanel';
import SettingsTabPanel from './components/SettingsTabPanel';
import {
  agentCommunicationDescriptions,
  agentTypeDescriptions,
} from '../Agents';
import ChannelsTabPanel from './components/ChannelsTabPanel';

// Keep the original TabPanel helper component if it's generic
interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const tabIndexFromName = {
  profile: 0,
  work: 1,
  training: 2,
  integrations: 3,
  channels: 4,
  settings: 5,
} as const;

type TabName = keyof typeof tabIndexFromName;

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
  const navigate = useNavigate();
  const location = useLocation();

  const { paginatedAgents, activateAgent, deactivateAgent, loading } =
  useAgents();
  const { agents } = paginatedAgents;
  const { token } = useAuth();
     
  const {
    getQRCode,
    disconnectChannel,
    loading: channelQRCodeLoading,
  } = useChannelService(token as string);

  const [currentTab, setCurrentTab] = useState(0);
  const [agentData, setAgentData] = useState<Agent | null>(null);
  const [agentSettingsData, setAgentSettingsData] =
    useState<AgentSettings | null>(null);

  const [QRCode, setQRCode] = useState<string | undefined>(undefined);

  // Keep handlers and useEffect from original file
  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);

    // Strip query params and navigate to the clean URL
    navigate(location.pathname, { replace: true });
  };

  const handleRefreshQrCode = async (channelId: string) => {
    try {
      const { qrCode } = await getQRCode(channelId);
      setQRCode(qrCode as string);
    } catch (error) {
      console.error('Failed to refresh QR code:', error);
    }
  };

  const handleDisconnectChannel = async (
    agentId: string,
    channelId: string
  ) => {
    try {
      await disconnectChannel(agentId, channelId);
    } catch (error) {
      console.error('Failed to disconnect channel:', error);
    }
  };

  useEffect(() => {
    if (params.agentId) {
      const agentWrapper = agents.find(
        (wrapper) => wrapper.agent.id === params.agentId
      );

      // try to fetch tabName from query Params
      const searchParams = new URLSearchParams(location.search);
      const tabName = searchParams.get('tabName');

      if (agentWrapper?.agent) {
        setAgentData(agentWrapper?.agent);
        setAgentSettingsData(agentWrapper?.settings);
        if (tabName) {
          setCurrentTab(tabIndexFromName[tabName as TabName]);
        }
      }
    }
  }, [params.agentId, agents]);

  if (!agentData) {
    // Maybe show a loading indicator or a not found message
    return <LoadingBackdrop open={true} />;
  }

  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', bgcolor: theme.palette.background.default }}
    >
      <CardContent sx={{ height: '100%', overflowY: 'auto' }}>
        {' '}
        {/* Changed overflowY to auto */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(-1)}
              >
                &larr; Go back to Agents
              </Button>
            </Grid>
            {/* Agent Header (Keep as is) */}
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
                    <Tooltip
                      title={
                        agentData.isActive ? 'Deactivate me' : 'Activate me'
                      }
                    >
                      <Chip
                        color={
                          agentData.isActive
                            ? agentData.channels.find(
                                (channel: Channel) => channel.connected
                              )
                              ? 'success'
                              : 'warning'
                            : 'error'
                        }
                        label={
                          agentData.isActive
                            ? agentData.channels.filter(
                                (channel: Channel) => channel.connected
                              ).length > 0
                              ? 'ACTIVE & CONNECTED'
                              : 'ACTIVE BUT DISCONNECTED'
                            : 'INACTIVE'
                        }
                        onClick={() =>
                          agentData.isActive
                            ? deactivateAgent(agentData.id)
                            : activateAgent(agentData.id)
                        }
                      />
                    </Tooltip>
                    <Tooltip
                      title={
                        agentCommunicationDescriptions[
                          agentData.communicationType
                        ]
                      }
                      placement="bottom"
                    >
                      <Chip label={agentData.communicationType} />
                    </Tooltip>
                    <Tooltip
                      title={agentTypeDescriptions[agentData.type]}
                      placement="bottom"
                    >
                      <Chip label={agentData.type} />
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Tooltip title="Not yet implemented">
                    <Button variant="outlined" color="primary" disabled>
                      Chat with {agentData.name}
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>

            {/* Navigation Tabs (Keep as is) */}
            <Grid size={{ xs: 12 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab icon={<PersonIcon />} label="Profile" />
                <Tab icon={<WorkIcon />} label="Work" />
                <Tab icon={<SchoolIcon />} label="Training" />
                <Tab icon={<PsychologyIcon />} label="Integrations" />
                <Tab icon={<HubIcon />} label="Channels" />
                <Tab icon={<SettingsIcon />} label="Settings" />
              </Tabs>
            </Grid>

            {/* Content Area - Use imported components */}
            <Grid size={{ xs: 12 }}>
              <TabPanel value={currentTab} index={0}>
                <ProfileTabPanel agentData={agentData} loading={loading} />
              </TabPanel>
              <TabPanel value={currentTab} index={1}>
                <WorkTabPanel agentData={agentData} loading={loading} />
              </TabPanel>
              <TabPanel value={currentTab} index={2}>
                <TrainingTabPanel agentData={agentData} />
              </TabPanel>
              <TabPanel value={currentTab} index={3}>
                <IntegrationsTabPanel agentData={agentData} />
              </TabPanel>
              <TabPanel value={currentTab} index={4}>
                <ChannelsTabPanel
                  agentData={agentData}
                  QRCode={QRCode}
                  handleRefreshQrCode={handleRefreshQrCode}
                  disconnectChannel={handleDisconnectChannel}
                  channelQRCodeLoading={channelQRCodeLoading}
                />
              </TabPanel>
              <TabPanel value={currentTab} index={5}>
                <SettingsTabPanel
                  key={`${agentData.id}-${JSON.stringify(agentSettingsData)}`}
                  agentData={agentData}
                  agentSettingsData={agentSettingsData}
                />
              </TabPanel>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <LoadingBackdrop open={loading || channelQRCodeLoading} />
    </Card>
  );
}
