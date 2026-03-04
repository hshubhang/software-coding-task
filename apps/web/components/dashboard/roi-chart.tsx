"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
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
import { CHART_COLORS } from "@/lib/constants";

interface RoiData {
  channels: {
    channel: string;
    mean: number;
    median: number;
    ci_lower: number;
    ci_upper: number;
  }[];
}

export function RoiChart({ data }: { data: RoiData }) {
  const chartData = data.channels
    .sort((a, b) => b.mean - a.mean)
    .map((c) => ({
      channel: c.channel,
      roi: Number(c.mean.toFixed(2)),
      errorRange: [
        Number((c.mean - c.ci_lower).toFixed(2)),
        Number((c.ci_upper - c.mean).toFixed(2)),
      ],
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
        <CardTitle>ROI by Channel</CardTitle>
        <CardDescription>
          Return on investment with 90% confidence intervals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} margin={{ left: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="channel" />
            <YAxis tickFormatter={(v) => `${v}x`} />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `${value}x`}
                />
              }
            />
            <ReferenceLine y={1} stroke="hsl(0, 0%, 45%)" strokeDasharray="3 3" label={{ value: "1x Break-even", position: "right", fontSize: 11, fill: "hsl(0, 0%, 45%)" }} />
            <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.roi >= 1 ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
                />
              ))}
              <ErrorBar dataKey="errorRange" direction="y" stroke="hsl(0, 0%, 40%)" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
