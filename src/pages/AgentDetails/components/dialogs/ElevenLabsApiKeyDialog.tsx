import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Link,
  CircularProgress,
  useColorScheme,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, Key as KeyIcon } from '@mui/icons-material';
import { useElevenLabsService } from '../../../../hooks/useElevenLabsService';
import { useAuth } from '../../../../context/AuthContext';

interface ElevenLabsApiKeyDialogProps {
  agentId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ElevenLabsApiKeyDialog({
  agentId,
  open,
  onClose,
  onSuccess,
}: ElevenLabsApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const { token } = useAuth();
  const { activateElevenLabs, elevenLabsLoading } = useElevenLabsService(
    token as string
  );

  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const handleSubmit = async () => {
    if (!apiKey.trim()) return;

    try {
      await activateElevenLabs(agentId, apiKey);
      onSuccess();
      setApiKey('');
      onClose();
    } catch {
      setApiKey('');
    }
  };

  const handleClose = () => {
    if (!elevenLabsLoading) {
      setApiKey('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon color="primary" />
            <Typography variant="h6" component="div">
              Activate Integration
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={elevenLabsLoading}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              API Key
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please inform below an API key from ElevenLabs that allows you to
              authenticate with their API and access these functionalities
              programmatically: Text to Speech, Voices (read) and User (read)
            </Typography>

            <TextField
              fullWidth
              placeholder="Token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={elevenLabsLoading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              You do not have a token yet?{' '}
              <Link
                href="https://elevenlabs.io/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 'bold', textDecoration: 'none' }}
              >
                Create your account now
              </Link>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            disabled={!apiKey.trim() || elevenLabsLoading}
            onClick={handleSubmit}
            sx={{
              '&.Mui-disabled': {
                color:
                  resolvedMode == 'dark'
                    ? theme.palette.grey[400]
                    : theme.palette.grey[500],
              },
            }}
          >
            {elevenLabsLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                Activating integration...
              </Box>
            ) : (
              'Activate Integration'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
