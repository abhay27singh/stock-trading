import React, { useState, useEffect } from 'react';
import { tradeService, stockService } from '../services/api';
import {
  Container, Paper, Typography, Box,
  Chip, CircularProgress, Grid
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, transRes, stocksRes] = await Promise.all([
        tradeService.getPortfolio(),
        tradeService.getHistory(),
        stockService.getAllStocks(),
      ]);
      setPortfolio(Array.isArray(portfolioRes.data) ? portfolioRes.data : []);
      setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
      setStocks(Array.isArray(stocksRes.data) ? stocksRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress size={60} />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        💼 My Portfolio
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Current Holdings
            </Typography>
            {portfolio.length === 0 ? (
              <Typography color="text.secondary">
                No holdings yet — go buy some stocks!
              </Typography>
            ) : (
              portfolio.map((item) => {
                const stock = stocks.find(s => s.id === item.stock?.id);
                const currentVal = stock ?
                  (stock.currentPrice * item.quantity) : 0;
                const invested = item.avgBuyPrice * item.quantity;
                const profit = (currentVal - invested).toFixed(2);
                const profitPct = ((profit / invested) * 100).toFixed(2);
                const isProfit = profit >= 0;
                return (
                  <Box key={item.id} sx={{ mb: 2, p: 2,
                    border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between"
                      alignItems="center">
                      <Typography fontWeight="bold" variant="h6">
                        {item.stock?.symbol?.replace('.BSE', '')}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {isProfit ?
                          <TrendingUp color="success" /> :
                          <TrendingDown color="error" />}
                        <Chip
                          label={`${isProfit ? '+' : ''}${profitPct}%`}
                          color={isProfit ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} shares •
                      Avg: ₹{Number(item.avgBuyPrice)
                        .toLocaleString('en-IN')}
                    </Typography>
                    <Box display="flex" justifyContent="space-between"
                      sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Invested: ₹{Number(invested)
                          .toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="body2"
                        color={isProfit ? 'success.main' : 'error.main'}
                        fontWeight="bold">
                        P&L: {isProfit ? '+' : ''}₹{profit}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Transaction History
            </Typography>
            {transactions.length === 0 ? (
              <Typography color="text.secondary">
                No transactions yet!
              </Typography>
            ) : (
              transactions.map((t) => (
                <Box key={t.id} sx={{ mb: 2, p: 2,
                  border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between"
                    alignItems="center">
                    <Typography fontWeight="bold">
                      {t.stock?.symbol?.replace('.BSE', '')}
                    </Typography>
                    <Chip
                      label={t.type}
                      color={t.type === 'BUY' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t.quantity} shares @ ₹{t.price}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Total: ₹{Number(t.total).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(t.createdAt).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Portfolio;