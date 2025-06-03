import {
  useState,
  useEffect,
  SyntheticEvent,
  MouseEvent,
  ChangeEvent,
} from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  useColorScheme,
  Pagination,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
  Language as LanguageIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Agent } from '../../../context/AgentsContext';
import { useTrainingService } from '../../../hooks/useTrainingService';
import { useAuth } from '../../../context/AuthContext';
import {
  CreateTrainingDto,
  defaultPaginatedResponse,
  PaginatedTrainingsResponseDto,
  TrainingDto,
} from '../../../services/trainingService';
import LoadingBackdrop from '../../../components/LoadingBackdrop';
import CreateTrainingDialog from './CreateTrainingDialog';

interface TrainingTabPanelProps {
  agentData: Agent | null;
}

export default function TrainingTabPanel({ agentData }: TrainingTabPanelProps) {
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { token } = useAuth();
  const { fetchTrainings, createTraining, deleteTraining, loading, createTrainingLoading } =
    useTrainingService(token as string);

  const [page, setPage] = useState<number>(
    agentData?.paginatedTrainings?.meta?.page || 1
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<TrainingDto | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false);

  const [activeTab, setActiveTab] = useState<
    'all' | 'TEXT' | 'DOCUMENT' | 'WEBSITE' | 'VIDEO'
  >('all');

  const [trainingData, setTrainingData] =
    useState<PaginatedTrainingsResponseDto>(defaultPaginatedResponse);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange =
    (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  useEffect(() => {
    const fetchTrainingData = async (agentId: string) => {
      const paginatedTrainings = await fetchTrainings(agentId, page);
      setTrainingData(paginatedTrainings as PaginatedTrainingsResponseDto);
    };

    if (!agentData) return;

    const paginated = agentData.paginatedTrainings;

    // If data exists and is for the right page, use it
    if (paginated && paginated.meta.page === page) {
      if (trainingData !== paginated) {
        setTrainingData(paginated);
      }
    } else {
      // Fetch from API
      fetchTrainingData(agentData.id);
    }
  }, [agentData?.paginatedTrainings?.data, page]);

  const handleMenuClick = (
    event: MouseEvent<HTMLElement>,
    item: TrainingDto
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return <ArticleIcon />;
      case 'WEBSITE':
        return <LanguageIcon />;
      case 'VIDEO':
        return <VideoIcon />;
      case 'DOCUMENT':
        return <DocumentIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const getTypeColor = (
    type: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (type) {
      case 'TEXT':
        return 'primary';
      case 'WEBSITE':
        return 'info';
      case 'VIDEO':
        return 'error';
      case 'DOCUMENT':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisplayText = (item: TrainingDto) => {
    switch (item.type) {
      case 'TEXT':
        return item.text || 'Text without content';
      case 'WEBSITE':
        return item.website || 'URL not specified';
      case 'VIDEO':
        // Check if video is a data URL
        return item.documentName
          ? item.documentName
          : item.video || 'Unnamed video';
      case 'DOCUMENT':
        return item.documentName || 'Unnamed document';
      default:
        return 'Content not specified';
    }
  };

  const getMimeTypeExtension = (mimetype: string): string => {
    const mimeTypeMap: Record<string, string> = {
      // Document types
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'text/plain': 'TXT',
      'text/html': 'HTML',
      'application/msword': 'DOC',
      'application/vnd.oasis.opendocument.text': 'ODT',
      'application/rtf': 'RTF',
      
      // Image types
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
      'image/tiff': 'TIFF',
      
      // Video types
      'video/mp4': 'MP4',
      'video/avi': 'AVI',
      'video/quicktime': 'MOV',
      'video/x-msvideo': 'AVI',
      'video/webm': 'WEBM',
      'video/ogg': 'OGV',
      'video/3gpp': '3GP',
      'video/x-flv': 'FLV',
      'video/x-ms-wmv': 'WMV',
      'video/mp2t': 'TS',
      'video/x-matroska': 'MKV'
    };

    return mimeTypeMap[mimetype] || 'Unknown extension';
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmitTraining = (training: CreateTrainingDto) => {
    console.log('handleSubmitTraining...')
    createTraining(agentData?.id as string, training);
  };

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const filteredData = trainingData.data.filter((item) => {
    const matchesSearch = getDisplayText(item)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabCounts = {
    all: trainingData.data.length,
    TEXT: trainingData.data.filter((item) => item.type === 'TEXT').length,
    DOCUMENT: trainingData.data.filter((item) => item.type === 'DOCUMENT')
      .length,
    VIDEO: trainingData.data.filter((item) => item.type === 'VIDEO').length,
    WEBSITE: trainingData.data.filter((item) => item.type === 'WEBSITE').length,
  };

  if (!agentData) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Training material
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            textTransform: 'none',
            px: 3,
          }}
          onClick={() => setDialogOpen(true)}
        >
          New Training
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search for training material..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              color: resolvedMode == 'dark' ? 'white' : 'dark',
              fontWeight: 800,
            },
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          {(['all', 'TEXT', 'DOCUMENT', 'WEBSITE', 'VIDEO'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'contained' : 'text'}
              size="small"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                minWidth: 'auto',
                px: 2,
                py: 1,
                color: activeTab === tab ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor:
                    activeTab === tab ? '#5855eb' : 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              {tab === 'all' ? 'All' : tab.toLowerCase()}
              <Chip
                label={tabCounts[tab]}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: '0.75rem',
                }}
              />
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Content */}
      {loading || createTrainingLoading && (
        <LinearProgress color="secondary" sx={{ width: '100%', margin: 1 }} />
      )}
      {filteredData.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {loading || createTrainingLoading
            ? loading ? 'Fetching data...' : 'Processing and storing training data...'
            : searchQuery
              ? 'No training found for this search.'
              : 'No training registered yet.'}
        </Alert>
      ) : (
        <Stack spacing={1}>
          {' '}
          {/* Reduced spacing for Accordions */}
          {filteredData.map((item) => (
            <Accordion
              key={item.id}
              expanded={expanded === `panel-${item.id}`}
              onChange={handleChange(`panel-${item.id}`)}
              sx={
                {
                  // Optional: Add subtle border back if desired
                  // border: '1px solid #e5e7eb',
                  // boxShadow: 'none', // Remove default elevation if needed
                  // '&:before': { display: 'none' }, // Remove top border divider
                  // '&.Mui-expanded': { margin: '8px 0' } // Adjust margin when expanded
                }
              }
              disableGutters // Removes default padding
              elevation={1} // Add slight elevation like cards
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${item.id}-content`}
                id={`panel-${item.id}-header`}
                sx={{
                  // Mimic CardContent padding and layout
                  p: 2, // Adjust padding as needed
                  alignItems: 'flex-start',
                  '& .MuiAccordionSummary-content': {
                    margin: 0, // Reset default margin
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                  },
                }}
              >
                {/* Icon/Avatar (from original CardContent) */}
                <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                  {' '}
                  {/* Added slight margin top for alignment */}
                  {item.image ? (
                    <Avatar src={item.image} sx={{ width: 40, height: 40 }} /> // Slightly smaller avatar
                  ) : (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${getTypeColor(item.type)}.main`,
                      }}
                    >
                      {getTypeIcon(item.type)}
                    </Avatar>
                  )}
                </Box>

                {/* Main Content for Summary (from original CardContent) */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Chip
                      label={item.type.toLowerCase()}
                      size="small"
                      color={getTypeColor(item.type)}
                      variant="outlined"
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.createdAt)}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2, // Keep truncated text in summary
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4,
                    }}
                  >
                    {getDisplayText(item)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, pt: 1 }}>
                {' '}
                {/* Adjust padding */}
                {/* Full Text */}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {getDisplayText(item)} {/* Display full text here */}
                </Typography>
                {/* Additional info + Menu (from original CardContent) */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    gap={1}
                  >
                    {' '}
                    {/* Use smaller spacing and wrap */}
                    {item.website && (
                      <Tooltip title="Visit website">
                        <Chip
                          icon={<LinkIcon fontSize="small" />}
                          label="Website"
                          size="small"
                          clickable
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent Accordion toggle
                            window.open(item.website!, '_blank');
                          }}
                        />
                      </Tooltip>
                    )}
                    {item.documentUrl && (
                      <Tooltip title="Download document">
                        <Chip
                          icon={<DocumentIcon fontSize="small" />}
                          label={getMimeTypeExtension(
                            item.documentMimetype as string
                          )}
                          size="small"
                          clickable
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent Accordion toggle
                            window.open(item.documentUrl!, '_blank');
                          }}
                        />
                      </Tooltip>
                    )}
                    {item.video && (
                      <Chip
                        icon={<VideoIcon fontSize="small" />}
                        label={getMimeTypeExtension(
                          item.documentMimetype as string
                        )}
                        size="small"
                        variant="outlined"
                      />
                    )}                    
                  </Stack>

                  {/* Menu Button */}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent Accordion toggle
                      handleMenuClick(e, item);
                    }}
                    sx={{ color: 'text.secondary' }}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <Typography sx={{ mr: 2 }}>
              Total: {filteredData.length} training material
              {filteredData.length > 1 ? 's' : ''}
            </Typography>
            <Pagination
              count={trainingData.meta.totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
          <LoadingBackdrop open={loading} />
        </Stack>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            deleteTraining(agentData.id, selectedItem?.id as string);
            handleMenuClose();
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: 'error.light' }} />
          Delete
        </MenuItem>
      </Menu>

      <CreateTrainingDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitTraining}
      />
    </Box>
  );
}
