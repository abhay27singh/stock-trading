import React, { useState } from 'react';
import { userService } from '../services/api';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, IconButton
} from '@mui/material';
import { Add } from '@mui/icons-material';

const AddFunds = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (value > 1000000) {
      setError('Maximum deposit is 10,00,000');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await userService.deposit(value);
      onSuccess(res.data.newBalance);
      setOpen(false);
      setAmount('');
    } catch (err) {
      setError(err.response?.data || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
      >
        <Add />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Funds</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mt: 1 }}
            inputProps={{ min: 1, max: 1000000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDeposit} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Funds'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddFunds;
