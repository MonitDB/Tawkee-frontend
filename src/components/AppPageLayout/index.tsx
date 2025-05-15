import { ReactNode } from 'react';

import Header from '../Header';
import LoadingBackdrop from '../LoadingBackdrop';

import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import AppNavbar from '../AppNavbar';
import SideMenu from '../SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import { useAuth } from '../../context/AuthContext';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...treeViewCustomizations,
};

type AppPageLayoutProps = {
  disableCustomTheme?: boolean;
  children: ReactNode;
};

export default function AppPageLayout({
  disableCustomTheme,
  children,
}: AppPageLayoutProps) {
  const { loading: authLoading } = useAuth();

  return (
    <AppTheme
      disableCustomTheme={disableCustomTheme}
      themeComponents={xThemeComponents}
    >
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            {children}
          </Stack>
        </Box>
      </Box>

      <LoadingBackdrop open={authLoading} />
    </AppTheme>
  );
}
