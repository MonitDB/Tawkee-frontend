import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { CurveType } from '@mui/x-charts/models';
import { Box } from '@mui/material';
import { Fragment, useMemo } from 'react';

type AgentCredits = {
  agentId: string;
  credits: number;
};

type CreditEntry = {
  date: string;
  totalCredits: number;
  creditsByAgent: AgentCredits[];
};

type CreditsPerDayChartProps = {
  data: CreditEntry[];
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

export default function CreditsPerDayChart({ data }: CreditsPerDayChartProps) {
  const theme = useTheme();

  const labels = useMemo(() => {
    return data.map((d) =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
  }, [data]);

  const allAgentIds = useMemo(() => {
    const idSet = new Set<string>();
    data.forEach((entry) => {
      entry.creditsByAgent.forEach((agent) => idSet.add(agent.agentId));
    });
    return Array.from(idSet);
  }, [data]);

  const colorPalette = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.primary.main,
  ];

  const series = allAgentIds.map((agentId) => {
    const agentData = data.map(
      (entry) => entry.creditsByAgent.find((c) => c.agentId === agentId)?.credits ?? 0
    );

    return {
      id: agentId,
      label: `Agent ${agentId}`,
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
                tickInterval: (_, i) => (i + 1) % 2 === 0,
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
