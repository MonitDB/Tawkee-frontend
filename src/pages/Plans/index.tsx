import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  useTheme,
  useColorScheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Subscriptions as SubscriptionsIcon,
} from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import { useEffect, useState } from 'react';
import EditPlanDialog, { StripePlan } from './components/EditPlanDialog';
import { useAuth } from '../../context/AuthContext';
import { useStripeService } from '../../hooks/useStripeService';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import CreatePlanDialog from './components/CreatePlanDialog';
import { useNavigate } from 'react-router-dom';
import { useHttpResponse } from '../../context/ResponseNotifier';

export default function PlanList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';
  const { notify } = useHttpResponse();
  const { token, can } = useAuth();
  const { getAvailableProducts, stripeLoading } = useStripeService(
    token as string
  );

  const canEditPlanAsAdmin = can('EDIT_AS_ADMIN', 'PLAN');
  const canViewPlanAsAdmin = can('VIEW_AS_ADMIN', 'PLAN');
  const canCreatePlanAsAdmin = can('CREATE_AS_ADMIN', 'PLAN');

  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [planToEdit, setPlanToEdit] = useState<StripePlan | null>(null);
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  // Handle unauthorized access to the page
  useEffect(() => {
    if (!canViewPlanAsAdmin) {
      notify(
        'You do not have permission to view existing Plans of your workspace.',
        'warning'
      );
      navigate('/');
    }
  }, [canViewPlanAsAdmin]);

  // Fetch data if user has permission to view them
  useEffect(() => {
    async function fetchProductsAndPlan() {
      try {
        setLoading(true);
        const productData = await getAvailableProducts();

        if (productData) {
          // Sort plans by price (ascending)
          const sorted = productData.sort(
            (a, b) =>
              (a?.prices?.[0]?.unit_amount ?? 0) -
              (b?.prices?.[0]?.unit_amount ?? 0)
          );
          setPlans(sorted);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProductsAndPlan();
  }, [getAvailableProducts]);

  //   const [createOpen, setCreateOpen] = useState(false);

  return (
    <Card variant="outlined" sx={{ margin: '0 auto', width: '100%' }}>
      <CardContent>
        <Box sx={{ p: 3 }}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Typography
                variant="h4"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box
                  sx={{
                    width: '1.5rem',
                    height: '1.5rem',
                    bgcolor: 'black',
                    borderRadius: '999px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'hsla(210, 100%, 95%, 0.9)',
                    border: '1px solid',
                    borderColor: 'hsl(210, 100%, 55%)',
                    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <SubscriptionsIcon
                    color="inherit"
                    sx={{ fontSize: '1rem' }}
                  />
                </Box>
                Plans
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateOpen(true)}
                  disabled={!canCreatePlanAsAdmin}
                  sx={{
                    '&.Mui-disabled': {
                      color:
                        resolvedMode == 'dark'
                          ? theme.palette.grey[400]
                          : theme.palette.grey[500],
                    },
                  }}
                >
                  Create Plan
                </Button>
                {!canCreatePlanAsAdmin && (
                  <Tooltip title="Your admin privileges to create new plans has been revoked.">
                    <InfoIcon
                      fontSize="small"
                      sx={{ ml: 0.5 }}
                      color="warning"
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={`skeleton-${i}`}>
                      <Card variant="outlined">
                        <CardContent>
                          <Skeleton variant="text" height={32} width={300} />
                          <Skeleton variant="text" height={96} width={300} />
                          <Skeleton variant="text" height={48} width={300} />
                          <Skeleton variant="rectangular" height={300} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                : plans.map((plan) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={plan.product.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          minHeight: 500,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            maxHeight: 520,
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="h6">
                              {plan.product.name}
                            </Typography>
                            <Tooltip title="Edit">
                              {canEditPlanAsAdmin ? (
                                <Button
                                  onClick={() => setPlanToEdit(plan)}
                                  disabled={!canEditPlanAsAdmin}
                                >
                                  <EditIcon />
                                </Button>
                              ) : (
                                <Tooltip title="Your admin privileges to edit plans has been revoked.">
                                  <InfoIcon
                                    fontSize="small"
                                    sx={{ ml: 0.5 }}
                                    color="warning"
                                  />
                                </Tooltip>
                              )}
                            </Tooltip>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                            sx={{ minHeight: 60 }}
                          >
                            {plan.product.description}
                          </Typography>
                          {plan.prices[0].unit_amount && (
                            <Typography fontWeight="bold" mb={1}>
                              US${' '}
                              {(plan.prices[0].unit_amount / 100).toFixed(2)}
                              /month
                            </Typography>
                          )}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              justifyContent: 'space-between',
                            }}
                          >
                            <List dense sx={{ minHeight: '300px' }}>
                              {plan?.metadata?.features?.map(
                                (feature, index) => (
                                  <ListItem key={index} disableGutters>
                                    <ListItemIcon>
                                      <CheckCircleIcon
                                        color="success"
                                        fontSize="small"
                                      />
                                    </ListItemIcon>
                                    <ListItemText primary={feature} />
                                  </ListItem>
                                )
                              )}
                            </List>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {plan?.metadata?.trialDays && (
                                <Chip
                                  label={`${plan.metadata.trialDays} days of trial`}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                />
                              )}
                              {plan?.metadata?.isActive ? (
                                <Chip
                                  label={`Plan Available`}
                                  color="success"
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                />
                              ) : (
                                <Chip
                                  label={`Hidden from Public`}
                                  color="warning"
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                />
                              )}
                              {plan?.metadata?.isEnterprise && (
                                <Chip
                                  label={`Enterprise plan`}
                                  color="secondary"
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
            </Grid>

            <EditPlanDialog
              plan={planToEdit}
              onClose={() => setPlanToEdit(null)}
            />
            <CreatePlanDialog
              open={createOpen}
              onClose={() => setCreateOpen(false)}
            />
            <LoadingBackdrop open={stripeLoading} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
