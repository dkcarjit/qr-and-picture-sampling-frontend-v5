import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function HourlyChart({ chartData }: any) {
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        min: 0,
        ticks: { stepSize: 5 },
      },
      x: {
        ticks: { autoSkip: true, },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
