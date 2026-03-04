"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ChartContainer } from "@workspace/ui/components/chart";
import { Badge } from "@workspace/ui/components/badge";
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/lib/constants";

interface ResponseCurvesData {
  curves: {
    channel: string;
    current_spend: number;
    spend_points: number[];
    response_points: number[];
    marginal_roi?: number;
  }[];
}

export function ResponseCurves({ data }: { data: ResponseCurvesData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Curves</CardTitle>
        <CardDescription>
          Spend vs. incremental revenue per channel.
          Solid line = observed range, dashed = projected beyond current spend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.curves.map((curve, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length];

            // Split into observed (solid) and projected (dotted) at current spend
            // Both series include the current spend point so they connect seamlessly
            const chartData = curve.spend_points.map((s, i) => {
              const atOrBelow = s <= curve.current_spend;
              const atOrAbove = s >= curve.current_spend;
              // Find the nearest point at/above current spend for the overlap
              const isNextAbove = i > 0 && (curve.spend_points[i - 1] ?? 0) < curve.current_spend && s >= curve.current_spend;
              return {
                spend: s,
                observed: atOrBelow || isNextAbove ? curve.response_points[i] : undefined,
                projected: atOrAbove ? curve.response_points[i] : undefined,
              };
            });

            const chartConfig = {
              observed: { label: "Observed", color },
              projected: { label: "Projected", color },
            };

            // Find the response at current spend
            const currentIdx = curve.spend_points.findIndex(
              (s) => s >= curve.current_spend
            );
            const currentResponse =
              currentIdx >= 0 ? curve.response_points[currentIdx] : 0;

            return (
              <div key={curve.channel}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium capitalize">
                    {curve.channel}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Spend: {formatCurrency(curve.current_spend)}
                  </span>
                  {curve.marginal_roi != null && (
                    <Badge variant={curve.marginal_roi >= 1 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                      mROI: {curve.marginal_roi.toFixed(2)}x
                    </Badge>
                  )}
                </div>
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <LineChart data={chartData} margin={{ bottom: 25, left: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="spend"
                      tickFormatter={(v) => formatCurrency(v)}
                      fontSize={10}
                      label={{ value: "Spend", position: "insideBottom", offset: -10, fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      fontSize={10}
                      label={{ value: "Incr. Revenue", angle: -90, position: "insideLeft", offset: -10, fontSize: 10, style: { textAnchor: "middle" } }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const point = payload[0]?.payload;
                        if (!point) return null;
                        const revenue = point.observed ?? point.projected;
                        return (
                          <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm">
                            <p className="font-medium">Spend: {formatCurrency(point.spend)}</p>
                            <p className="text-muted-foreground">Revenue: {formatCurrency(revenue)}</p>
                          </div>
                        );
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="observed"
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke={color}
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      connectNulls={false}
                    />
                    <ReferenceLine
                      x={curve.current_spend}
                      stroke="hsl(0, 0%, 65%)"
                      strokeDasharray="4 4"
                    />
                    <ReferenceDot
                      x={curve.current_spend}
                      y={currentResponse}
                      r={5}
                      fill={color}
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
