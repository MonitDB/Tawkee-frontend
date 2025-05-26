import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';

const items = [
  {
    icon: <SupportAgentIcon sx={{ fontSize: 32 }} />,
    title: 'Customer Service',
    description: 'Enhance customer experience with personalized messages',
  },
  {
    icon: <EventNoteIcon sx={{ fontSize: 32 }} />,
    title: 'Schedule Management',
    description:
      'Simplify the scheduling process and reduce time spent on this task',
  },
  {
    icon: <AutoGraphIcon sx={{ fontSize: 32 }} />,
    title: 'Personalized Responses',
    description:
      'Create tailored responses for each customer, providing a humanized experience',
  },
  {
    icon: <AutorenewIcon sx={{ fontSize: 32 }} />,
    title: 'Sales Automation',
    description:
      'Automate the sales process and help your customers find what they are looking for',
  },
  {
    icon: <QueryStatsIcon sx={{ fontSize: 32 }} />,
    title: 'Data Analysis',
    description:
      'Collect and analyze data efficiently to make metric-based decisions',
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
    title: 'Repetitive Task Management',
    description:
      'Automate repetitive tasks and free up your team to focus on what really matters',
  },
];

export default function Highlights() {
  const navigate = useNavigate();

  return (
    <Box
      id="highlights"
      sx={{
        py: { xs: 8, sm: 16 },
        color: 'text.primary',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography
            component="span"
            variant="body1"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              mb: 2,
              display: 'block',
            }}
          >
            New AI
          </Typography>
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            AI-powered service like you&lsquo;ve never seen before!
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
          >
            AI is no longer just a tool, but an intelligent assistant that
            enhances your business with 24/7 customer service, schedule
            management, and much more. Let AI employees work for you!
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/sign-up')}
          >
            7-day free trial
          </Button>
        </Box>

        <Grid container spacing={3}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, md: 6, sm: 4 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{item.icon}</Box>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
