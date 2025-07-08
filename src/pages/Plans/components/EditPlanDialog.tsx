import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Box,
  Typography,
  useTheme,
  useColorScheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useStripeService } from '../../../hooks/useStripeService';
import { useAuth } from '../../../context/AuthContext';

interface StripePlanMeta {
  isActive: boolean;
  agentLimit?: number;
  creditsLimit?: number;
  trainingTextLimit?: number;
  trainingWebsiteLimit?: number;
  trainingVideoLimit?: number;
  trainingDocumentLimit?: number;
  trialDays?: number;
  isEnterprise?: boolean;
  features?: string[];
}

export interface StripePlan {
  product: {
    id: string;
    name: string;
    description?: string;
    metadata: StripePlanMeta;
  };
  prices: {
    id: string;
    currency: string;
    unit_amount: number;
    active: boolean;
    recurring?: {
      interval: string;
      interval_count: number;
    };
  }[];
  metadata: StripePlanMeta;
}

interface EditStripePlan {
  name: string;
  description: string;
  price: number;
  creditsLimit: number | undefined | null;
  agentsLimit: number | undefined | null;
  trialDays: number | undefined | null;
  trainingTextLimit: number | undefined | null;
  trainingDocumentLimit: number | undefined | null;
  trainingVideoLimit: number | undefined | null;
  trainingWebsiteLimit: number | undefined | null;
  isActive: boolean;
  isEnterprise: boolean;

  features: string[];
}

interface EditPlanDialogProps {
  plan: StripePlan | null;
  onClose: () => void;
}

export default function EditPlanDialog({ plan, onClose }: EditPlanDialogProps) {
  const { mode, systemMode } = useColorScheme();
  const theme = useTheme();

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { token } = useAuth();
  const { updatePlanFromForm, stripeLoading } = useStripeService(
    token as string
  );

  const [form, setForm] = useState<EditStripePlan>({
    name: '',
    description: '',
    price: 0,

    creditsLimit: undefined,
    agentsLimit: undefined,
    trialDays: undefined,
    trainingTextLimit: undefined,
    trainingDocumentLimit: undefined,
    trainingVideoLimit: undefined,
    trainingWebsiteLimit: undefined,
    isActive: false,
    isEnterprise: false,

    features: [],
  });

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.product.name,
        description: plan.product?.description || '',
        price: plan.prices[0].unit_amount,

        creditsLimit: plan?.metadata?.creditsLimit,
        agentsLimit: plan?.metadata?.agentLimit,
        trialDays: plan?.metadata?.trialDays,
        trainingTextLimit: plan?.metadata?.trainingTextLimit,
        trainingDocumentLimit: plan?.metadata?.trainingDocumentLimit,
        trainingVideoLimit: plan?.metadata?.trainingVideoLimit,
        trainingWebsiteLimit: plan?.metadata?.trainingWebsiteLimit,
        isActive: plan?.metadata?.isActive,
        isEnterprise: plan?.metadata?.isEnterprise || false,

        features: plan?.metadata?.features || [],
      });
    }
  }, [plan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === '' ? null : parseInt(value, 10),
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...form.features];
    updatedFeatures[index] = value;
    setForm((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  const handleAddFeature = () => {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...form.features];
    updatedFeatures.splice(index, 1);
    setForm((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  const handleSubmit = async () => {
    await updatePlanFromForm(form);
  };

  return (
    <Dialog open={!!plan} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Plan: {form.name}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Price (USD)"
              name="price"
              type="number"
              value={(form.price / 100).toFixed(2)} // Display as dollars
              onChange={(e) => {
                const input = e.target.value;
                const dollars = parseFloat(input);
                if (!isNaN(dollars)) {
                  setForm({ ...form, price: Math.round(dollars * 100) }); // Store as cents
                }
              }}
              slotProps={{ input: { inputProps: { step: 0.1, min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Description"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              label={
                typeof form.agentsLimit == 'number'
                  ? 'Agents Limit'
                  : 'Unlimited Agents'
              }
              name="agentsLimit"
              type="number"
              value={form.agentsLimit ?? ''}
              onChange={handleNumberChange}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              label={
                typeof form.agentsLimit == 'number'
                  ? 'Credits Limit'
                  : 'Unlimited Credits'
              }
              name="creditsLimit"
              type="number"
              value={form.creditsLimit ?? ''}
              onChange={handleNumberChange}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              label="Trial Days"
              name="trialDays"
              type="number"
              value={form.trialDays ?? ''}
              onChange={handleNumberChange}
              slotProps={{ input: { inputProps: { min: 7 } } }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label={
                typeof form.trainingTextLimit == 'number'
                  ? 'Text Training Limit'
                  : 'Unlimited Text Training'
              }
              name="trainingTextLimit"
              type="number"
              placeholder="Unlimited"
              value={form.trainingTextLimit ?? ''}
              onChange={handleNumberChange}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label={
                typeof form.trainingDocumentLimit == 'number'
                  ? 'Document Training Limit'
                  : 'Unlimited Document Training'
              }
              name="trainingDocumentLimit"
              type="number"
              value={form.trainingDocumentLimit ?? ''}
              onChange={handleNumberChange}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label={
                typeof form.trainingVideoLimit == 'number'
                  ? 'Video Training Limit'
                  : 'Unlimited Video Training'
              }
              name="trainingVideoLimit"
              type="number"
              value={form.trainingVideoLimit ?? ''}
              onChange={handleNumberChange}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label={
                typeof form.trainingWebsiteLimit == 'number'
                  ? 'Website Training Limit'
                  : 'Unlimited Website Training'
              }
              name="trainingWebsiteLimit"
              type="number"
              value={form.trainingWebsiteLimit ?? ''}
              onChange={handleNumberChange}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.isActive}
                  onChange={handleCheckboxChange}
                  name="isActive"
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isEnterprise}
                  onChange={handleCheckboxChange}
                  name="isEnterprise"
                />
              }
              label="Enterprise Plan"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="subtitle1">Features</Typography>
              <Button
                startIcon={<AddIcon />}
                size="small"
                onClick={handleAddFeature}
              >
                Add Feature
              </Button>
            </Box>
            {form.features?.map((feature, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
              >
                <TextField
                  fullWidth
                  size="small"
                  label={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                />
                <IconButton onClick={() => handleRemoveFeature(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={stripeLoading}
          sx={{
            '&.Mui-disabled': {
              color:
                resolvedMode == 'dark'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[500],
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
