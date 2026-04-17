import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tradeService, stockService, userService } from '../services/api';
import AddFunds from '../components/AddFunds';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await userService.getProfile();
        setBalance(Number(res.data.balance) || 0);
      } catch { setBalance(0); }
    };
    fetchBalance();
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes] = await Promise.all([
        tradeService.getPortfolio(),
        stockService.getAllStocks(),
      ]);
      setPortfolio(Array.isArray(portfolioRes.data) ? portfolioRes.data : []);
      setStocks(Array.isArray(stocksRes.data) ? stocksRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, item) => {
      const stock = stocks.find(s => s.id === item.stock?.id);
      return stock ? total + (stock.currentPrice * item.quantity) : total;
    }, 0).toFixed(2);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress size={60} /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Welcome back, {user?.name}! 👋
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1976d2, #42a5f5)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <AccountBalance sx={{ color: 'white', fontSize: 40 }} />
                <Box>
                  <Typography color="white" variant="body2">Available Balance</Typography>
                  <Typography color="white" variant="h5" fontWeight="bold">
                    ₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
              <AddFunds onSuccess={(newBalance) => setBalance(Number(newBalance))} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #2e7d32, #66bb6a)' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingUp sx={{ color: 'white', fontSize: 40 }} />
              <Box>
                <Typography color="white" variant="body2">Portfolio Value</Typography>
                <Typography color="white" variant="h5" fontWeight="bold">
                  ₹{Number(calculatePortfolioValue()).toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #7b1fa2, #ba68c8)' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingDown sx={{ color: 'white', fontSize: 40 }} />
              <Box>
                <Typography color="white" variant="body2">Total Stocks Owned</Typography>
                <Typography color="white" variant="h5" fontWeight="bold">
                  {portfolio.length} Stocks
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>📊 My Portfolio</Typography>
            {portfolio.length === 0 ? (
              <Typography color="text.secondary">No stocks owned yet. Start trading!</Typography>
            ) : (
              <Grid container spacing={2}>
                {portfolio.map((item) => {
                  const stock = stocks.find(s => s.id === item.stock?.id);
                  const currentVal = stock ? (stock.currentPrice * item.quantity).toFixed(2) : 0;
                  const invested = (item.avgBuyPrice * item.quantity).toFixed(2);
                  const profit = (currentVal - invested).toFixed(2);
                  const isProfit = profit >= 0;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography fontWeight="bold">
                            {item.stock?.symbol?.replace('.BSE', '')}
                          </Typography>
                          <Chip label={`${isProfit ? '+' : ''}₹${profit}`}
                            color={isProfit ? 'success' : 'error'} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.quantity} shares @ ₹{item.avgBuyPrice}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Current Value: ₹{Number(currentVal).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
