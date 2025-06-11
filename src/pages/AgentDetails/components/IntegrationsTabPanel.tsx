import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import {
  Schedule,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Agent, useAgents } from '../../../context/AgentsContext';
import { googleCalendarIcon } from '../../../assets';
import { useGoogleCalendarService } from '../../../hooks/useGoogleCalendarService';
import { useAuth } from '../../../context/AuthContext';
import LoadingBackdrop from '../../../components/LoadingBackdrop';

interface IntegrationsTabPanelProps {
  agentData: Agent | null;
}

export interface ScheduleSettingsDto {
  email: string | undefined;
  availableTimes: Record<string, string[][]>;
  minAdvanceMinutes: number;
  maxAdvanceDays: number;
  maxEventDuration: number;
  alwaysOpen: boolean;
  askForContactName: boolean;
  askForContactPhone: boolean;
  askForMeetingDuration: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettingsDto = {
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
  const { token } = useAuth();
  const { 
    authenticateAgent,
    getScheduleSettings,
    updateScheduleSettings,
    revokeTokens,
    loading
  } = useGoogleCalendarService(token as string);
  
  const { paginatedAgents, syncAgentScheduleSettingsUpdate } = useAgents();
  const { agents } = paginatedAgents;

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettingsDto>(DEFAULT_SCHEDULE_SETTINGS);
  const [hasInitialized, setHasInitialized] = useState(false);

  if (!agentData) return null;

  // Safe function to check if a day is active - with comprehensive null/undefined checks
  const isDayActive = (dayKey: string): boolean => {
    // Check if scheduleSettings exists
    if (!scheduleSettings) return false;
    
    // Check if availableTimes exists
    if (!scheduleSettings.availableTimes) return false;
    
    // Check if the specific day exists in availableTimes
    const dayTimes = scheduleSettings.availableTimes[dayKey];
    
    // Check if dayTimes is an array and has length > 0
    return Array.isArray(dayTimes) && dayTimes.length > 0;
  };

  // Safe function to get available times for a day
  const getDayTimes = (dayKey: string): string[][] => {
    if (!scheduleSettings?.availableTimes?.[dayKey]) {
      return [];
    }
    return scheduleSettings.availableTimes[dayKey];
  };

  const handleActivateIntegration = async () => {
    await authenticateAgent(agentData.id);
  };

  const handleConfigureIntegration = () => {
    setConfigDialogOpen(true);
  };

  const handleSaveConfiguration = async () => {
    await updateScheduleSettings(agentData.id, scheduleSettings);
    setConfigDialogOpen(false);
  };

  const handleSaveSchedule = async () => {
    await updateScheduleSettings(agentData.id, scheduleSettings);
    setScheduleDialogOpen(false);
  };

  const handleTimeChange = (day: string, timeIndex: number, type: 'start' | 'end', value: string) => {
    setScheduleSettings(prev => {
      // Ensure availableTimes exists
      const currentAvailableTimes = prev.availableTimes || {};
      const currentDayTimes = currentAvailableTimes[day] || [];
      
      return {
        ...prev,
        availableTimes: {
          ...currentAvailableTimes,
          [day]: currentDayTimes.map((timeSlot, index) =>
            index === timeIndex
              ? type === 'start'
                ? [value, timeSlot[1]]
                : [timeSlot[0], value]
              : timeSlot
          ),
        },
      };
    });
  };

  const addTimeSlot = (day: string) => {
    setScheduleSettings(prev => {
      const currentAvailableTimes = prev.availableTimes || {};
      const currentDayTimes = currentAvailableTimes[day] || [];
      
      return {
        ...prev,
        availableTimes: {
          ...currentAvailableTimes,
          [day]: [...currentDayTimes, ['08:00', '18:00']],
        },
      };
    });
  };

  const removeTimeSlot = (day: string, timeIndex: number) => {
    setScheduleSettings(prev => {
      const currentAvailableTimes = prev.availableTimes || {};
      const currentDayTimes = currentAvailableTimes[day] || [];
      
      return {
        ...prev,
        availableTimes: {
          ...currentAvailableTimes,
          [day]: currentDayTimes.filter((_, index) => index !== timeIndex),
        },
      };
    });
  };

  const renderIntegrationCard = (
    title: string,
    description: string,
    icon: React.ReactNode,
    isActive: boolean,
    onActivate: () => void,
    onConfigure: () => void
  ) => (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
            <Button
              variant="outlined"
              onClick={onConfigure}
              sx={{ textTransform: 'none' }}
            >
              Configure Integration
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onActivate}
              sx={{ textTransform: 'none' }}
            >
              Activate Integration
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const agentWrapper = agents.find(wrapper => wrapper.agent.id === agentData.id);
  const existingSettings = agentWrapper?.agent?.scheduleSettings;

  async function handleDeactivateAgent(agentId: string) {
    await revokeTokens(agentId);
    setScheduleSettings(DEFAULT_SCHEDULE_SETTINGS);
    setConfigDialogOpen(false);
    syncAgentScheduleSettingsUpdate({ agentId, scheduleSettings: DEFAULT_SCHEDULE_SETTINGS });
  }

  // Fixed useEffect with proper dependencies and initialization logic
  useEffect(() => {
    async function fetchScheduleSettingsData(agentId: string) {
      try {
        // console.log('Fetching schedule settings...');
        const data = await getScheduleSettings(agentId);
        
        // Merge with defaults to ensure all properties exist
        const mergedSettings = {
          ...DEFAULT_SCHEDULE_SETTINGS,
          ...data,
          availableTimes: {
            ...DEFAULT_SCHEDULE_SETTINGS.availableTimes,
            ...(data?.availableTimes || {}),
          },
        } as ScheduleSettingsDto;
        
        setScheduleSettings(mergedSettings);
        setHasInitialized(true);
        // console.log('Schedule settings updated:', data, mergedSettings);
      } catch (error) {
        console.error('Error fetching schedule settings:', error);
        setHasInitialized(true);
      }
    }
   
    if (!hasInitialized) {
      if (existingSettings?.email != undefined) {
        // Use existing settings from context
        const contextSettings = {
          ...DEFAULT_SCHEDULE_SETTINGS,
          ...existingSettings,
          availableTimes: {
            ...DEFAULT_SCHEDULE_SETTINGS.availableTimes,
            ...(existingSettings.availableTimes || {}),
          },
        } as ScheduleSettingsDto;
        
        setScheduleSettings(contextSettings);
        setHasInitialized(true);
        // console.log('Using existing settings from context:', contextSettings);
      } else {
        // Fetch from API
        fetchScheduleSettingsData(agentData.id);
      }
    }
  }, [agentData.id, agents, getScheduleSettings, hasInitialized]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Integrations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Connect your agent to other applications. This allows it to get more accurate information or schedule meetings for you.
      </Typography>

      {renderIntegrationCard(
        'Google Calendar',
        'With Google Calendar your agent will be able to schedule meetings, create meeting links and send invitations.',
        <img src={googleCalendarIcon} style={{ width: '10%' }} />,
        !!existingSettings?.email || !!scheduleSettings?.email,
        handleActivateIntegration,
        handleConfigureIntegration
      )}

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">General agenda data</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Agenda address
              </Typography>
              <TextField
                fullWidth
                placeholder="Agenda name"
                value={scheduleSettings.email}
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  Minimum advance time
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Minimum time in minutes the next meeting can be scheduled
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={scheduleSettings?.minAdvanceMinutes || 60}
                  onChange={(e: SelectChangeEvent<number>) => 
                    setScheduleSettings(prev => ({ ...prev, minAdvanceMinutes: Number(e.target.value) }))
                  }
                >
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                  <MenuItem value={1440}>1 day</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6}}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  Maximum allowed distance
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Maximum time in days the next meeting can be scheduled
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={scheduleSettings?.maxAdvanceDays || 7}
                  onChange={(e: SelectChangeEvent<number>) => 
                    setScheduleSettings(prev => ({ ...prev, maxAdvanceDays: Number(e.target.value) }))
                  }
                >
                  <MenuItem value={7}>Up to one week</MenuItem>
                  <MenuItem value={15}>Up to two weeks</MenuItem>
                  <MenuItem value={30}>Up to one month</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  Maximum agenda duration
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Time limit for each appointment
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={scheduleSettings?.maxEventDuration || 60}
                  onChange={(e: SelectChangeEvent<number>) => 
                    setScheduleSettings(prev => ({ ...prev, maxEventDuration: Number(e.target.value) }))
                  }
                >
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

        </DialogContent>
        <DialogActions>
          <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'space-between',
            justifyContent: 'space-between',
            gap: 1
          }}>
            <Button
              variant="text"
              onClick={() => handleDeactivateAgent(agentData.id)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <DeleteIcon color='error' />
              Deactivate integration
            </Button>             

            <Button
              variant="contained"
              onClick={() => {
                setConfigDialogOpen(false);
                setScheduleDialogOpen(true);
              }}
              // sx={{ width: '100%' }}
            >
              Configure Schedule Settings
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSaveConfiguration}
              sx={{ textTransform: 'none' }}
            >
              Save
            </Button>
          </Box>
        </DialogActions>

        <LoadingBackdrop open={loading} />
      </Dialog>

      {/* Schedule Settings Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Schedule settings</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  mr: 1 
                }} />
                <Typography variant="subtitle2">
                  Always open
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Allow appointments at any time
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={scheduleSettings?.alwaysOpen || false}
                    onChange={(e) => setScheduleSettings(prev => ({ ...prev, alwaysOpen: e.target.checked }))}
                  />
                }
                label=""
              />
            </Grid>
          
            {!scheduleSettings?.alwaysOpen && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Business hours:
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Click on days to add/remove them from your schedule
                </Typography>
                
                {/* Day selection chips */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  {DAYS_OF_WEEK.map((day) => {
                    const isActive = isDayActive(day.key);
                    return (
                      <Chip
                        key={day.key}
                        label={day.short}
                        clickable
                        onClick={() => {
                          if (isActive) {
                            // Remove the day by setting empty array
                            setScheduleSettings(prev => ({
                              ...prev,
                              availableTimes: {
                                ...(prev.availableTimes || {}),
                                [day.key]: [],
                              },
                            }));
                          } else {
                            // Add the day with default time slot
                            setScheduleSettings(prev => ({
                              ...prev,
                              availableTimes: {
                                ...(prev.availableTimes || {}),
                                [day.key]: [['08:00', '18:00']],
                              },
                            }));
                          }
                        }}
                        color={isActive ? 'info' : 'default'}
                      />
                    );
                  })}
                </Box>

                {/* Time slot configuration for active days */}
                {DAYS_OF_WEEK.filter(day => isDayActive(day.key)).map((day) => (
                  <Box key={day.key} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {day.label}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => addTimeSlot(day.key)}
                        sx={{ textTransform: 'none', minWidth: 'auto', p: 0.5 }}
                      >
                        <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        Add Time Slot
                      </Button>
                    </Box>
                    
                    {getDayTimes(day.key).map((timeSlot, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <TextField
                          type="time"
                          value={timeSlot[0]}
                          onChange={(e) => handleTimeChange(day.key, index, 'start', e.target.value)}
                          sx={{ width: 120 }}
                        />
                        <Typography>–</Typography>
                        <TextField
                          type="time"
                          value={timeSlot[1]}
                          onChange={(e) => handleTimeChange(day.key, index, 'end', e.target.value)}
                          sx={{ width: 120 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeTimeSlot(day.key, index)}
                          color="error"
                          disabled={getDayTimes(day.key).length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ))}

                {/* Quick actions */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      // Add weekdays (Mon-Fri)
                      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                      setScheduleSettings(prev => {
                        const currentAvailableTimes = prev.availableTimes || {};
                        const weekdayTimes = weekdays.reduce<Record<string, [string, string][]>>((acc, day) => {
                          const times = currentAvailableTimes[day] as [string, string][] | undefined;
                          acc[day] = times && times.length > 0 ? times : [['08:00', '18:00']];
                          return acc;
                        }, {});
                        
                        return {
                          ...prev,
                          availableTimes: {
                            ...currentAvailableTimes,
                            ...weekdayTimes,
                          },
                        };
                      });
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Set Weekdays
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      // Add weekend (Sat-Sun)
                      setScheduleSettings(prev => {
                        const currentAvailableTimes = prev.availableTimes || {};
                        return {
                          ...prev,
                          availableTimes: {
                            ...currentAvailableTimes,
                            saturday: (currentAvailableTimes.saturday || []).length > 0 
                              ? currentAvailableTimes.saturday 
                              : [['09:00', '17:00']],
                            sunday: (currentAvailableTimes.sunday || []).length > 0 
                              ? currentAvailableTimes.sunday 
                              : [['09:00', '17:00']],
                          },
                        };
                      });
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Set Weekend
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      // Clear all days
                      setScheduleSettings(prev => ({
                        ...prev,
                        availableTimes: {
                          monday: [],
                          tuesday: [],
                          wednesday: [],
                          thursday: [],
                          friday: [],
                          saturday: [],
                          sunday: [],
                        },
                      }));
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Clear All
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setScheduleDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSchedule}
            sx={{ textTransform: 'none' }}
          >
            Save Schedule
          </Button>
        </DialogActions>

        <LoadingBackdrop open={loading} />
      </Dialog>

      <LoadingBackdrop open={loading} />
    </Box>
  );
}