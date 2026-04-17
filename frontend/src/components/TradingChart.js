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

const TradingChart = ({ data, height = 420 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

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

    // Determine candle bucket size based on data timespan
    const span = data[data.length - 1].time - data[0].time;
    let bucket = 60; // 1-min default
    if (span > 86400) bucket = 900;      // >1day => 15-min candles
    else if (span > 14400) bucket = 300;  // >4hr => 5-min candles
    else if (span > 3600) bucket = 120;   // >1hr => 2-min candles
    else if (span < 120) bucket = 10;     // <2min => 10-sec candles (fresh data)
    else if (span < 600) bucket = 30;     // <10min => 30-sec candles

    const candles = buildCandles(data, bucket);

    if (candles.length >= 1) {
      // Candlestick chart
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      });
      candleSeries.setData(candles);
    } else {
      // Fallback to line if not enough candles
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#22c55e',
        lineWidth: 2,
      });
      const seen = new Set();
      const uniqueData = [];
      for (const point of data) {
        if (!seen.has(point.time)) {
          seen.add(point.time);
          uniqueData.push({ time: point.time, value: point.price });
        }
      }
      lineSeries.setData(uniqueData);
    }

    chart.timeScale().fitContent();
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
      }
    };
  }, [data, height]);

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
