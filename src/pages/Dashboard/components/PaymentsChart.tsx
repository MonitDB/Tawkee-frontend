import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Typography,
  Skeleton,
  Box,
  Stack,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo, useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useAuth } from '../../../context/AuthContext';
import { useStripeService } from '../../../hooks/useStripeService';

dayjs.extend(isSameOrBefore);

interface PaymentChartProps {
  workspaceId: string | null;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

function generateDateRange(startDate: string, endDate: string): string[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const range: string[] = [];

  for (let d = start; d.isSameOrBefore(end); d = d.add(1, 'day')) {
    range.push(d.format('YYYY-MM-DD'));
  }

  return range;
}

export default function PaymentsChart({
  workspaceId,
  startDate,
  endDate,
}: PaymentChartProps) {
  const theme = useTheme();
  const { token } = useAuth();
  const { getWorkspacePaymentsInPeriod } = useStripeService(token as string);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return; // Ensure safe access

      setLoading(true);
      try {
        const response = await getWorkspacePaymentsInPeriod(
          workspaceId,
          startDate.toISOString(),
          endDate.toISOString()
        );
        setData(response);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [workspaceId, startDate, endDate, getWorkspacePaymentsInPeriod]);

  const filledData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const map = new Map(data.map((d) => [d.date, d]));
    return generateDateRange(
      startDate.toISOString(),
      endDate.toISOString()
    ).map(
      (date) =>
        map.get(date) || { date, planAmount: 0, oneTimeAmount: 0, total: 0 }
    );
  }, [data, startDate, endDate]);

  const labels = filledData.map((d) => d.date);
  const totalSeries = filledData.map((d) => d.total / 100);
  const planSeries = filledData.map((d) => d.planAmount / 100);
  const oneTimeSeries = filledData.map((d) => d.oneTimeAmount / 100);

  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%', minHeight: 300, flex: 1 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography component="h2" variant="subtitle2">
            Payments Breakdown
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
          Cumulative daily totals (USD)
        </Typography>

        <Box sx={{ flex: 1, height: 300 }}>
          {loading ? (
            <Skeleton variant="rectangular" height="100%" />
          ) : totalSeries.every((v) => v === 0) ? (
            <Box sx={{ textAlign: 'center', pt: 4, fontStyle: 'italic' }}>
              No payment data available for the selected period.
            </Box>
          ) : (
            <LineChart
              xAxis={[{ scaleType: 'point', data: labels }]}
              yAxis={[{ valueFormatter: (v: number) => `$${v.toFixed(0)}` }]}
              series={[
                {
                  id: 'total',
                  label: 'Total',
                  data: totalSeries,
                  area: true,
                  curve: 'bumpX',
                  showMark: false,
                },
                {
                  id: 'plan',
                  label: 'Plan',
                  data: planSeries,
                  area: true,
                  curve: 'bumpX',
                  showMark: false,
                },
                {
                  id: 'oneTime',
                  label: 'One-Time',
                  data: oneTimeSeries,
                  area: true,
                  curve: 'bumpX',
                  showMark: false,
                },
              ]}
              colors={colorPalette}
              grid={{ horizontal: true }}
              margin={{ top: 20, bottom: 20, left: 40, right: 20 }}
              height={280}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
