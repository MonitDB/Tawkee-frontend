import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import LoadingBackdrop from '../../../../components/LoadingBackdrop';
import { ScheduleSettingsDto } from './GoogleCalendarConfigDialog';

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

interface ScheduleSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  scheduleSettings: ScheduleSettingsDto;
  onScheduleSettingsChange: (
    settings:
      | ScheduleSettingsDto
      | ((prev: ScheduleSettingsDto) => ScheduleSettingsDto)
  ) => void;
  onSave: () => void;
  loading: boolean;
}

export default function ScheduleSettingsDialog({
  open,
  onClose,
  scheduleSettings,
  onScheduleSettingsChange,
  onSave,
  loading,
}: ScheduleSettingsDialogProps) {
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

  const handleTimeChange = (
    day: string,
    timeIndex: number,
    type: 'start' | 'end',
    value: string
  ) => {
    onScheduleSettingsChange((prev) => {
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
    onScheduleSettingsChange((prev) => {
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
    onScheduleSettingsChange((prev) => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Schedule settings</Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  mr: 1,
                }}
              />
              <Typography variant="subtitle2">Always open</Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Allow appointments at any time
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={scheduleSettings?.alwaysOpen || false}
                  onChange={(e) =>
                    onScheduleSettingsChange((prev) => ({
                      ...prev,
                      alwaysOpen: e.target.checked,
                    }))
                  }
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
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2, display: 'block' }}
              >
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
                          onScheduleSettingsChange((prev) => ({
                            ...prev,
                            availableTimes: {
                              ...(prev.availableTimes || {}),
                              [day.key]: [],
                            },
                          }));
                        } else {
                          // Add the day with default time slot
                          onScheduleSettingsChange((prev) => ({
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
              {DAYS_OF_WEEK.filter((day) => isDayActive(day.key)).map((day) => (
                <Box
                  key={day.key}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
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
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <TextField
                        type="time"
                        value={timeSlot[0]}
                        onChange={(e) =>
                          handleTimeChange(
                            day.key,
                            index,
                            'start',
                            e.target.value
                          )
                        }
                        sx={{ width: 120 }}
                      />
                      <Typography>–</Typography>
                      <TextField
                        type="time"
                        value={timeSlot[1]}
                        onChange={(e) =>
                          handleTimeChange(
                            day.key,
                            index,
                            'end',
                            e.target.value
                          )
                        }
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
                    const weekdays = [
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                    ];
                    onScheduleSettingsChange((prev) => {
                      const currentAvailableTimes = prev.availableTimes || {};
                      const weekdayTimes = weekdays.reduce<
                        Record<string, [string, string][]>
                      >((acc, day) => {
                        const times = currentAvailableTimes[day] as
                          | [string, string][]
                          | undefined;
                        acc[day] =
                          times && times.length > 0
                            ? times
                            : [['08:00', '18:00']];
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
                    onScheduleSettingsChange((prev) => {
                      const currentAvailableTimes = prev.availableTimes || {};
                      return {
                        ...prev,
                        availableTimes: {
                          ...currentAvailableTimes,
                          saturday:
                            (currentAvailableTimes.saturday || []).length > 0
                              ? currentAvailableTimes.saturday
                              : [['09:00', '17:00']],
                          sunday:
                            (currentAvailableTimes.sunday || []).length > 0
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
                    onScheduleSettingsChange((prev) => ({
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
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{ textTransform: 'none' }}
        >
          Save Schedule
        </Button>
      </DialogActions>

      <LoadingBackdrop open={loading} />
    </Dialog>
  );
}
