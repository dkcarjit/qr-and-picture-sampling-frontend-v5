"use client";

import HourlyChart from "@/components/HourlyChart/HourlyChart";
import { useEffect, useState } from "react";

export default function Page() {
  const [rawData, setRawData] = useState<any>(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    async function fetchReport() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/report/`
      );
      const apiData = await res.json();

      setRawData(apiData);

      const firstDate = new Date(
        apiData.time_periods[0].period_start
      )
        .toISOString()
        .split("T")[0];

      setSelectedDate(firstDate);
    }

    fetchReport();
  }, []);

  useEffect(() => {
    if (!rawData || !selectedDate) return;

    const { time_periods, users, report } = rawData;

    const filteredPeriods = time_periods.filter((period: any) => {
      const date = new Date(period.period_start)
        .toISOString()
        .split("T")[0];
      return date === selectedDate;
    });

    const labels = filteredPeriods.map((period: any) => {
      const start = new Date(period.period_start);
      const end = new Date(period.period_end);

      const formatTime = (date: Date) =>
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      return `${formatTime(start)} - ${formatTime(end)}`;
    });

    const generateColor = (index: number) => {
      const colors = [
        "rgb(255, 159, 64)",
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
      ];
      return colors[index % colors.length];
    };

    const datasets = users.map((user: any, index: number) => {
      const userReport = report[user.username] || [];

      const filteredUserData = userReport
        .filter((entry: any) => {
          const entryDate = new Date(entry.period_start)
            .toISOString()
            .split("T")[0];
          return entryDate === selectedDate;
        })
        .map((entry: any) => entry.count);

      return {
        label: user.username,
        data: filteredUserData,
        borderColor: generateColor(index),
        backgroundColor: generateColor(index)
          .replace("rgb", "rgba")
          .replace(")", ", 0.2)"),
        fill: true,
        pointRadius: 4,
      };
    });

    setChartData({ labels, datasets });
  }, [selectedDate, rawData]);

  if (!rawData) return <div>Loading...</div>;

  const availableDates = [
    ...new Set(
      rawData.time_periods.map((period: any) =>
        new Date(period.period_start).toISOString().split("T")[0]
      )
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto bg-white p-3 md:p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 px-1">
          Hourly Data Chart
        </h2>

        <div className="mb-4">
          <label className="mr-2 font-medium">Select Date:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            {availableDates.map((date: any) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <HourlyChart chartData={chartData} />
      </div>
    </div>
  );
}
