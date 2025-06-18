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
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SpeedDial from '@mui/material/SpeedDial';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../../context/AuthContext';
import { useHttpResponse } from '../../../context/ResponseNotifier';
import { ChatDto } from '../../../services/chatService';

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
  onMessageSent?: (data: ChatDto) => void; // Callback para atualizar a lista de mensagens
}

interface SendMessageDto {
  message: string;
  media?: MediaDto;
}

interface MediaDto {
  url: string;
  caption: string;
  type: 'image' | 'audio' | 'document';
  mimetype: string;
  filename: string;
}

interface MediaUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (media: MediaDto) => void;
  mediaType: MediaDto['type'];
}

export const MediaUploadDialog: React.FC<MediaUploadDialogProps> = ({
  open,
  onClose,
  onConfirm,
  mediaType,
}) => {
  const [caption, setCaption] = useState('');
  const [filename, setFilename] = useState('');
  const [mimetype, setMimetype] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const maxRecordingSeconds = 30;
  const recordingIntervalRef = useRef<number | null>(null);

  const getMimeTypePattern = (type: MediaDto['type']) => {
    switch (type) {
      case 'image': return 'image/*';
      case 'audio': return 'audio/*';
      case 'document': return '.pdf,.doc,.docx,.txt,.rtf';
      default: return '*/*';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setUrl(base64);
        setFilename(selectedFile.name);
        setMimetype(selectedFile.type);
        setFile(selectedFile);
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        clearInterval(recordingIntervalRef.current!);
        setRecordingProgress(0);

        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setUrl(base64);
          setFilename('gravacao.webm');
          setMimetype('audio/webm');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      let elapsed = 0;
      recordingIntervalRef.current = setInterval(() => {
        elapsed += 1;
        setRecordingProgress((elapsed / maxRecordingSeconds) * 100);
        if (elapsed >= maxRecordingSeconds) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
    }
  };

  const handleStopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
    setMediaRecorder(null);
  };

  const handlePlayAudio = () => {
    if (audioBlob) {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrlRef.current);
      audioPlayerRef.current = audio;
      audio.play();
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
      setAudioBlob(null);
      setRecordingProgress(0);
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Anexar {mediaType === 'image' ? 'Imagem' : mediaType === 'audio' ? 'Áudio' : 'Documento'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {mediaType === 'audio' && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" gap={1} alignItems="center">
                {!isRecording ? (
                  <Button variant="outlined" onClick={handleStartRecording} startIcon={<MicIcon />}>
                    Gravar áudio
                  </Button>
                ) : (
                  <Button variant="contained" color="error" onClick={handleStopRecording} startIcon={<StopIcon />}>
                    Parar gravação
                  </Button>
                )}
                {audioBlob && (
                  <Button variant="text" onClick={handlePlayAudio} startIcon={<PlayArrowIcon />}>Ouvir</Button>
                )}
              </Box>
              {isRecording && <LinearProgress variant="determinate" value={recordingProgress} />}
            </Box>
          )}

          {!isRecording && (
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
                Selecionar Arquivo
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
            </Box>
          )}

          <TextField
            label="Legenda"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Adicione uma legenda..."
          />

          <TextField
            label="Nome do arquivo"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            fullWidth
            placeholder="arquivo.jpg"
          />

          <TextField
            label="Tipo MIME"
            value={mimetype}
            onChange={(e) => setMimetype(e.target.value)}
            fullWidth
            placeholder="image/jpeg"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={!url || !caption || !filename || !mimetype}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
  const [mediaToSend, setMediaToSend] = useState<MediaDto | undefined>(undefined);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<MediaDto['type']>('image');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !mediaToSend) return;

    setSending(true);
    setError(null);

    const messagePayload: SendMessageDto = {
      message: newMessage.trim(),
    };

    if (mediaToSend) {
      messagePayload.media = mediaToSend;
    }

    try {    
      const response = await fetch(
        `${env.API_URL}/chats/${selectedChat.id}/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
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
        onMessageSent(data.data as ChatDto);
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
    setMediaToSend(media);
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
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column'}}>
                { sending && <LinearProgress sx={{ width: '100%' }} color='secondary' /> }
                <Box sx={{ width: '100%', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
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
                        FabProps={{ color: 'secondary' }}  // or 'primary', 'error', etc.
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
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && !mediaToSend) || sending}
                    sx={{ height: 50 }}
                    >
                    <SendIcon />
                    </IconButton>
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: '100%', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mt: 1,
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1
            }}>
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
            You can't send messages to finished chats.
            Mark this chat as unfinished before resuming conversation. 
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
};