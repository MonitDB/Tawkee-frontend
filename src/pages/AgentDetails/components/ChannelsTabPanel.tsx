import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Agent } from '../../../context/AgentsContext';
import { Channel } from '../../../services/channelService';

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
  Button
} from '@mui/material';
import { LinkOff, DeleteForever } from '@mui/icons-material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../../../context/AuthContext';

interface ChannelsTabPanelProps {
  agentData: Agent | null;
  QRCode?: string;
  handleRefreshQrCode: (channelId: string) => Promise<void>;
  disconnectChannel: (agentId: string, channelId: string) => Promise<void>; // Assuming return type
  channelQRCodeLoading: boolean;
}

export default function ChannelsTabPanel({
  agentData,
  QRCode,
  handleRefreshQrCode,
  disconnectChannel,
  channelQRCodeLoading,
}: ChannelsTabPanelProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  if (!agentData) return null;

  const { user, can } = useAuth();

  const canConnectToChannel = can('CONNECT_CHANNEL', 'AGENT');
  const canConnectToChannelAsAdmin = can('CONNECT_CHANNEL_AS_ADMIN', 'AGENT');

  const userBelongsToWorkspace = user?.workspaceId === agentData.workspaceId;

  const disconnectedChannel = useMemo(
    () => agentData.channels?.find((channel: Channel) => !channel.connected),
    [agentData.channels]
  );
 
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Channels
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
                { userBelongsToWorkspace ?
                  !canConnectToChannel && (
                  <Tooltip
                    title={channel.connected
                      ? "You cannot disconnect agents of the workspace from channels."
                      : "You cannot connect agents of the workspace to channels."
                    }
                    placement='right'
                  >
                    <InfoIcon color='warning' />
                  </Tooltip>
                ) : !canConnectToChannelAsAdmin && (
                  <Tooltip
                    title={channel.connected
                      ? "Your admin privileges to disconnect agents of any workspace from channels has been revoked."
                      : "Your admin privileges to connect agents of any workspace to channels has been revoked."
                    }
                    placement='right'
                  >
                    <InfoIcon color='warning' />
                  </Tooltip>
                )}
                {channel.connected ? (
                  <IconButton
                    onClick={() => {
                      disconnectChannel(agentData.id, channel.id);
                    }}
                    color="primary"
                    disabled={channelQRCodeLoading
                      ? true
                      : userBelongsToWorkspace
                        ? !canConnectToChannel
                        : !canConnectToChannelAsAdmin
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
                    <Tooltip title="Disconnect">
                      <LinkOff />
                    </Tooltip>
                  </IconButton>
                ) : (                 
                  <IconButton
                    onClick={() => handleRefreshQrCode(channel.id)}
                    color="primary"
                    disabled={channelQRCodeLoading
                      ? true
                      : userBelongsToWorkspace
                        ? !canConnectToChannel
                        : !canConnectToChannelAsAdmin
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
                  <Tooltip title="Delete Channel">
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
