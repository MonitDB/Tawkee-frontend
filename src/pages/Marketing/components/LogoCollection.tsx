import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const metrics = [
  {
    value: '80%',
    label: 'less time spent on customer service',
    originalValue: '350%',
  },
  {
    value: '4X',
    label: 'faster customer response time',
    highlight: true,
  },
  {
    value: '60%',
    label: 'reduction in operational costs',
    originalValue: '450%',
  },
];

export default function LogoCollection() {
  const theme = useTheme();

  return (
    <Box
      id="metricsCollection"
      sx={{
        py: 6,
        px: 3,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.dark, 0.2)
            : alpha(theme.palette.primary.light, 0.1),
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        align="center"
        sx={{
          mb: 6,
          color: 'text.primary',
          fontWeight: 'bold',
        }}
      >
        Proven Results
      </Typography>
      <Grid
        container
        spacing={4}
        sx={{
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 4 }} key={index}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                p: 3,
                borderRadius: 2,
                backgroundColor: metric.highlight
                  ? alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === 'dark' ? 0.2 : 0.1
                    )
                  : 'transparent',
              }}
            >
              <Typography
                variant="h2"
                component="div"
                sx={{
                  color: metric.highlight ? 'primary.main' : 'text.primary',
                  fontWeight: 'bold',
                  mb: 2,
                  position: 'relative',
                }}
              >
                {metric.value}
                {metric.originalValue && (
                  <Typography
                    component="span"
                    sx={{
                      position: 'absolute',
                      top: -15,
                      right: -40,
                      fontSize: '1rem',
                      color: 'error.main',
                      textDecoration: 'line-through',
                    }}
                  >
                    {metric.originalValue}
                  </Typography>
                )}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 'medium',
                  maxWidth: '200px',
                  mx: 'auto',
                }}
              >
                {metric.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
