import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Box,
  Stack,
} from '@mui/material';
import { useStripeService } from '../../../hooks/useStripeService';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';
import { ProductWithPrices } from '../../../services/stripeService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { green } from '@mui/material/colors';
import LoadingBackdrop from '../../../components/LoadingBackdrop';

interface SelectPlanDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SelectPlanDialog({
  open,
  onClose,
}: SelectPlanDialogProps) {
  const { token, user } = useAuth();
  const {
    getAvailableProducts,
    getBillingStatus,
    subscribeOrChangePlan,
    stripeLoading,
  } = useStripeService(token as string);

  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProductsAndPlan() {
      try {
        setLoading(true);
        const [productData, billing] = await Promise.all([
          getAvailableProducts(),
          getBillingStatus(user?.workspaceId as string),
        ]);

        if (productData) {
          // Sort plans by price (ascending)
          const sorted = productData.sort(
            (a, b) =>
              (a?.prices?.[0]?.unit_amount ?? 0) -
              (b?.prices?.[0]?.unit_amount ?? 0)
          );

          // Filter plans: keep only active
          const filteredProductData = sorted.filter(
            (product) => product.metadata?.isActive
          );

          setProducts(filteredProductData);
        }

        if (billing?.currentPlan) setCurrentPlan(billing.currentPlan);
        setLoading(false);
      } catch {
        onClose();
      }
    }

    if (open) fetchProductsAndPlan();
  }, [getAvailableProducts, getBillingStatus, open]);

  const handlePlanSelection = async (priceId: string) => {
    if (!user?.workspaceId) return;
    await subscribeOrChangePlan({ workspaceId: user.workspaceId, priceId });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Change Plan
        <Typography variant="body2" color="primary">
          Choose your plan
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} justifyContent="center">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`skeleton-${i}`}>
                  <Card variant="outlined">
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={48} />
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="rectangular" height={200} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : products.map(({ product, prices, metadata }) => {
                const price = prices[0];
                const isCurrent = product.name === currentPlan;
                const formattedPrice = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: price.currency.toUpperCase(),
                }).format(price.unit_amount / 100);

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderWidth: 2,
                        borderColor: isCurrent ? 'primary.main' : 'transparent',
                        backgroundColor: isCurrent ? 'grey.900' : 'grey.800',
                        color: 'white',
                        height: '100%',

                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {product.name}
                        </Typography>

                        <Typography
                          variant="body1"
                          fontWeight={600}
                          gutterBottom
                        >
                          {formattedPrice}/month
                        </Typography>

                        {product.description && (
                          <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ mb: 2 }}
                          >
                            {product.description}
                          </Typography>
                        )}

                        <Stack spacing={0.5}>
                          {metadata?.features?.map((f: string) => (
                            <Box
                              key={f}
                              display="flex"
                              alignItems="center"
                              sx={{ gap: 1 }}
                            >
                              <CheckCircleIcon
                                fontSize="small"
                                sx={{ color: green[500] }}
                              />
                              <Typography variant="body2" color="white">
                                {f}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                      <DialogActions
                        sx={{
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          pb: 2,
                        }}
                      >
                        <Button
                          disabled={isCurrent}
                          variant="contained"
                          color="primary"
                          onClick={() => handlePlanSelection(price.id)}
                          sx={{ borderRadius: 2, px: 4 }}
                        >
                          {isCurrent ? 'Current Plan' : 'Choose Plan'}
                        </Button>
                      </DialogActions>
                    </Card>
                  </Grid>
                );
              })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <LoadingBackdrop open={stripeLoading} />
    </Dialog>
  );
}
