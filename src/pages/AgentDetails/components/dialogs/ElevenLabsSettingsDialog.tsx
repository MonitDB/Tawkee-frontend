// Enhanced settings interface
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Slider,
  CircularProgress,
  Paper,
  useTheme,
  useColorScheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';
import { useElevenLabsService } from '../../../../hooks/useElevenLabsService';
import { useAudioPlayback } from '../../../../hooks/useAudioPlayback';
import { useAuth } from '../../../../context/AuthContext';
import { Agent } from '../../../../context/AgentsContext';
import { CompleteElevenLabsDto } from '../../../../services/elevenLabsService';

interface ElevenLabsSettingsDialogProps {
  agentData: Agent;
  open: boolean;
  onClose: () => void;
  onDeactivate: () => void;
}

// Enhanced settings interface with audio response mode
export interface ElevenLabsSettings {
  stability: number;
  similarityBoost: number;
  audioResponseMode: 'never' | 'audio_only' | 'always';
  respondAudioWithAudio: boolean;
  alwaysRespondWithAudio?: boolean;
  selectedElevenLabsVoiceId?: string;
}

// Audio response mode options
const AUDIO_RESPONSE_MODES = [
  {
    value: 'never' as const,
    label: 'Never respond via audio',
    description: 'Text responses only',
    settings: {
      respondAudioWithAudio: false,
      alwaysRespondWithAudio: false,
    },
  },
  {
    value: 'audio_only' as const,
    label: 'Only respond audio with audio',
    description: 'Audio response only when user sends audio',
    settings: {
      respondAudioWithAudio: true,
      alwaysRespondWithAudio: false,
    },
  },
  {
    value: 'always' as const,
    label: 'Always respond via audio',
    description: 'All responses will include audio',
    settings: {
      respondAudioWithAudio: true,
      alwaysRespondWithAudio: true,
    },
  },
];

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: {
    accent: string;
    description: string;
    age: string;
    gender: string;
    use_case: string;
  };
  preview_url: string;
}

export function ElevenLabsSettingsDialog({
  agentData,
  open,
  onClose,
  onDeactivate,
}: ElevenLabsSettingsDialogProps) {
  const theme = useTheme();

  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const [settings, setSettings] = useState<CompleteElevenLabsDto>(
    agentData.elevenLabsSettings as CompleteElevenLabsDto
  );

  const [audioResponseMode, setAudioResponseMode] = useState<
    'never' | 'always' | 'audio_only'
  >(
    agentData?.elevenLabsSettings?.alwaysRespondWithAudio
      ? 'always'
      : agentData?.elevenLabsSettings?.respondAudioWithAudio
        ? 'audio_only'
        : 'never'
  );

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterAccent, setFilterAccent] = useState<string>('all');
  const [filterUseCase, setFilterUseCase] = useState<string>('all');

  const { token } = useAuth();
  const { fetchElevenLabsData, updateElevenLabsData, elevenLabsLoading } =
    useElevenLabsService(token as string);

  useEffect(() => {
    async function fetchData(agentId: string) {
      if (agentData?.elevenLabsSettings?.connected) {
        await fetchElevenLabsData(agentId);
      }
    }

    fetchData(agentData.id);
  }, []);

  const voices = agentData?.elevenLabsSettings?.data?.voices?.voices || [];

  // Use the audio playback hook
  const { isPlaying, currentVoiceId, playVoicePreview, stopPlayback } =
    useAudioPlayback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    function getAudioSettings(value: 'never' | 'audio_only' | 'always') {
      const mode = AUDIO_RESPONSE_MODES.find((mode) => mode.value === value);
      if (!mode) {
        throw new Error(`Invalid audio mode: ${value}`);
      }
      return mode.settings;
    }

    try {
      const finalSettings = {
        ...settings,
        ...getAudioSettings(audioResponseMode),
      };
      await updateElevenLabsData(agentData.id, finalSettings);
      onClose();
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  const handleClose = () => {
    if (!elevenLabsLoading) {
      stopPlayback(); // Stop any playing audio when closing
      onClose();
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSettings((prev) => ({ ...prev, selectedElevenLabsVoiceId: voiceId }));
  };

  const handlePlayPreview = (voiceId: string, previewUrl: string) => {
    if (isPlaying && currentVoiceId === voiceId) {
      stopPlayback();
    } else {
      playVoicePreview(voiceId, previewUrl);
    }
  };

  const getFilteredVoices = (): ElevenLabsVoice[] => {
    if (!voices) return [];

    return voices.filter((voice) => {
      const labels = voice.labels ?? {}; // fallback to empty object

      const categoryMatch =
        filterCategory === 'all' || voice.category === filterCategory;
      const genderMatch =
        filterGender === 'all' || labels.gender === filterGender;
      const accentMatch =
        filterAccent === 'all' || labels.accent?.includes(filterAccent);
      const useCaseMatch =
        filterUseCase === 'all' || labels.use_case === filterUseCase;

      return categoryMatch && genderMatch && accentMatch && useCaseMatch;
    }) as ElevenLabsVoice[];
  };

  const getUniqueCategories = (): string[] => {
    if (!voices) return [];

    const categories = voices.map((voice) => voice.category);
    return [...new Set(categories)].sort();
  };

  const getUniqueAccents = (): string[] => {
    if (!voices) return [];

    const accents = voices
      .map((voice) => voice.labels?.accent)
      .filter((accent): accent is string => Boolean(accent)); // filter out undefined/null

    return [...new Set(accents)].sort();
  };

  const getUniqueUseCases = (): string[] => {
    if (!voices) return [];

    const useCases = voices
      .map((voice) => voice.labels?.use_case)
      .filter((useCase): useCase is string => Boolean(useCase)); // filter out undefined/null

    return [...new Set(useCases)].sort();
  };

  const getCategoryColor = (
    category: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning' => {
    switch (category) {
      case 'premade':
        return 'warning';
      case 'cloned':
        return 'success';
      case 'generated':
        return 'error';
      case 'professional':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getGenderColor = (gender: string): string => {
    switch (gender) {
      case 'male':
        return '#2196F3';
      case 'female':
        return '#E91E63';
      default:
        return '#9E9E9E';
    }
  };

  const selectedVoice =
    voices?.find(
      (voice) => voice.voice_id === settings.selectedElevenLabsVoiceId
    ) ?? null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" component="div">
            ElevenLabs Settings
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={elevenLabsLoading}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 3 }}>
          <Paper
            elevation={3}
            sx={{
              mb: 2,
              borderRadius: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Grid
              container
              spacing={2}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                  User
                </Typography>
                <Typography variant="body2">
                  {agentData?.elevenLabsSettings?.userName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontSize: '0.875rem', mt: 1 }}
                >
                  Subscription Tier
                </Typography>
                <Typography variant="body2">
                  {agentData?.elevenLabsSettings?.subscriptionTier}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontSize: '0.875rem', mt: 1 }}
                >
                  Characters Used
                </Typography>
                <Typography variant="body2">
                  {agentData?.elevenLabsSettings?.characterCount} /{' '}
                  {agentData?.elevenLabsSettings?.characterLimit}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Audio Response Mode Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Audio Response Mode
            </Typography>
            <FormControl fullWidth>
              <Select
                value={audioResponseMode}
                onChange={(e: SelectChangeEvent) =>
                  setAudioResponseMode(
                    e.target.value as 'never' | 'audio_only' | 'always'
                  )
                }
                displayEmpty
                startAdornment={
                  <VolumeIcon sx={{ mr: 1, color: 'action.active' }} />
                }
              >
                {AUDIO_RESPONSE_MODES.map((mode) => (
                  <MenuItem key={mode.value} value={mode.value}>
                    <Box>
                      <Typography variant="body1">{mode.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mode.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Voice Filters */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Voice Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Category
                  </Typography>
                  <Select
                    value={filterCategory}
                    onChange={(e: SelectChangeEvent) =>
                      setFilterCategory(e.target.value)
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    {getUniqueCategories().map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() +
                          category.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Gender
                  </Typography>
                  <Select
                    value={filterGender}
                    onChange={(e: SelectChangeEvent) =>
                      setFilterGender(e.target.value)
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Accent
                  </Typography>
                  <Select
                    value={filterAccent}
                    onChange={(e: SelectChangeEvent) =>
                      setFilterAccent(e.target.value)
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    {getUniqueAccents().map((accent) => (
                      <MenuItem key={accent} value={accent}>
                        {accent.charAt(0).toUpperCase() +
                          accent.slice(1).replace('-', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Use Cases
                  </Typography>
                  <Select
                    value={filterUseCase}
                    onChange={(e: SelectChangeEvent) =>
                      setFilterUseCase(e.target.value)
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    {getUniqueUseCases().map((useCase) => (
                      <MenuItem key={useCase} value={useCase}>
                        {useCase.charAt(0).toUpperCase() +
                          useCase.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Voice List */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Select Voice ({getFilteredVoices().length} available)
              </Typography>
              {selectedVoice?.name && (
                <Chip
                  color="secondary"
                  label={`Selected ${selectedVoice?.name}`}
                />
              )}
            </Box>
            <Box
              sx={{
                maxHeight: 300,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {getFilteredVoices().map((voice) => (
                <Card
                  key={voice.voice_id}
                  sx={{
                    m: 1,
                    cursor: 'pointer',
                    border:
                      settings.selectedElevenLabsVoiceId === voice.voice_id
                        ? 2
                        : 1,
                    borderColor:
                      settings.selectedElevenLabsVoiceId === voice.voice_id
                        ? 'primary.main'
                        : 'divider',
                    '&:hover': {
                      borderColor: 'primary.light',
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => handleVoiceSelect(voice.voice_id)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{ bgcolor: getGenderColor(voice.labels.gender) }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {voice.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {voice.labels.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {voice?.category && (
                            <Chip
                              size="small"
                              label={voice.category}
                              color={getCategoryColor(voice.category)}
                            />
                          )}
                          {voice?.labels?.gender && (
                            <Chip size="small" label={voice.labels.gender} />
                          )}
                          {voice?.labels?.age && (
                            <Chip size="small" label={voice.labels.age} />
                          )}
                          {voice?.labels?.accent && (
                            <Chip
                              size="small"
                              label={voice.labels.accent.replace('-', ' ')}
                              variant="outlined"
                            />
                          )}
                          {voice?.labels?.use_case && (
                            <Chip
                              size="small"
                              label={voice.labels.use_case.replace('_', ' ')}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(voice.voice_id, voice.preview_url);
                        }}
                        disabled={
                          isPlaying && currentVoiceId !== voice.voice_id
                        }
                        color={
                          isPlaying && currentVoiceId === voice.voice_id
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {isPlaying && currentVoiceId === voice.voice_id ? (
                          <StopIcon />
                        ) : (
                          <PlayIcon />
                        )}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Voice Settings */}
          {selectedVoice && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Voice Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Stability: {(settings.stability * 100).toFixed(0)}%
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: 'block' }}
                  >
                    Controls the consistency of the voice
                  </Typography>
                  <Slider
                    value={settings.stability}
                    onChange={(_, value) =>
                      setSettings((prev) => ({
                        ...prev,
                        stability: value as number,
                      }))
                    }
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Similarity Boost:{' '}
                    {(settings.similarityBoost * 100).toFixed(0)}%
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: 'block' }}
                  >
                    Controls the similarity to the original voice
                  </Typography>
                  <Slider
                    value={settings.similarityBoost}
                    onChange={(_, value) =>
                      setSettings((prev) => ({
                        ...prev,
                        similarityBoost: value as number,
                      }))
                    }
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant="text"
              onClick={onDeactivate}
              disabled={elevenLabsLoading}
              sx={{ mr: 1 }}
            >
              <DeleteIcon color="error" />
              Deactivate integration
            </Button>

            <Box>
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={elevenLabsLoading}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!selectedVoice?.name || elevenLabsLoading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  '&.Mui-disabled': {
                    color:
                      resolvedMode == 'dark'
                        ? theme.palette.grey[400]
                        : theme.palette.grey[500],
                  },
                }}
              >
                {elevenLabsLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    Saving...
                  </Box>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}
