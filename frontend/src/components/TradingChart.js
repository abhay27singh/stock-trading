import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';

/**
 * Aggregates raw {time, price} ticks into OHLC candles.
 * bucketSeconds = candle width in seconds (default 60 = 1-minute candles).
 */
const buildCandles = (data, bucketSeconds = 60) => {
  if (!data || data.length === 0) return [];

  const buckets = {};
  for (const point of data) {
    const key = Math.floor(point.time / bucketSeconds) * bucketSeconds;
    if (!buckets[key]) {
      buckets[key] = { time: key, open: point.price, high: point.price, low: point.price, close: point.price };
    } else {
      const b = buckets[key];
      b.high = Math.max(b.high, point.price);
      b.low = Math.min(b.low, point.price);
      b.close = point.price;
    }
  }

  return Object.values(buckets).sort((a, b) => a.time - b.time);
};

const pickBucket = (data) => {
  const span = data[data.length - 1].time - data[0].time;
  if (span > 86400) return 900;
  if (span > 14400) return 300;
  if (span > 3600) return 120;
  if (span < 120) return 10;
  if (span < 600) return 30;
  return 60;
};

const TradingChart = ({ data, height = 420 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const lineSeriesRef = useRef(null);
  const fittedRef = useRef(false);

  // Create the chart once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d5db',
        fontFamily: "'Inter', -apple-system, sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.6)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.6)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(224, 227, 235, 0.3)', style: 0 },
        horzLine: { color: 'rgba(224, 227, 235, 0.3)', style: 0 },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2a2e39',
        rightOffset: 5,
        barSpacing: 8,
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
        lineSeriesRef.current = null;
        fittedRef.current = false;
      }
    };
  }, [height]);

  // Update series data without recreating the chart — preserves zoom/pan
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data || data.length === 0) return;

    const bucket = pickBucket(data);
    const candles = buildCandles(data, bucket);

    if (candles.length >= 1) {
      if (!candleSeriesRef.current) {
        candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderDownColor: '#ef4444',
          borderUpColor: '#22c55e',
          wickDownColor: '#ef4444',
          wickUpColor: '#22c55e',
        });
      }
      candleSeriesRef.current.setData(candles);
    } else {
      if (!lineSeriesRef.current) {
        lineSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#22c55e',
          lineWidth: 2,
        });
      }
      const seen = new Set();
      const uniqueData = [];
      for (const point of data) {
        if (!seen.has(point.time)) {
          seen.add(point.time);
          uniqueData.push({ time: point.time, value: point.price });
        }
      }
      lineSeriesRef.current.setData(uniqueData);
    }

    // Only auto-fit on the first data load; afterwards keep the user's zoom.
    if (!fittedRef.current) {
      chart.timeScale().fitContent();
      fittedRef.current = true;
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
};

export default TradingChart;
