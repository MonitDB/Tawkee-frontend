import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box } from '@mui/material';

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

  const labels = data.map((d) =>
    new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const a1 = data.map((d) => d.creditsByAgent.find((c) => c.agentId === 'a1')?.credits ?? 0);
  const a2 = data.map((d) => d.creditsByAgent.find((c) => c.agentId === 'a2')?.credits ?? 0);
  const a3 = data.map((d) => d.creditsByAgent.find((c) => c.agentId === 'a3')?.credits ?? 0);

  const totalSum = [...a1, ...a2, ...a3].reduce((acc, val) => acc + val, 0);

  const colorPalette = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
  ];

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
            series={[
              {
                id: 'a1',
                label: 'Agent a1',
                data: a1,
                showMark: false,
                curve: 'bumpX',
                area: true,
                stack: 'total'
              },
              {
                id: 'a2',
                label: 'Agent a2',
                data: a2,
                showMark: false,
                curve: 'bumpX',
                area: true,
                stack: 'total'
              },
              {
                id: 'a3',
                label: 'Agent a3',
                data: a3,
                showMark: false,
                curve: 'bumpX',
                area: true,
                stack: 'total'
              },
            ]}
            colors={colorPalette}
            margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
            grid={{ horizontal: true }}
            sx={{
              '& .MuiAreaElement-series-a1': {
                fill: "url('#a1')",
              },
              '& .MuiAreaElement-series-a2': {
                fill: "url('#a2')",
              },
              '& .MuiAreaElement-series-a3': {
                fill: "url('#a3')",
              },
              height: '99.4%',
            }}
          >
            <AreaGradient color={colorPalette[0]} id="a1" />
            <AreaGradient color={colorPalette[1]} id="a2" />
            <AreaGradient color={colorPalette[2]} id="a3" />
          </LineChart>
        </Box>
      </CardContent>
    </Card>
  );
}
