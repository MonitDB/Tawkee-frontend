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

export default function NavbarBreadcrumbs({ overrideLatestSegment = '' }) {
  const location = useLocation();

  function getSegments(path: string): string[] {
    if (path === '/' || path.trim() === '') return ['Dashboard'];

    return path.replace(/^\/+/, '').split('/');
  }

  function formatSegment(segment: string): string {
    return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
  }
  const segments = getSegments(location.pathname);

  const formattedSegments = segments.map((segment) => formatSegment(segment));

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Home</Typography>
      {formattedSegments.map((segment, index) => (
        <Typography
          key={index}
          variant="body1"
          sx={{
            color: index === formattedSegments.length - 1 ? 'text.primary' : '',
            fontWeight: index === formattedSegments.length - 1 ? 600 : 400, // Apply bold only to the last
          }}
        >
          {index === formattedSegments.length - 1
            ? overrideLatestSegment.length > 0
              ? overrideLatestSegment
              : segment
            : segment}
        </Typography>
      ))}
    </StyledBreadcrumbs>
  );
}
