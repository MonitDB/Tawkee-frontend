import { useState, FormEvent, ChangeEvent } from 'react';

import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon } from '../../../components/CustomIcons';
import env from '../../../config/env';
import { Badge } from '@mui/material';
import TawkeeLogo from '../../../components/TawkeeLogo';


const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard() {
  const { login, latestProvider, loading } = useAuth();
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const currentEmail: string | null = localStorage.getItem('app:email');

  const [shouldRememberEmail, setShouldRememberEmail] = useState(currentEmail ? true : false);

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
      setOpen(true);
  };

  const handleClose = () => {
      setOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (emailError || passwordError) {
          return;
      }
      const data = new FormData(event.currentTarget);

      if (shouldRememberEmail) {
        localStorage.setItem('app:email', data.get('email') as string);
      } else {
        localStorage.removeItem('app:email');
      }
      
      try {
        login({
            email: data.get('email') as string,
            password: data.get('password') as string,
        });

        navigate('/');
      } catch(error) {
        return;
      }
  };

  const validateInputs = () => {
      const email = document.getElementById('email') as HTMLInputElement;
      const password = document.getElementById('password') as HTMLInputElement;

      let isValid = true;

      if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
      } else {
      setEmailError(false);
      setEmailErrorMessage('');
      }

      const passwordValue = password.value;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

      if (!passwordValue || passwordValue.length < 6) {
          setPasswordError(true);
          setPasswordErrorMessage('Password must be at least 6 characters long.');
          isValid = false;
      } else if (!passwordRegex.test(passwordValue)) {
          setPasswordError(true);
          setPasswordErrorMessage(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
          );
          isValid = false;
      } else {
          setPasswordError(false);
          setPasswordErrorMessage('');
      }

      return isValid;
  };

  const handleNavigationToSignUp = () => {
    navigate('/sign-up');
  }

  const handleRememberMe = (event: ChangeEvent<HTMLInputElement>) => {
    setShouldRememberEmail(event.target.checked);
  }

  const handleGoogleLogin = () => {
    window.location.href = `${env.API_URL}/auth/google`;
  }

  const handleFacebookLogin = () => {
    window.location.href = `${env.API_URL}/auth/facebook`;
  }

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <TawkeeLogo />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            error={emailError}
            defaultValue={currentEmail}
            helperText={emailErrorMessage}
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailError ? 'error' : 'primary'}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'baseline' }}
            >
              Forgot your password?
            </Link>
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox value="remember" color="primary" defaultChecked={shouldRememberEmail}
            />
          }
          label="Remember me"
          onChange={(e) => handleRememberMe(e as ChangeEvent<HTMLInputElement>)}
        />
        <ForgotPassword open={open} handleClose={handleClose} />
        <Button
            type="submit"
            fullWidth
            variant={loading ? "outlined" : "contained"}
            onClick={validateInputs}
            disabled={loading}
        >
          Sign in
        </Button>
        <Typography sx={{ textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <span>
          <button
            type='button'
            onClick={handleNavigationToSignUp}
            style={{
              backgroundColor: '#fff0',
              border: '1px solid transparent',
              cursor: 'pointer'
            }
          }>
            <Link
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Sign up
            </Link>
          </button>

          </span>
        </Typography>
      </Box>
      <Divider>or</Divider>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Badge
          color="secondary"
          badgeContent="Last used"
          invisible={latestProvider !== "google"}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
          >
            Sign in with Google
          </Button>
        </Badge>
        <Badge
          color="secondary"
          badgeContent="Last used"
          invisible={latestProvider !== "facebook"}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleFacebookLogin}
            startIcon={<FacebookIcon />}
          >
            Sign in with Facebook
          </Button>
        </Badge>
      </Box>
    </Card>
  );
}