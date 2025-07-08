import { useState, useMemo, useRef, useEffect } from 'react';

import env from '../../../config/env';

import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  useTheme,
  useColorScheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SpeedDial from '@mui/material/SpeedDial';
// import MicIcon from '@mui/icons-material/Mic';
// import StopIcon from '@mui/icons-material/Stop';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../../context/AuthContext';
import { useHttpResponse } from '../../../context/ResponseNotifier';
import { MessageChatUpdatePayload } from '../../../context/SocketContext';

// Interfaces
interface ChatComponentProps {
  selectedChat: {
    id: string;
    finished: boolean;
    humanTalk: boolean;
    agentName: string;
  };
  chatLoading: boolean;
  isLargeScreen: boolean;
  isSmallScreen: boolean;
  handleStartHumanAttendance: (chatId: string) => void;
  onMessageSent?: (data: MessageChatUpdatePayload) => void; // Callback para atualizar a lista de mensagens
}

interface SendMessageDto {
  message: string;
  media?: MediaDto;
}

interface MediaDto {
  url: string;
  caption: string;
  type: 'image' | 'audio' | 'document' | 'video';
  mimetype: string;
  filename: string;
}

interface MediaUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (media: MediaDto) => void;
  mediaType: MediaDto['type'];
}

export function MediaUploadDialog({
  open,
  onClose,
  onConfirm,
  mediaType,
}: MediaUploadDialogProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const [caption, setCaption] = useState('');
  const [filename, setFilename] = useState('');
  const [mimetype, setMimetype] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE_MB = 25;

  const getMimeTypePattern = (type: MediaDto['type']) => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'audio':
        return 'audio/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.rtf';
      case 'video':
        return 'video/*';
      default:
        return '*/*';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError(null);
    if (selectedFile) {
      const sizeInMB = selectedFile.size / (1024 * 1024);
      if (sizeInMB > MAX_FILE_SIZE_MB) {
        setError(`File exceeds 25MB limit (${sizeInMB.toFixed(2)} MB).`);
        return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        setUrl(base64);
        setFilename(selectedFile.name);
        setMimetype(selectedFile.type);
        setFile(selectedFile);
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleConfirm = () => {
    if (url && caption && filename && mimetype) {
      onConfirm({ url, caption, type: mediaType, mimetype, filename });
      setUrl('');
      setCaption('');
      setFilename('');
      setMimetype('');
      setFile(null);
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      if (fileInputRef.current?.files?.length) {
        URL.revokeObjectURL(fileInputRef.current.value);
      }
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>
        Attach{' '}
        {mediaType === 'image'
          ? 'Image'
          : mediaType === 'audio'
            ? 'Audio'
            : mediaType === 'document'
              ? 'Document'
              : 'Video'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={getMimeTypePattern(mediaType)}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<AttachFileIcon />}
              fullWidth
            >
              Select File
            </Button>
            {uploading && <CircularProgress size={20} sx={{ mt: 1 }} />}
            {file && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={file.name}
                  onDelete={() => setFile(null)}
                  deleteIcon={<CloseIcon />}
                />
              </Box>
            )}
            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}
            {file && mediaType === 'video' && (
              <Box mt={2}>
                <video controls width="100%">
                  <source
                    src={`data:${mimetype};base64,${url}`}
                    type={mimetype}
                  />
                  Your browser does not support the video element.
                </video>
              </Box>
            )}
          </Box>

          <TextField
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Add a caption..."
          />

          <TextField
            label="File Name"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            fullWidth
            placeholder="file.jpg"
          />

          <TextField
            label="MIME Type"
            value={mimetype}
            onChange={(e) => setMimetype(e.target.value)}
            fullWidth
            placeholder="image/jpeg"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!url || !caption || !filename || !mimetype || !!error}
          sx={{
            '&.Mui-disabled': {
              color:
                resolvedMode == 'dark'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[500],
            },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ChatInput({
  selectedChat,
  chatLoading,
  isLargeScreen,
  isSmallScreen,
  handleStartHumanAttendance,
  onMessageSent,
}: ChatComponentProps) {
  const { notify } = useHttpResponse();
  const { token } = useAuth();

  const [newMessage, setNewMessage] = useState('');
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [mediaToSend, setMediaToSend] = useState<MediaDto | undefined>(
    undefined
  );
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [selectedMediaType, setSelectedMediaType] =
    useState<MediaDto['type']>('image');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (message: string, media?: MediaDto) => {
    if (!message.trim() && !media) return;

    setSending(true);
    setError(null);

    const messagePayload: SendMessageDto = {
      message: message.trim(),
    };

    if (media) {
      messagePayload.media = media;
    }

    try {
      const response = await fetch(
        `${env.API_URL}/chats/${selectedChat.id}/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messagePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData.message || 'Failure to send message';
      }

      const data = await response.json();

      // Limpar o formulário
      setNewMessage('');
      setMediaToSend(undefined);

      // Chamar callback para atualizar a lista de mensagens
      if (onMessageSent) {
        onMessageSent(data.data as MessageChatUpdatePayload);
      }
    } catch (error) {
      notify(error as string, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSpeedDialOpen = () => setOpenSpeedDial(true);
  const handleSpeedDialClose = () => setOpenSpeedDial(false);

  const handleMediaSelect = (type: MediaDto['type']) => {
    setSelectedMediaType(type);
    setMediaDialogOpen(true);
    handleSpeedDialClose();
  };

  const handleMediaConfirm = (media: MediaDto) => {
    handleSendMessage(media.caption, media);
  };

  const actions = [
    {
      icon: <ImageIcon />,
      name: 'Imagem',
      onClick: () => handleMediaSelect('image'),
    },
    {
      icon: <AudiotrackIcon />,
      name: 'Áudio',
      onClick: () => handleMediaSelect('audio'),
    },
    {
      icon: <DescriptionIcon />,
      name: 'Documento',
      onClick: () => handleMediaSelect('document'),
    },
    // {
    //   icon: <VideoLibraryIcon />,
    //   name: 'Video',
    //   onClick: () => handleMediaSelect('video'),
    // },
  ];

  const messageInputSection = useMemo(
    () =>
      !selectedChat.finished ? (
        <Paper
          sx={{
            backgroundColor: 'transparent',
            height: 50,
            borderRadius: 0,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
            flexDirection: 'column',
          }}
        >
          {(chatLoading || sending) && (
            <LinearProgress color="secondary" sx={{ width: '100%' }} />
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '50',
              gap: 1,
            }}
          >
            {selectedChat.humanTalk ? (
              <Box
                sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
              >
                {sending && (
                  <LinearProgress sx={{ width: '100%' }} color="secondary" />
                )}
                <Box
                  sx={{
                    width: '100%',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(newMessage);
                      }
                    }}
                    multiline
                    maxRows={2}
                    disabled={sending}
                  />
                  <SpeedDial
                    ariaLabel="Seleção de mídia"
                    sx={{
                      position: 'relative',
                      '&.MuiSpeedDial-directionUp': { mb: 2 },
                      '& .MuiSpeedDial-fab': { width: 40, height: 40 },
                      height: 50,
                    }}
                    FabProps={{ color: 'secondary' }} // or 'primary', 'error', etc.
                    icon={<SpeedDialIcon />}
                    onClose={handleSpeedDialClose}
                    onOpen={handleSpeedDialOpen}
                    open={openSpeedDial}
                    direction="up"
                  >
                    {actions.map((action) => (
                      <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.onClick}
                      />
                    ))}
                  </SpeedDial>
                  <IconButton
                    color="primary"
                    onClick={() => handleSendMessage(newMessage)}
                    disabled={(!newMessage.trim() && !mediaToSend) || sending}
                    sx={{ height: 50 }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {!isLargeScreen && (
                  <Typography>
                    Chat held by Agent {selectedChat.agentName}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  onClick={() => handleStartHumanAttendance(selectedChat.id)}
                  disabled={chatLoading}
                >
                  {!isSmallScreen
                    ? chatLoading
                      ? 'Wait a moment...'
                      : 'Start Human Attendance'
                    : chatLoading
                      ? 'Wait...'
                      : 'Start Attendance'}
                </Button>
              </Box>
            )}
          </Box>

          {mediaToSend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                📎 {mediaToSend.filename} ({mediaToSend.type})
                {mediaToSend.caption && ` - ${mediaToSend.caption}`}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setMediaToSend(undefined)}
                disabled={sending}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 2,
            borderRadius: 0,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
            flexDirection: 'column',
          }}
        >
          <Typography>
            You are unable to send messages to finished chats. Mark this chat as
            unfinished before resuming conversation.
          </Typography>
        </Paper>
      ),
    [
      chatLoading,
      sending,
      error,
      selectedChat.humanTalk,
      selectedChat.agentName,
      selectedChat.id,
      selectedChat.finished,
      newMessage,
      handleSendMessage,
      handleStartHumanAttendance,
      isLargeScreen,
      isSmallScreen,
      openSpeedDial,
      mediaToSend,
    ]
  );

  return (
    <>
      {messageInputSection}
      <MediaUploadDialog
        open={mediaDialogOpen}
        onClose={() => setMediaDialogOpen(false)}
        onConfirm={handleMediaConfirm}
        mediaType={selectedMediaType}
      />
    </>
  );
}
