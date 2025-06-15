import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Stack } from '@mui/material';

type ResolvedChartProps = {
  data: {
    timeSeries: {
      date: string;
      total: number;
      byAI: number;
      byHuman: number;
    }[];
    trend: {
      total: number;
      byAI: number;
      byHuman: number;
    };
  };
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

export default function ResolvedChart({ data }: ResolvedChartProps) {
  const theme = useTheme();
  const { timeSeries, trend } = data;

  const labels = timeSeries.map((d) =>
    new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const totals = timeSeries.map((d) => d.total);
  const ai = timeSeries.map((d) => d.byAI);
  const human = timeSeries.map((d) => d.byHuman);

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
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
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
            <Chip size="small" color="default" label={`Total: (${totalSum}) ${trendLabel(trend.total)}`} />
            <Chip size="small" color="success" label={`AI: (${aiSum}) ${trendLabel(trend.byAI)}`} />
            <Chip size="small" color="warning" label={`Human: (${humanSum}) ${trendLabel(trend.byHuman)}`} />
          </Stack>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
          Based on historical time series
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
        </Box>
      </CardContent>
    </Card>
  );
}
