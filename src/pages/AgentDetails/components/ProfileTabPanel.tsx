import { FormEvent, useEffect, useState } from 'react';

import {
  Agent,
  AgentCommunicationType,
  useAgents,
} from '../../../context/AgentsContext';
import { agentCommunicationDescriptions } from '../../Agents';

import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  Tooltip,
  Button,
  useTheme,
  useColorScheme,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../../../context/AuthContext';

interface ProfileTabPanelProps {
  agentData: Agent | null;
  loading: boolean;
}

const AGENT_NAME_CHARS_LIMIT: number = 50;
const AGENT_BEHAVIOR_CHARS_LIMIT: number = 3000;

export default function ProfileTabPanel({
  agentData,
  loading,
}: ProfileTabPanelProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { updateAgent } = useAgents();
  const { user, can } = useAuth();
  
  const userBelongsToWorkspace = user?.workspaceId === agentData?.workspaceId;
  const canEditProfile = can('EDIT_PROFILE', 'AGENT');
  const canEditProfileAsAdmin = can('EDIT_PROFILE_AS_ADMIN', 'AGENT');

  const [agentNameValue, setAgentNameValue] = useState<string>('');
  const [agentNameError, setAgentNameError] = useState<boolean>(false);
  const [agentNameErrorMessage, setAgentNameErrorMessage] =
    useState<string>('');

  const [agentBehaviorValue, setAgentBehaviorValue] = useState<string>('');
  const [agentBehaviorError, setAgentBehaviorError] = useState<boolean>(false);

  const validateInputs = () => {
    let isValid = true;
    if (!agentNameValue) {
      setAgentNameError(true);
      setAgentNameErrorMessage('Agent name should not be left blank.');
      isValid = false;
    } else if (agentNameValue.length > AGENT_NAME_CHARS_LIMIT) {
      setAgentNameError(true);
      setAgentNameErrorMessage('');
      isValid = false;
    } else {
      setAgentNameError(false);
      setAgentNameErrorMessage('');
    }

    if (agentBehaviorValue.length > AGENT_BEHAVIOR_CHARS_LIMIT) {
      setAgentBehaviorError(true);
      isValid = false;
    } else {
      setAgentBehaviorError(false);
    }
    return isValid;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (agentNameError || agentBehaviorError) {
      return;
    }
    const data = new FormData(event.currentTarget);
    try {
      updateAgent(agentData?.id as string, {
        name: (agentNameValue as string) || undefined,
        behavior: (agentBehaviorValue as string) || undefined,
        communicationType:
          (data.get('agent-communicationType') as AgentCommunicationType) ||
          undefined,
      });
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  useEffect(() => {
    if (agentData) {
      setAgentNameValue(agentData.name || '');
      setAgentBehaviorValue(agentData.behavior || '');
    }
  }, [agentData?.name, agentData?.behavior]);

  if (!agentData) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>

        { userBelongsToWorkspace
          ? !canEditProfile && (
            <Tooltip
              title="You cannot edit personal information of agents on the workspace."
              placement='right'
            >
              <InfoIcon color='warning' />
            </Tooltip>
          ) : !canEditProfileAsAdmin && (
            <Tooltip
              title="Your admin privileges to edit personal information of agents of any workspace has been revoked."
              placement='right'
            >
              <InfoIcon color='warning' />
            </Tooltip>
          )
        }
      </Box>

      <Grid
        container
        spacing={3}
        component="form"
        onSubmit={handleSubmit}
        noValidate
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              htmlFor="agent-name"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Agent Name
              <Tooltip
                title="The name the agent uses to identify themselves."
                placement="bottom-start"
              >
                <InfoIcon />
              </Tooltip>
            </FormLabel>
            <TextField
              error={agentNameError}
              value={agentNameValue}
              helperText={
                agentNameErrorMessage ||
                `${agentNameValue.length}/${AGENT_NAME_CHARS_LIMIT}`
              }
              id="agent-name"
              name="agent-name"
              required
              fullWidth
              variant="outlined"
              color={agentNameError ? 'error' : 'primary'}
              onChange={(event) => {
                setAgentNameValue(event.target.value);
                if (event.target.value.length < AGENT_NAME_CHARS_LIMIT) {
                  setAgentNameError(false);
                  setAgentNameErrorMessage('');
                }
              }}
              disabled={userBelongsToWorkspace
                ? !canEditProfile
                : !canEditProfileAsAdmin
              }
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              htmlFor="agent-communicationType"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Communication
              <Tooltip
                title="Specifies how the agent tailors responses to match the desired tone and style."
                placement="bottom-start"
              >
                <InfoIcon />
              </Tooltip>
            </FormLabel>
            <TextField
              defaultValue={agentData.communicationType}
              id="agent-communicationType"
              name="agent-communicationType"
              select
              required
              fullWidth
              variant="outlined"
              disabled={userBelongsToWorkspace
                ? !canEditProfile
                : !canEditProfileAsAdmin
              }
            >
              {Object.values(AgentCommunicationType).map(
                (communicationType) => (
                  <MenuItem key={communicationType} value={communicationType}>
                    <Tooltip
                      title={agentCommunicationDescriptions[communicationType]}
                      placement="bottom-start"
                    >
                      <Typography>{communicationType}</Typography>
                    </Tooltip>
                  </MenuItem>
                )
              )}
            </TextField>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              htmlFor="agent-behavior"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Behavior
              <Tooltip
                title="Describes a bit about how the agent behaves during conversations."
                placement="bottom-start"
              >
                <InfoIcon />
              </Tooltip>
            </FormLabel>
            <TextField
              error={agentBehaviorError}
              value={agentBehaviorValue}
              id="agent-behavior"
              name="agent-behavior"
              required
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              helperText={`${agentBehaviorValue.length}/3000`}
              onChange={(event) => {
                setAgentBehaviorValue(event.target.value);
                if (event.target.value.length < AGENT_BEHAVIOR_CHARS_LIMIT) {
                  setAgentBehaviorError(false);
                }
              }}
              color={agentBehaviorError ? 'error' : 'primary'}
              disabled={userBelongsToWorkspace
                ? !canEditProfile
                : !canEditProfileAsAdmin
              }              
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 9 }}></Grid>
        <Grid size={{ xs: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant={loading ? 'outlined' : 'contained'}
            onClick={validateInputs}
            disabled={loading
              ? true
              : userBelongsToWorkspace
                ? !canEditProfile
                : !canEditProfileAsAdmin
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
            Save
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
