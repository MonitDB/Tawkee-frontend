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
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useStripeService } from '../../../hooks/useStripeService';
import { useAuth } from '../../../context/AuthContext';

interface CreatePlanDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePlanDialog({
  open,
  onClose,
}: CreatePlanDialogProps) {
  const { mode, systemMode } = useColorScheme();
  const theme = useTheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const { token } = useAuth();
  const { createPlanFromForm, stripeLoading } = useStripeService(
    token as string
  );

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    creditsLimit: null as number | null,
    agentsLimit: null as number | null,
    trialDays: null as number | null,
    trainingTextLimit: null as number | null,
    trainingDocumentLimit: null as number | null,
    trainingVideoLimit: null as number | null,
    trainingWebsiteLimit: null as number | null,
    isActive: false,
    isEnterprise: false,
    features: [] as string[],
  });

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
    await createPlanFromForm(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Plan</DialogTitle>
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
              value={(form.price / 100).toFixed(2)}
              onChange={(e) => {
                const input = e.target.value;
                const dollars = parseFloat(input);
                if (!isNaN(dollars)) {
                  setForm({ ...form, price: Math.round(dollars * 100) });
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
              value={form.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              label="Agents"
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
              label="Credits"
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
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              label="Text Training Limit"
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
              label="Document Training Limit"
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
              label="Video Training Limit"
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
              label="Website Training Limit"
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
                  checked={form.isActive}
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
            {form.features.map((feature, index) => (
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
                resolvedMode === 'dark'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[500],
            },
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
