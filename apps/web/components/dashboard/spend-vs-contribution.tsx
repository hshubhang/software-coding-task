"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
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

interface ContributionData {
  contributions: {
    channel: string;
    spend_pct: number;
    contribution_pct: number;
  }[];
}

export function SpendVsContribution({ data }: { data: ContributionData }) {
  const chartData = data.contributions
    .sort((a, b) => b.spend_pct - a.spend_pct)
    .map((c) => ({
      channel: c.channel,
      "Spend %": Number(c.spend_pct.toFixed(1)),
      "Contribution %": Number(c.contribution_pct.toFixed(1)),
    }));

  const chartConfig = {
    "Spend %": { label: "Spend %", color: "hsl(var(--chart-1))" },
    "Contribution %": { label: "Contribution %", color: "hsl(var(--chart-2))" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend vs. Contribution</CardTitle>
        <CardDescription>
          Budget allocation compared to revenue attribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="channel" />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip
              content={
                <ChartTooltipContent formatter={(value) => `${value}%`} />
              }
            />
            <Legend />
            <Bar dataKey="Spend %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Contribution %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
