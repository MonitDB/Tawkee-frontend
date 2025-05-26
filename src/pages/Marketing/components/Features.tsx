import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import {
  tawkeeAgencies,
  tawkeeEntrepreneurs,
  tawkeeProfessionals,
} from '../../../assets';

const items = [
  {
    title: 'Agencies',
    description: 'who want to offer automation as a service to other companies',
    image: tawkeeAgencies,
  },
  {
    title: 'Professionals',
    description:
      'who want to scale their support and manage the company where they work with AI as collaborative assistants',
    image: tawkeeProfessionals,
  },
  {
    title: 'Entrepreneurs',
    description:
      'who want to transform their innovative services using AI assistants',
    image: tawkeeEntrepreneurs,
  },
];

export default function Features() {
  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Chip label="MADE FOR YOU" color="success" sx={{ mb: 4 }} />
        <Typography
          component="h2"
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 4,
          }}
        >
          Tawkee was designed for you
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {items.map((item, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: (theme) => theme.shadows[4],
              }}
            >
              <Box
                sx={{
                  height: 200,
                  bgcolor: 'grey.100',
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: 600 }}
                >
                  {item.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
