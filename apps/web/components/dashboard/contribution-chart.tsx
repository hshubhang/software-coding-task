"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

interface ContributionData {
  contributions: {
    channel: string;
    incremental_revenue: number;
    spend: number;
    spend_pct: number;
    contribution_pct: number;
    roi: number;
  }[];
  baseline: number;
  total_revenue: number;
}

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
  "hsl(190, 80%, 45%)",
  "hsl(10, 80%, 55%)",
  "hsl(160, 60%, 45%)",
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function ContributionChart({ data }: { data: ContributionData }) {
  const chartData = data.contributions
    .sort((a, b) => b.incremental_revenue - a.incremental_revenue)
    .map((c) => ({
      channel: c.channel,
      revenue: c.incremental_revenue,
      label: formatCurrency(c.incremental_revenue),
    }));

  const chartConfig = Object.fromEntries(
    chartData.map((c, i) => [
      c.channel,
      { label: c.channel, color: COLORS[i % COLORS.length] },
    ])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Contribution</CardTitle>
        <CardDescription>
          Incremental revenue attributed to each media channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => formatCurrency(v)}
            />
            <YAxis type="category" dataKey="channel" width={80} />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
