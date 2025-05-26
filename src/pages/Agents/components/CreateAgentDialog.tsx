import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext';
import {
  Agent,
  AgentCommunicationType,
  AgentInput,
  AgentType,
  useAgents,
} from '../../../context/AgentsContext';

import { useChannelService } from '../../../hooks/useChannelService';

import LoadingBackdrop from '../../../components/LoadingBackdrop';

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Grid,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Switch,
  Fade,
  useTheme,
  useColorScheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  School,
  Psychology,
  Settings,
} from '@mui/icons-material';
import { newAgent } from '../../../assets';

const steps = ['Name', 'Type', 'Role', 'Description', 'Settings', 'Complete'];

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

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  agentTypeDescriptions: Record<AgentType, string>;
}

export default function CreateAgentDialog({
  open,
  onClose,
  agentTypeDescriptions,
}: CreateAgentDialogProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const navigate = useNavigate();

  const { createAgent, loading } = useAgents();
  const { token } = useAuth();
  const { createChannel, loading: channelCreationLoading } = useChannelService(
    token as string
  );

  const [activeStep, setActiveStep] = useState(0);
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
  const [createdAgentId, setCreatedAgentId] = useState<string | undefined>(
    undefined
  );

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async (selectedAgent: Agent | AgentInput) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, workspaceId, isActive, ...agentInput } =
        selectedAgent as Agent;

      const { id: agentId } = await createAgent(agentInput as AgentInput);
      setCreatedAgentId(agentId);
      await createChannel(agentId as string, 'Whatsapp', 'WHATSAPP');
      // await fetchAgents(); // I guess it's safe to remove
    } finally {
      setActiveStep(5);
    }
  };

  const handleCloseModal = () => {
    setSelectedAgent(blankAgentInput);
    setActiveStep(0);
    onClose();
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedAgent.name && selectedAgent.name.trim().length > 0;
      case 1:
        return selectedAgent.type;
      case 2:
        return selectedAgent.jobName && selectedAgent.jobName.trim().length > 0;
      case 3:
        return (
          selectedAgent.jobDescription &&
          selectedAgent.jobDescription.trim().length > 0
        );
      default:
        return true;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="md"
      slotProps={{ transition: { timeout: 500 } }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 3 }}>
        Create Agent
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleCloseModal}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            '& .MuiStepLabel-root .Mui-completed': {
              color:
                resolvedMode == 'dark'
                  ? theme.palette.success.light
                  : theme.palette.success.dark,
            },
            '& .MuiStepLabel-root .Mui-active': {
              color:
                resolvedMode == 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, minHeight: '300px' }}>
          <Fade in={true} timeout={500}>
            <Box>
              {activeStep === 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={newAgent}
                    style={{ width: '10.0rem', borderRadius: '8px' }}
                  />
                  <Typography variant="h6" gutterBottom>
                    What is your agent called?
                  </Typography>
                  <Typography>
                    Be creative — choose the name your agent will use to
                    introduce itself.
                  </Typography>
                  <TextField
                    autoFocus
                    variant="standard"
                    value={selectedAgent?.name || ''}
                    onChange={(e) =>
                      setSelectedAgent((prev) =>
                        prev ? { ...prev, name: e.target.value } : prev
                      )
                    }
                    sx={{ mt: 2, width: '50%' }}
                  />
                </Box>
              )}

              {activeStep === 1 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    What type of agent is {selectedAgent.name}?
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                      mt: 3,
                    }}
                  >
                    {Object.values(AgentType).map((type) => (
                      <Button
                        key={type}
                        variant={
                          selectedAgent?.type === type
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() =>
                          setSelectedAgent((prev) =>
                            prev ? { ...prev, type } : prev
                          )
                        }
                        sx={{ minWidth: '120px' }}
                      >
                        {type}
                      </Button>
                    ))}
                  </Box>
                  {selectedAgent?.type === AgentType.SALE && (
                    <img
                      src={newAgent}
                      style={{ width: '10.0rem', borderRadius: '8px' }}
                    />
                  )}
                  {selectedAgent?.type === AgentType.SUPPORT && (
                    <img
                      src={newAgent}
                      style={{ width: '10.0rem', borderRadius: '8px' }}
                    />
                  )}
                  {selectedAgent?.type === AgentType.PERSONAL && (
                    <img
                      src={newAgent}
                      style={{ width: '10.0rem', borderRadius: '8px' }}
                    />
                  )}
                  {selectedAgent.type && (
                    <Typography>
                      {agentTypeDescriptions[selectedAgent?.type]}
                    </Typography>
                  )}
                </Box>
              )}

              {activeStep === 2 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedAgent?.type === AgentType.PERSONAL
                      ? `Who owns ${selectedAgent.name}?`
                      : `Where does ${selectedAgent.name} work?`}
                  </Typography>
                  {selectedAgent?.type === AgentType.SALE && (
                    <>
                      <img
                        src={newAgent}
                        style={{ width: '10.0rem', borderRadius: '8px' }}
                      />
                      <Typography>
                        Insert the name of the company where{' '}
                        <strong>{selectedAgent.name}</strong> is going to work
                        with:
                      </Typography>
                    </>
                  )}
                  {selectedAgent?.type === AgentType.SUPPORT && (
                    <>
                      <img
                        src={newAgent}
                        style={{ width: '10.0rem', borderRadius: '8px' }}
                      />
                      <Typography>
                        Insert the name of the company where{' '}
                        <strong>{selectedAgent.name}</strong> is going to work
                        with:
                      </Typography>
                    </>
                  )}
                  {selectedAgent?.type === AgentType.PERSONAL && (
                    <>
                      <img
                        src={newAgent}
                        style={{ width: '10.0rem', borderRadius: '8px' }}
                      />
                      <Typography>
                        Insert the name of the person who will be assisted by{' '}
                        <strong>{selectedAgent.name}</strong>&lsquo;s help.
                      </Typography>
                    </>
                  )}
                  <TextField
                    variant="standard"
                    value={selectedAgent?.jobName || ''}
                    onChange={(e) =>
                      setSelectedAgent((prev) =>
                        prev ? { ...prev, jobName: e.target.value } : prev
                      )
                    }
                    sx={{ mt: 2, width: '50%' }}
                  />
                </Box>
              )}

              {activeStep === 3 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Add a description
                  </Typography>
                  {selectedAgent?.type === AgentType.SALE && (
                    <>
                      <img
                        src={newAgent}
                        style={{ width: '10.0rem', borderRadius: '8px' }}
                      />
                      <Typography>
                        Give {selectedAgent.name} a detailed description
                        regarding its role in the company{' '}
                        <strong>{selectedAgent.jobName}</strong>. Start
                        introducing the company itself.
                      </Typography>
                    </>
                  )}
                  {selectedAgent?.type === AgentType.SUPPORT && (
                    <>
                      <img
                        src={newAgent}
                        style={{ width: '10.0rem', borderRadius: '8px' }}
                      />
                      <Typography>
                        Give {selectedAgent.name} a detailed description
                        regarding its role in the company{' '}
                        <strong>{selectedAgent.jobName}</strong>. Start
                        introducing the company itself.
                      </Typography>
                    </>
                  )}
                  {selectedAgent?.type === AgentType.PERSONAL && (
                    <>
                      <img
                        src={newAgent}
                        style={{ width: '10.0rem', borderRadius: '8px' }}
                      />
                      <Typography>
                        Give {selectedAgent.name} a detailed description
                        regarding its role in assisting{' '}
                        <strong>{selectedAgent.jobName}</strong>. Start
                        introducing {selectedAgent.jobName}.
                      </Typography>
                    </>
                  )}

                  <TextField
                    variant="standard"
                    fullWidth
                    multiline
                    rows={4}
                    value={selectedAgent?.jobDescription || ''}
                    onChange={(e) =>
                      setSelectedAgent((prev) =>
                        prev
                          ? {
                              ...prev,
                              jobDescription: e.target.value.slice(0, 500),
                            }
                          : prev
                      )
                    }
                    helperText={`${selectedAgent?.jobDescription?.length || 0}/500`}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}

              {activeStep === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom textAlign="center">
                    Agent Settings
                  </Typography>
                  <Grid container spacing={2}>
                    {settingsOptions.map(({ key, label, description }) => (
                      <Grid key={key} size={{ xs: 12 }}>
                        <FormControlLabel
                          control={<Switch />}
                          label={
                            <Box>
                              <Typography variant="body1">{label}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {description}
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeStep === 5 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h6"
                    color={
                      resolvedMode == 'dark'
                        ? theme.palette.success.light
                        : theme.palette.success.dark
                    }
                    gutterBottom
                  >
                    Your agent has been created successfully!
                  </Typography>
                  <img
                    src={newAgent}
                    style={{ width: '10.0rem', borderRadius: '8px' }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                      mt: 4,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() =>
                        navigate(`/agents/${createdAgentId}?tabName=training`)
                      }
                      startIcon={<School />}
                    >
                      Training
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        navigate(`/agents/${createdAgentId}?tabName=intentions`)
                      }
                      disabled
                      startIcon={<Psychology />}
                    >
                      Intentions
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        navigate(`/agents/${createdAgentId}?tabName=settings`)
                      }
                      disabled
                      startIcon={<Settings />}
                    >
                      Settings
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleCloseModal}>Finish</Button>
        ) : (
          <Button
            variant="contained"
            onClick={
              activeStep === 4 ? () => handleSave(selectedAgent) : handleNext
            }
            disabled={!canProceed()}
            sx={{
              '&.Mui-disabled': {
                color:
                  resolvedMode == 'dark'
                    ? theme.palette.grey[400]
                    : theme.palette.grey[500],
              },
            }}
          >
            {activeStep === 4 ? 'Create Agent' : 'Continue'}
          </Button>
        )}
      </DialogActions>
      <LoadingBackdrop open={loading || channelCreationLoading} />
    </Dialog>
  );
}
