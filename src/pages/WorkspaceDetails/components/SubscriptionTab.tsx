import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  Button,
  useTheme,
  useColorScheme,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../context/AuthContext';
import { useStripeService } from '../../../hooks/useStripeService';

export interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  customStripePriceId?: string;
  featureOverrides?: string[];
  creditsLimitOverrides?: number | 'UNLIMITED';
  agentLimitOverrides?: number | 'UNLIMITED';
  trainingTextLimitOverrides?: number | 'UNLIMITED';
  trainingWebsiteLimitOverrides?: number | 'UNLIMITED';
  trainingVideoLimitOverrides?: number | 'UNLIMITED';
  trainingDocumentLimitOverrides?: number | 'UNLIMITED';
  plan: any;
}

interface SubscriptionTabProps {
  subscription: Subscription;
}

export default function SubscriptionTab({ subscription }: SubscriptionTabProps) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';
  const { token, can } = useAuth();
  const { updateSubscriptionOverrides, stripeLoading } = useStripeService(token as string);
  const { plan } = subscription;

  const canOverrideSubscriptionLimitsAsAdmin = can('OVERRIDE_SUBSCRIPTION_LIMITS_AS_ADMIN', 'WORKSPACE');

  const [isEditing, setIsEditing] = useState(false);
  const [editableFeatures, setEditableFeatures] = useState<string[]>(subscription.featureOverrides ?? plan.features);

  const [editableLimits, setEditableLimits] = useState({
    creditsLimitOverrides: subscription.creditsLimitOverrides ?? plan.creditsLimit,
    agentLimitOverrides: subscription.agentLimitOverrides ?? plan.agentLimit,
    trainingTextLimitOverrides: subscription.trainingTextLimitOverrides ?? plan.trainingTextLimit,
    trainingWebsiteLimitOverrides: subscription.trainingWebsiteLimitOverrides ?? plan.trainingWebsiteLimit,
    trainingVideoLimitOverrides: subscription.trainingVideoLimitOverrides ?? plan.trainingVideoLimit,
    trainingDocumentLimitOverrides: subscription.trainingDocumentLimitOverrides ?? plan.trainingDocumentLimit,
  });

  const handleAddFeature = () => {
    setEditableFeatures((prev) => [...prev, '']);
  };

  const handleFeatureChange = (index: number, value: string) => {
    setEditableFeatures((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveFeature = (index: number) => {
    setEditableFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLimitChange = (key: keyof typeof editableLimits, value: string) => {
    setEditableLimits((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const overridesPayload: any = {};

    if (JSON.stringify(editableFeatures) !== JSON.stringify(plan.features)) {
      overridesPayload.featureOverrides = editableFeatures;
    } else {
      overridesPayload.featureOverrides = null;
    }

    for (const [key, value] of Object.entries(editableLimits)) {
      const planValue = plan[key.replace('Overrides', '')];
      const isPlanUnlimited = planValue === null || planValue === undefined;
      const isUserUnlimited = value === '' || value === null || value === undefined;

      if (isUserUnlimited) {
        overridesPayload[key] = {
          value: 'UNLIMITED',
          explicitlySet: !isPlanUnlimited,
        };
      } else {
        const numericValue = Number(value);
        const isEqual = numericValue === planValue;

        overridesPayload[key] = {
          value: numericValue,
          explicitlySet: !isEqual,
        };
      }
    }

    await updateSubscriptionOverrides({ subscriptionId: subscription.id, overrides: overridesPayload });
    setIsEditing(false);
  };

  const handleRemoveOverrides = async () => {
    const resetPayload: any = {
      featureOverrides: null,
    };

    for (const key of Object.keys(editableLimits)) {
      const planValue = plan[key.replace('Overrides', '')];

      if (planValue === null || planValue === undefined) {
        resetPayload[key] = {
          value: 'UNLIMITED',
          explicitlySet: false,
        };
      } else {
        resetPayload[key] = {
          value: Number(planValue),
          explicitlySet: false,
        };
      }
    }

    await updateSubscriptionOverrides({ subscriptionId: subscription.id, overrides: resetPayload });
    setEditableFeatures(plan.features);

    setEditableLimits({
      creditsLimitOverrides: plan.creditsLimit,
      agentLimitOverrides: plan.agentLimit,
      trainingTextLimitOverrides: plan.trainingTextLimit,
      trainingWebsiteLimitOverrides: plan.trainingWebsiteLimit,
      trainingVideoLimitOverrides: plan.trainingVideoLimit,
      trainingDocumentLimitOverrides: plan.trainingDocumentLimit,
    });

    setIsEditing(false);
  };

  const hasOverrides = (() => {
    const featuresChanged =
      JSON.stringify(editableFeatures) !== JSON.stringify(plan.features);

    const limitsChanged = Object.entries(editableLimits).some(([key, value]) => {
      const planValue = plan[key.replace('Overrides', '')];
      const isPlanUnlimited = planValue === null || planValue === undefined;
      const isUserUnlimited = value === '' || value === null || value === undefined;

      if (isUserUnlimited && isPlanUnlimited) return false;
      if (!isUserUnlimited && planValue === Number(value)) return false;

      return true;
    });

    return featuresChanged || limitsChanged;
  })();

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : '—';

  function renderLimitDisplay(planValue?: number, overrideValue?: number | 'UNLIMITED' | undefined) {
    const hasOverride = overrideValue !== undefined;
    const isPlanUnlimited = planValue === null || planValue === undefined;
    const isOverrideUnlimited = overrideValue === 'UNLIMITED';

    if (!hasOverride) {
      return <Typography variant="body2">{planValue ?? 'Unlimited'}</Typography>;
    }

    if (isPlanUnlimited && isOverrideUnlimited) {
      return <Typography variant="body2">Unlimited</Typography>;
    }

    if (isPlanUnlimited && !isOverrideUnlimited) {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>Unlimited</Typography>
          <Typography variant="body2">→</Typography>
          <Typography variant="body2" fontWeight="bold">{overrideValue}</Typography>
        </Box>
      );
    }

    if (!isPlanUnlimited && isOverrideUnlimited) {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>{planValue}</Typography>
          <Typography variant="body2">→</Typography>
          <Typography variant="body2" fontWeight="bold" color="success.main">Unlimited</Typography>
        </Box>
      );
    }

    if (!isPlanUnlimited && overrideValue !== planValue) {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>{planValue}</Typography>
          <Typography variant="body2">→</Typography>
          <Typography variant="body2" fontWeight="bold">{overrideValue}</Typography>
        </Box>
      );
    }

    return <Typography variant="body2">{planValue}</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Subscription & Plan Details</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            size='small'
            variant='outlined'
            onClick={() => handleRemoveOverrides()}
            disabled={stripeLoading
              ? true
              : !hasOverrides || !canOverrideSubscriptionLimitsAsAdmin
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-disabled': {
                color: resolvedMode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[500],
              },
            }}
          >
            Remove Overrides
          </Button>
          <Button
            variant={isEditing ? 'contained' : 'outlined'}
            size="small"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={stripeLoading
              ? true
              : !canOverrideSubscriptionLimitsAsAdmin
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-disabled': {
                color: resolvedMode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[500],
              },
            }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          { !canOverrideSubscriptionLimitsAsAdmin && (
            <Tooltip title="Your admin privileges to override subscription limits of any workspace has been revoked.">
              <InfoIcon fontSize="small" sx={{ ml: 0.5 }} color='warning' />
            </Tooltip>              
          )}
        </Box>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <FormControl fullWidth>
            <FormLabel sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Typography>Stripe Subscription ID</Typography>             
              <Tooltip title="The subscription identifier from Stripe.">
                <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Tooltip>
            </FormLabel>
            <TextField value={subscription.stripeSubscriptionId} disabled />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <FormControl fullWidth>
            <FormLabel sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Typography>Status</Typography>             
              <Tooltip title="The status of the subscription.">
                <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Tooltip>
            </FormLabel>
            <TextField value={subscription.status} disabled />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <FormControl fullWidth>
            <FormLabel sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Typography>Current Period</Typography>             
              <Tooltip title="Start and end dates of the current subscription.">
                <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Tooltip>
            </FormLabel>
            <TextField
              value={`${formatDate(subscription.currentPeriodStart)} → ${formatDate(subscription.currentPeriodEnd)}`}
              disabled
            />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <FormControl fullWidth>
            <FormLabel>Plan Name</FormLabel>
            <TextField value={plan.name} disabled />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 8 }}>
          <FormControl fullWidth>
            <FormLabel>Description</FormLabel>
            <TextField value={plan.description ?? '—'} disabled />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <FormLabel sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
              <Typography variant='subtitle1'>Features</Typography>             
              <Tooltip title={ isEditing ? "You can override the plan features and limits while in edit mode." : "List of features from the current plan."}>
                <InfoIcon
                  fontSize="small"
                  sx={{ ml: 0.5 }}
                  color={ isEditing ? 'info' : 'inherit'}
                />
              </Tooltip>
            </FormLabel>
            {isEditing && (
              <Button startIcon={<AddIcon />} size="small" onClick={handleAddFeature}>
                Add Feature
              </Button>
            )}
          </Box>
          {editableFeatures.map((feature, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
              <TextField
                fullWidth
                size="small"
                label={`Feature ${index + 1}`}
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                disabled={!isEditing}
              />
              {isEditing && (
                <IconButton onClick={() => handleRemoveFeature(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Grid>

        {Object.keys(editableLimits).map((key) => {
          const planKey = key.replace('Overrides', '');
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace('Overrides', '')
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());

          const base = plan[planKey];
          const override = subscription[key as keyof Subscription];

          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={key}>
              <FormControl fullWidth>
                <FormLabel>{label}</FormLabel>
                {isEditing ? (
                  <TextField
                    size="small"
                    type="number"
                    fullWidth
                    label={typeof base === 'number' ? `Plan Limit: ${base}` : 'Unlimited in Plan'}
                    slotProps={{
                      input: {
                        inputProps: {
                          min: 0,
                        },
                      },
                    }}
                    placeholder="Leave blank to set as Unlimited"
                    value={editableLimits[key as keyof typeof editableLimits]}
                    onChange={(e) => handleLimitChange(key as keyof typeof editableLimits, e.target.value)}
                  />
                ) : (
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'action.disabledBackground',
                      minHeight: '56px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {renderLimitDisplay(base, override)}
                  </Box>
                )}
              </FormControl>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
