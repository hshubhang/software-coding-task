"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

interface ContributionData {
  contributions: {
    channel: string;
    incremental_revenue: number;
    spend: number;
    spend_pct: number;
    contribution_pct: number;
    roi: number;
    cpm: number;
  }[];
  baseline: number;
  total_revenue: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function SummaryTable({ data }: { data: ContributionData }) {
  const sorted = [...data.contributions].sort(
    (a, b) => b.incremental_revenue - a.incremental_revenue
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Summary</CardTitle>
        <CardDescription>
          Complete performance metrics across all channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Spend %</TableHead>
              <TableHead className="text-right">Incremental Revenue</TableHead>
              <TableHead className="text-right">Contribution %</TableHead>
              <TableHead className="text-right">ROI</TableHead>
              <TableHead className="text-right">CPM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow key={c.channel}>
                <TableCell className="font-medium capitalize">
                  {c.channel}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(c.spend)}
                </TableCell>
                <TableCell className="text-right">
                  {c.spend_pct.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(c.incremental_revenue)}
                </TableCell>
                <TableCell className="text-right">
                  {c.contribution_pct.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      c.roi >= 1.5
                        ? "text-green-500"
                        : c.roi >= 1
                          ? "text-yellow-500"
                          : "text-red-500"
                    }
                  >
                    {c.roi.toFixed(1)}x
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  ${c.cpm.toFixed(0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
