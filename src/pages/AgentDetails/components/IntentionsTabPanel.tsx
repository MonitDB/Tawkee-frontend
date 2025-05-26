import { Box, Typography } from '@mui/material';
import { Agent } from '../../../context/AgentsContext';

interface IntentionsTabPanelProps {
  agentData: Agent | null;
}

export default function IntentionsTabPanel({
  agentData,
}: IntentionsTabPanelProps) {
  if (!agentData) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">Agent Intentions</Typography>
      {/* Placeholder: Add content for Intentions here based on the original file */}
      <Typography>...</Typography>
    </Box>
  );
}
