"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { formatCurrency } from "@/lib/format";

interface SummaryData {
  total_spend: number;
  total_revenue: number;
  media_driven_pct: number;
  time_range: { start: string; end: string; weeks: number };
  channels: string[];
}

export function HeroSection({ data }: { data: SummaryData }) {
  const overallRoi = data.total_revenue / data.total_spend;
  const baselinePct = 100 - data.media_driven_pct;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Media Spend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(data.total_spend)}</p>
          <p className="text-xs text-muted-foreground">
            {data.time_range.weeks} weeks &middot; {data.channels.length} channels
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(data.total_revenue)}</p>
          <p className="text-xs text-muted-foreground">
            {data.time_range.start} to {data.time_range.end}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Overall ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{overallRoi.toFixed(1)}x</p>
          <p className="text-xs text-muted-foreground">
            Revenue per dollar spent
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Media-Driven Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.media_driven_pct.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">
            {baselinePct.toFixed(1)}% organic/baseline
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
