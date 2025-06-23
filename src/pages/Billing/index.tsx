import { useState } from 'react';
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
} from '@mui/material';
import { useAuth, User } from '../../context/AuthContext';
import SelectPlanDialog from './components/SelectPlanDialog';
import { useStripeService } from '../../hooks/useStripeService';
import { Circle } from '@mui/icons-material';

export default function Billing() {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { token, user, workspacePlanCredits, workspaceExtraCredits } = useAuth();
  const { 
    openCustomerPortal,
    purchaseCredits,
    updateSmartRechargeSetting
} = useStripeService(token as string);

  const { smartRecharge, plan, subscription } = user as User;

  const [openPlanDialog, setOpenPlanDialog] = useState(false);

  const formattedDueDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(new Date(subscription?.currentPeriodEnd as string));

  const formattedCancelDate = subscription?.cancelAtPeriodEnd
    ? new Intl.DateTimeFormat('en-US', {
            dateStyle: 'long',
        }).format(new Date(subscription?.canceledAt as string))
    : undefined

  const value = (plan?.amount || 0) / 100; // Stripe gives amounts in cents
  const currency = plan?.currency || 'usd';

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

  const handlePurchaseExtraCredits = async () => {
    await purchaseCredits({ workspaceId: user?.workspaceId as string, credits: rechargeAmount});
  };

  const handleUpdateSmartRechargeSetting = async () => {
    await updateSmartRechargeSetting(user?.workspaceId as string, {
        threshold: autoRechargeThreshold,
        rechargeAmount: autoRechargeAmount,
        active: autoRechargeEnabled
    });
  };

  return (
    <Card variant="outlined" sx={{ margin: '0 auto', width: '100%' }}>
      <CardContent>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Your subscription is{' '}
            <Typography variant="h4" component="span" color="primary">
              {subscription?.status}
            </Typography>
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
            You currently have{' '}
            <Chip
              label={`${workspacePlanCredits.toLocaleString('en-US') || 'No'} credits`}
              color="primary"
              variant="outlined"
              size="small"
            />
            { subscription?.status !== 'TRIAL' && (
                <Chip
                label={`${workspaceExtraCredits.toLocaleString('en-US') || 'No'} extra credits`}
                color="primary"
                variant="outlined"
                size="small"
                />
            )}
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                { subscription?.cancelAtPeriodEnd 
                    ? `Your subscription was cancelled at ${formattedCancelDate}, but your subscription will remain active until `
                    : subscription?.status !== 'TRIAL'
                        ? 'Your next payment is due on '
                        : 'Your trial period ends on '
                }                
                <strong>{formattedDueDate}.</strong>
              </Typography>
              <Typography>
                Plan {plan?.name} — {formattedPrice}/month
              </Typography>
              {plan?.features && (
                <Box sx={{ mt: 1 }}>
                  {plan.features.map((feature: string, index: number) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Circle fontSize="small" color="success" /> {feature}
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            { subscription?.status === 'TRIAL' ? (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenPlanDialog(true)}
                    disabled={!!subscription?.cancelAtPeriodEnd}
                    sx={{
                    '&.Mui-disabled': {
                        color:
                        resolvedMode == 'dark'
                            ? theme.palette.grey[400]
                            : theme.palette.grey[500],
                    },
                    }}
                >
                { subscription?.status === 'TRIAL' 
                    ? 'Confirm Plan'
                    : 'Change Plan'
                }
                </Button>
            ) : (
                <Button
                    disabled={subscription?.status === 'TRIAL'}
                    variant="contained"
                    color="secondary"
                    onClick={() => openCustomerPortal(user?.workspaceId as string)}
                >
                    Manage Subscription
                </Button>
            )}
          </Stack>

          { (subscription?.status !== 'TRIAL' && !subscription?.cancelAtPeriodEnd) && (
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
                    />
                    <Chip label={rechargeCost + ' ' + currency.toUpperCase()} />
                    <Button variant="contained" onClick={handlePurchaseExtraCredits} >Buy Now</Button>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Automatic Extra Credits
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRechargeEnabled}
                        onChange={() => setAutoRechargeEnabled(!autoRechargeEnabled)}
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
                            disabled={!autoRechargeEnabled}
                        />
                        <TextField
                            label="Recharge amount"
                            type="number"
                            value={autoRechargeAmount}
                            onChange={(e) => setAutoRechargeAmount(Number(e.target.value))}
                            size="small"
                            disabled={!autoRechargeEnabled}
                        />
                        <Button variant="contained" onClick={handleUpdateSmartRechargeSetting}>Save</Button>
                    </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        <SelectPlanDialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} />
      </CardContent>
    </Card>
  );
}
