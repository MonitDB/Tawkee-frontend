// UserSecurityTab.tsx
import {
  Grid,
  TextField,
  Button,
  Typography,
  useTheme,
  useColorScheme,
  Divider,
  Box,
  Paper,
  Tooltip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePublicEmailService } from '../../../hooks/usePublicEmailService';

export default function UserSecurityTab() {
  const { user, updatePassword, loading } = useAuth();
  const { mode, systemMode } = useColorScheme();
  const theme = useTheme();
  const { sendForgotPasswordEmail, loading: publicEmailServiceloading } =
    usePublicEmailService();

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState('');

  const onChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const validateInputs = () => {
      let isValid = true;

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

      if (!newPassword || newPassword.length < 8) {
        setPasswordError(true);
        setPasswordErrorMessage('Password must be at least 8 characters long.');
        isValid = false;
      } else if (!passwordRegex.test(newPassword)) {
        setPasswordError(true);
        setPasswordErrorMessage(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        );
        isValid = false;
      } else {
        setPasswordError(false);
        setPasswordErrorMessage('');
      }

      if (confirmPassword !== newPassword) {
        setConfirmPasswordError(true);
        setConfirmPasswordErrorMessage('Passwords do not match');
        isValid = false;
      } else {
        setConfirmPasswordError(false);
        setConfirmPasswordErrorMessage('');
      }

      return isValid;
    };

    if (validateInputs()) {
      await updatePassword({ currentPassword, newPassword });
    }
  };

  const [countdown, setCountdown] = useState(60);
  const [requestSucceeded, setRequestSucceeded] = useState(false);

  const handleSubmitForgotPasswordRequest = async () => {
    const succeeded: boolean = await sendForgotPasswordEmail(
      user?.email as string
    );
    setRequestSucceeded(succeeded);
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
      setCountdown(60);
    }
  }, [requestSucceeded, countdown]);

  const providerIsOurPlatform = user?.provider === 'password';

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Security
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <TextField
          fullWidth
          label="Current Password"
          type={showPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={!providerIsOurPlatform}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    disabled={!providerIsOurPlatform}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <TextField
          fullWidth
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={!providerIsOurPlatform}
          error={passwordError}
          helperText={passwordErrorMessage}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    disabled={!providerIsOurPlatform}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <TextField
          fullWidth
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={!providerIsOurPlatform}
          error={confirmPasswordError}
          helperText={confirmPasswordErrorMessage}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    disabled={!providerIsOurPlatform}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 12, lg: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            height: '100%',
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => onChangePassword(currentPassword, newPassword)}
            sx={{
              height: '100%',
              '&.Mui-disabled': {
                color:
                  resolvedMode == 'dark'
                    ? theme.palette.grey[400]
                    : theme.palette.grey[500],
              },
            }}
            disabled={
              loading || currentPassword.length == 0
                ? true
                : !providerIsOurPlatform
            }
          >
            Update Password
          </Button>
          {!providerIsOurPlatform && (
            <Tooltip
              title="We do not hold your password on our servers, henceforth you cannot update it."
              placement="top-end"
            >
              <InfoIcon color="info" />
            </Tooltip>
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 5.5 }} sx={{ mt: 1.2 }}>
        <Divider />
      </Grid>

      <Grid size={{ xs: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>OR</Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 5.5 }} sx={{ mt: 1.2 }}>
        <Divider />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            height: '100%',
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={handleSubmitForgotPasswordRequest}
            disabled={
              publicEmailServiceloading || requestSucceeded
                ? true
                : !providerIsOurPlatform
            }
          >
            {publicEmailServiceloading
              ? 'Sending Password Reset Link to your email...'
              : requestSucceeded
                ? `You can try again in ${countdown} seconds...`
                : 'Send Password Reset Link to your email'}
          </Button>
          {!providerIsOurPlatform && (
            <Tooltip
              title="We do not hold your password on our servers, henceforth we cannot send a link to reset it."
              placement="top-end"
            >
              <InfoIcon color="info" />
            </Tooltip>
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            border: '1px dashed',
            borderColor: theme.palette.info.main,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(0, 150, 255, 0.05)'
                : 'rgba(0, 150, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          <LockIcon color="info" />
          <Typography variant="body2" color="info.main">
            Two-Factor Authentication (2FA) coming soon — stay tuned!
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
