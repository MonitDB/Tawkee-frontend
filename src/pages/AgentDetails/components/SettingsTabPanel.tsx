import { Box, Typography } from '@mui/material';
import { Agent } from '../../../context/AgentsContext';

interface SettingsTabPanelProps {
  agentData: Agent | null;
}

export default function SettingsTabPanel({ agentData }: SettingsTabPanelProps) {
  if (!agentData) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">Agent Settings</Typography>
      {/* Placeholder: Add content for Settings here based on the original file */}
      <Typography>...</Typography>
    </Box>
  );
}
