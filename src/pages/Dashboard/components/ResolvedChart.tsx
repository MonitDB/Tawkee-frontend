import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  Box,
  Stack,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo } from 'react';
import dayjs from 'dayjs';

import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

type TimeSeriesPoint = {
  date: string;
  total: number;
  byAI: number;
  byHuman: number;
};

type ResolvedChartProps = {
  data: {
    timeSeries: TimeSeriesPoint[];
    trend: {
      total: number;
      byAI: number;
      byHuman: number;
    };
  };
  startDate: string;
  endDate: string;
  loading?: boolean;
};

function generateDateRange(startDate: string, endDate: string): string[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const range: string[] = [];

  for (let d = start; d.isSameOrBefore(end); d = d.add(1, 'day')) {
    range.push(d.format('YYYY-MM-DD'));
  }

  return range;
}

function fillMissingDates(
  data: TimeSeriesPoint[],
  startDate: string,
  endDate: string
): TimeSeriesPoint[] {
  const allDates = generateDateRange(startDate, endDate);
  const dataMap = new Map(data.map((d) => [d.date, d]));

  return allDates.map((date) => {
    return (
      dataMap.get(date) || {
        date,
        total: 0,
        byAI: 0,
        byHuman: 0,
      }
    );
  });
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

export default function ResolvedChart({
  data,
  startDate,
  endDate,
  loading = false,
}: ResolvedChartProps) {
  const theme = useTheme();

  const adjustedTimeSeries = useMemo(
    () => fillMissingDates(data.timeSeries, startDate, endDate),
    [data.timeSeries, startDate, endDate]
  );

  const labels = useMemo(() => adjustedTimeSeries.map((d) => d.date), [adjustedTimeSeries]);

  const totals = adjustedTimeSeries.map((d) => d.total);
  const ai = adjustedTimeSeries.map((d) => d.byAI);
  const human = adjustedTimeSeries.map((d) => d.byHuman);

  const totalSum = totals.reduce((acc, val) => acc + val, 0);
  const aiSum = ai.reduce((acc, val) => acc + val, 0);
  const humanSum = human.reduce((acc, val) => acc + val, 0);

  const colorPalette = [
    theme.palette.grey[700],
    theme.palette.success.main,
    theme.palette.warning.main,
  ];

  const trendLabel = (value: number) => `${value > 0 ? '+' : ''}${value}%`;

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minHeight: 300,
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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography component="h2" variant="subtitle2" gutterBottom>
            Resolved Interactions
          </Typography>
          <Stack direction="row" spacing={1}>
            {loading ? (
              <>
                <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 16 }} />
                <Skeleton variant="rounded" width={90} height={28} sx={{ borderRadius: 16 }} />
                <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 16 }} />
              </>
            ) : (
              <>
                <Chip
                  size="small"
                  color="default"
                  label={`Total: (${totalSum}) ${trendLabel(data.trend.total)}`}
                />
                <Chip
                  size="small"
                  color="success"
                  label={`AI: (${aiSum}) ${trendLabel(data.trend.byAI)}`}
                />
                <Chip
                  size="small"
                  color="warning"
                  label={`Human: (${humanSum}) ${trendLabel(data.trend.byHuman)}`}
                />
              </>
            )}
          </Stack>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
          Based on historical time series
        </Typography>

        <Box sx={{ flex: 1, height: '100%' }}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height="100%"
              sx={{ borderRadius: 2 }}
            />
          ) : totals.length === 0 || (totals.every(v => v === 0) && ai.every(v => v === 0) && human.every(v => v === 0)) ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                textAlign: 'center',
                px: 2,
              }}
            >
              No interaction data available for the selected period.
            </Box>
          ) : (
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
                  id: 'total',
                  label: `Total`,
                  data: totals,
                  showMark: false,
                  curve: 'bumpX',
                  area: true,
                },
                {
                  id: 'ai',
                  label: `By AI`,
                  data: ai,
                  showMark: false,
                  curve: 'bumpX',
                  area: true,
                },
                {
                  id: 'human',
                  label: `By Human`,
                  data: human,
                  showMark: false,
                  curve: 'bumpX',
                  area: true,
                },
              ]}
              colors={colorPalette}
              margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
              grid={{ horizontal: true }}
              sx={{
                '& .MuiAreaElement-series-total': {
                  fill: "url('#total')",
                },
                '& .MuiAreaElement-series-ai': {
                  fill: "url('#ai')",
                },
                '& .MuiAreaElement-series-human': {
                  fill: "url('#human')",
                },
                height: '99.4%',
              }}
            >
              <AreaGradient color={colorPalette[0]} id="total" />
              <AreaGradient color={colorPalette[1]} id="ai" />
              <AreaGradient color={colorPalette[2]} id="human" />
            </LineChart>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
