import { useLocation, useNavigate } from 'react-router-dom';

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

interface NavbarBreadcrumbsProps {
  overrideLatestSegment: string;
}

export default function NavbarBreadcrumbs({
  overrideLatestSegment = '',
}: NavbarBreadcrumbsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  function getSegments(path: string): string[] {
    // Remove query parameters if any
    const cleanPath = path.split('?')[0];

    if (cleanPath === '/' || cleanPath.trim() === '') return ['Agents'];

    return cleanPath.replace(/^\/+/, '').split('/');
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
      <Typography
        variant="body1"
        onClick={() => navigate('/')}
        sx={{ cursor: 'pointer' }}
      >
        Home
      </Typography>
      {formattedSegments.map((segment, index) => (
        <Typography
          key={index}
          variant="body1"
          sx={{
            color: index === formattedSegments.length - 1 ? 'text.primary' : '',
            fontWeight: index === formattedSegments.length - 1 ? 600 : 400, // Apply bold only to the last
            cursor:
              index != formattedSegments.length - 1 ? 'pointer' : 'default',
          }}
          onClick={() =>
            index != formattedSegments.length - 1
              ? navigate(`/${segments[index]}`)
              : ''
          }
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
