"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ChartContainer } from "@workspace/ui/components/chart";
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/lib/constants";

interface SpendTrendsData {
  channels: string[];
  weekly_data: Record<string, number | string>[];
}

export function SpendTrends({ data }: { data: SpendTrendsData }) {
  const chartConfig = Object.fromEntries(
    data.channels.map((ch, i) => [
      ch,
      { label: ch, color: CHART_COLORS[i % CHART_COLORS.length] },
    ])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Spend Trends</CardTitle>
        <CardDescription>
          Stacked channel spend over time with revenue overlay.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart data={data.weekly_data} margin={{ bottom: 25, left: 25, right: 25 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              fontSize={10}
              tickFormatter={(v: string) => v.slice(5)}
              label={{ value: "Week", position: "insideBottom", offset: -10, fontSize: 11 }}
            />
            <YAxis
              yAxisId="spend"
              tickFormatter={(v: number) => formatCurrency(v)}
              fontSize={10}
              label={{ value: "Spend", angle: -90, position: "insideLeft", offset: -10, fontSize: 10, style: { textAnchor: "middle" } }}
            />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              tickFormatter={(v: number) => formatCurrency(v)}
              fontSize={10}
              label={{ value: "Revenue", angle: 90, position: "insideRight", offset: -10, fontSize: 10, style: { textAnchor: "middle" } }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm max-w-[220px]">
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {formatCurrency(entry.value as number)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />

            {data.channels.map((ch, i) => (
              <Area
                key={ch}
                type="monotone"
                dataKey={ch}
                yAxisId="spend"
                stackId="spend"
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={0.6}
                name={ch}
              />
            ))}

            <Line
              type="monotone"
              dataKey="revenue"
              yAxisId="revenue"
              stroke="#000"
              strokeWidth={2}
              dot={false}
              name="Revenue"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
