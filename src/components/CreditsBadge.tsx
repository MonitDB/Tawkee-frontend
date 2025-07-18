import { useAuth } from '../context/AuthContext';
import { Box, Chip, Typography, Skeleton } from '@mui/material';
import { useDeferredValue, useState, useEffect } from 'react';

export default function CreditsBadge() {
  const { workspacePlanCredits, workspaceExtraCredits } = useAuth();
  const workspaceCredits = workspacePlanCredits + workspaceExtraCredits;

  const [pendingCredits, setPendingCredits] =
    useState<number>(workspaceCredits);
  const deferredCredits = useDeferredValue(pendingCredits);

  useEffect(() => {
    if (workspaceCredits !== pendingCredits) {
      setPendingCredits(workspaceCredits);
    }
  }, [workspaceCredits, pendingCredits]);

  const isUpdating = pendingCredits !== deferredCredits;

  const chipColor =
    workspaceCredits > 1000
      ? 'success'
      : workspaceCredits > 500
        ? 'warning'
        : 'error';

  return isUpdating ? (
    <Skeleton variant="rounded" width={100} height={32} />
  ) : (
    <Chip
      color={chipColor}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" fontWeight="bold">
            {workspaceCredits == Infinity
              ? 'unlimited'
              : workspaceCredits.toLocaleString('en-US')}
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
