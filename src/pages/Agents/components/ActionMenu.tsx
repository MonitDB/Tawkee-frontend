import { MouseEvent, useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Hub as HubIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  Restore as RestoreIcon,
  PowerSettingsNew,
  StopCircle,
} from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import { Agent } from '../../../context/AgentsContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface ActionMenuProps {
  agent: Agent;
  handleOpenSettings: (agentId: string) => void;
  handleDelete: (agentId: string) => void;
  handleRestore: (agentId: string) => void;
  handleActivateOrDeactivate: (
    event: any,
    agentActivityStatus: boolean,
    agentId: string
  ) => void;
  theme: any;
}

export default function ActionMenu({
  agent,
  handleOpenSettings,
  handleDelete,
  handleRestore,
  handleActivateOrDeactivate,
  theme,
}: ActionMenuProps) {
  const navigate = useNavigate();

  const { user, can } = useAuth();

  const userBelongsToWorkspace = user?.workspaceId === agent.workspaceId;
  const canActivate = can('ACTIVATE', 'AGENT');
  const canActivateAsAdmin = can('ACTIVATE_AS_ADMIN', 'AGENT');
  const canDelete = can('DELETE', 'AGENT');
  const canDeleteAsAdmin = can('DELETE_AS_ADMIN', 'AGENT');

  const [anchorEl, setAnchorEl] = useState<EventTarget | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: MouseEvent<HTMLLIElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleMenuItemClick = (
    event: MouseEvent<HTMLLIElement>,
    action: () => void
  ) => {
    handleClose(event);
    action();
  };

  const handleNavigateToAgentDetails = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  return (
    <>
      <Tooltip title="Actions">
        <IconButton
          aria-label="more"
          aria-controls={open ? 'agent-actions-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="agent-actions-menu"
        anchorEl={anchorEl as Element}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        { !agent.isDeleted && (
          <>
            <MenuItem onClick={(event) => handleActivateOrDeactivate(event, agent.isActive, agent.id)}>
              <ListItemIcon>
                { agent.isActive ? (
                  <StopCircle fontSize="small" />
                ) : (
                  <PowerSettingsNew fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>{ agent.isActive ? 'Deactivate' : 'Activate' }</ListItemText>
              { userBelongsToWorkspace
                ? !canActivate && (
                  <Tooltip
                    title="You cannot activate/deactivate agents of the workspace."
                    placement='right'
                    sx={{ ml: 1 }}
                  >
                    <InfoIcon color='warning' />
                  </Tooltip>
                ) : !canActivateAsAdmin && (
                  <Tooltip
                    title="Your admin privileges to activate/deactivate agents of any workspace has been revoked."
                    placement='right'
                    sx={{ ml: 1 }}
                  >
                    <InfoIcon color='warning' />
                  </Tooltip>
                )
              }          
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => handleNavigateToAgentDetails(agent.id)}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () => handleOpenSettings(agent.id))
          }
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () =>
              navigate(`/agents/${agent.id}?tabName=channels`)
            )
          }
        >
          <ListItemIcon>
            <HubIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Channels</ListItemText>
        </MenuItem>
        <Divider />
        { agent.isDeleted && (
          <MenuItem
            onClick={(event) =>
              handleMenuItemClick(event, () => handleRestore(agent.id))
            }
          >
            <ListItemIcon>
              <RestoreIcon
                sx={{ color: theme.palette.success.main }}
                fontSize="small"
              />
            </ListItemIcon>
            <ListItemText>Restore</ListItemText>
            { userBelongsToWorkspace && !canDeleteAsAdmin && (
              <Tooltip
                title="Your admin privileges to restore agents of any workspace has been revoked."
                placement='right'
              >
                <InfoIcon color='warning' />
              </Tooltip>
            )}
          </MenuItem>
        )}
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () => handleDelete(agent.id))
          }
        >
          <ListItemIcon>
            { agent.isDeleted ? (
              <DeleteForeverIcon
                sx={{ color: theme.palette.error.main }}
                fontSize="small"
              />
            ) : (
              <DeleteIcon
                sx={{ color: theme.palette.error.main }}
                fontSize="small"
              />
            )}
          </ListItemIcon>
          <ListItemText>Delete { agent.isDeleted ? 'Permanently' : '' }</ListItemText>
          { userBelongsToWorkspace
            ? !canDelete && (
              <Tooltip
                title="You cannot delete agents of the workspace."
                placement='right'
              >
                <InfoIcon color='warning' />
              </Tooltip>
            ) : !canDeleteAsAdmin && (
              <Tooltip
                title="Your admin privileges to delete agents of any workspace has been revoked."
                placement='right'
              >
                <InfoIcon color='warning' />
              </Tooltip>
            )
          }
        </MenuItem>
      </Menu>
    </>
  );
}
