import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Schedule,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import LoadingBackdrop from '../../../../components/LoadingBackdrop';

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

interface GoogleCalendarConfigDialogProps {
  open: boolean;
  onClose: () => void;
  scheduleSettings: ScheduleSettingsDto;
  onScheduleSettingsChange: (
    settings:
      | ScheduleSettingsDto
      | ((prev: ScheduleSettingsDto) => ScheduleSettingsDto)
  ) => void;
  onSave: () => void;
  onOpenScheduleDialog: () => void;
  onDeactivate: () => void;
  loading: boolean;
}

export default function GoogleCalendarConfigDialog({
  open,
  onClose,
  scheduleSettings,
  onScheduleSettingsChange,
  onSave,
  onOpenScheduleDialog,
  onDeactivate,
  loading,
}: GoogleCalendarConfigDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">General agenda data</Typography>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
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
              <Typography variant="subtitle2">Minimum advance time</Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Minimum time in minutes the next meeting can be scheduled
            </Typography>
            <FormControl fullWidth>
              <Select
                value={scheduleSettings?.minAdvanceMinutes || 60}
                onChange={(e: SelectChangeEvent<number>) =>
                  onScheduleSettingsChange((prev) => ({
                    ...prev,
                    minAdvanceMinutes: Number(e.target.value),
                  }))
                }
              >
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
                <MenuItem value={1440}>1 day</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Schedule sx={{ mr: 1 }} />
              <Typography variant="subtitle2">
                Maximum allowed distance
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Maximum time in days the next meeting can be scheduled
            </Typography>
            <FormControl fullWidth>
              <Select
                value={scheduleSettings?.maxAdvanceDays || 7}
                onChange={(e: SelectChangeEvent<number>) =>
                  onScheduleSettingsChange((prev) => ({
                    ...prev,
                    maxAdvanceDays: Number(e.target.value),
                  }))
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: 'block' }}
            >
              Time limit for each appointment
            </Typography>
            <FormControl fullWidth>
              <Select
                value={scheduleSettings?.maxEventDuration || 60}
                onChange={(e: SelectChangeEvent<number>) =>
                  onScheduleSettingsChange((prev) => ({
                    ...prev,
                    maxEventDuration: Number(e.target.value),
                  }))
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
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'space-between',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Button
            variant="text"
            onClick={onDeactivate}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <DeleteIcon color="error" />
            Deactivate integration
          </Button>

          <Button variant="contained" onClick={onOpenScheduleDialog}>
            Configure Schedule Settings
          </Button>

          <Button
            variant="contained"
            onClick={onSave}
            sx={{ textTransform: 'none' }}
          >
            Save
          </Button>
        </Box>
      </DialogActions>

      <LoadingBackdrop open={loading} />
    </Dialog>
  );
}
