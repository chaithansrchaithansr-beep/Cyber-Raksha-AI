export type Role = 'citizen' | 'organization' | 'admin';
export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml' | 'mr';

export interface User {
  id: number;
  name: string;
  full_name?: string;
  email: string;
  role: Role;
  language: Language;
  is_active: boolean;
  is_verified?: boolean;
  mfa_enabled: boolean;
  last_login?: string | null;
  organization?: string;
  organization_id?: number | null;
  created_at: string;
}

export interface UserSession {
  id: number;
  user_agent: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
}

export interface ScanResult {
  id: number;
  scan_type: string;
  input_preview?: string;
  classification: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  risk_score: number;
  confidence: number;
  detected_indicators: string[];
  ai_explanation: string;
  recommendations: string[];
  details: Record<string, any>;
  analysis_method?: string;
  report_integrity_hash: string;
  created_at: string;
}

export interface ThreatSignal {
  source: string;
  preview: string;
  risk_score: number;
  indicators: string[];
}

export interface FusionResult {
  campaign_detected: boolean;
  campaign_name: string;
  campaign_risk: string;
  combined_risk_score: number;
  confidence: number;
  signals_correlated: number;
  signals: ThreatSignal[];
  shared_patterns: string[];
  brand_impersonated?: string;
  suggested_cluster_code: string;
  fusion_explanation: string;
  recommended_containment: string[];
  integrity_hash: string;
}

export interface ThreatReport {
  id: number;
  reporter_id?: number;
  threat_type: string;
  severity: string;
  target_brand?: string;
  title?: string;
  description?: string;
  indicators?: string[];
  sanitized_content: string;
  state: string;
  status: string;
  admin_notes?: string;
  upvotes: number;
  cluster_id?: number;
  created_at: string;
}

export interface ThreatCluster {
  id: number;
  cluster_code: string;
  campaign_title: string;
  cluster_type: string;
  severity: string;
  confidence: number;
  report_count: number;
  first_seen: string;
  last_seen: string;
  status: string;
  target_brands: string[];
  common_indicators: string[];
  affected_states: string[];
}

export interface AlertItem {
  id: number;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  active: boolean;
  created_at: string;
}

export interface HeatmapState {
  state_code: string;
  state_name: string;
  report_count: number;
  severity: string;
  top_threat_category: string;
  trend: string;
}

export interface NationalAnalytics {
  total_scans: number;
  high_risk_threats: number;
  verified_campaigns: number;
  active_alerts: number;
  citizens_protected: number;
  average_risk_score: number;
  threat_trends: Array<{
    date: string;
    total_scans: number;
    phishing: number;
    scam_messages: number;
    upi_frauds: number;
  }>;
  category_distribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  severity_distribution: Array<{
    severity: string;
    count: number;
  }>;
  state_heatmaps: HeatmapState[];
}

export interface CitizenDashboardData {
  user_name?: string;
  email?: string;
  total_scans: number;
  high_risk_scans: number;
  total_reports?: number;
  reported_incidents?: number;
  safety_score?: number;
  cyber_safety_score?: number;
  risk_label?: string;
  safety_status?: string;
  recent_scans: ScanResult[];
  recent_reports?: ThreatReport[];
  active_alerts?: Array<{
    id: number;
    title: string;
    message: string;
    severity: string;
    created_at: string;
  }>;
}

export interface OrgDomainItem {
  id: number;
  org_id: number;
  domain: string;
  status: 'pending' | 'verified';
  is_verified?: boolean;
  verification_token?: string;
  risk_score: number;
  created_at: string;
}

export interface OrgIncidentItem {
  id: number;
  org_id: number;
  title: string;
  description?: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';
  investigation_notes?: string;
  created_by_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface OrgTeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface OrgDashboardData {
  org_name?: string;
  org_type?: string;
  verified?: boolean;
  risk_score?: number;
  organization_id?: number;
  monitored_domains?: number;
  domains_count?: number;
  team_size?: number;
  active_monitors?: number;
  total_incidents?: number;
  open_incidents?: number;
  team_count?: number;
  brand_alerts?: Array<{
    domain: string;
    similarity: number;
    risk: string;
    status: string;
    firstSeen?: string;
    first_seen?: string;
  }>;
  lookalike_alerts?: Array<{
    domain: string;
    similarity: number;
    risk: string;
    status: string;
    first_seen: string;
  }>;
  recent_incidents?: OrgIncidentItem[];
  api_key?: string;
  brand_protection_status?: string;
  verified_domain?: string;
}

export interface AdminDashboardData {
  total_users: number;
  total_organizations: number;
  total_scans: number;
  high_risk_scans: number;
  pending_threat_reports: number;
  verified_threat_clusters: number;
  active_alerts: number;
  system_status: string;
  data_source: string;
}
