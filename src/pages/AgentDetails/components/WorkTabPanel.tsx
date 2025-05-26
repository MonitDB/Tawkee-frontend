import { FormEvent, useEffect, useState } from 'react';

import { Agent, AgentType, useAgents } from '../../../context/AgentsContext';
import { agentTypeDescriptions } from '../../Agents';

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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface ProfileTabPanelProps {
  agentData: Agent | null;
  loading: boolean;
}

const AGENT_JOB_NAME_CHARS_LIMIT: number = 50;
const AGENT_JOB_DESCRIPTION_CHARS_LIMIT: number = 500;
const AGENT_SITE_CHARS_LIMIT: number = 1028;

export default function WorkTabPanel({
  agentData,
  loading,
}: ProfileTabPanelProps) {
  const { updateAgent } = useAgents();

  const [agentTypeValue, setAgentTypeValue] = useState<AgentType>(
    agentData?.type as AgentType
  );

  const [agentJobNameValue, setAgentJobNameValue] = useState<string>('');
  const [agentJobNameValueError, setAgentJobNameValueError] =
    useState<boolean>(false);
  const [agentJobNameValueErrorMessage, setAgentJobNameValueErrorMessage] =
    useState<string>('');

  const [agentJobSiteValue, setAgentJobSiteValue] = useState<string>('');
  const [agentJobSiteValueError, setAgentJobSiteValueError] =
    useState<boolean>(false);
  const [agentJobSiteValueErrorMessage, setAgentJobSiteValueErrorMessage] =
    useState<string>('');

  const [agentJobDescriptionValue, setAgentJobDescriptionValue] =
    useState<string>('');
  const [agentJobDescriptionValueError, setAgentJobDescriptionValueError] =
    useState<boolean>(false);
  const [
    agentJobDescriptionValueErrorMessage,
    setAgentJobDescriptionValueErrorMessage,
  ] = useState<string>('');

  const validateInputs = () => {
    let isValid = true;
    if (!agentJobNameValue) {
      setAgentJobNameValueError(true);
      setAgentJobNameValueErrorMessage('This field should not be left blank.');
      isValid = false;
    } else if (agentJobNameValue.length > AGENT_JOB_NAME_CHARS_LIMIT) {
      setAgentJobNameValueError(true);
      setAgentJobNameValueErrorMessage('');
    } else {
      setAgentJobNameValueError(false);
      setAgentJobNameValueErrorMessage('');
    }

    try {
      const url = new URL(agentJobSiteValue);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }

      if (agentJobSiteValue.length > AGENT_SITE_CHARS_LIMIT) {
        setAgentJobSiteValueError(true);
        setAgentJobSiteValueErrorMessage('');
        isValid = false;
      } else {
        setAgentJobSiteValueError(false);
        setAgentJobSiteValueErrorMessage('');
      }
    } catch (e) {
      setAgentJobSiteValueError(true);
      setAgentJobSiteValueErrorMessage('Please enter a valid website URL.');
      isValid = false;
    }

    if (!agentJobDescriptionValue) {
      setAgentJobDescriptionValueError(true);
      setAgentJobDescriptionValueErrorMessage(
        'This field should not be left blank.'
      );
      isValid = false;
    } else if (
      agentJobDescriptionValue.length > AGENT_JOB_DESCRIPTION_CHARS_LIMIT
    ) {
      setAgentJobDescriptionValueError(true);
      setAgentJobDescriptionValueErrorMessage('');
    } else {
      setAgentJobDescriptionValueError(false);
      setAgentJobDescriptionValueErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      agentJobNameValueError ||
      agentJobSiteValueError ||
      agentJobDescriptionValueError
    ) {
      return;
    }
    try {
      updateAgent(agentData?.id as string, {
        type: (agentTypeValue as AgentType) || undefined,
        jobName: (agentJobNameValue as string) || undefined,
        jobSite: (agentJobSiteValue as AgentType) || undefined,
        jobDescription: (agentJobDescriptionValue as AgentType) || undefined,
      });
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  useEffect(() => {
    if (agentData) {
      setAgentTypeValue(agentData.type || '');
      setAgentJobNameValue(agentData.jobName || '');
      setAgentJobSiteValue(agentData.jobSite || '');
      setAgentJobDescriptionValue(agentData.jobDescription || '');
    }
  }, [
    agentData?.type,
    agentData?.jobName,
    agentData?.jobSite,
    agentData?.jobDescription,
  ]);

  const jobNameLabelAccordingToAgentType = {
    [AgentType.PERSONAL]: 'Personal agent of...',
    [AgentType.SALE]: 'Sells the product...',
    [AgentType.SUPPORT]: 'Provides support for...',
  };

  const jobNameTooltipAccordingToAgentType = {
    [AgentType.PERSONAL]: 'Specifies who the agent works for.',
    [AgentType.SALE]: 'Specifies what the agent works with.',
    [AgentType.SUPPORT]: 'Specifies where the agent works at.',
  };

  const jobDescriptionLabelAccordingToAgentType = {
    [AgentType.PERSONAL]: 'you',
    [AgentType.SALE]: 'the product',
    [AgentType.SUPPORT]: 'the company',
  };

  const jobSiteTooltipAccordingToAgentType = {
    [AgentType.PERSONAL]: 'Specifies the website related to you.',
    [AgentType.SALE]: 'Specifies the website related to the product.',
    [AgentType.SUPPORT]: 'Specifies the website related the company.',
  };

  if (!agentData) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Work Information
      </Typography>
      <Grid
        container
        spacing={3}
        component="form"
        onSubmit={handleSubmit}
        noValidate
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              htmlFor="agent-type"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Goal
              <Tooltip
                title="Specifies how the agent tailors responses to match the goal and approach."
                placement="bottom-start"
              >
                <InfoIcon />
              </Tooltip>
            </FormLabel>
            <TextField
              value={agentTypeValue}
              id="agent-type"
              name="agent-type"
              select
              required
              fullWidth
              variant="outlined"
              onChange={(event) =>
                setAgentTypeValue(event.target.value as AgentType)
              }
            >
              {Object.values(AgentType).map((type) => (
                <MenuItem key={type} value={type}>
                  <Tooltip
                    title={agentTypeDescriptions[type]}
                    placement="bottom-start"
                  >
                    <Typography>{type}</Typography>
                  </Tooltip>
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              htmlFor="agent-jobName"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {jobNameLabelAccordingToAgentType[agentTypeValue]}
              <Tooltip
                title={jobNameTooltipAccordingToAgentType[agentTypeValue]}
                placement="bottom-start"
              >
                <InfoIcon />
              </Tooltip>
            </FormLabel>
            <TextField
              error={agentJobNameValueError}
              value={agentJobNameValue}
              id="agent-jobName"
              name="agent-jobName"
              required
              fullWidth
              variant="outlined"
              helperText={
                agentJobNameValueErrorMessage ||
                `${agentJobNameValue.length}/${AGENT_JOB_NAME_CHARS_LIMIT}`
              }
              onChange={(event) => {
                setAgentJobNameValue(event.target.value);
                setAgentJobNameValueErrorMessage('');
                if (event.target.value.length <= AGENT_JOB_NAME_CHARS_LIMIT) {
                  setAgentJobNameValueError(false);
                }
              }}
              color={
                agentJobNameValue.length > AGENT_JOB_NAME_CHARS_LIMIT
                  ? 'error'
                  : 'primary'
              }
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              htmlFor="agent-jobSite"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Website (optional)
              <Tooltip
                title={jobSiteTooltipAccordingToAgentType[agentTypeValue]}
                placement="bottom-start"
              >
                <InfoIcon />
              </Tooltip>
            </FormLabel>
            <TextField
              error={agentJobSiteValueError}
              value={agentJobSiteValue}
              id="agent-jobName"
              name="agent-jobName"
              required
              fullWidth
              variant="outlined"
              helperText={
                agentJobSiteValueErrorMessage ||
                `${agentJobSiteValue.length}/${AGENT_SITE_CHARS_LIMIT}`
              }
              onChange={(event) => {
                setAgentJobSiteValue(event.target.value);
                if (event.target.value.length < AGENT_SITE_CHARS_LIMIT) {
                  setAgentJobSiteValueErrorMessage('');
                  setAgentJobSiteValueError(false);
                }
              }}
              color={
                agentJobNameValue.length > AGENT_JOB_NAME_CHARS_LIMIT
                  ? 'error'
                  : 'primary'
              }
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel
              htmlFor="agent-jobDescription"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Tell more about{' '}
              {agentJobNameValue ||
                jobDescriptionLabelAccordingToAgentType[agentTypeValue]}
              <Tooltip
                title={`Provide a detailed description about ${agentJobNameValue || jobDescriptionLabelAccordingToAgentType[agentTypeValue]}`}
                placement="bottom-start"
              >
                <InfoIcon />
              </Tooltip>
            </FormLabel>
            <TextField
              error={agentJobDescriptionValueError}
              value={agentJobDescriptionValue}
              id="agent-jobDescription"
              name="agent-jobDescription"
              required
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              helperText={
                agentJobDescriptionValueErrorMessage ||
                `${agentJobDescriptionValue.length}/${AGENT_JOB_DESCRIPTION_CHARS_LIMIT}`
              }
              onChange={(event) =>
                setAgentJobDescriptionValue(event.target.value)
              }
              color={agentJobDescriptionValueError ? 'error' : 'primary'}
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
            disabled={loading}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
