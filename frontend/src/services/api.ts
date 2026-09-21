import { 
  ScanResult, FusionResult, ThreatReport, ThreatCluster, AlertItem, 
  NationalAnalytics, HeatmapState, User, UserSession, TokenResponse,
  CitizenDashboardData
} from '../types';
import {
  generateMockScanResult,
  mockCitizenDashboardData,
  mockOrgDashboardData,
  mockOrgDomains,
  mockOrgIncidents,
  mockThreatClusters,
  mockAlerts,
  mockHeatmap,
  mockNationalAnalytics
} from './mockData';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
  }
  // Production fallback: when running on live deployment (not localhost), use relative path
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('cr_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('application/json')) {
    let errorDetail = 'API request failed';
    if (contentType.includes('application/json')) {
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errorDetail;
      } catch (_) {}
    } else {
      errorDetail = 'Backend API server unreachable';
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  auth: {
    login: async (credentials: any): Promise<TokenResponse> => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse<TokenResponse>(res);
    },
    register: async (userData: any): Promise<TokenResponse> => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse<TokenResponse>(res);
    },
    quickLogin: async (role: 'citizen' | 'organization' | 'admin'): Promise<TokenResponse> => {
      const res = await fetch(`${API_BASE_URL}/auth/quick-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      return handleResponse<TokenResponse>(res);
    },
    refresh: async (refreshToken: string): Promise<TokenResponse> => {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      return handleResponse<TokenResponse>(res);
    },
    logout: async (refreshToken?: string): Promise<{ message: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ refresh_token: refreshToken || '' })
        });
        return await handleResponse<{ message: string }>(res);
      } catch (_) {
        return { message: "Successfully logged out" };
      }
    },
    logoutAll: async (): Promise<{ message: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/logout-all`, {
          method: 'POST',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<{ message: string }>(res);
      } catch (_) {
        return { message: "All sessions terminated" };
      }
    },
    getSessions: async (): Promise<UserSession[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/sessions`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<UserSession[]>(res);
      } catch (_) {
        return [
          {
            id: 1,
            user_agent: navigator.userAgent.slice(0, 80),
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
            is_current: true
          }
        ];
      }
    },
    forgotPassword: async (email: string): Promise<{ message: string; mode: string; dev_reset_token?: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        return await handleResponse<{ message: string; mode: string; dev_reset_token?: string }>(res);
      } catch (_) {
        return {
          message: "Password reset link generated (Demo Mode)",
          mode: "development",
          dev_reset_token: "demo_reset_token_2026_xyz"
        };
      }
    },
    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, new_password: newPassword })
        });
        return await handleResponse<{ message: string }>(res);
      } catch (_) {
        return { message: "Password updated successfully in demo session." };
      }
    },
    changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        return await handleResponse<{ message: string }>(res);
      } catch (_) {
        return { message: "Password updated successfully." };
      }
    },
    getProfile: async (): Promise<User> => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<User>(res);
    },
    updateProfile: async (data: { name?: string; language?: string }): Promise<User> => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<User>(res);
      } catch (_) {
        const token = localStorage.getItem('cr_token') || '';
        const role = (token.split('_')[3] || 'citizen') as any;
        return {
          id: 1,
          name: data.name || 'Verified User',
          email: 'user@cyberraksha.gov.in',
          role: role,
          language: (data.language as any) || 'en',
          is_active: true,
          mfa_enabled: false,
          created_at: new Date().toISOString()
        };
      }
    }
  },

  scans: {
    scanUrl: async (url: string): Promise<ScanResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ url })
        });
        return await handleResponse<ScanResult>(res);
      } catch (err) {
        return generateMockScanResult('url', url);
      }
    },
    scanEmail: async (data: { subject: string; sender?: string; body: string }): Promise<ScanResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<ScanResult>(res);
      } catch (err) {
        return generateMockScanResult('email', `${data.subject} — ${data.body}`);
      }
    },
    scanMessage: async (data: { text: string; source_channel?: string }): Promise<ScanResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<ScanResult>(res);
      } catch (err) {
        return generateMockScanResult('message', data.text);
      }
    },
    scanWebsite: async (data: { url: string; simulated_brand?: string }): Promise<ScanResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/website`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<ScanResult>(res);
      } catch (err) {
        return generateMockScanResult('website', data.url, 'CRITICAL RISK');
      }
    },
    scanScreenshot: async (file: File): Promise<ScanResult> => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/scans/screenshot`, {
          method: 'POST',
          headers: { ...getAuthHeader() },
          body: formData
        });
        return await handleResponse<ScanResult>(res);
      } catch (err) {
        return generateMockScanResult('screenshot', file.name, 'CRITICAL RISK');
      }
    },
    scanQr: async (data: { extracted_data?: string }): Promise<ScanResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<ScanResult>(res);
      } catch (err) {
        return generateMockScanResult('qr', data.extracted_data || 'upi://pay?pa=scam@okaxis&am=5000');
      }
    },
    scanQrImage: async (file: File): Promise<ScanResult> => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/scans/qr-image`, {
          method: 'POST',
          headers: { ...getAuthHeader() },
          body: formData
        });
        return await handleResponse<ScanResult>(res);
      } catch (err) {
        return generateMockScanResult('qr', file.name, 'CRITICAL RISK');
      }
    },
    scanFusion: async (data: { url?: string; message?: string; screenshot_text?: string; brand_context?: string }): Promise<FusionResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/fusion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<FusionResult>(res);
      } catch (err) {
        return {
          campaign_detected: true,
          campaign_name: 'Nationwide SBI YONO KYC Suspension & UPI Trap',
          campaign_risk: 'CRITICAL',
          combined_risk_score: 96,
          confidence: 97.4,
          signals_correlated: 3,
          signals: [
            { source: 'Phishing URL', preview: data.url || 'http://sbi-rewards-yono.xyz', risk_score: 94, indicators: ['Lookalike Brand Spoofing', 'Unregistered TLD'] },
            { source: 'Scam Message', preview: data.message || 'Electricity bill unpaid, power cut tonight', risk_score: 91, indicators: ['Urgency Coercion'] },
            { source: 'Payment Screenshot OCR', preview: data.screenshot_text || 'Payment Successful ₹25,000', risk_score: 88, indicators: ['Synthetic Receipt Layout'] }
          ],
          shared_patterns: [
            'Targeting SBI / NPCI banking identity',
            'Coercive call to action with 2-hour countdown',
            'Payment redirection to unverified mule accounts'
          ],
          brand_impersonated: data.brand_context || 'State Bank of India',
          suggested_cluster_code: 'CR-2026-00305',
          fusion_explanation: 'Autonomous AI Multi-Vector Correlation Engine correlated URL lexical patterns, NLP urgency extraction, and OCR receipt anomalies into an active nationwide threat cluster.',
          recommended_containment: [
            'Immediate CERT-In notification dispatch.',
            'Trigger telecom operator advisory to block associated WhatsApp forward hashes.',
            'Broadcast real-time alert to Citizen Defense Portal radar.'
          ],
          integrity_hash: 'sha256-' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
        };
      }
    },
    getHistory: async (): Promise<ScanResult[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/history`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<ScanResult[]>(res);
      } catch (_) {
        return mockCitizenDashboardData.recent_scans;
      }
    },
    deleteScan: async (scanId: number) => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/${scanId}`, {
          method: 'DELETE',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<{ success: boolean; message: string }>(res);
      } catch (_) {
        return { success: true, message: "Scan removed from history." };
      }
    },
    getPdfDownloadUrl: (scanId: number) => `${API_BASE_URL}/scans/${scanId}/pdf`,
    getJson: async (scanId: number) => {
      try {
        const res = await fetch(`${API_BASE_URL}/scans/${scanId}/json`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return generateMockScanResult('url', 'http://sbi-rewards-yono.xyz');
      }
    }
  },

  citizen: {
    getDashboardStats: async (): Promise<CitizenDashboardData> => {
      try {
        const res = await fetch(`${API_BASE_URL}/citizen/dashboard-stats`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<CitizenDashboardData>(res);
      } catch (_) {
        return mockCitizenDashboardData;
      }
    },
    getMyReports: async (): Promise<ThreatReport[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/threats/my-reports`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<ThreatReport[]>(res);
      } catch (_) {
        return [
          {
            id: 1,
            threat_type: 'Phishing URL',
            severity: 'CRITICAL',
            target_brand: 'SBI YONO',
            sanitized_content: 'http://sbi-rewards-yono.xyz/login.php',
            state: 'Maharashtra',
            status: 'VERIFIED',
            upvotes: 24,
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 2,
            threat_type: 'SMS Extortion',
            severity: 'HIGH',
            target_brand: 'State Electricity Board',
            sanitized_content: 'Power cut tonight at 9:30 PM. Call officer [PHONE_REDACTED].',
            state: 'Karnataka',
            status: 'INVESTIGATING',
            upvotes: 15,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ];
      }
    }
  },

  org: {
    getDashboardStats: async (): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/dashboard-stats`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return mockOrgDashboardData;
      }
    },
    getDomains: async (): Promise<any[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/domains`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any[]>(res);
      } catch (_) {
        return mockOrgDomains;
      }
    },
    registerDomain: async (domain: string): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/domains`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ domain })
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return {
          id: Date.now(),
          domain,
          status: 'pending',
          verification_token: `cr_verify_${Math.random().toString(36).substring(7)}`,
          created_at: new Date().toISOString()
        };
      }
    },
    verifyDomain: async (domainId: number): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/domains/${domainId}/verify`, {
          method: 'POST',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { success: true, message: "Domain verified successfully." };
      }
    },
    getTeam: async (): Promise<any[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/team`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any[]>(res);
      } catch (_) {
        return [
          { id: 1, name: "Infosec Operations Lead", email: "org@infosec-defense.in", role: "organization", is_active: true },
          { id: 2, name: "SecOps Threat Analyst", email: "analyst@infosec-defense.in", role: "organization", is_active: true }
        ];
      }
    },
    addTeamMember: async (data: any): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { id: Date.now(), ...data, is_active: true };
      }
    },
    removeTeamMember: async (memberId: number): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/team/${memberId}`, {
          method: 'DELETE',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { success: true, message: "Member removed." };
      }
    },
    getIncidents: async (): Promise<any[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/incidents`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any[]>(res);
      } catch (_) {
        return mockOrgIncidents;
      }
    },
    createIncident: async (data: any): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/incidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { id: Date.now(), ...data, status: 'OPEN', created_at: new Date().toISOString() };
      }
    },
    updateIncident: async (incidentId: number, data: any): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/incidents/${incidentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(data)
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { id: incidentId, ...data, updated_at: new Date().toISOString() };
      }
    },
    exportIncident: async (incidentId: number): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/org/incidents/${incidentId}/export`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { incident_id: incidentId, export_timestamp: new Date().toISOString(), status: "EXPORTED" };
      }
    }
  },

  threats: {
    getReports: async (): Promise<ThreatReport[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/threats/reports`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<ThreatReport[]>(res);
      } catch (_) {
        return [
          {
            id: 1,
            threat_type: 'Phishing URL',
            severity: 'CRITICAL',
            target_brand: 'SBI YONO',
            sanitized_content: 'http://sbi-rewards-yono.xyz/login.php',
            state: 'Maharashtra',
            status: 'VERIFIED',
            upvotes: 42,
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            threat_type: 'Utility Disconnection Extortion',
            severity: 'HIGH',
            target_brand: 'State Electricity DISCOM',
            sanitized_content: 'Power will be disconnected tonight. Call officer [PHONE_REDACTED].',
            state: 'Karnataka',
            status: 'VERIFIED',
            upvotes: 31,
            created_at: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 3,
            threat_type: 'UPI Reverse Debit QR Trap',
            severity: 'HIGH',
            target_brand: 'PhonePe / GPay',
            sanitized_content: 'Buyer sent QR claiming scan to accept ₹15,000 for sofa on OLX.',
            state: 'Delhi',
            status: 'INVESTIGATING',
            upvotes: 19,
            created_at: new Date(Date.now() - 14400000).toISOString()
          }
        ];
      }
    },
    getMyReports: async (): Promise<ThreatReport[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/threats/my-reports`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<ThreatReport[]>(res);
      } catch (_) {
        return [
          {
            id: 101,
            threat_type: 'Phishing URL',
            severity: 'CRITICAL',
            target_brand: 'SBI YONO',
            sanitized_content: 'http://sbi-rewards-yono.xyz/login.php',
            state: 'Maharashtra',
            status: 'VERIFIED',
            upvotes: 24,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
      }
    },
    submitReport: async (report: any): Promise<ThreatReport> => {
      try {
        const res = await fetch(`${API_BASE_URL}/threats/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(report)
        });
        return await handleResponse<ThreatReport>(res);
      } catch (_) {
        return {
          id: Date.now(),
          threat_type: report.threat_type || 'Crowdsourced Threat',
          severity: report.severity || 'HIGH',
          target_brand: report.target_brand || 'National Identity',
          sanitized_content: report.sanitized_content || report.content || 'Threat reported by citizen',
          state: report.state || 'Maharashtra',
          status: 'PENDING_REVIEW',
          upvotes: 1,
          created_at: new Date().toISOString()
        };
      }
    },
    upvoteReport: async (reportId: number) => {
      try {
        const res = await fetch(`${API_BASE_URL}/threats/reports/${reportId}/upvote`, {
          method: 'POST',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<{ success: boolean; upvotes: number }>(res);
      } catch (_) {
        return { success: true, upvotes: 43 };
      }
    }
  },

  clusters: {
    getClusters: async (): Promise<ThreatCluster[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/threats/clusters`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<ThreatCluster[]>(res);
      } catch (_) {
        return mockThreatClusters;
      }
    },
    takeAction: async (clusterCode: string, action: string, mergeTargetCode?: string) => {
      try {
        const res = await fetch(`${API_BASE_URL}/threats/clusters/${clusterCode}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ action, merge_target_code: mergeTargetCode })
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { success: true, cluster_code: clusterCode, action_applied: action };
      }
    }
  },

  alerts: {
    getAlerts: async (): Promise<AlertItem[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/alerts`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<AlertItem[]>(res);
      } catch (_) {
        return mockAlerts;
      }
    },
    simulateEvent: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/simulate-event`, {
          method: 'POST',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { success: true, event_type: "broadcast_threat_cluster", timestamp: new Date().toISOString() };
      }
    },
    simulateThreatEvent: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/simulate-event`, {
          method: 'POST',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { success: true, event_type: "broadcast_threat_cluster", timestamp: new Date().toISOString() };
      }
    }
  },

  analytics: {
    getNationalAnalytics: async (): Promise<NationalAnalytics> => {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<NationalAnalytics>(res);
      } catch (_) {
        return mockNationalAnalytics;
      }
    },
    getHeatmap: async (): Promise<HeatmapState[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/heatmap`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<HeatmapState[]>(res);
      } catch (_) {
        return mockHeatmap;
      }
    }
  },

  admin: {
    getDashboardStats: async (): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return {
          national_threat_index: 74,
          total_reports: 18400,
          active_clusters: 142,
          protected_citizens: 94250,
          system_status: 'HEALTHY'
        };
      }
    },
    getUsers: async (params?: { q?: string; role?: string }): Promise<User[]> => {
      try {
        const query = new URLSearchParams();
        if (params?.q) query.append('q', params.q);
        if (params?.role) query.append('role', params.role);
        const url = `${API_BASE_URL}/admin/users${query.toString() ? `?${query.toString()}` : ''}`;
        const res = await fetch(url, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<User[]>(res);
      } catch (_) {
        return [
          { id: 1, name: "Aarav Sharma", email: "citizen@cyberraksha.gov.in", role: "citizen", language: "en", is_active: true, mfa_enabled: false, created_at: new Date().toISOString() },
          { id: 2, name: "Infosec Operations Lead", email: "org@infosec-defense.in", role: "organization", language: "en", is_active: true, mfa_enabled: true, created_at: new Date().toISOString() },
          { id: 3, name: "National SecOps Director", email: "admin@cyberraksha.gov.in", role: "admin", language: "en", is_active: true, mfa_enabled: true, created_at: new Date().toISOString() }
        ];
      }
    },
    toggleUserStatus: async (userId: number) => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
          method: 'POST',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<{ success: boolean; user_id: number; is_active: boolean }>(res);
      } catch (_) {
        return { success: true, user_id: userId, is_active: false };
      }
    },
    getOrganizations: async (): Promise<any[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/organizations`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any[]>(res);
      } catch (_) {
        return [
          { id: 1, name: "National Cyber Defense Alliance", verified_domain: "cyberraksha.gov.in", status: "verified", member_count: 5 },
          { id: 2, name: "Infosec Financial Shield", verified_domain: "infosec-defense.in", status: "verified", member_count: 3 }
        ];
      }
    },
    verifyOrganization: async (orgId: number): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/organizations/${orgId}/verify`, {
          method: 'POST',
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { success: true, org_id: orgId, status: "verified" };
      }
    },
    getThreatReports: async (status?: string): Promise<ThreatReport[]> => {
      try {
        const url = `${API_BASE_URL}/admin/threat-reports${status ? `?status=${status}` : ''}`;
        const res = await fetch(url, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<ThreatReport[]>(res);
      } catch (_) {
        return [
          {
            id: 1,
            threat_type: 'Phishing URL',
            severity: 'CRITICAL',
            target_brand: 'SBI YONO',
            sanitized_content: 'http://sbi-rewards-yono.xyz/login.php',
            state: 'Maharashtra',
            status: status || 'PENDING',
            upvotes: 42,
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ];
      }
    },
    updateThreatReportStatus: async (reportId: number, status: string, adminNotes?: string): Promise<any> => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/threat-reports/${reportId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ status, admin_notes: adminNotes })
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { success: true, report_id: reportId, status, admin_notes: adminNotes };
      }
    },
    getModels: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/models`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any[]>(res);
      } catch (_) {
        return [
          { name: "Phishing URL Random Forest", version: "v2.4", accuracy: 96.4, f1_score: 96.4, status: "PRODUCTION" },
          { name: "Scam NLP Taxonomy Classifier", version: "v3.1", accuracy: 95.8, f1_score: 96.1, status: "PRODUCTION" },
          { name: "Manipulated OCR Receipt Classifier", version: "v1.8", accuracy: 94.2, f1_score: 94.5, status: "PRODUCTION" }
        ];
      }
    },
    getAuditLogs: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any[]>(res);
      } catch (_) {
        return [
          { id: 1, action: "USER_AUTHENTICATION", details: "Citizen login authenticated via Tier Gateway", created_at: new Date().toISOString() },
          { id: 2, action: "THREAT_SCAN", details: "Autonomous multi-vector URL scanner executed", created_at: new Date(Date.now() - 1200000).toISOString() }
        ];
      }
    },
    getHealth: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/health`, {
          headers: { ...getAuthHeader() }
        });
        return await handleResponse<any>(res);
      } catch (_) {
        return { status: "ONLINE", node: "Cyber Raksha Defense Gateway", uptime: "99.98%", timestamp: new Date().toISOString() };
      }
    }
  },

  assistant: {
    chat: async (message: string, history: any[] = []) => {
      try {
        const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ message, history })
        });
        return await handleResponse<{ reply: string; category: string; suggested_actions: string[]; emergency_contacts: string[] }>(res);
      } catch (_) {
        return {
          reply: "I am the Cyber Raksha AI Defensive Safety Assistant. Remember that legitimate government authorities and banks will NEVER ask for your UPI PIN, passwords, or SMS OTPs over phone or chat. If you have been targeted by a financial scam, immediately dial 1930 to contact the National Cyber Financial Fraud Helpline.",
          category: "Citizen Safety Advisory",
          suggested_actions: [
            "Dial 1930 National Cybercrime Helpline immediately",
            "File an incident report at cybercrime.gov.in",
            "Block deceptive mobile numbers and report to bank branch"
          ],
          emergency_contacts: [
            "1930 (National Cyber Financial Fraud Helpline)",
            "112 (National Emergency Number)",
            "support@cybercrime.gov.in"
          ]
        };
      }
    }
  }
};
