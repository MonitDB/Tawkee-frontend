import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

type Model = {
  model: string;
  credits: number;
};

type TopModelsBarChartProps = {
  data: Model[];
};

export default function TopModelsBarChart({ data }: TopModelsBarChartProps) {
  const theme = useTheme();

  const modelNames = data.map((m) => m.model);
  const creditValues = data.map((m) => m.credits);
  const totalSum = creditValues.reduce((acc, val) => acc + val, 0);

  return (
    <Card variant="outlined" sx={{ width: '100%', flex: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Top Models by Credits
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
            Distributed among top models
          </Typography>
        </Stack>
        <Box>
          <BarChart
            xAxis={[{ data: modelNames, scaleType: 'band' }]}
            series={[
              {
                id: 'credits',
                label: 'Total Credits',
                data: creditValues,
                color: theme.palette.primary.dark,
              },
            ]}
            grid={{ horizontal: true }}
            height={180}
            margin={{ bottom: modelNames.some(name => name.length > 10) ? 80 : 50 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
