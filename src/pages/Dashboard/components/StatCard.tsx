import {
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Box,
} from '@mui/material';
import { useState, useRef } from 'react';

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  interactions?: {
    id: string;
    userName: string | null;
    whatsappPhone: string | null;
    isWaiting: boolean;
  }[];
};

export default function StatCard({
  title,
  value,
  interval,
  trend,
  trendValue,
  interactions,
}: StatCardProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeout = useRef<number | null>(null);

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  const trendLabel =
    trendValue !== undefined ? `${trendValue > 0 ? '+' : ''}${trendValue}%` : '';

  const handleEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovering(true);
    if (wrapperRef.current) setAnchorEl(wrapperRef.current);
  };

  const handleLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHovering(false);
      setAnchorEl(null);
    }, 150); // slight delay to allow cursor transition
  };

  return (
    <Box
      ref={wrapperRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      sx={{ display: 'inline-block', width: '100%' }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography component="h2" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Stack spacing={0.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h4" component="p">
                {value}
              </Typography>
              {trend && trendLabel && (
                <Chip
                  size="small"
                  color={labelColors[trend]}
                  label={trendLabel}
                />
              )}
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {interval}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {interactions && interactions.length > 0 && (
        <Popover
          open={hovering}
          anchorEl={anchorEl}
          onClose={() => setHovering(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          disableRestoreFocus
          PaperProps={{
            onMouseEnter: handleEnter,
            onMouseLeave: handleLeave,
            sx: {
              pointerEvents: 'auto',
              maxHeight: 240,
              overflowY: 'auto',
              mt: 1,
              minWidth: 250,
            },
          }}
        >
          <List dense>
            {interactions.map((interaction) => (
              <ListItemButton
                key={interaction.id}
                onClick={() => {
                  window.location.href = `/chats/${interaction.id}`;
                }}
              >
                <ListItemText
                  primary={interaction.userName || 'Unnamed User'}
                  secondary={interaction.whatsappPhone || interaction.id}
                />
              </ListItemButton>
            ))}
          </List>
        </Popover>
      )}
    </Box>
  );
}
