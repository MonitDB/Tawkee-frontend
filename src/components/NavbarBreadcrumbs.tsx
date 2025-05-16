import { useLocation } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  function formatRouteName(path: string): string {
    if (path === '/' || path.trim() === '') return 'Dashboard';

    const segment = path.replace(/^\/+/, '').split('/')[0]; // remove leading slashes and get first segment
    return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
  }

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Home</Typography>
      <Typography
        variant="body1"
        sx={{ color: 'text.primary', fontWeight: 600 }}
      >
        {formatRouteName(location.pathname)}
      </Typography>
    </StyledBreadcrumbs>
  );
}
