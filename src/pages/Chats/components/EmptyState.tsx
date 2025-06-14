import { Box, LinearProgress, Typography } from '@mui/material';

import { Chat as ChatIcon } from '@mui/icons-material';

export function EmptyState({
  interactionLoading,
}: {
  interactionLoading: boolean;
}) {
  return (
    <>
      {interactionLoading && (
        <LinearProgress color="secondary" sx={{ width: '100%' }} />
      )}
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            opacity: 0.7,
          }}
        >
          <ChatIcon sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Chat Moderation
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          Monitor in real time the responses that your agents are sending to
          your clients, take over the conversation if necessary, or wait for an
          agent to request your help.
        </Typography>
      </Box>
    </>
  );
}
