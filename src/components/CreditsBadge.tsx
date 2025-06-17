import { useAuth } from '../context/AuthContext';
import { Box, Chip, Typography, Skeleton } from '@mui/material';
import { useDeferredValue, useState, useEffect } from 'react';

export default function CreditsBadge() {
  const { user } = useAuth();
  const credits = user?.workspaceCredits || 0;

  const [pendingCredits, setPendingCredits] = useState<number>(credits);
  const deferredCredits = useDeferredValue(pendingCredits);

  useEffect(() => {
    if (credits !== pendingCredits) {
      setPendingCredits(credits);
    }
  }, [credits, pendingCredits]);

  const isUpdating = pendingCredits !== deferredCredits;

  const chipColor =
    credits > 1000 ? 'success' : credits > 500 ? 'warning' : 'error';

  return isUpdating ? (
    <Skeleton variant="rounded" width={100} height={32} />
  ) : (
    <Chip
      color={chipColor}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" fontWeight="bold">
            {credits.toLocaleString()}
          </Typography>
          <Typography variant="caption">credits</Typography>
        </Box>
      }
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 3,
        fontWeight: 'bold',
      }}
      size="medium"
    />
  );
}