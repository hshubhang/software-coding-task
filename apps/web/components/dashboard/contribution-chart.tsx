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
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/lib/constants";
import type { ContributionData } from "@/lib/types";

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
      { label: c.channel, color: CHART_COLORS[i % CHART_COLORS.length] },
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
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
