import { Dispatch, SetStateAction } from 'react';
import {
  AgentSettings,
  AIModel,
  GroupingTime,
} from '../../../context/AgentsContext';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Switch,
  MenuItem,
  Tooltip,
  Divider,
} from '@mui/material';

interface AgentSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  settings: AgentSettings;
  setSettings: Dispatch<SetStateAction<AgentSettings>>;
  modelDescriptions: Record<AIModel, string>;
  groupingDescriptions: Record<GroupingTime, string>;
  settingsOptions: Array<{
    key: string;
    label: string;
    description: string;
  }>;
}

export default function AgentSettingsDialog({
  open,
  onClose,
  onSave,
  settings,
  setSettings,
  modelDescriptions,
  groupingDescriptions,
  settingsOptions,
}: AgentSettingsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Agent Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              variant="standard"
              margin="dense"
              fullWidth
              label="Timezone"
              value={settings?.timezone || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, timezone: e.target.value } : prev
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              variant="standard"
              margin="dense"
              select
              fullWidth
              label="Preferred Model"
              value={settings?.preferredModel || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? { ...prev, preferredModel: e.target.value as AIModel }
                    : prev
                )
              }
            >
              {Object.values(AIModel).map((model) => (
                <MenuItem key={model} value={model}>
                  <Tooltip title={modelDescriptions[model]} placement="right">
                    <span>{model}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              variant="standard"
              margin="dense"
              select
              fullWidth
              label="Message Grouping Time"
              value={settings?.messageGroupingTime || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        messageGroupingTime: e.target.value as GroupingTime,
                      }
                    : prev
                )
              }
            >
              {Object.values(GroupingTime).map((group) => (
                <MenuItem key={group} value={group}>
                  <Tooltip
                    title={groupingDescriptions[group]}
                    placement="right"
                  >
                    <span>{group}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Divider />
        {settingsOptions.map(({ key, label, description }) => (
          <Tooltip key={key} title={description} placement="right">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <Typography>{label}</Typography>
              <Switch
                checked={
                  (settings?.[key as keyof AgentSettings] as boolean) || false
                }
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, [key]: e.target.checked } : prev
                  )
                }
              />
            </div>
          </Tooltip>
        ))}
        <Divider />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
