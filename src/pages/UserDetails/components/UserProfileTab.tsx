import {
  Grid,
  TextField,
  Button,
  useColorScheme,
  useTheme,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function UserProfileTab() {
  const { mode, systemMode } = useColorScheme();
  const theme = useTheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { user, updateName, loading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setAvatarPreview(user.avatar || null); // Adjust key if different
    }
  }, [user]);

  const onUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    await updateName(formData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

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
            Profile
          </Typography>
        </Box>
        <Typography variant="subtitle1">Change your name and avatar</Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            src={avatarPreview || undefined}
            sx={{ width: 160, height: 160, mb: 1 }}
          />
          <Button component="label" variant="outlined">
            Upload Avatar
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleAvatarChange}
            />
          </Button>
        </Box>
      </Grid>

      <Grid size={{ xs: 8 }} />

      <Grid size={{ xs: 4 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onUpdateProfile}
          disabled={loading}
          sx={{
            height: '100%',
            '&.Mui-disabled': {
              color:
                resolvedMode === 'dark'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[500],
            },
          }}
        >
          Save Changes
        </Button>
      </Grid>
    </Grid>
  );
}
