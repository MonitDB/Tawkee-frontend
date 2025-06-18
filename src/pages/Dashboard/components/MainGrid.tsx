import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button, ButtonGroup, useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DashboardIcon from '@mui/icons-material/Dashboard';

import StatCard from './StatCard';
import ResolvedChart from './ResolvedChart';
import TopAgentsBarChart from './TopAgentsBarChart';
import TopModelsBarChart from './TopModelsBarChart';
import CreditsPerDayChart from './CreditsPerDayChart';
import { useDashboardService } from '../../../hooks/useDashboardService';
import { useAuth } from '../../../context/AuthContext';
import { DashboardMetricsDto } from '../../../services/dashboardService';

const ranges = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

export default function MainGrid() {
  const theme = useTheme();
  
  const { token, user } = useAuth();
  const { fetchDashboardMetrics, loading } = useDashboardService(token as string);

  const [selectedRange, setSelectedRange] = useState<number>(7);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardMetricsDto | null>(null);

  const fetchData = async (start: Dayjs, end: Dayjs) => {
    try {
      const data = await fetchDashboardMetrics(
        user?.workspaceId as string,
        start.format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD')
      );
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  // Initialize date range and fetch data on mount or when selectedRange changes
  useEffect(() => {
    if (selectedRange == -1) return;

    const today = dayjs();
    const newStart = today.subtract(selectedRange - 1, 'day');
    setStartDate(newStart);
    setEndDate(today);
    fetchData(newStart, today);
  }, [selectedRange]);

  const handleRangeChange = (days: number) => {
    setSelectedRange(days);
  };

  const handleCustomDateChange = async (newValue: Dayjs | null, type: 'start' | 'end') => {
    console.log({newValue, type})
    if (!newValue) return;

    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (type === 'start') {
      finalStartDate = newValue;
      setStartDate(newValue);

      if (endDate && newValue.isAfter(endDate, 'day')) {
        const adjustedEnd = newValue.endOf('month');
        finalEndDate = adjustedEnd;
        setEndDate(adjustedEnd);
      }
    } else {
      finalEndDate = newValue;
      setEndDate(newValue);

      if (startDate && newValue.isBefore(startDate, 'day')) {
        const adjustedStart = newValue.startOf('month');
        finalStartDate = adjustedStart;
        setStartDate(adjustedStart);
      }
    }

    setSelectedRange(-1); // Deselect preset

    // Fetch data with the final calculated dates
    if (finalStartDate && finalEndDate) {
      await fetchData(finalStartDate, finalEndDate);
    }
  };

  const data = dashboardData;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <Typography
            variant="h4"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: '1.5rem',
                height: '1.5rem',
                bgcolor: 'black',
                borderRadius: '999px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'hsla(210, 100%, 95%, 0.9)',
                border: '1px solid',
                borderColor: 'hsl(210, 100%, 55%)',
                boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
              }}
            >
              <DashboardIcon color="inherit" sx={{ fontSize: '1rem' }} />
            </Box>
            Interactions
          </Typography>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'flex-end' }} >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'flex-end' }} >
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => handleCustomDateChange(newValue, 'start')}
                sx={{ width: { xs: '100%', md: 'fit-content'}}}
              />

              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => handleCustomDateChange(newValue, 'end')}
                sx={{ width: { xs: '100%', md: 'fit-content'}}}
              />
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
              <ButtonGroup variant="outlined" size="small">
                {ranges.map((range) => (
                  <Button
                    key={range.days}
                    onClick={() => handleRangeChange(range.days)}
                    variant={selectedRange === range.days ? 'contained' : 'outlined'}
                  >
                    {range.label}
                  </Button>
                ))}
              </ButtonGroup>           
            </Box>
          </Stack>

        </Box>

        { data && (
          <>
            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
              <Grid size={{ xs: 12, md: 3}}>
                <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} sx={{ height: '100%', justifyContent: 'center', gap: 2, flex: 1 }}>
                  <StatCard
                    title="In Progress"
                    value={data.running.total.toString()}
                    interval="Current"
                    interactions={data.running.interactions}
                    loading={loading}
                  />
                  <StatCard
                    title="Waiting for Reply"
                    value={data.running.waiting.toString()}
                    interval="Current"
                    interactions={data.running.interactions.filter(i => i.isWaiting)}
                    loading={loading}
                  />
                  <StatCard
                    title="Average Interaction Time"
                    value={`${Math.floor(data.avgInteractionTimeMs / 60000)}min`}
                    interval="Current"
                    trend={data.avgTimeTrend >= 0 ? 'up' : 'down'}
                    trendValue={data.avgTimeTrend}
                    loading={loading}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 9}}>
                <ResolvedChart
                  data={data.resolved}
                  loading={loading}
                  startDate={startDate?.format('YYYY-MM-DD') ?? ''}
                  endDate={endDate?.format('YYYY-MM-DD') ?? ''}
                />
              </Grid>
            </Grid>

            <Typography
              variant="h4"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}
            >
              <Box
                sx={{
                  width: '1.5rem',
                  height: '1.5rem',
                  bgcolor: 'black',
                  borderRadius: '999px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'hsla(210, 100%, 95%, 0.9)',
                  border: '1px solid',
                  borderColor: 'hsl(210, 100%, 55%)',
                  boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
                }}
              >
                <DashboardIcon color="inherit" sx={{ fontSize: '1rem' }} />
              </Box>
              Credits
            </Typography>

            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
              <Grid size={{ xs: 12, md: 3}}>
                <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} sx={{ height: '100%', justifyContent: 'center', gap: 2, flex: 1 }}>
                  <TopAgentsBarChart data={data.topAgents} />
                  <TopModelsBarChart data={data.topModels} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 9}}>
                <CreditsPerDayChart
                  data={data.creditsPerDay}
                  startDate={startDate?.format('YYYY-MM-DD') ?? ''}
                  endDate={endDate?.format('YYYY-MM-DD') ?? ''}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
}
