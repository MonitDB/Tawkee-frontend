import { useEffect, useState, FormEvent } from 'react';

import { useHttpResponse } from '../../../context/ResponseNotifier';

import { usePublicEmailService } from '../../../hooks/usePublicEmailService';

import LoadingBackdrop from '../../../components/LoadingBackdrop';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const { notify } = useHttpResponse();
  const { sendForgotPasswordEmail, loading } = usePublicEmailService();
  const theme = useTheme();

  const [countdown, setCountdown] = useState(5);
  const [requestSucceeded, setRequestSucceeded] = useState(false);

  const handleSubmitForgotPasswordRequest = async () => {
    const email = document.getElementById('email-forget') as HTMLInputElement;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      notify('Please provide a valid email address', 'warning');
      return;
    }

    try {
      const succeeded: boolean = await sendForgotPasswordEmail(email.value);
      email.value = '';
      setRequestSucceeded(succeeded);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (requestSucceeded && countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }

    if (countdown == 0) {
      setRequestSucceeded(false);
      setCountdown(5);
    }
  }, [requestSucceeded, countdown]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            handleClose();
          },
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Enter your account&apos;s email address, and we&apos;ll send you a
          link to reset your password.
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          id="email-forget"
          name="email"
          label="Email address"
          placeholder={
            requestSucceeded
              ? `You can try again in ${countdown} seconds...`
              : 'Email address'
          }
          type="email"
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          type="button"
          onClick={handleSubmitForgotPasswordRequest}
          disabled={requestSucceeded}
          sx={{
            '&.Mui-disabled': {
              color: theme.palette.action.disabled,
            },
          }}
        >
          Continue
        </Button>
      </DialogActions>
      <LoadingBackdrop open={loading} />
    </Dialog>
  );
}
