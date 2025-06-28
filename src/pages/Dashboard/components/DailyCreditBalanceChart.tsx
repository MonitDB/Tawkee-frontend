import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { CurveType } from '@mui/x-charts/models';
import { Box } from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardService } from '../../../hooks/useDashboardService';
import { DailyCreditBalanceItem } from '../../../services/dashboardService';

dayjs.extend(isSameOrBefore);

interface DailyCreditBalanceChartProps {
  startDate: string;
  endDate: string;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function formatRelative(dateStr: string): string {
  const today = new Date();
  const target = new Date(`${dateStr}T00:00:00Z`);
  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return '';
}

export default function DailyCreditBalanceChart({
  startDate,
  endDate,
}: DailyCreditBalanceChartProps) {
  const theme = useTheme();
  const { token, user } = useAuth();
  const { fetchDailyCreditBalance } = useDashboardService(token as string);

  const [data, setData] = useState<DailyCreditBalanceItem[]>([]);

  useEffect(() => {
    fetchDailyCreditBalance(user?.workspaceId as string, startDate, endDate)
      .then(setData)
      .catch(() => setData([]));
  }, [user?.workspaceId, startDate, endDate, fetchDailyCreditBalance]);

  const labels = useMemo(() => data.map((d) => d.date), [data]);
  const planSeries = data.map((d) => d.planCreditsRemaining);
  const extraSeries = data.map((d) => d.extraCreditsRemaining);

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minHeight: 300,
        maxHeight: 1000,
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Daily Credit Balance
        </Typography>
        <Box sx={{ flex: 1, height: '100%' }}>
          <LineChart
            xAxis={[
              {
                scaleType: 'point',
                data: labels,
                valueFormatter: (value) => {
                  const date = new Date(`${value}T00:00:00Z`);
                  const label = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                  });
                  const relative = formatRelative(value);
                  return relative ? `${label} (${relative})` : label;
                },
                tickInterval: (_, i) => (i + 1) % 2 === 0,
              },
            ]}
            yAxis={[
              {
                tickMinStep: 1,
                valueFormatter: (value: number) => `${Math.round(value)}`,
              },
            ]}
            series={[
              {
                id: 'plan',
                label: 'Plan Credits',
                data: planSeries,
                showMark: false,
                curve: 'bumpX' as CurveType,
                area: true,
                stack: 'total',
              },
              {
                id: 'extra',
                label: 'Extra Credits',
                data: extraSeries,
                showMark: false,
                curve: 'bumpX' as CurveType,
                area: true,
                stack: 'total',
              },
            ]}
            colors={[theme.palette.primary.main, theme.palette.success.main]}
            margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
            grid={{ horizontal: true }}
            sx={{
              height: '99.4%',
              '& .MuiAreaElement-series-plan': {
                fill: 'url(#plan)',
              },
              '& .MuiAreaElement-series-extra': {
                fill: 'url(#extra)',
              },
            }}
          >
            <Fragment>
              <AreaGradient color={theme.palette.primary.main} id="plan" />
              <AreaGradient color={theme.palette.success.main} id="extra" />
            </Fragment>
          </LineChart>
        </Box>
      </CardContent>
    </Card>
  );
}
