"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { HeroSection } from "@/components/dashboard/hero-section";
import { ContributionChart } from "@/components/dashboard/contribution-chart";
import { RoiChart } from "@/components/dashboard/roi-chart";
import { ResponseCurves } from "@/components/dashboard/response-curves";
import { SpendVsContribution } from "@/components/dashboard/spend-vs-contribution";
import { SummaryTable } from "@/components/dashboard/summary-table";
import { ChatPanel } from "@/components/dashboard/chat-panel";
import { SpendTrends } from "@/components/dashboard/spend-trends";


export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, email, loading: authLoading, logout } = useAuth();

  const { data: summary, loading: summaryLoading } = useDashboardData<{
    total_spend: number;
    total_revenue: number;
    media_driven_pct: number;
    time_range: { start: string; end: string; weeks: number };
    channels: string[];
  }>("/api/dashboard/summary");

  const { data: roi, loading: roiLoading } = useDashboardData<{
    channels: {
      channel: string;
      mean: number;
      median: number;
      ci_lower: number;
      ci_upper: number;
    }[];
  }>("/api/dashboard/roi");
  const { data: contribution, loading: contribLoading } = useDashboardData<{
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
  }>("/api/dashboard/contribution");

  const { data: responseCurves, loading: curvesLoading } = useDashboardData<{
    curves: {
      channel: string;
      current_spend: number;
      spend_points: number[];
      response_points: number[];
    }[];
  }>("/api/dashboard/response-curves");

  const { data: spend, loading: spendLoading } = useDashboardData<{
    channels: string[];
    weekly_data: Record<string, number | string>[];
  }>("/api/dashboard/spend");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  const dataLoading = summaryLoading || roiLoading || contribLoading || curvesLoading || spendLoading;
  
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Marketing Performance</h1>
            <p className="text-sm text-muted-foreground">
              Meridian Marketing Mix Model Analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            {email && (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{email}</span>
              </>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {dataLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[120px]" />
              ))}
            </div>
            <Skeleton className="h-[400px]" />
          </div>
        ) : (
          <>
            {summary && <HeroSection data={summary} />}

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="channels">Channel Analysis</TabsTrigger>
                <TabsTrigger value="curves">Response Curves</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {contribution && <ContributionChart data={contribution} />}
              </TabsContent>

              <TabsContent value="channels" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {roi && <RoiChart data={roi} />}
                  {contribution && <SpendVsContribution data={contribution} />}
                </div>
              </TabsContent>

              <TabsContent value="curves" className="mt-6 space-y-6">
                {responseCurves && <ResponseCurves data={responseCurves} />}
              </TabsContent>

              <TabsContent value="trends" className="mt-6 space-y-6">
                {spend && <SpendTrends data={spend} />}
              </TabsContent>

              <TabsContent value="details" className="mt-6 space-y-6">
                {contribution && <SummaryTable data={contribution} />}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <ChatPanel />
    </div>
  );
}
