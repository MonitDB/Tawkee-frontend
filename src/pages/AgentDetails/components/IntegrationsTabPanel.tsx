import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  useTheme,
  useColorScheme,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Agent, useAgents } from '../../../context/AgentsContext';
import { elevenLabsIcon, googleCalendarIcon } from '../../../assets';
import { useGoogleCalendarService } from '../../../hooks/useGoogleCalendarService';
import { useAuth } from '../../../context/AuthContext';
import LoadingBackdrop from '../../../components/LoadingBackdrop';
import GoogleCalendarConfigDialog, {
  ScheduleSettingsDto,
} from '../components/dialogs/GoogleCalendarConfigDialog';
import ScheduleSettingsDialog from '../components/dialogs/ScheduleSettingsDialog';
import { ElevenLabsApiKeyDialog } from './dialogs/ElevenLabsApiKeyDialog';
import { ElevenLabsSettingsDialog } from './dialogs/ElevenLabsSettingsDialog';
import { useElevenLabsService } from '../../../hooks/useElevenLabsService';

interface IntegrationsTabPanelProps {
  agentData: Agent | null;
}
export const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettingsDto = {
  email: undefined,
  availableTimes: {
    monday: [['08:00', '18:00']],
    tuesday: [['08:00', '18:00']],
    wednesday: [['08:00', '18:00']],
    thursday: [['08:00', '18:00']],
    friday: [['08:00', '18:00']],
    saturday: [],
    sunday: [],
  },
  minAdvanceMinutes: 60,
  maxAdvanceDays: 7,
  maxEventDuration: 60,
  alwaysOpen: false,
  askForContactName: false,
  askForContactPhone: false,
  askForMeetingDuration: false,
};

export default function IntegrationsTabPanel({
  agentData,
}: IntegrationsTabPanelProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { user, token, can } = useAuth();

  const userBelongsToWorkspace = user?.workspaceId === agentData?.workspaceId;
  const canActivateIntegrations = can('INTEGRATIONS_ACTIVATE', 'AGENT');
  const canActivateIntegrationsAsAdmin = can('INTEGRATIONS_ACTIVATE_AS_ADMIN', 'AGENT');
  const canManageIntegrations = can('INTEGRATIONS_MANAGE', 'AGENT');
  const canManageIntegrationsAsAdmin = can('INTEGRATIONS_MANAGE_AS_ADMIN', 'AGENT');  

  const { authenticateAgent, updateScheduleSettings, revokeTokens, loading } =
    useGoogleCalendarService(token as string);

  const {
    paginatedAgents,
    syncAgentScheduleSettingsUpdate,
    syncAgentElevenLabsStatus,
  } = useAgents();
  const { deactivateElevenLabs } = useElevenLabsService(token as string);
  const { agents } = paginatedAgents;

  const [configGoogleCalendarDialogOpen, setConfigGoogleCalendarDialogOpen] =
    useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettingsDto>(
    DEFAULT_SCHEDULE_SETTINGS
  );

  // Estados para diálogos do ElevenLabs
  const [elevenLabsApiKeyDialogOpen, setElevenLabsApiKeyDialogOpen] =
    useState(false);
  const [elevenLabsSettingsDialogOpen, setElevenLabsSettingsDialogOpen] =
    useState(false);

  if (!agentData) return null;

  const handleActivateGoogleCalendarIntegration = async () => {
    await authenticateAgent(agentData.id);
  };

  const handleConfigureGoogleCalendarIntegration = () => {
    setConfigGoogleCalendarDialogOpen(true);
  };

  const handleActivateElevenLabsIntegration = () => {
    setElevenLabsApiKeyDialogOpen(true);
  };

  const handleElevenLabsIntegrationSuccess = () => {
    syncAgentElevenLabsStatus({ agentId: agentData.id, connected: true });
  };

  const handleConfigureElevenLabsIntegration = () => {
    setElevenLabsSettingsDialogOpen(true);
  };

  const handleElevenLabsDeactivation = async (agentId: string) => {
    await deactivateElevenLabs(agentId);
    setElevenLabsSettingsDialogOpen(false);
  };

  const handleSaveConfiguration = async () => {
    await updateScheduleSettings(agentData.id, scheduleSettings);
    setConfigGoogleCalendarDialogOpen(false);
  };

  const handleSaveSchedule = async () => {
    await updateScheduleSettings(agentData.id, scheduleSettings);
    setScheduleDialogOpen(false);
  };

  const handleDeactivateAgent = async (agentId: string) => {
    await revokeTokens(agentId);
    setScheduleSettings(DEFAULT_SCHEDULE_SETTINGS);
    setConfigGoogleCalendarDialogOpen(false);
    syncAgentScheduleSettingsUpdate({
      agentId,
      scheduleSettings: DEFAULT_SCHEDULE_SETTINGS,
    });
  };

  const renderIntegrationCard = (
    title: string,
    description: string,
    icon: React.ReactNode,
    isActive: boolean,
    email: string | undefined,
    onActivate: () => void,
    onConfigure: () => void
  ) => (
    <Grid size={{ xs: 12, lg: 6 }}>
      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 2,
              minHeight: '120px',
            }}
          >
            {icon}
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {isActive ? (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Chip color="success" label={`Connected to ${email}`} />
                <Button
                  variant="outlined"
                  onClick={onConfigure}
                  sx={{ textTransform: 'none' }}
                  disabled={userBelongsToWorkspace
                    ? !canManageIntegrations
                    : !canManageIntegrationsAsAdmin
                  }                      
                >
                  Manage Integration
                </Button>
                { userBelongsToWorkspace
                  ? !canManageIntegrations && (
                    <Tooltip
                      title="You cannot manage active integrations of agents on the workspace."
                      placement='top-end'
                    >
                      <InfoIcon color='warning' />
                    </Tooltip>
                  ) : !canManageIntegrationsAsAdmin && (
                    <Tooltip
                      title="Your admin privileges to manage active integrations of agents of any workspace has been revoked."
                      placement='top-end'
                    >
                      <InfoIcon color='warning' />
                    </Tooltip>
                  )
                }                       
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={onActivate}
                  sx={{ 
                    textTransform: 'none',
                    '&.Mui-disabled': {
                        color:
                        resolvedMode == 'dark'
                            ? theme.palette.grey[400]
                            : theme.palette.grey[500],
                    },                  
                  }}
                  disabled={userBelongsToWorkspace
                    ? !canActivateIntegrations
                    : !canActivateIntegrationsAsAdmin
                  }               
                >
                  Activate Integration
                </Button>
                { userBelongsToWorkspace
                  ? !canActivateIntegrations && (
                    <Tooltip
                      title="You cannot activate integrations of agents on the workspace."
                      placement='top-end'
                    >
                      <InfoIcon color='warning' />
                    </Tooltip>
                  ) : !canActivateIntegrationsAsAdmin && (
                    <Tooltip
                      title="Your admin privileges to activate integrations of agents of any workspace has been revoked."
                      placement='top-end'
                    >
                      <InfoIcon color='warning' />
                    </Tooltip>
                  )
                }                          
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const agentWrapper = agents.find(
    (wrapper) => wrapper.agent.id === agentData.id
  );
  const existingSettings = agentWrapper?.agent?.scheduleSettings;

  const connectedToElevenLabs = !!agentData?.elevenLabsSettings?.connected;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Integrations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Connect your agent to other applications. This allows it to get more
        accurate information or schedule meetings for you.
      </Typography>

      <Grid container spacing={2}>
        {renderIntegrationCard(
          'Schedule meetings with Google Calendar',
          'With Google Calendar your agent will be able to schedule meetings, create meeting links and send invitations.',
          <img src={googleCalendarIcon} style={{ width: '20%' }} />,
          !!existingSettings?.email || !!scheduleSettings?.email,
          existingSettings?.email || scheduleSettings?.email,
          handleActivateGoogleCalendarIntegration,
          handleConfigureGoogleCalendarIntegration
        )}

        {renderIntegrationCard(
          'Enable Text-to-Speech with ElevenLabs',
          'With ElevenLabs your agent will be able to respond messages via audio.',
          <img
            src={elevenLabsIcon}
            style={{
              width: '30%',
              background: 'white',
              padding: 3,
              borderRadius: 8,
            }}
          />,
          connectedToElevenLabs,
          connectedToElevenLabs
            ? agentData?.elevenLabsSettings?.userName
            : undefined,
          handleActivateElevenLabsIntegration,
          handleConfigureElevenLabsIntegration
        )}
      </Grid>

      <GoogleCalendarConfigDialog
        open={configGoogleCalendarDialogOpen}
        onClose={() => setConfigGoogleCalendarDialogOpen(false)}
        scheduleSettings={scheduleSettings}
        onScheduleSettingsChange={setScheduleSettings}
        onSave={handleSaveConfiguration}
        onOpenScheduleDialog={() => {
          setConfigGoogleCalendarDialogOpen(false);
          setScheduleDialogOpen(true);
        }}
        onDeactivate={() => handleDeactivateAgent(agentData.id)}
        loading={loading}
      />

      <ScheduleSettingsDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        scheduleSettings={scheduleSettings}
        onScheduleSettingsChange={setScheduleSettings}
        onSave={handleSaveSchedule}
        loading={loading}
      />

      <ElevenLabsApiKeyDialog
        agentId={agentData.id}
        open={elevenLabsApiKeyDialogOpen}
        onClose={() => setElevenLabsApiKeyDialogOpen(false)}
        onSuccess={handleElevenLabsIntegrationSuccess}
      />

      <ElevenLabsSettingsDialog
        agentData={agentData}
        open={elevenLabsSettingsDialogOpen}
        onClose={() => setElevenLabsSettingsDialogOpen(false)}
        onDeactivate={() => handleElevenLabsDeactivation(agentData.id)}
      />
      <LoadingBackdrop open={loading} />
    </Box>
  );
}
