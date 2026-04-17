import React, { useState } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Chip
} from '@mui/material';
import { getPrediction } from '../services/predictionService';

const PredictionCard = ({ symbol, currentPrice, token }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const prices = Array.from({ length: 7 }, (_, i) =>
        parseFloat((currentPrice * (0.97 + i * 0.01)).toFixed(2))
      );

      const res = await getPrediction(symbol, prices, prices[0], token);
      setPrediction(res.predictions);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      mt: 3,
      p: 3,
      borderRadius: 2,
      background: "#ffffff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        AI Price Predictions
      </Typography>

      <Button
        variant="contained"
        onClick={handlePredict}
        sx={{ mb: 2 }}
      >
        {loading ? "Loading..." : "Run Prediction"}
      </Button>

      {prediction && (
        <Grid container spacing={2}>

          <Grid size={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">Predicted Price</Typography>
              <Typography variant="h6" color="green">
                ₹{prediction.newton_interpolation.predictedPrice}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">Trend</Typography>
              <Typography variant="h6">
                {prediction.simpsons_trend.trend}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">Next Day</Typography>
              <Typography variant="h6">
                ₹{prediction.gauss_regression.predictedNext}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">Breakeven</Typography>
              <Typography variant="h6" color="error">
                ₹{prediction.newton_raphson.breakevenPrice}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                5 Day Forecast
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {prediction.rk4_forecast.next5Days.map((p, i) => (
                  <Chip key={i} label={`₹${p}`} />
                ))}
              </Box>
            </Paper>
          </Grid>

        </Grid>
      )}
    </Box>
  );
};

export default PredictionCard;