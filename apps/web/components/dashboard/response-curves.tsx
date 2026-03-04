"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  Legend,
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

interface ResponseCurvesData {
  curves: {
    channel: string;
    current_spend: number;
    spend_points: number[];
    response_points: number[];
  }[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function ResponseCurves({ data }: { data: ResponseCurvesData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Curves</CardTitle>
        <CardDescription>
          Spend vs. incremental revenue — showing diminishing returns per channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.curves.map((curve, idx) => {
            const chartData = curve.spend_points.map((s, i) => ({
              spend: s,
              response: curve.response_points[i],
            }));

            const chartConfig = {
              response: { label: "Incremental Revenue", color: COLORS[idx % COLORS.length] },
            };

            // Find the response at current spend
            const currentIdx = curve.spend_points.findIndex(
              (s) => s >= curve.current_spend
            );
            const currentResponse =
              currentIdx >= 0 ? curve.response_points[currentIdx] : 0;

            return (
              <div key={curve.channel}>
                <h4 className="text-sm font-medium mb-2 capitalize">
                  {curve.channel}
                  <span className="text-muted-foreground font-normal ml-2">
                    Current: {formatCurrency(curve.current_spend)}
                  </span>
                </h4>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="spend"
                      tickFormatter={(v) => formatCurrency(v)}
                      fontSize={10}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      fontSize={10}
                    />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) =>
                            formatCurrency(value as number)
                          }
                          labelFormatter={(label) =>
                            `Spend: ${formatCurrency(label as number)}`
                          }
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="response"
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <ReferenceDot
                      x={curve.current_spend}
                      y={currentResponse}
                      r={5}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
