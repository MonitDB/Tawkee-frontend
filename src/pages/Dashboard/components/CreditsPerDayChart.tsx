import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { CurveType } from '@mui/x-charts/models';
import { Box } from '@mui/material';
import { Fragment, useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

type AgentCredits = {
  agentId: string;
  agentName: string;
  credits: number;
};

type CreditEntry = {
  date: string;
  totalCredits: number;
  creditsByAgent: AgentCredits[];
};

type CreditsPerDayChartProps = {
  data: CreditEntry[];
  startDate: string;
  endDate: string;
};

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
  data: CreditEntry[],
  startDate: string,
  endDate: string
): CreditEntry[] {
  const fullRange = generateDateRange(startDate, endDate);
  const known = new Map(data.map((d) => [d.date, d]));

  const allAgents = Array.from(
    new Set(data.flatMap((d) => d.creditsByAgent.map((c) => c.agentId)))
  );

  const agentIdToName: Record<string, string> = {};
  data.forEach((d) =>
    d.creditsByAgent.forEach(({ agentId, agentName }) => {
      agentIdToName[agentId] = agentName;
    })
  );

  return fullRange.map((date) => {
    return (
      known.get(date) || {
        date,
        totalCredits: 0,
        creditsByAgent: allAgents.map((agentId) => ({
          agentId,
          agentName: agentIdToName[agentId] || 'Unknown',
          credits: 0,
        })),
      }
    );
  });
}

export default function CreditsPerDayChart({
  data,
  startDate,
  endDate,
}: CreditsPerDayChartProps) {
  const theme = useTheme();
  const adjustedData = useMemo(
    () => fillMissingDates(data, startDate, endDate),
    [data, startDate, endDate]
  );

  const labels = useMemo(() => {
    return adjustedData.map((d) => d.date);
  }, [adjustedData]);

  const allAgentIds = useMemo(() => {
    const idSet = new Set<string>();
    adjustedData.forEach((entry) => {
      entry.creditsByAgent.forEach((agent) => idSet.add(agent.agentId));
    });
    return Array.from(idSet);
  }, [adjustedData]);

  const agentIdToNameMap = useMemo(() => {
    const map = new Map<string, string>();
    adjustedData.forEach((entry) => {
      entry.creditsByAgent.forEach(({ agentId, agentName }) => {
        if (!map.has(agentId)) {
          map.set(agentId, agentName);
        }
      });
    });
    return map;
  }, [adjustedData]);

  const colorPalette = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.primary.main,
  ];

  const series = allAgentIds.map((agentId) => {
    const agentData = adjustedData.map(
      (entry) => entry.creditsByAgent.find((c) => c.agentId === agentId)?.credits ?? 0
    );

    const agentName = agentIdToNameMap.get(agentId) || 'Unknown';

    return {
      id: agentId,
      label: `Agent ${agentName}`,
      data: agentData,
      showMark: false,
      curve: 'bumpX' as CurveType,
      area: true,
      stack: 'total',
    };
  });

  const totalSum = series.flatMap((s) => s.data).reduce((acc, val) => acc + val, 0);

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
          Daily Credit Usage
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
          Credits stacked by agent per day ({totalSum})
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
            series={series}
            colors={colorPalette}
            margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
            grid={{ horizontal: true }}
            sx={{
              height: '99.4%',
              ...Object.fromEntries(
                allAgentIds.map((agentId) => [
                  `& .MuiAreaElement-series-${agentId}`,
                  { fill: `url('#${agentId}')` },
                ])
              ),
            }}
          >
            {allAgentIds.map((agentId, i) => (
              <Fragment key={agentId}>
                <AreaGradient color={colorPalette[i % colorPalette.length]} id={agentId} />
              </Fragment>
            ))}
          </LineChart>
        </Box>
      </CardContent>
    </Card>
  );
}
