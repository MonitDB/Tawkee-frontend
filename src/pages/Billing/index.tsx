import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Stack,
  useTheme,
  useColorScheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import { useAuth, User } from '../../context/AuthContext';
import SelectPlanDialog from './components/SelectPlanDialog';
import InfoIcon from '@mui/icons-material/Info';
import { useStripeService } from '../../hooks/useStripeService';
import { Circle } from '@mui/icons-material';
import { useDashboardService } from '../../hooks/useDashboardService';
import { useNavigate } from 'react-router-dom';
import { useHttpResponse } from '../../context/ResponseNotifier';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import { SubscriptionStatus } from '../Workspaces';

export const subscriptionColorsTypography: Record<SubscriptionStatus, 'primary' | 'secondary' | 'warning' | 'error'> = {
  TRIAL: 'secondary',
  ACTIVE: 'primary',
  PAST_DUE: 'error',
  CANCELED: 'warning',
  INCOMPLETE: 'error',
  INCOMPLETE_EXPIRED: 'error',
  UNPAID: 'error',
};

export const friendlySubscriptionStatus: Record<SubscriptionStatus, string> = {
  TRIAL: 'in a trial period.',
  ACTIVE: 'active.',
  PAST_DUE: 'past due — payment required.',
  CANCELED: 'canceled.',
  INCOMPLETE: 'incomplete — trial period expired.',
  INCOMPLETE_EXPIRED: 'incomplete and expired due to inactivity.',
  UNPAID: 'unpaid after multiple failed attempts.',
};

export default function Billing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { token, user, isLoggingOutRef, workspacePlanCredits, workspaceExtraCredits, can } = useAuth();
  const { notify } = useHttpResponse();

  const userIsAdmin = user?.role.name === 'ADMIN';
  const canManageSubscriptionAsAdmin = can('MANAGE_SUBSCRIPTION_AS_ADMIN', 'BILLING');
  const canManageSubscription = can('MANAGE_SUBSCRIPTION', 'BILLING');
  const canPurchaseExtraCreditsAsAdmin = can('PURCHASE_EXTRA_CREDITS_AS_ADMIN', 'BILLING');
  const canPurchaseExtraCredits = can('PURCHASE_EXTRA_CREDITS', 'BILLING');
  const canManageSmartRechargeSettingsAsAdmin = can('MANAGE_SMART_RECHARGE_SETTINGS_AS_ADMIN', 'BILLING');
  const canManageSmartRechargeSettings = can('MANAGE_SMART_RECHARGE_SETTINGS', 'BILLING');
  const canViewAsAdmin = can('VIEW_AS_ADMIN', 'BILLING')
  const canView = can('VIEW', 'BILLING');

  const { 
    openCustomerPortal,
    purchaseCredits,
    updateSmartRechargeSetting,
    getBillingStatus,
    stripeLoading
  } = useStripeService(token as string);

  const { fetchAllWorkspacesBasicInfo  } = useDashboardService(token as string);

  const { smartRecharge, plan, subscription } = user as User;

  const [planState, setPlanState] = useState(plan);
  const [subscriptionState, setSubscriptionState] = useState(subscription);
  const [workspacePlanCreditsState, setWorkspacePlanCreditsState] = useState<number>(workspacePlanCredits);
  const [workspaceExtraCreditsState, setWorkspaceExtraCreditsState] = useState<number>(workspaceExtraCredits);

  const [openPlanDialog, setOpenPlanDialog] = useState(false);

  const [workspaceId, setWorkspaceId] = useState<string | null>(user?.workspaceId ?? null);
  const [workspaceOptions, setWorkspaceOptions] = useState<
    { id: string; name: string; email: string | null }[]
  >([]);
  
  const formattedDueDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(new Date(subscriptionState?.currentPeriodEnd as string));

  const formattedCancelDate = subscriptionState?.cancelAtPeriodEnd
    ? new Intl.DateTimeFormat('en-US', {
            dateStyle: 'long',
        }).format(new Date(subscriptionState?.canceledAt as string))
    : undefined

  const value = (planState?.amount || 0) / 100; // Stripe gives amounts in cents
  const currency = planState?.currency || 'usd';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);

  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(!!smartRecharge?.active);
  const [autoRechargeThreshold, setRechargeThreshold] = useState(smartRecharge?.threshold);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState(smartRecharge?.rechargeAmount);
  const [rechargeAmount, setRechargeAmount] = useState(1000);

  const rechargeCost = rechargeAmount ?
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(rechargeAmount * 0.04)
    : undefined;

  const handleWorkspaceChange = (event: SelectChangeEvent<string | null>) => {
    setWorkspaceId(event.target.value);
  }; 

  const handlePurchaseExtraCredits = async () => {
    await purchaseCredits({ workspaceId: user?.workspaceId as string, credits: rechargeAmount});
  };

  const handleUpdateSmartRechargeSetting = async (
    selectedWorkspaceId: string, currentAutoRechargeEnabled: boolean
  ) => {
    await updateSmartRechargeSetting(selectedWorkspaceId, {
        threshold: autoRechargeThreshold,
        rechargeAmount: autoRechargeAmount,
        active: currentAutoRechargeEnabled
    });
  };

  const userBelongsToSelectedWorkspace = user?.workspaceId === workspaceId;

  // Handle unauthorized access to the page
  useEffect(() => {
    if (!canView) {
      notify('You do not have permission to view Billing details of your workspace.', 'warning');
      navigate('/');
    }
  }, [canView]);

  // Fetch list of workspaces
  useEffect(() => {

    if (!isLoggingOutRef.current && userIsAdmin) {
      // Fetch list of all workspaces
      const fetchOptions = async () => {
        try {
          const all = await fetchAllWorkspacesBasicInfo();
          setWorkspaceOptions(all);
        } catch (err) {
          console.error('Failed to load workspace options:', err);
        }
      };
      fetchOptions();
    }

  }, [userIsAdmin, fetchAllWorkspacesBasicInfo]);  
  
  // Fetch billing data of selected workspace (if admin is viewing other workspaces data)
  useEffect(() => {
    const fetchBillingData = async (workspaceId: string) => {
      const response = await getBillingStatus(workspaceId);

      setPlanState(response?.plan);
      setSubscriptionState(response?.subscription);

      setAutoRechargeEnabled(!!response?.smartRecharge?.active);
      setRechargeThreshold(response?.smartRecharge?.threshold);
      setAutoRechargeAmount(response?.smartRecharge?.rechargeAmount);

      setWorkspacePlanCreditsState(response?.planCreditsRemaining as number);
      setWorkspaceExtraCreditsState(response?.extraCreditsRemaining as number);
    }
    
    if (!userBelongsToSelectedWorkspace) {
      fetchBillingData(workspaceId as string);
    } else {
      setPlanState(plan);
      setSubscriptionState(subscription);
      setAutoRechargeEnabled(!!user?.smartRecharge?.active);
      setRechargeThreshold(user?.smartRecharge?.threshold);
      setAutoRechargeAmount(user?.smartRecharge?.rechargeAmount);
      setWorkspacePlanCreditsState(workspacePlanCredits);
      setWorkspaceExtraCreditsState(workspaceExtraCredits);
    }

  }, [userBelongsToSelectedWorkspace, workspaceId]);

  const relativeTerm = user?.workspaceId === workspaceId ? 'Your' : 'The'

  return (
    <Card variant="outlined" sx={{ margin: '0 auto', width: '100%' }}>
      <CardContent>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" component="div" sx={{ mb: 1 }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: {xs: 'column', md: 'row'},
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              width: '100%'
            }}>
              { userIsAdmin && (
                <FormControl variant='standard' fullWidth error={!workspaceId} required>
                  <InputLabel>
                    Select a Workspace
                    { !canViewAsAdmin && (
                      <Tooltip title="Your admin privileges to view Billing details of other workspaces has been revoked.">
                        <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                      </Tooltip>
                    )}
                  </InputLabel>
                  <Select
                    label="Select a Workspace"
                    value={workspaceOptions.some(w => w.id === workspaceId) ? workspaceId : ''}
                    onChange={handleWorkspaceChange}
                    sx={{ p: 1 }}
                    disabled={!canViewAsAdmin}
                  >
                    {workspaceOptions.map((workspace) => (
                      <MenuItem key={workspace.id} value={workspace.id}>
                        {`${workspace.name}${workspace.email ? ` (${workspace.email})` : ` (${workspace.id})`}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              { userBelongsToSelectedWorkspace 
                ? subscription?.status && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%', textAlign: 'right' }}>
                    <Typography variant='h5'>
                      Your subscription is 
                    </Typography>
                    <Typography
                      variant="h4"
                      component="span"
                      color={
                        subscriptionColorsTypography[subscription?.status as SubscriptionStatus]
                      }
                    >
                      { friendlySubscriptionStatus[subscription?.status as SubscriptionStatus] }
                    </Typography>
                  </Box>
                ) : subscriptionState?.status && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%', textAlign: 'right' }}>
                    <Typography variant='h5'>
                      This subscription is 
                    </Typography>
                    <Typography
                      variant="h4"
                      component="span"
                      color={
                        subscriptionColorsTypography[subscriptionState?.status as SubscriptionStatus]
                      }
                    >
                      { friendlySubscriptionStatus[subscriptionState?.status as SubscriptionStatus] }
                    </Typography>
                  </Box>
                )
              }
            </Box>
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
            { userBelongsToSelectedWorkspace
              ? 'You currently have '
              : 'This workspace currently has '
            }
            { userBelongsToSelectedWorkspace ? (
              <Chip
                label={`${workspacePlanCredits.toLocaleString('en-US') || 'No'} credits`}
                color="primary"
                variant="outlined"
                size="small"
              />
            ) : (
              <Chip
                label={`${workspacePlanCreditsState.toLocaleString('en-US') || 'No'} credits`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            { subscriptionState?.status !== 'TRIAL' && (
              userBelongsToSelectedWorkspace ? (
                <Chip
                  label={`${workspaceExtraCredits.toLocaleString('en-US') || 'No'} extra credits`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Chip
                  label={`${workspaceExtraCreditsState.toLocaleString('en-US') || 'No'} extra credits`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )
            )}
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                { subscriptionState?.cancelAtPeriodEnd 
                    ? `${relativeTerm} subscription was cancelled at ${formattedCancelDate}, but it will remain active until `
                    : subscriptionState?.status !== 'TRIAL'
                        ? `${relativeTerm} next payment is due on `
                        : `${relativeTerm} trial period ends on `
                }                
                <strong>{formattedDueDate}.</strong>
              </Typography>
              <Typography>
                Plan {planState?.name} — {formattedPrice}/month
              </Typography>
              { subscriptionState?.featureOverrides ? (
                <Box sx={{ mt: 1 }}>
                  {subscriptionState.featureOverrides.map((feature: string, index: number) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Circle fontSize="small" color="success" /> {feature}
                    </Typography>
                  ))}
                </Box>
              ) : (
                planState?.features && (
                  <Box sx={{ mt: 1 }}>
                    {planState.features.map((feature: string, index: number) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Circle fontSize="small" color="success" /> {feature}
                      </Typography>
                    ))}
                  </Box>
                )
              )}
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            { subscriptionState?.status === 'TRIAL' ? (
              userBelongsToSelectedWorkspace && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenPlanDialog(true)}
                    disabled={!!subscriptionState?.cancelAtPeriodEnd}
                    sx={{
                      '&.Mui-disabled': {
                          color:
                          resolvedMode == 'dark'
                              ? theme.palette.grey[400]
                              : theme.palette.grey[500],
                      },
                    }}
                >
                { subscriptionState?.status === 'TRIAL' 
                    ? 'Confirm Plan'
                    : 'Change Plan'
                }
                </Button>
              )
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                      disabled={userBelongsToSelectedWorkspace
                        ? !canManageSubscription
                        : !canManageSubscriptionAsAdmin
                      }
                      variant="contained"
                      color="secondary"
                      onClick={() => openCustomerPortal(user?.workspaceId as string)}
                  >
                      Manage Subscription
                  </Button>
                  { userBelongsToSelectedWorkspace
                    ? !canManageSubscription && (
                      <Tooltip title="You do not have permission to manage workspace subscription.">
                        <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                      </Tooltip>                    
                    )
                    : !canManageSubscriptionAsAdmin && (
                      <Tooltip title="Your admin privileges to manage subscriptions of any workspace has been revoked.">
                        <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                      </Tooltip>                    
                    )
                  }
                </Box>
            )}
          </Stack>

          { (subscriptionState?.status !== 'TRIAL' && !subscriptionState?.cancelAtPeriodEnd) && (
            <>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Purchase Extra Credits
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Credits Quantity"
                      type="number"
                      size="small"
                      value={rechargeAmount}
                      onChange={event => setRechargeAmount(Number(event.target.value))}
                      disabled={userBelongsToSelectedWorkspace
                        ? !canPurchaseExtraCredits
                        : !canPurchaseExtraCreditsAsAdmin
                      }
                    />
                    <Chip label={rechargeCost + ' ' + currency.toUpperCase()} />
                    <Button
                      variant="contained"
                      onClick={handlePurchaseExtraCredits}
                      disabled={userBelongsToSelectedWorkspace
                        ? !canPurchaseExtraCredits
                        : !canPurchaseExtraCreditsAsAdmin
                      }
                      sx={{
                          '&.Mui-disabled': {
                              color:
                              resolvedMode == 'dark'
                                  ? theme.palette.grey[400]
                                  : theme.palette.grey[500],
                          }                                
                      }}                      
                    >
                      Buy Now
                    </Button>
                    { userBelongsToSelectedWorkspace
                      ? !canPurchaseExtraCredits && (
                        <Tooltip title="You do not have permission to purchase extra credits for this workspace.">
                          <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                        </Tooltip>                    
                      )
                      : !canPurchaseExtraCreditsAsAdmin && (
                        <Tooltip title="Your admin privileges to purchase extra credits for any workspace has been revoked.">
                          <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                        </Tooltip>                    
                      )
                    }
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Automatic Extra Credits: Smart Recharge
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRechargeEnabled}
                        onChange={() => {
                            setAutoRechargeEnabled(!autoRechargeEnabled);
                            handleUpdateSmartRechargeSetting(workspaceId as string, !autoRechargeEnabled);
                        }}
                        disabled={userBelongsToSelectedWorkspace
                          ? !canManageSmartRechargeSettings
                          : !canManageSmartRechargeSettingsAsAdmin
                        }
                      />
                    }
                    label={autoRechargeEnabled ? 'Enabled' : 'Not Enabled'}
                  />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
                        <TextField
                            label="Trigger when below"
                            type="number"
                            value={autoRechargeThreshold}
                            onChange={(e) => setRechargeThreshold(Number(e.target.value))}
                            size="small"
                            disabled={(stripeLoading || !autoRechargeEnabled) 
                                ? true
                                : userBelongsToSelectedWorkspace
                                  ? !canManageSmartRechargeSettings
                                  : !canManageSmartRechargeSettingsAsAdmin
                            }
                        />
                        <TextField
                            label="Recharge amount"
                            type="number"
                            value={autoRechargeAmount}
                            onChange={(e) => setAutoRechargeAmount(Number(e.target.value))}
                            size="small"
                            disabled={ (stripeLoading || !autoRechargeEnabled) 
                                ? true
                                : userBelongsToSelectedWorkspace
                                  ? !canManageSmartRechargeSettings
                                  : !canManageSmartRechargeSettingsAsAdmin
                            }
                        />
                        <Button
                            variant="contained"
                            onClick={() => handleUpdateSmartRechargeSetting(workspaceId as string, autoRechargeEnabled)}
                            disabled={ (stripeLoading || !autoRechargeEnabled) 
                                ? true
                                : userBelongsToSelectedWorkspace
                                  ? !canManageSmartRechargeSettings
                                  : !canManageSmartRechargeSettingsAsAdmin
                            }
                            sx={{
                                '&.Mui-disabled': {
                                    color:
                                    resolvedMode == 'dark'
                                        ? theme.palette.grey[400]
                                        : theme.palette.grey[500],
                                }                                
                            }}
                        >
                            Save Settings
                        </Button>

                        { userBelongsToSelectedWorkspace
                          ? !canManageSmartRechargeSettings && (
                            <Tooltip title="You do not have permission to manage smart recharge settings.">
                              <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                            </Tooltip>                    
                          )
                          : !canManageSmartRechargeSettingsAsAdmin && (
                            <Tooltip title="Your admin privileges to manage smart recharge settings for any workspace has been revoked.">
                              <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
                            </Tooltip>                    
                          )
                        }
                    </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        <SelectPlanDialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} />
        <LoadingBackdrop open={stripeLoading} />
      </CardContent>
    </Card>
  );
}
