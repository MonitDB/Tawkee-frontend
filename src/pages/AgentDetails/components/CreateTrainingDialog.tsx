import { useState, ChangeEvent, SyntheticEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  TextField,
  Box,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  useColorScheme,
  useTheme,
} from '@mui/material';
import { CloudUpload, Close, Image } from '@mui/icons-material';

// Enum para os tipos de treinamento
enum TrainingType {
  TEXT = 'TEXT',
  DOCUMENT = 'DOCUMENT',
  WEBSITE = 'WEBSITE',
  VIDEO = 'VIDEO',
}

// Interface para o DTO de criação de treinamento
interface CreateTrainingDto {
  type: TrainingType;
  text?: string;
  image?: string;
  website?: string;
  trainingSubPages?: string;
  trainingInterval?: string;
  documentUrl?: string;
  documentName?: string;
  documentMimetype?: string;
  video?: string;
}

interface NewTrainingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (training: CreateTrainingDto) => void;
  allowedTrainings: {
    textAmountReachedLimit: boolean;
    documentAmountReachedLimit: boolean;
    videoAmountReachedLimit: boolean;
    websiteAmountReachedLimit: boolean;
  };
}

export default function CreateTrainingDialog({
  open,
  onClose,
  onSubmit,
  allowedTrainings: {
    textAmountReachedLimit,
    documentAmountReachedLimit,
    videoAmountReachedLimit,
    websiteAmountReachedLimit,
  },
}: NewTrainingDialogProps) {
  const { mode, systemMode } = useColorScheme();
  const theme = useTheme();

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<TrainingType>(TrainingType.TEXT);

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<CreateTrainingDto>({
    type: TrainingType.TEXT,
  });

  // Estados para controle de upload
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);

  const [textCharacterCount, setTextCharacterCount] = useState<number>(0);
  const [textError, setTextError] = useState<boolean>(false);

  const [websiteCharacterCount, setWebsiteCharacterCount] = useState<number>(0);
  const [websiteError, setWebsiteError] = useState<boolean>(false);
  const [websiteErrorMessage, setWebsiteErrorMessage] = useState<string>('');

  const [videoCharacterCount, setVideoCharacterCount] = useState<number>(0);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoErrorMessage, setVideoErrorMessage] = useState<string>('');

  const TEXT_CHARS_LIMIT = 1028;

  // Função para lidar com a mudança de aba
  const handleTabChange = (_event: SyntheticEvent, newValue: TrainingType) => {
    setActiveTab(newValue);
    setFormData({ ...formData, type: newValue });
  };

  // Função para lidar com mudanças nos campos de texto
  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'text') {
      setTextCharacterCount(value.length);

      if (value.length > TEXT_CHARS_LIMIT) {
        setTextError(true);
      } else {
        setTextError(false);
      }
    }

    if (name === 'website') {
      setWebsiteCharacterCount(value.length);
      setWebsiteErrorMessage('');

      if (value.length > TEXT_CHARS_LIMIT) {
        setWebsiteError(true);
      } else {
        setWebsiteError(false);
      }
    }

    if (name === 'video') {
      setVideoCharacterCount(value.length);
      setVideoErrorMessage('');

      if (value.length > TEXT_CHARS_LIMIT) {
        setVideoError(true);
      } else {
        setVideoError(false);
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Função para lidar com mudanças nos campos de seleção
  //   const handleSelectChange = (e: ChangeEvent<{ name?: string; value: unknown }>) => {
  //     const name = e.target.name as string;
  //     const value = e.target.value as string;

  //     setFormData({
  //       ...formData,
  //       [name]: value,
  //     });
  //   };

  // Função para simular o upload de imagem e converter para URL
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulando o processo de upload e conversão para URL
    const reader = new FileReader();
    reader.onload = () => {
      // Base64 da imagem como URL simulada
      const imageUrl = reader.result as string;
      setUploadedImage(imageUrl);
      setFormData({
        ...formData,
        image: imageUrl,
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Função para simular o upload de documento e converter para URL
  const handleDocumentUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedDocument(file);

    // Simulando o processo de upload e conversão para URL
    const reader = new FileReader();
    reader.onload = () => {
      // Base64 do documento como URL simulada
      const documentUrl = reader.result as string;
      setFormData({
        ...formData,
        documentUrl: documentUrl,
        documentName: file.name,
        documentMimetype: file.type,
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedVideo(file);

    // Simulando o processo de upload e conversão para URL
    const reader = new FileReader();
    reader.onload = () => {
      // Base64 do documento como URL simulada
      const videoUrl = reader.result as string;
      setFormData({
        ...formData,
        video: videoUrl,
        documentName: file.name,
        documentMimetype: file.type,
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Função para remover a imagem carregada
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setFormData({
      ...formData,
      image: undefined,
    });
  };

  // Função para remover o documento carregado
  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setFormData({
      ...formData,
      documentUrl: undefined,
      documentName: undefined,
      documentMimetype: undefined,
    });
  };

  // Função para remover o documento carregado
  const handleRemoveVideo = () => {
    setUploadedVideo(null);
    setFormData({
      ...formData,
      video: undefined,
    });
    setVideoError(false);
  };

  // Função para enviar o formulário
  const handleSubmit = () => {
    // Validar valores do formulário primeiro
    if (textError) {
      setTextError(true);
      return;
    }

    if (websiteError) {
      setWebsiteError(true);
      return;
    }

    if (videoError) {
      setVideoError(true);
      return;
    }

    try {
      if (formData.website) {
        const url = new URL(formData.website);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      }
    } catch (e) {
      setWebsiteError(true);
      setWebsiteErrorMessage('Please enter a valid website URL.');
      return;
    }

    try {
      if (formData.video) {
        const url = new URL(formData.video);
        if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      }
    } catch (e) {
      setVideoError(true);
      setVideoErrorMessage('Please enter a valid video URL.');
      return;
    }

    const dataToSubmit = formData;

    setFormData({
      type: TrainingType.TEXT,
      text: undefined,
      image: undefined,
      website: undefined,
      documentUrl: undefined,
      documentName: undefined,
      documentMimetype: undefined,
      video: undefined,
    });
    setTextCharacterCount(0);
    setWebsiteCharacterCount(0);
    setWebsiteErrorMessage('');
    setVideoCharacterCount(0);
    setVideoErrorMessage('');
    setUploadedImage(null);
    setUploadedDocument(null);
    setUploadedImage(null);
    setUploadedVideo(null);
    setActiveTab(TrainingType.TEXT);
    onSubmit(dataToSubmit);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>New Training Material</DialogTitle>
      <DialogContent sx={{ height: '55vh' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {!textAmountReachedLimit && (
            <Tab
              label="Text"
              value={TrainingType.TEXT}
              disabled={textAmountReachedLimit}
            />
          )}
          {!documentAmountReachedLimit && (
            <Tab
              label="Document"
              value={TrainingType.DOCUMENT}
              disabled={documentAmountReachedLimit}
            />
          )}
          {!websiteAmountReachedLimit && (
            <Tab
              label="Website"
              value={TrainingType.WEBSITE}
              disabled={websiteAmountReachedLimit}
            />
          )}
          {!videoAmountReachedLimit && (
            <Tab
              label="Video"
              value={TrainingType.VIDEO}
              disabled={videoAmountReachedLimit}
            />
          )}
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {/* Aba de Texto */}
          {activeTab === TrainingType.TEXT && (
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                New training via text
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Write a statement and then register..."
                name="text"
                value={formData.text || ''}
                onChange={handleTextChange}
                variant="outlined"
                sx={{ mb: 2 }}
                error={textError}
                color={textError ? 'error' : 'primary'}
                helperText={`${textCharacterCount}/${TEXT_CHARS_LIMIT}`}
              />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  {!uploadedImage ? (
                    <Button
                      component="label"
                      startIcon={<Image />}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Add image related to training text'
                      )}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <Box
                        component="img"
                        src={uploadedImage}
                        alt="Image uploaded"
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          mr: 1,
                        }}
                      />
                      <IconButton size="small" onClick={handleRemoveImage}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Aba de Website */}
          {activeTab === TrainingType.WEBSITE && (
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                New training via website
              </Typography>

              <TextField
                fullWidth
                placeholder="Paste the URL of a website"
                name="website"
                value={formData.website || ''}
                onChange={handleTextChange}
                variant="outlined"
                sx={{ mb: 2 }}
                error={websiteError}
                color={websiteError ? 'error' : 'primary'}
                helperText={
                  websiteErrorMessage ||
                  `${websiteCharacterCount}/${TEXT_CHARS_LIMIT}`
                }
              />

              {/* <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
                <FormControl variant="standard" sx={{ minWidth: 200 }}>
                  <InputLabel>Update interval</InputLabel>
                  <Select
                    name="trainingInterval"
                    value={formData.trainingInterval || 'NEVER'}
                    onChange={handleSelectChange as any}
                    label="Update interval"
                    sx={{ padding: 1 }}
                  >
                    <MenuItem value="NEVER">Never</MenuItem>
                    <MenuItem value="ONE_DAY">Daily</MenuItem>
                    <MenuItem value="ONE_WEEK">Weekly</MenuItem>
                    <MenuItem value="ONE_MONTH">Monthly</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl variant="standard" sx={{ minWidth: 200 }}>
                  <InputLabel>Browse subpages</InputLabel>
                  <Select
                    name="trainingSubPages"
                    value={formData.trainingSubPages || 'DISABLED'}
                    onChange={handleSelectChange as any}
                    label="Browse subpages"
                    sx={{ padding: 1 }}
                  >
                    <MenuItem value="DISABLED">No</MenuItem>
                    <MenuItem value="ENABLED">Yes</MenuItem>
                  </Select>
                </FormControl>
              </Box> */}
            </Box>
          )}

          {/* Aba de Documento */}
          {activeTab === TrainingType.DOCUMENT && (
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                New training via document
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 150,
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }}
                component="label"
              >
                {isUploading ? (
                  <CircularProgress />
                ) : !uploadedDocument ? (
                  <>
                    <CloudUpload
                      sx={{ fontSize: 40, mb: 1, color: 'primary.main' }}
                    />
                    <Typography variant="body1" gutterBottom>
                      Select the file to upload
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Supported types: .pdf, .doc, .docx, .txt, .odt, .rtf (max:
                      100MB)
                    </Typography>
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleDocumentUpload}
                    />
                  </>
                ) : (
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {uploadedDocument.name}
                    </Typography>
                    <IconButton onClick={handleRemoveDocument}>
                      <Close />
                    </IconButton>
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          {/* Aba de Vídeo */}
          {activeTab === TrainingType.VIDEO && (
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                New training via video
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 150,
                    cursor: 'pointer',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  }}
                  component="label"
                >
                  {isUploading ? (
                    <CircularProgress />
                  ) : !uploadedVideo ? (
                    <>
                      <CloudUpload
                        sx={{ fontSize: 40, mb: 1, color: 'primary.main' }}
                      />
                      <Typography variant="body1" gutterBottom>
                        Select the file to upload
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Supported types: .mp4, .mov, .avi, .mkv, .webm, .wmv
                        (max: 100MB)
                      </Typography>
                      <input
                        type="file"
                        hidden
                        accept=".mp4,.mov,.avi,.mkv,.webm,.wmv"
                        onChange={handleVideoUpload}
                      />
                    </>
                  ) : (
                    <Box display="flex" alignItems="center" width="100%">
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {uploadedVideo.name}
                      </Typography>
                      <IconButton onClick={handleRemoveVideo}>
                        <Close />
                      </IconButton>
                    </Box>
                  )}
                </Paper>

                {!uploadedVideo && (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography>OR</Typography>
                    </Box>

                    <TextField
                      fullWidth
                      placeholder="Paste the URL of a public video"
                      name="video"
                      value={formData.video || ''}
                      onChange={handleTextChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                      error={videoError}
                      color={videoError ? 'error' : 'primary'}
                      helperText={
                        videoErrorMessage ||
                        `${videoCharacterCount}/${TEXT_CHARS_LIMIT}`
                      }
                      disabled={!!uploadedVideo}
                    />
                  </>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={
            isUploading ||
            (activeTab === TrainingType.TEXT && !formData.text) ||
            (activeTab === TrainingType.WEBSITE && !formData.website) ||
            (activeTab === TrainingType.DOCUMENT && !formData.documentUrl) ||
            (activeTab === TrainingType.VIDEO && !formData.video)
          }
          sx={{
            '&.Mui-disabled': {
              color:
                resolvedMode == 'dark'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[500],
            },
          }}
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
}
