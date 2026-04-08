import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
)

/**
 * Reusable mini line chart for health metrics.
 *
 * Props:
 *   - labels     — x-axis labels (e.g., ["Mon", "Tue", ...])
 *   - data       — numeric values
 *   - color      — line/fill color (hex)
 *   - height     — chart height in px (default 120)
 *   - showFill   — gradient fill under line (default true)
 *   - unit       — y-axis unit label for tooltip (e.g., "bpm")
 */
export default function MiniChart({
  labels = [],
  data = [],
  color = '#6C5CE7',
  height = 120,
  showFill = true,
  unit = '',
}) {
  const chartRef = useRef(null)

  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: color,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: showFill,
        backgroundColor: (ctx) => {
          if (!ctx.chart.chartArea) return 'transparent'
          const { top, bottom } = ctx.chart.chartArea
          const gradient = ctx.chart.ctx.createLinearGradient(0, top, 0, bottom)
          gradient.addColorStop(0, color + '30')
          gradient.addColorStop(1, color + '05')
          return gradient
        },
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      tooltip: {
        backgroundColor: '#2D3436',
        titleColor: '#B2BEC3',
        bodyColor: '#FFFFFF',
        titleFont: { size: 11, weight: 'normal' },
        bodyFont: { size: 13, weight: 'bold' },
        padding: { x: 12, y: 8 },
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} ${unit}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: '#B2BEC3',
          font: { size: 10 },
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        display: false,
        beginAtZero: false,
        grid: { display: false },
      },
    },
  }

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}
