import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartComponentProps {
  data: any[];
  type?: "line" | "bar";
  dataKey: string;
  xKey: string;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  type = "line",
  dataKey,
  xKey,
}) => {
  const Chart = type === "line" ? LineChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {type === "line" ? (
          <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" />
        ) : (
          <Bar dataKey={dataKey} fill="#3b82f6" />
        )}
      </Chart>
    </ResponsiveContainer>
  );
};
