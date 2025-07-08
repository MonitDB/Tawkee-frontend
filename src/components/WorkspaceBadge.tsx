import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useRef, useState } from 'react';


export default function WorkspaceBadge() {
  const { user, updateWorkspaceName } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.workspaceName);
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleConfirm = async () => {
    if (name?.trim()) {
        await updateWorkspaceName(name);
    }
    setIsEditing(false);
  };

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{ position: 'relative', display: 'inline-block', minWidth: 150 }}
    >
      {isEditing ? (
        <TextField
          inputRef={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleConfirm}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
          variant="standard"
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '1rem',
              fontWeight: 500,
              padding: 0,
            },
          }}
        />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" fontWeight="500">
            {name}
          </Typography>
          {hover && (
            <Tooltip title="Edit workspace name">
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{
                  padding: 0.5,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Chip
            variant='filled'
            label={ user?.workspaceIsActive ? 'Active' : 'Inactive' }
            color={ user?.workspaceIsActive ? 'success' : 'error' }
          />
        </Box>
      )}
    </Box>
  );
}
