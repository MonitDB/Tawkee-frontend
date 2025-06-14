import { ChatDto } from '../../../services/chatService';
import { MouseEvent, useState } from 'react';
import {
  useTheme,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';

import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface ChatMenuProps {
  chat: ChatDto;
  handleMarkChatResolution: (chatId: string, chatFinished: boolean) => void;
  handleStopHumanAttendance: (chatId: string) => void;
  handleDelete: (chatId: string) => void;
}

export function ChatMenu({
  chat,
  handleMarkChatResolution,
  handleStopHumanAttendance,
  handleDelete,
}: ChatMenuProps) {
  const theme = useTheme();

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

  return (
    <>
      <Tooltip title="Actions">
        <IconButton
          aria-label="more"
          aria-controls={open ? 'chat-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="chat-menu"
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
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () =>
              handleMarkChatResolution(chat.id, chat.finished)
            )
          }
        >
          <ListItemIcon>
            {chat.finished ? (
              <ScheduleIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            Mark as {chat.finished ? 'Unread' : 'Finished'}
          </ListItemText>
        </MenuItem>
        {chat.humanTalk && (
          <MenuItem
            onClick={(event) =>
              handleMenuItemClick(event, () =>
                handleStopHumanAttendance(chat.id)
              )
            }
          >
            <ListItemIcon>
              {chat.finished ? (
                <ScheduleIcon fontSize="small" />
              ) : (
                <CheckCircleIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>Stop Human Attendance</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={(event) =>
            handleMenuItemClick(event, () => handleDelete(chat.id))
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
