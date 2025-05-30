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
  Edit as EditIcon,
  Settings as SettingsIcon,
  Hub as HubIcon,
  Delete as DeleteIcon,
  PowerSettingsNew,
  StopCircle,
} from '@mui/icons-material';
import { Agent, useAgents } from '../../../context/AgentsContext';
import { useNavigate } from 'react-router-dom';

interface ActionMenuProps {
  agent: Agent;
  handleOpenSettings: (agentId: string) => void;
  handleDelete: (agentId: string) => void;
  theme: any;
}

export default function ActionMenu({
  agent,
  handleOpenSettings,
  handleDelete,
  theme,
}: ActionMenuProps) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<EventTarget | null>(null);
  const { activateAgent, deactivateAgent } = useAgents();

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

  const handleToggleActive = (
    event: MouseEvent<HTMLLIElement>,
    agent: Agent
  ) => {
    agent.isActive ? deactivateAgent(agent.id) : activateAgent(agent.id);
    handleClose(event);
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
        <MenuItem onClick={() => handleNavigateToAgentDetails(agent.id)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
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
        <Divider />
        {!agent.isActive && (
          <MenuItem onClick={(event) => handleToggleActive(event, agent)}>
            <ListItemIcon>
              <PowerSettingsNew fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        {agent.isActive && (
          <MenuItem onClick={(event) => handleToggleActive(event, agent)}>
            <ListItemIcon>
              <StopCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () =>
              navigate(`/agents/${agent.id}?tabName=integrations`)
            )
          }
        >
          <ListItemIcon>
            <HubIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Channels</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () => handleDelete(agent.id))
          }
        >
          <ListItemIcon>
            <DeleteIcon
              sx={{ color: theme.palette.error.main }}
              fontSize="small"
            />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
