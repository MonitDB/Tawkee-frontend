import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  useTheme,
  useColorScheme,
  Button,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Agent } from '../../../context/AgentsContext';
import { Channel } from '../../../services/channelService';
import { LinkOff, DeleteForever } from '@mui/icons-material';
import QrCode2Icon from '@mui/icons-material/QrCode2';

interface IntegrationsTabPanelProps {
  agentData: Agent | null;
  QRCode?: string;
  handleRefreshQrCode: (channelId: string) => Promise<void>;
  disconnectChannel: (agentId: string, channelId: string) => Promise<void>; // Assuming return type
  channelQRCodeLoading: boolean;
}

export default function IntegrationsTabPanel({
  agentData,
  QRCode,
  handleRefreshQrCode,
  disconnectChannel,
  channelQRCodeLoading,
}: IntegrationsTabPanelProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  if (!agentData) return null;

  const disconnectedChannel = agentData.channels?.find(
    (channel: Channel) => !channel.connected
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Integrations
      </Typography>
      {disconnectedChannel && QRCode && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="subtitle1">
            Connect to {disconnectedChannel.name} Channel
          </Typography>
          <QRCodeSVG
            value={QRCode}
            size={384}
            bgColor={resolvedMode === 'dark' ? '#121212' : '#ffffff'}
            fgColor={resolvedMode === 'dark' ? '#ffffff' : '#000000'}
            level={'H'}
            marginSize={4}
          />
          <Typography variant="caption">
            Scan this QR code with the corresponding application.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => handleRefreshQrCode(disconnectedChannel.id)}
          >
            Refresh QR code
          </Button>
        </Box>
      )}
      <Grid container spacing={2}>
        {agentData.channels.map((channel: Channel) => (
          <Grid key={channel.id} size={{ xs: 12 }}>
            <Card
              variant="outlined"
              sx={{
                display: 'flex',
                height: '100%',
                borderLeft: `4px solid ${
                  channel.connected
                    ? agentData.isActive
                      ? theme.palette.success.main
                      : theme.palette.warning.main
                    : theme.palette.error.main
                }`,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: channel.connected
                        ? agentData.isActive
                          ? theme.palette.success.main
                          : theme.palette.warning.main
                        : theme.palette.error.main,
                      mr: 1,
                    }}
                  />
                  <Typography variant="h6" component="div">
                    {channel.name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'flex', gap: '8px' }}
                >
                  <Chip label={channel.type} />
                  <Divider orientation="vertical" flexItem />
                  <Chip
                    color={
                      channel.connected
                        ? agentData.isActive
                          ? 'success'
                          : 'warning'
                        : 'error'
                    }
                    label={
                      channel.connected
                        ? agentData.isActive
                          ? 'Connected'
                          : 'Connected but inactive'
                        : 'Disconnected'
                    }
                  />
                </Typography>
              </CardContent>
              <CardActions>
                {channel.connected ? (
                  <IconButton
                    onClick={() => {
                      disconnectChannel(agentData.id, channel.id);
                    }}
                    color="primary"
                  >
                    <Tooltip title="Disconnect">
                      <LinkOff />
                    </Tooltip>
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => handleRefreshQrCode(channel.id)}
                    color="primary"
                    disabled={channelQRCodeLoading} // Disable while loading QR code
                  >
                    <Tooltip title="Refresh QR Code To Connect">
                      <QrCode2Icon />
                    </Tooltip>
                  </IconButton>
                )}
                <IconButton
                  disabled // Deletion might be handled elsewhere or needs confirmation
                  //   onClick={() => handleDeleteChannel(agentData.id, channel.id)}
                  color="error"
                >
                  <Tooltip title="Delete Channel (Not implemented)">
                    <DeleteForever />
                  </Tooltip>
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
