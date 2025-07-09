import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useRef, useState } from 'react';

export default function WorkspaceBadge({
  workspaceId,
  workspaceName,
  workspaceIsActive,
}: {
  workspaceId?: string;
  workspaceName?: string;
  workspaceIsActive?: boolean;
}) {
  const { user, updateWorkspaceName, can } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(
    workspaceName ? workspaceName : user?.workspaceName
  );
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canEditWorkspace = can('EDIT', 'WORKSPACE');
  const canEditWorkspaceAsAdmin = can('EDIT_AS_ADMIN', 'WORKSPACE');

  const userBelongsToWorkspace = user?.workspaceId == workspaceId;

  const canEdit = userBelongsToWorkspace
    ? canEditWorkspace
    : canEditWorkspaceAsAdmin;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleConfirm = async () => {
    if (name?.trim()) {
      await updateWorkspaceName(
        workspaceId ? workspaceId : (user?.workspaceId as string),
        name
      );
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
          <Typography variant="h4" fontWeight="bold">
            {name}
          </Typography>
          {hover && canEdit && (
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
            variant="filled"
            label={
              workspaceIsActive != undefined
                ? workspaceIsActive
                  ? 'Active'
                  : 'Inactive'
                : user?.workspaceIsActive
                  ? 'Active'
                  : 'Inactive'
            }
            color={
              workspaceIsActive != undefined
                ? workspaceIsActive
                  ? 'success'
                  : 'error'
                : user?.workspaceIsActive
                  ? 'success'
                  : 'error'
            }
          />
        </Box>
      )}
    </Box>
  );
}
