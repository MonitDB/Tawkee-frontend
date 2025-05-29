import { useState, ChangeEvent, Fragment, ReactNode } from 'react';
import { AgentSettings, AIModel, useAgents } from '../../../context/AgentsContext';
import {
  Box,
  Typography,
  Switch,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Stack,
  Button,
  Tooltip,
  Grid,
  useTheme,
  useColorScheme
} from '@mui/material';
import {
  // PersonAdd,
  EmojiEmotions,
  FilterList,
  // SplitscreenOutlined,
  // Memory,
  Schedule,
  SmartToy
} from '@mui/icons-material';

const modelDescriptions: Record<AIModel, string> = {
  [AIModel.GPT_4]: 'GPT-4: General-purpose large language model.',
  [AIModel.GPT_4_O]: 'GPT-4o: Multimodal model (vision, text, audio).',
  [AIModel.GPT_4_O_MINI]: 'GPT-4o-mini: Lightweight version of GPT-4o.',
  [AIModel.GPT_4_1_MINI]: 'GPT-4.1-mini: Efficient GPT-4.1 variant.',
  [AIModel.GPT_4_1]: 'GPT-4.1: Enhanced version with better reasoning.',
  [AIModel.DEEPSEEK_CHAT]: 'DeepSeek-Chat: Open-source large language model optimized for conversational tasks.'
};

const timezones = [
  '(GMT-12:00) Baker Island',
  '(GMT-11:00) Pago Pago',
  '(GMT-10:00) Honolulu',
  '(GMT-09:00) Anchorage',
  '(GMT-08:00) Los Angeles',
  '(GMT-07:00) Denver',
  '(GMT-06:00) Chicago',
  '(GMT-05:00) New York',
  '(GMT-04:00) Santiago',
  '(GMT-03:00) São Paulo',
  '(GMT-02:00) South Georgia',
  '(GMT-01:00) Azores',
  '(GMT+00:00) London',
  '(GMT+01:00) Paris',
  '(GMT+02:00) Athens',
  '(GMT+03:00) Moscow',
  '(GMT+04:00) Dubai',
  '(GMT+05:00) Karachi',
  '(GMT+06:00) Almaty',
  '(GMT+07:00) Bangkok',
  '(GMT+08:00) Beijing',
  '(GMT+09:00) Tokyo',
  '(GMT+10:00) Sydney',
  '(GMT+11:00) Noumea',
  '(GMT+12:00) Auckland'
];

const settingsOptions = [
  // { key: 'enabledHumanTransfer', label: 'Request Human Assistance', description: 'Enable this so the agent can transfer the interaction to a human team.', icon: <PersonAdd /> },
  { key: 'enabledEmoji', label: 'Use Emojis in Responses', description: 'Defines whether the agent can use emojis in its responses.', icon: <EmojiEmotions /> },
  { key: 'limitSubjects', label: 'Restrict Allowed Topics', description: 'Check this option to prevent the agent from discussing unrelated topics.', icon: <FilterList /> },
  // { key: 'splitMessages', label: 'Split Response into Parts', description: 'If the message becomes too long, the agent can split it into multiple messages.', icon: <SplitscreenOutlined /> },
  // { key: 'enabledReminder', label: 'Allow Setting Reminders', description: 'Enable this so the agent can set reminders for the user.', icon: <Memory /> },
];

interface SettingsTabPanelProps {
  agentId: string;
  agentSettingsData: AgentSettings | null;
}

export default function SettingsTabPanel({ agentId, agentSettingsData }: SettingsTabPanelProps) {
  console.log('SettingsTabPanel received agentSettingsData:', agentSettingsData);

  const theme = useTheme();

  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { updateAgentSettings, loading } = useAgents();

  // Helper function to get initial state from agentSettingsData
  const getInitialState = (settingsData: any) => {
    // Handle nested structure: {updatedSettingsDto: {...}} or direct structure
    const actualSettings = settingsData?.updatedSettingsDto || settingsData;
    
    return {
      enabledHumanTransfer: actualSettings?.enabledHumanTransfer ?? false,
      enabledEmoji: actualSettings?.enabledEmoji ?? false,
      limitSubjects: actualSettings?.limitSubjects ?? false,
      splitMessages: actualSettings?.splitMessages ?? false,
      enabledReminder: actualSettings?.enabledReminder ?? false,
      timezone: actualSettings?.timezone ?? '(GMT+00:00) London',
      preferredModel: actualSettings?.preferredModel ?? AIModel.GPT_4_1
    };
  };

  const [formState, setFormState] = useState(() => getInitialState(agentSettingsData));

  const handleToggleChange = (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      [key]: event.target.checked,
    }));
  };

  const handleSelectChange = (key: keyof typeof formState) => (event: SelectChangeEvent<string>) => {
    setFormState(prev => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const handleSave = () => {
    updateAgentSettings(agentId, formState);
  };

  if (!agentSettingsData) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Agent Settings
      </Typography>
      <Grid
        container
        spacing={3}
        component="form"
        // onSubmit={handleSubmit}
        noValidate
      >
        <Grid size={{ xs: 12 }}>
          <Stack spacing={3} flexGrow={1}>
            {settingsOptions.map((option, index) => (
              <Fragment key={option.key}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                    <Box sx={{ mr: 2, mt: 0.5, p: 0.5, borderRadius: 1, bgcolor: 'rgba(138, 43, 226, 0.2)', color: '#8a2be2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {option.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {option.label}
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.4, color: 'text.secondary' }}>
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={formState[option.key as keyof typeof formState] as boolean}
                    onChange={handleToggleChange(option.key)}
                    sx={{
                      ml: 2,
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#8a2be2' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#8a2be2' },
                      '& .MuiSwitch-switchBase': { color: resolvedMode == 'dark'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900] 
                      }
                    }}
                  />
                </Box>
                {index < settingsOptions.length - 1 && <Divider sx={{ bgcolor: '#333', opacity: 0.3 }} />}
              </Fragment>
            ))}

            {/* Timezone Select */}
            <Divider sx={{ bgcolor: '#333', opacity: 0.5, my: 2 }} />
            <SelectField
              icon={<Schedule />}
              label="Agent Timezone"
              description="Choose the timezone that the agent will use for dates, for example, to schedule meetings."
              value={formState.timezone}
              options={timezones}
              onChange={handleSelectChange('timezone')}
            />

            {/* Preferred Model Select */}
            <Divider sx={{ bgcolor: '#333', opacity: 0.5, my: 2 }} />
            <SelectField
              icon={<SmartToy />}
              label="Preferred AI Model"
              description="Select the AI model the agent will use for generating responses."
              value={formState.preferredModel}
              options={Object.values(AIModel)}
              optionDescriptions={modelDescriptions}
              onChange={handleSelectChange('preferredModel')}
            />
            <Divider sx={{ bgcolor: '#333', opacity: 0.5, my: 2 }} />
          </Stack>
        </Grid>

        <Grid size={{ xs: 9 }} />
        <Grid size={{ xs: 3 }}>
          <Box sx={{ mt: 3 }}>
            <Button
              type="button"
              fullWidth
              variant={loading ? 'outlined' : 'contained'}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Grid>
      </Grid>


    </Box>
  );
}

interface SelectFieldProps {
  icon: ReactNode;
  label: string;
  description: string;
  value: string;
  options: string[];
  optionDescriptions?: Record<string, string>;
  onChange: (event: SelectChangeEvent<string>) => void;
}

function SelectField({ icon, label, description, value, options, optionDescriptions, onChange }: SelectFieldProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
        <Box sx={{ mr: 2, mt: 0.5, p: 0.5, borderRadius: 1, bgcolor: 'rgba(138, 43, 226, 0.2)', color: '#8a2be2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.4, color: 'text.secondary' }}>
            {description}
          </Typography>
        </Box>
      </Box>
      <FormControl size="small" sx={{
        minWidth: 200, ml: 2,
        '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#404040' }, '&:hover fieldset': { borderColor: '#8a2be2' }, '&.Mui-focused fieldset': { borderColor: '#8a2be2' } },
        '& .MuiSelect-icon': { color: '#a0a0a0' }
      }}>
        <Select value={value} onChange={onChange} displayEmpty>
          {options.map(option => (
            <MenuItem key={option} value={option}>
              <Tooltip title={optionDescriptions?.[option]}>
                <Typography>{option}</Typography>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
