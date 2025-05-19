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
import {
  Agent,
  AgentSettings,
  useAgents,
} from '../../../context/AgentsContext';
import { useNavigate } from 'react-router-dom';

interface ActionMenuProps {
  agent: Agent;
  settings: AgentSettings;
  handleOpenSettings: (agentId: string, settings: AgentSettings) => void;
  handleOpenChannels: (agentId: string, agentIsActive: boolean) => void;
  handleDelete: (agentId: string) => void;
  theme: any;
}

export default function ActionMenu({
  agent,
  settings,
  handleOpenSettings,
  handleOpenChannels,
  handleDelete,
  theme,
}: ActionMenuProps) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<EventTarget | null>(null);
  const { activateAgent, deactivateAgent } = useAgents();

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action: () => void) => {
    handleClose();
    action();
  };

  const handleToggleActive = (agent: Agent) => {
    agent.isActive ? deactivateAgent(agent.id) : activateAgent(agent.id);
    handleClose();
  };

  const handleNavigateToAgentDetails = (agentId: string) => {
    navigate(`/agents/${agentId}/none`);
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
          onClick={() =>
            handleMenuItemClick(() => handleOpenSettings(agent.id, settings))
          }
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        {!agent.isActive && (
          <MenuItem onClick={() => handleToggleActive(agent)}>
            <ListItemIcon>
              <PowerSettingsNew fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() =>
            handleMenuItemClick(() =>
              handleOpenChannels(agent.id, agent.isActive)
            )
          }
        >
          <ListItemIcon>
            <HubIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Channels</ListItemText>
        </MenuItem>
        {agent.isActive && (
          <MenuItem onClick={() => handleToggleActive(agent)}>
            <ListItemIcon>
              <StopCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => handleMenuItemClick(() => handleDelete(agent.id))}
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
