// Shared types for the analytics dashboard — used by both demo data and real API responses.

export interface DayPoint {
  day: number;
  facebook: number;
  instagram: number;
}

export interface PerPlatformTotals {
  facebook: number;
  instagram: number;
  total: number;
  facebookChange: number;
  instagramChange: number;
  totalChange: number;
}

export interface AnalyticsTotals {
  impressions: PerPlatformTotals;
  engagements: PerPlatformTotals;
  audienceGrowth: PerPlatformTotals;
  engagementRate: PerPlatformTotals;
  postLinkClicks: { total: number; totalChange: number };
}

export interface AnalyticsResponse {
  impressions: DayPoint[];
  engagements: DayPoint[];
  audienceGrowth: DayPoint[];
  engagementRate: DayPoint[];
  totals: AnalyticsTotals;
  fbConnected: boolean;
  igConnected: boolean;
  isSimulated: boolean;
  error?: string;
}
