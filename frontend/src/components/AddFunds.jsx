import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography,
  Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, CircularProgress
} from '@mui/material';
import { userService } from '../services/api';

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

const AddFunds = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Simulate payment processing delay (like a real payment gateway)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await userService.deposit(amt);
      setMessage(res.data.message);
      setAmount('');

      // Notify parent to refresh balance
      if (onSuccess) onSuccess(res.data.newBalance);

      setTimeout(() => {
        setOpen(false);
        setMessage('');
      }, 2000);

    } catch (err) {
      setError(err.response?.data || 'Deposit failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="success"
        onClick={() => { setOpen(true); setMessage(''); setError(''); }}
        sx={{ borderRadius: 2, fontWeight: 'bold' }}
      >
        + Add Funds
      </Button>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">💳 Add Funds to Wallet</Typography>
          <Typography variant="body2" color="text.secondary">
            Simulated deposit — instant credit
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* Quick amount buttons */}
          <Typography variant="body2" sx={{ mb: 1, mt: 1 }}>
            Quick Select:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            {QUICK_AMOUNTS.map((amt) => (
              <Chip
                key={amt}
                label={`₹${amt.toLocaleString('en-IN')}`}
                onClick={() => setAmount(String(amt))}
                color={amount === String(amt) ? 'primary' : 'default'}
                clickable
                sx={{ fontWeight: 'bold' }}
              />
            ))}
          </Box>

          {/* Custom amount */}
          <TextField
            fullWidth
            label="Enter Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 1, max: 1000000 }}
            sx={{ mb: 2 }}
          />

          {amount && !isNaN(parseFloat(amount)) && (
            <Box
              sx={{
                p: 2, bgcolor: '#f0f9ff', borderRadius: 2,
                border: '1px solid #bae6fd', mb: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                You will receive
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ₹{parseFloat(amount).toLocaleString('en-IN', {
                  minimumFractionDigits: 2
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Instantly credited to your trading wallet
              </Typography>
            </Box>
          )}

          {/* Success message */}
          {message && (
            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac' }}>
              <Typography color="success.main" fontWeight="bold">
                {message}
              </Typography>
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fca5a5' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpen(false)}
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={loading || !amount}
            variant="contained"
            color="success"
            size="large"
            sx={{ minWidth: 140 }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={18} color="inherit" />
                Processing...
              </Box>
            ) : (
              `Deposit ₹${parseFloat(amount || 0).toLocaleString('en-IN')}`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddFunds;