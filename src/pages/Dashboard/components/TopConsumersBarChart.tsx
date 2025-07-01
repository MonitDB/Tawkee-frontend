import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { AgentConsumptionDto, WorkspaceConsumptionDto } from '../../../services/dashboardService';

type TopConsumersBarChartProps = {
  data: AgentConsumptionDto[] | WorkspaceConsumptionDto[];
  type: 'agents' | 'workspaces';
};

export default function TopConsumersBarChart({ data, type }: TopConsumersBarChartProps) {
  const theme = useTheme();

  const names = data.map((item) => item.name || 'Unknown');
  const credits = data.map((item) => item.totalCredits);
  const totalSum = credits.reduce((acc, val) => acc + val, 0);

  const title = type === 'agents' ? 'Top Agents by Credits' : 'Top Workspaces by Credits';
  const description = type === 'agents' 
    ? 'Distributed among top agents'
    : 'Distributed among top workspaces';

  return (
    <Card variant="outlined" sx={{ width: '100%', flex: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
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
              {totalSum.toLocaleString()}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        </Stack>
        <Box>
          <BarChart
            xAxis={[{ 
              data: names, 
              scaleType: 'band',
              tickLabelStyle: {
                angle: names.some(name => name.length > 10) ? -45 : 0,
                textAnchor: names.some(name => name.length > 10) ? 'end' : 'middle'
              }
            }]}
            series={[
              {
                id: 'credits',
                label: 'Total Credits',
                data: credits,
                color: theme.palette.primary.main,
              },
            ]}
            grid={{ horizontal: true }}
            height={180}
            margin={{ bottom: names.some(name => name.length > 10) ? 80 : 50 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}