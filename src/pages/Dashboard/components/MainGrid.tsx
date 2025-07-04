import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Autocomplete, Button, ButtonGroup, Card, CardContent, Skeleton, TextField, useColorScheme, useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DashboardIcon from '@mui/icons-material/Dashboard';

import StatCard from './StatCard';
import ResolvedChart from './ResolvedChart';
import TopConsumersBarChart from './TopConsumersBarChart';
import TopModelsBarChart from './TopModelsBarChart';
import CreditsPerDayChart from './CreditsPerDayChart';
import { useDashboardService } from '../../../hooks/useDashboardService';
import { useAuth } from '../../../context/AuthContext';
import { DashboardMetricsDto } from '../../../services/dashboardService';
import DailyCreditBalanceChart from './DailyCreditBalanceChart';
// import PaymentsChart from './PaymentsChart';

const ranges = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

export default function MainGrid() {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { token, user, isLoggingOutRef, can } = useAuth();
  const { fetchDashboardMetrics, fetchAllWorkspacesBasicInfo, loading } = useDashboardService(
    token as string
  );

  const canViewInteractions = can('VIEW_INTERACTIONS', 'DASHBOARD');
  const canViewCreditRemaining = can('VIEW_CREDIT_REMAINING', 'DASHBOARD');
  const canViewCreditUsage = can('VIEW_CREDIT_USAGE', 'DASHBOARD');

  const canViewPartOfDashboard = canViewInteractions || canViewCreditRemaining || canViewCreditUsage;
  const cannotViewDashboard = !canViewInteractions && !canViewCreditRemaining && !canViewCreditUsage;

  const [workspaceId, setWorkspaceId] = useState<string | null>(user?.workspaceId ?? null);
  const [workspaceOptions, setWorkspaceOptions] = useState<
    { id: string; name: string; email: string | null }[]
  >([]);

  const [selectedRange, setSelectedRange] = useState<number>(7);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [dashboardData, setDashboardData] =
    useState<DashboardMetricsDto | null>(null);

  const fetchData = async (start: Dayjs, end: Dayjs, workspaceId: string | null) => {
    try {
      const data = await fetchDashboardMetrics(
        workspaceId,
        start.format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD')
      );
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  // Fetch list of workspaces
  useEffect(() => {
    if (!isLoggingOutRef.current && user?.role.name == 'ADMIN') {
      // Fetch list of all workspaces
      const fetchOptions = async () => {
        try {
          const all = await fetchAllWorkspacesBasicInfo();
          setWorkspaceOptions(all);
        } catch (err) {
          console.error('Failed to load workspace options:', err);
        }
      };
      fetchOptions();
    }

  }, [user?.role.name, fetchAllWorkspacesBasicInfo]);

  // Initialize date range and fetch data on mount or when selectedRange changes
  useEffect(() => {
    if (selectedRange == -1) return;

    if (!canViewPartOfDashboard) return;

    const today = dayjs();
    const newStart = today.subtract(selectedRange - 1, 'day');
    setStartDate(newStart);
    setEndDate(today);
    fetchData(newStart, today, workspaceId);
  }, [selectedRange]);

  const handleWorkspaceChange = async (
    _: unknown,
    selected: { id: string; name: string; email: string | null } | null
  ) => {
    setWorkspaceId(selected?.id ?? null);
    if (startDate && endDate) {
      if (canViewInteractions || canViewCreditUsage) {
        await fetchData(startDate, endDate, selected?.id ?? null);
      }
    }
  };  

  const handleRangeChange = (days: number) => {
    setSelectedRange(days);
  };

  const handleCustomDateChange = async (
    newValue: Dayjs | null,
    type: 'start' | 'end'
  ) => {
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
      if (canViewInteractions || canViewCreditUsage) {
        await fetchData(finalStartDate, finalEndDate, workspaceId);
      }
    }
  };

  const data = dashboardData;

  if (cannotViewDashboard) return (
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
            Dashboard
          </Typography>
        </Box>

        <Grid
          container
          spacing={2}
          columns={12}
          sx={{ mb: (theme) => theme.spacing(2) }}
        >
          <Grid size={{ xs: 12 }}>
            <Typography fontSize={20} variant="body1" fontWeight="bold" >Interactions</Typography>
          </Grid>
            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{ width: '100%' }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography component="h2" variant="subtitle2" gutterBottom>
                    {loading ? <Skeleton width="60%" /> : 'You do not have permission to view interactions data'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <Typography fontSize={20} variant="body1" fontWeight="bold" >Credits</Typography>
        </Grid>

        <Grid
          container
          spacing={2}
          columns={12}
          sx={{ mt: (theme) => theme.spacing(2), mb: (theme) => theme.spacing(2) }}
        >
          <Grid size={{ xs: 12 }}>
            <Card
              variant="outlined"
              sx={{ width: '100%' }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                  {loading ? <Skeleton width="60%" /> : 'You do not have permission to view daily credit usage.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>                  
        </Grid>
      </Box>
    </LocalizationProvider>
  )


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
            Dashboard
          </Typography>

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              sx={{ width: '100%', justifyContent: 'flex-end' }}
            >
              { user?.role.name === 'ADMIN' && (
                <Autocomplete
                  fullWidth
                  options={workspaceOptions}
                  getOptionLabel={(option) =>
                    `${option.name}${option.email ? ` (${option.email})` : ` (${option.id})`}`
                  }
                  value={workspaceOptions?.find((w) => w.id === workspaceId) ?? null}
                  onChange={handleWorkspaceChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Workspace (Leave blank for ALL)" variant="outlined" />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={!canViewPartOfDashboard}
                />
              )}

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'flex-end' }}
              >
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) =>
                    handleCustomDateChange(newValue, 'start')
                  }
                  sx={{ width: { xs: '100%', md: 'fit-content' } }}
                  disabled={!canViewPartOfDashboard}
                />

                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => handleCustomDateChange(newValue, 'end')}
                  sx={{ width: { xs: '100%', md: 'fit-content' } }}
                  disabled={!canViewPartOfDashboard}
                />
              </Stack>
            </Stack>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <ButtonGroup variant="outlined" size="small">
                {ranges.map((range) => (
                  <Button
                    key={range.days}
                    onClick={() => handleRangeChange(range.days)}
                    variant={
                      selectedRange === range.days ? 'contained' : 'outlined'
                    }
                    sx={{ 
                      minHeight: 50,
                      '&.Mui-disabled': {
                        color:
                          resolvedMode == 'dark'
                            ? theme.palette.grey[400]
                            : theme.palette.grey[500],
                      },
                    }}
                    disabled={!canViewPartOfDashboard}
                  >
                    {range.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          </Stack>
        </Box>

        {/* <Grid
          container
          spacing={2}
          columns={12}
          sx={{ mb: (theme) => theme.spacing(2) }}
        >
          <Grid size={{ xs: 12 }}>
            <Typography fontSize={20} variant="body1" fontWeight="bold" >Payments</Typography>
          </Grid>

          <PaymentsChart workspaceId={workspaceId} startDate={startDate} endDate={endDate} />
        </Grid> */}

        {(data) ? (
          <>          
            <Grid
              container
              spacing={2}
              columns={12}
              sx={{ mb: (theme) => theme.spacing(2) }}
            >
              <Grid size={{ xs: 12 }}>
                <Typography fontSize={20} variant="body1" fontWeight="bold" >Interactions</Typography>
              </Grid>
              { canViewInteractions ? (
                <>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row', md: 'column' }}
                      sx={{
                        height: '100%',
                        justifyContent: 'center',
                        gap: 2,
                        flex: 1,
                      }}
                    >
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
                        interactions={data.running.interactions.filter(
                          (i) => i.isWaiting
                        )}
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
                  <Grid size={{ xs: 12, md: 9 }}>
                    <ResolvedChart
                      data={data.resolved}
                      loading={loading}
                      startDate={startDate?.format('YYYY-MM-DD') ?? ''}
                      endDate={endDate?.format('YYYY-MM-DD') ?? ''}
                    />
                  </Grid>
                </>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Card
                    variant="outlined"
                    sx={{ width: '100%' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography component="h2" variant="subtitle2" gutterBottom>
                        {loading ? <Skeleton width="60%" /> : 'You do not have permission to view interactions data'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Typography fontSize={20} variant="body1" fontWeight="bold" >Credits</Typography>
            </Grid>

            <Grid
              container
              spacing={2}
              columns={12}
              sx={{ mt: (theme) => theme.spacing(2), mb: (theme) => theme.spacing(2) }}
            >
              { (workspaceId) ? (
                canViewCreditRemaining ? (
                  <Grid size={{ xs: 12 }}>
                    <DailyCreditBalanceChart
                      startDate={startDate?.format('YYYY-MM-DD') ?? ''}
                      endDate={endDate?.format('YYYY-MM-DD') ?? ''}
                      workspaceId={workspaceId}
                    />
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Card
                      variant="outlined"
                      sx={{ width: '100%' }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography component="h2" variant="subtitle2" gutterBottom>
                          {loading ? <Skeleton width="60%" /> : 'You do not have permission to view daily credit balance.'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>  
                )
              ) : (
                  <Grid size={{ xs: 12 }}>
                  </Grid>            
              )}             
              { canViewCreditUsage ? (
                <>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row', md: 'column' }}
                      sx={{
                        height: '100%',
                        justifyContent: 'center',
                        gap: 2,
                        flex: 1,
                      }}
                    >
                      { data.topAgents && (
                        <TopConsumersBarChart data={data.topAgents} type={'agents'} />
                      )}

                      { data.topWorkspaces && (
                        <TopConsumersBarChart data={data.topWorkspaces} type={'workspaces'} />
                      )}

                      <TopModelsBarChart data={data.topModels} />
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 9 }}>
                    <CreditsPerDayChart
                      data={data.creditsPerDay}
                      startDate={startDate?.format('YYYY-MM-DD') ?? ''}
                      endDate={endDate?.format('YYYY-MM-DD') ?? ''}
                    />
                  </Grid>
                </>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Card
                    variant="outlined"
                    sx={{ width: '100%' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography component="h2" variant="subtitle2" gutterBottom>
                        {loading ? <Skeleton width="60%" /> : 'You do not have permission to view daily credit usage.'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>                  
              )}
            </Grid>
          </>
        ) : (
          <Skeleton sx={{ height: '300px'}} />
        )}
      </Box>
    </LocalizationProvider>
  );
}
