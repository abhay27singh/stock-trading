import React, { useEffect, useState, useCallback } from 'react';
import { stockService, tradeService } from '../services/api';
import TradingChart from '../components/TradingChart';
import {
  Container, Paper, Typography, Box, Button, TextField, Chip,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { TrendingUp, TrendingDown, ShowChart } from '@mui/icons-material';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadStocks();
    const interval = setInterval(loadStocks, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadStocks = async () => {
    try {
      const res = await stockService.getAllStocks();
      setStocks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = useCallback(async (symbol) => {
    setChartLoading(true);
    try {
      const res = await stockService.getHistory(symbol);
      const formatted = (res.data || [])
        .map(item => {
          const rawTime = item.time || item.recordedAt || item.recorded_at || item.timestamp;
          if (!rawTime) return null;

          let ts;
          if (typeof rawTime === 'number') {
            ts = rawTime;
          } else {
            let clean = rawTime.toString();
            if (clean.includes('.')) clean = clean.split('.')[0];
            clean = clean.replace(' ', 'T');
            ts = Math.floor(new Date(clean).getTime() / 1000);
          }

          if (isNaN(ts)) return null;
          return { time: ts, price: Number(item.price) };
        })
        .filter(Boolean)
        .sort((a, b) => a.time - b.time);

      setHistory(formatted);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const handleSelect = (stock) => {
    setSelectedStock(stock);
    fetchHistory(stock.symbol);
  };

  const handleTrade = async (type) => {
    if (!selectedStock || quantity < 1) return;
    try {
      await tradeService.executeTrade({
        symbol: selectedStock.symbol,
        quantity: Number(quantity),
        type,
      });
      setSnackbar({ open: true, message: `${type} order for ${quantity} ${selectedStock.symbol.replace('.BSE', '')} executed!`, severity: 'success' });
      loadStocks();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data || `${type} failed`, severity: 'error' });
    }
  };

  // Compute AI prediction from actual price history
  const getAIPrediction = () => {
    if (!history || history.length < 10) return null;

    const prices = history.map(h => h.price);
    const latest = prices[prices.length - 1];
    const oldest = prices[0];
    const overallChange = ((latest - oldest) / oldest) * 100;

    // Short-term trend (last 20% of data)
    const shortStart = Math.floor(prices.length * 0.8);
    const shortPrices = prices.slice(shortStart);
    const shortChange = ((shortPrices[shortPrices.length - 1] - shortPrices[0]) / shortPrices[0]) * 100;

    // Volatility
    let sumSqDiff = 0;
    for (let i = 1; i < prices.length; i++) {
      const diff = (prices[i] - prices[i - 1]) / prices[i - 1];
      sumSqDiff += diff * diff;
    }
    const volatility = Math.sqrt(sumSqDiff / (prices.length - 1)) * 100;

    // Determine trend
    let trend, confidence, signal;
    if (shortChange > 0.3 && overallChange > 0) {
      trend = 'Bullish';
      signal = 'BUY';
      confidence = Math.min(92, 60 + Math.abs(shortChange) * 10);
    } else if (shortChange < -0.3 && overallChange < 0) {
      trend = 'Bearish';
      signal = 'SELL';
      confidence = Math.min(92, 60 + Math.abs(shortChange) * 10);
    } else if (Math.abs(shortChange) < 0.15) {
      trend = 'Sideways';
      signal = 'HOLD';
      confidence = 50 + Math.random() * 15;
    } else {
      trend = shortChange > 0 ? 'Mildly Bullish' : 'Mildly Bearish';
      signal = shortChange > 0 ? 'BUY' : 'SELL';
      confidence = 50 + Math.abs(shortChange) * 8;
    }

    return {
      trend,
      signal,
      confidence: Math.min(95, confidence).toFixed(0),
      overallChange: overallChange.toFixed(2),
      shortChange: shortChange.toFixed(2),
      volatility: volatility.toFixed(3),
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const prediction = selectedStock ? getAIPrediction() : null;

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Markets
      </Typography>

      {/* STOCK LIST */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {stocks.map(stock => {
          const isUp = stock.changePercent >= 0;
          const isSelected = selectedStock?.symbol === stock.symbol;
          return (
            <Paper
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              elevation={isSelected ? 6 : 1}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 3,
                minWidth: 160,
                flex: '1 1 160px',
                maxWidth: 220,
                border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                bgcolor: isSelected ? 'rgba(25, 118, 210, 0.04)' : '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold">
                  {stock.symbol.replace('.BSE', '')}
                </Typography>
                {isUp ? (
                  <TrendingUp sx={{ color: '#22c55e', fontSize: 20 }} />
                ) : (
                  <TrendingDown sx={{ color: '#ef4444', fontSize: 20 }} />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>
                ₹{Number(stock.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Chip
                size="small"
                label={`${isUp ? '+' : ''}${Number(stock.changePercent).toFixed(2)}%`}
                sx={{
                  mt: 0.5,
                  fontWeight: 'bold',
                  bgcolor: isUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: isUp ? '#16a34a' : '#dc2626',
                }}
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {stock.companyName}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* SELECTED STOCK DETAIL */}
      {selectedStock && (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* CHART AREA */}
          <Paper
            elevation={3}
            sx={{
              flex: '1 1 600px',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Stock header */}
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {selectedStock.symbol.replace('.BSE', '')}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {selectedStock.companyName}
                  </Typography>
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5} sx={{ mt: 0.5 }}>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{Number(selectedStock.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Chip
                    size="small"
                    icon={selectedStock.changePercent >= 0 ? <TrendingUp /> : <TrendingDown />}
                    label={`${selectedStock.changePercent >= 0 ? '+' : ''}${Number(selectedStock.changePercent).toFixed(2)}%`}
                    color={selectedStock.changePercent >= 0 ? 'success' : 'error'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
              <ShowChart sx={{ fontSize: 40, color: '#9ca3af' }} />
            </Box>

            {/* Chart */}
            <Box sx={{ bgcolor: '#131722', p: 0 }}>
              {chartLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={420}>
                  <CircularProgress sx={{ color: '#22c55e' }} />
                </Box>
              ) : !history || history.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={420}>
                  <Typography color="#9ca3af">No chart data available</Typography>
                </Box>
              ) : (
                <TradingChart data={history} height={420} />
              )}
            </Box>
          </Paper>

          {/* TRADE PANEL + AI */}
          <Box sx={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Trade Card */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Place Order
              </Typography>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                inputProps={{ min: 1 }}
                sx={{ mb: 1.5 }}
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Estimated: ₹{(selectedStock.currentPrice * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Box display="flex" gap={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleTrade('BUY')}
                  sx={{
                    py: 1.3,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    bgcolor: '#22c55e',
                    '&:hover': { bgcolor: '#16a34a' },
                    borderRadius: 2,
                  }}
                >
                  BUY
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleTrade('SELL')}
                  sx={{
                    py: 1.3,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    bgcolor: '#ef4444',
                    '&:hover': { bgcolor: '#dc2626' },
                    borderRadius: 2,
                  }}
                >
                  SELL
                </Button>
              </Box>
            </Paper>

            {/* AI Prediction Card */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #131722 0%, #1e293b 100%)',
                color: '#fff',
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                AI Prediction
              </Typography>
              {prediction ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 0.5 }}>Trend</Typography>
                    <Chip
                      label={prediction.trend}
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        bgcolor: prediction.trend.includes('Bullish')
                          ? 'rgba(34,197,94,0.2)'
                          : prediction.trend.includes('Bearish')
                            ? 'rgba(239,68,68,0.2)'
                            : 'rgba(234,179,8,0.2)',
                        color: prediction.trend.includes('Bullish')
                          ? '#4ade80'
                          : prediction.trend.includes('Bearish')
                            ? '#f87171'
                            : '#fbbf24',
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 0.5 }}>Signal</Typography>
                    <Chip
                      label={prediction.signal}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: prediction.signal === 'BUY'
                          ? '#22c55e'
                          : prediction.signal === 'SELL'
                            ? '#ef4444'
                            : '#eab308',
                        color: '#fff',
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 0.5 }}>Confidence</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ flex: 1, height: 6, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                        <Box
                          sx={{
                            width: `${prediction.confidence}%`,
                            height: '100%',
                            borderRadius: 3,
                            bgcolor: Number(prediction.confidence) > 70 ? '#22c55e' : '#eab308',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="bold">{prediction.confidence}%</Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>Overall</Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={prediction.overallChange >= 0 ? '#4ade80' : '#f87171'}
                      >
                        {prediction.overallChange >= 0 ? '+' : ''}{prediction.overallChange}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>Recent</Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={prediction.shortChange >= 0 ? '#4ade80' : '#f87171'}
                      >
                        {prediction.shortChange >= 0 ? '+' : ''}{prediction.shortChange}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>Volatility</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#fbbf24">
                        {prediction.volatility}%
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Not enough data for prediction
                </Typography>
              )}
            </Paper>

            {/* Stock Stats */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Stock Info
              </Typography>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Previous Close</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ₹{Number(selectedStock.previousPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Change</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={selectedStock.changePercent >= 0 ? 'success.main' : 'error.main'}
                >
                  ₹{(selectedStock.currentPrice - selectedStock.previousPrice).toFixed(2)}
                </Typography>
              </Box>
              {history.length > 0 && (
                <>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Day High</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{Math.max(...history.map(h => h.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Day Low</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{Math.min(...history.map(h => h.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Stocks;
