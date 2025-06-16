import React, { useState } from 'react';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Divider, TextField, Stack,
  Alert, Snackbar, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel,
  IconButton
} from '@mui/material';
import { Payment, CreditCard, AccountBalance, Close } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

const PaymentPatient = ({ invoice, onClose }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Payment processed successfully!',
        severity: 'success'
      });
      setTimeout(() => onClose(), 2000);
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="sm" sx={{ p: 1 }}>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Payment fontSize="small" color="primary" />
              <Typography variant="h6">Payment Details</Typography>
            </Stack>
            <IconButton size="small" onClick={onClose}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>

          {invoice && (
            <>
              <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                Payment for: <strong>{invoice.application_title}</strong>
              </Typography>
              <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                Date: {invoice.SubmittedDate}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <FormControl component="fieldset" sx={{ mb: 1 }}>
              <FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 0.5 }}>Payment Method</FormLabel>
              <RadioGroup
                row
                aria-label="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                sx={{ gap: 1 }}
              >
                <FormControlLabel
                  value="credit"
                  control={<Radio size="small" />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CreditCard fontSize="small" />
                      <Typography variant="body2">Credit Card</Typography>
                    </Stack>
                  }
                  sx={{ m: 0 }}
                />
                <FormControlLabel
                  value="bank"
                  control={<Radio size="small" />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccountBalance fontSize="small" />
                      <Typography variant="body2">Bank Transfer</Typography>
                    </Stack>
                  }
                  sx={{ m: 0 }}
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === 'credit' && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Card Number"
                  name="number"
                  value={cardDetails.number}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Cardholder Name"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleCardChange}
                  placeholder="John Doe"
                  required
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Expiry"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    required
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="CVV"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    required
                  />
                </Stack>
              </Stack>
            )}

            {paymentMethod === 'bank' && (
              <Box sx={{ p: 1, backgroundColor: theme.palette.grey[100], borderRadius: 1, mt: 1 }}>
                <Typography variant="body2" paragraph sx={{ mb: 0.5 }}>
                  Transfer payment to:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  <strong>Bank:</strong> Healthcare Bank<br />
                  <strong>Account:</strong> Medical Services Inc.<br />
                  <strong>Number:</strong> 1234 5678 9012 3456<br />
                  <strong>SWIFT:</strong> HLTBANK123<br />
                  <strong>Ref:</strong> {invoice?.application_title || 'Medical Payment'}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="small"
                type="submit"
                disabled={loading}
                startIcon={<Payment fontSize="small" />}
                sx={{ py: 0.8 }}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%', fontSize: '0.875rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentPatient;