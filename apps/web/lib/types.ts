export interface ChannelContribution {
  channel: string;
  incremental_revenue: number;
  spend: number;
  spend_pct: number;
  contribution_pct: number;
  roi: number;
  cpm: number;
}

export interface ContributionData {
  contributions: ChannelContribution[];
  baseline: number;
  total_revenue: number;
}
