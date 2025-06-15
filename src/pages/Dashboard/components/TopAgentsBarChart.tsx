import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

type Agent = {
  agentId: string;
  name: string;
  jobName: string;
  avatar: string;
  totalCredits: number;
};

type TopAgentsBarChartProps = {
  data: Agent[];
};

export default function TopAgentsBarChart({ data }: TopAgentsBarChartProps) {
  const theme = useTheme();

  const names = data.map((a) => a.name);
  const credits = data.map((a) => a.totalCredits);
  const totalSum = credits.reduce((acc, val) => acc + val, 0);

  return (
    <Card variant="outlined" sx={{ width: '100%', flex: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Top Agents by Credits
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {totalSum}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total credits distributed among top agents
          </Typography>
        </Stack>
        <Box>
          <BarChart
            xAxis={[{ data: names, scaleType: 'band' }]}
            series={[
              {
                id: 'credits',
                label: 'Total Credits',
                data: credits,
                color: theme.palette.primary.main,
              },
            ]}
            grid={{ horizontal: true }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
