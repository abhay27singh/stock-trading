import React, { useEffect, useRef } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';

const TradingChart = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!chartRef.current) return;
    if (!Array.isArray(data) || data.length === 0) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth || 900,
      height: 400,
    });

    const series = chart.addSeries(LineSeries);

    const safeData = data
      .filter(d => d && typeof d.time === 'number' && typeof d.price === 'number')
      .sort((a, b) => a.time - b.time)
      .map(d => ({
        time: d.time,
        value: d.price,
      }));

    if (safeData.length > 0) {
      series.setData(safeData);
    }

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default TradingChart;