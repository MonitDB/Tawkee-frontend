import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StatCard from './StatCard';
import ResolvedChart from './ResolvedChart';
import TopAgentsBarChart from './TopAgentsBarChart';
import TopModelsBarChart from './TopModelsBarChart';
import CreditsPerDayChart from './CreditsPerDayChart';

const dashboardMetricsMock = {
  resolved: {
    total: 120,
    byAI: 85,
    byHuman: 35,
    timeSeries: [
      { date: '2025-06-07', total: 12, byAI: 8, byHuman: 4 },
      { date: '2025-06-08', total: 15, byAI: 10, byHuman: 5 },
      { date: '2025-06-09', total: 18, byAI: 13, byHuman: 5 },
      { date: '2025-06-10', total: 20, byAI: 14, byHuman: 6 },
      { date: '2025-06-11', total: 16, byAI: 11, byHuman: 5 },
      { date: '2025-06-12', total: 22, byAI: 16, byHuman: 6 },
      { date: '2025-06-13', total: 17, byAI: 13, byHuman: 4 },
    ],
    trend: {
      total: 8,
      byAI: 10,
      byHuman: 4,
    },
  },
  running: {
    total: 15,
    waiting: 4,
    interactions: [
      { id: 'i201', userName: 'Maria Silva', whatsappPhone: '+5511988880001', isWaiting: false },
      { id: 'i202', userName: 'João Pereira', whatsappPhone: '+5511977770002', isWaiting: false },
      { id: 'i203', userName: 'Lucas Lima', whatsappPhone: '+5511966660003', isWaiting: false },
      { id: 'i204', userName: 'Ana Souza', whatsappPhone: '+5511955550004', isWaiting: false },
      { id: 'i205', userName: 'Carlos Henrique', whatsappPhone: '+5511944440005', isWaiting: false },
      { id: 'i206', userName: 'Juliana Mendes', whatsappPhone: '+5511933330006', isWaiting: false },
      { id: 'i207', userName: 'Fernando Rocha', whatsappPhone: '+5511922220007', isWaiting: false },
      { id: 'i208', userName: 'Patrícia Torres', whatsappPhone: '+5511911110008', isWaiting: false },
      { id: 'i209', userName: 'Diego Costa', whatsappPhone: '+5511900000009', isWaiting: false },
      { id: 'i210', userName: 'Bruna Carvalho', whatsappPhone: '+5511899990010', isWaiting: true },
      { id: 'i211', userName: 'Rafael Gomes', whatsappPhone: '+5511888880011', isWaiting: true },
      { id: 'i212', userName: 'Luciana Ribeiro', whatsappPhone: '+5511877770012', isWaiting: true },
      { id: 'i213', userName: 'Igor Fernandes', whatsappPhone: '+5511866660013', isWaiting: true },
      { id: 'i214', userName: 'Camila Martins', whatsappPhone: '+5511855550014', isWaiting: false },
      { id: 'i215', userName: 'Thiago Almeida', whatsappPhone: '+5511844440015', isWaiting: false },
    ],
  },
  avgInteractionTimeMs: 252000,
  avgTimeTrend: -5,
  creditsPerDay: [
    {
      date: '2025-06-07',
      totalCredits: 130,
      creditsByAgent: [
        { agentId: 'a1', credits: 80 },
        { agentId: 'a2', credits: 50 },
      ],
    },
    {
      date: '2025-06-08',
      totalCredits: 110,
      creditsByAgent: [
        { agentId: 'a1', credits: 60 },
        { agentId: 'a3', credits: 50 },
      ],
    },
    {
      date: '2025-06-09',
      totalCredits: 95,
      creditsByAgent: [
        { agentId: 'a2', credits: 40 },
        { agentId: 'a3', credits: 55 },
      ],
    },
    {
      date: '2025-06-10',
      totalCredits: 160,
      creditsByAgent: [
        { agentId: 'a1', credits: 70 },
        { agentId: 'a2', credits: 90 },
      ],
    },
    {
      date: '2025-06-11',
      totalCredits: 180,
      creditsByAgent: [
        { agentId: 'a3', credits: 180 },
      ],
    },
    {
      date: '2025-06-12',
      totalCredits: 140,
      creditsByAgent: [
        { agentId: 'a1', credits: 100 },
        { agentId: 'a2', credits: 40 },
      ],
    },
    {
      date: '2025-06-13',
      totalCredits: 105,
      creditsByAgent: [
        { agentId: 'a3', credits: 65 },
        { agentId: 'a2', credits: 40 },
      ],
    },
  ],
  topAgents: [
    {
      agentId: 'a3',
      name: 'Suporte Avançado',
      jobName: 'Especialista IA',
      avatar: 'https://cdn.tawkee.io/avatars/a3.png',
      totalCredits: 410,
    },
    {
      agentId: 'a1',
      name: 'Bot de Atendimento',
      jobName: 'Atendente Virtual',
      avatar: 'https://cdn.tawkee.io/avatars/a1.png',
      totalCredits: 310,
    },
    {
      agentId: 'a2',
      name: 'IA Vendas',
      jobName: 'Assistente Comercial',
      avatar: 'https://cdn.tawkee.io/avatars/a2.png',
      totalCredits: 300,
    },
  ],
  topModels: [
    { model: 'gpt-4o', credits: 460 },
    { model: 'gpt-3.5-turbo', credits: 350 },
    { model: 'claude-3-haiku', credits: 210 },
  ],
};


export default function MainGrid() {
  const data = dashboardMetricsMock;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Interactions
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction={{ xs: 'row', md: 'column' }} sx={{ height: '100%', justifyContent: 'center', gap: 2, flex: 1 }}>
            <StatCard
              title="In Progress"
              value={data.running.total.toString()}
              interval="Current"
              interactions={data.running.interactions}
            />
            <StatCard
              title="Waiting for Reply"
              value={data.running.waiting.toString()}
              interval="Current"
              interactions={data.running.interactions.filter(i => i.isWaiting)}
            />
            <StatCard
              title="Average Interaction Time"
              value={`${Math.floor(data.avgInteractionTimeMs / 60000)}min`}
              interval="Current"
              trend={data.avgTimeTrend >= 0 ? 'up' : 'down'}
              trendValue={data.avgTimeTrend}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <ResolvedChart data={data.resolved} />
        </Grid>
      </Grid>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Credits
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction={{ xs: 'row', md: 'column' }} sx={{ height: '100%', justifyContent: 'center', gap: 2, flex: 1 }}>
            <TopAgentsBarChart data={data.topAgents} />
            <TopModelsBarChart data={data.topModels} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <CreditsPerDayChart data={data.creditsPerDay} />
        </Grid>
      </Grid>
    </Box>
  );
}
