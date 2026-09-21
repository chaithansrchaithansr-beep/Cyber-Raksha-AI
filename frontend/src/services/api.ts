import { 
  ScanResult, FusionResult, ThreatReport, ThreatCluster, AlertItem, 
  NationalAnalytics, HeatmapState, User, UserSession, TokenResponse 
} from '../types';

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
  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (_) {}
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
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ refresh_token: refreshToken || '' })
      });
      return handleResponse<{ message: string }>(res);
    },
    logoutAll: async (): Promise<{ message: string }> => {
      const res = await fetch(`${API_BASE_URL}/auth/logout-all`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<{ message: string }>(res);
    },
    getSessions: async (): Promise<UserSession[]> => {
      const res = await fetch(`${API_BASE_URL}/auth/sessions`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<UserSession[]>(res);
    },
    forgotPassword: async (email: string): Promise<{ message: string; mode: string; dev_reset_token?: string }> => {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return handleResponse<{ message: string; mode: string; dev_reset_token?: string }>(res);
    },
    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });
      return handleResponse<{ message: string }>(res);
    },
    changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      return handleResponse<{ message: string }>(res);
    },
    getProfile: async (): Promise<User> => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<User>(res);
    },
    updateProfile: async (data: { name?: string; language?: string }): Promise<User> => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<User>(res);
    }
  },

  scans: {
    scanUrl: async (url: string) => {
      const res = await fetch(`${API_BASE_URL}/scans/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ url })
      });
      return handleResponse<ScanResult>(res);
    },
    scanEmail: async (data: { subject: string; sender?: string; body: string }) => {
      const res = await fetch(`${API_BASE_URL}/scans/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<ScanResult>(res);
    },
    scanMessage: async (data: { text: string; source_channel?: string }) => {
      const res = await fetch(`${API_BASE_URL}/scans/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<ScanResult>(res);
    },
    scanWebsite: async (data: { url: string; simulated_brand?: string }) => {
      const res = await fetch(`${API_BASE_URL}/scans/website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<ScanResult>(res);
    },
    scanScreenshot: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/scans/screenshot`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      return handleResponse<ScanResult>(res);
    },
    scanQr: async (data: { extracted_data?: string }) => {
      const res = await fetch(`${API_BASE_URL}/scans/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<ScanResult>(res);
    },
    scanQrImage: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/scans/qr-image`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      return handleResponse<ScanResult>(res);
    },
    scanFusion: async (data: { url?: string; message?: string; screenshot_text?: string; brand_context?: string }) => {
      const res = await fetch(`${API_BASE_URL}/scans/fusion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<FusionResult>(res);
    },
    getHistory: async () => {
      const res = await fetch(`${API_BASE_URL}/scans/history`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<ScanResult[]>(res);
    },
    deleteScan: async (scanId: number) => {
      const res = await fetch(`${API_BASE_URL}/scans/${scanId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
    getPdfDownloadUrl: (scanId: number) => `${API_BASE_URL}/scans/${scanId}/pdf`,
    getJson: async (scanId: number) => {
      const res = await fetch(`${API_BASE_URL}/scans/${scanId}/json`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    }
  },

  citizen: {
    getDashboardStats: async (): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/citizen/dashboard-stats`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    },
    getMyReports: async (): Promise<ThreatReport[]> => {
      const res = await fetch(`${API_BASE_URL}/threats/my-reports`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<ThreatReport[]>(res);
    }
  },

  org: {
    getDashboardStats: async (): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/dashboard-stats`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    },
    getDomains: async (): Promise<any[]> => {
      const res = await fetch(`${API_BASE_URL}/org/domains`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any[]>(res);
    },
    registerDomain: async (domain: string): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ domain })
      });
      return handleResponse<any>(res);
    },
    verifyDomain: async (domainId: number): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/domains/${domainId}/verify`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    },
    getTeam: async (): Promise<any[]> => {
      const res = await fetch(`${API_BASE_URL}/org/team`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any[]>(res);
    },
    addTeamMember: async (data: any): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    removeTeamMember: async (memberId: number): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/team/${memberId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    },
    getIncidents: async (): Promise<any[]> => {
      const res = await fetch(`${API_BASE_URL}/org/incidents`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any[]>(res);
    },
    createIncident: async (data: any): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    updateIncident: async (incidentId: number, data: any): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    exportIncident: async (incidentId: number): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/org/incidents/${incidentId}/export`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    }
  },

  threats: {
    getReports: async () => {
      const res = await fetch(`${API_BASE_URL}/threats/reports`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<ThreatReport[]>(res);
    },
    getMyReports: async () => {
      const res = await fetch(`${API_BASE_URL}/threats/my-reports`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<ThreatReport[]>(res);
    },
    submitReport: async (report: any) => {
      const res = await fetch(`${API_BASE_URL}/threats/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(report)
      });
      return handleResponse<ThreatReport>(res);
    },
    upvoteReport: async (reportId: number) => {
      const res = await fetch(`${API_BASE_URL}/threats/reports/${reportId}/upvote`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<{ success: boolean; upvotes: number }>(res);
    }
  },

  clusters: {
    getClusters: async () => {
      const res = await fetch(`${API_BASE_URL}/threats/clusters`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<ThreatCluster[]>(res);
    },
    takeAction: async (clusterCode: string, action: string, mergeTargetCode?: string) => {
      const res = await fetch(`${API_BASE_URL}/threats/clusters/${clusterCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ action, merge_target_code: mergeTargetCode })
      });
      return handleResponse<any>(res);
    }
  },

  alerts: {
    getAlerts: async () => {
      const res = await fetch(`${API_BASE_URL}/alerts`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<AlertItem[]>(res);
    },
    simulateEvent: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/simulate-event`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    },
    simulateThreatEvent: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/simulate-event`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    }
  },

  analytics: {
    getNationalAnalytics: async () => {
      const res = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<NationalAnalytics>(res);
    },
    getHeatmap: async () => {
      const res = await fetch(`${API_BASE_URL}/analytics/heatmap`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<HeatmapState[]>(res);
    }
  },

  admin: {
    getDashboardStats: async (): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    },
    getUsers: async (params?: { q?: string; role?: string }): Promise<User[]> => {
      const query = new URLSearchParams();
      if (params?.q) query.append('q', params.q);
      if (params?.role) query.append('role', params.role);
      const url = `${API_BASE_URL}/admin/users${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await fetch(url, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<User[]>(res);
    },
    toggleUserStatus: async (userId: number) => {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<{ success: boolean; user_id: number; is_active: boolean }>(res);
    },
    getOrganizations: async (): Promise<any[]> => {
      const res = await fetch(`${API_BASE_URL}/admin/organizations`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any[]>(res);
    },
    verifyOrganization: async (orgId: number): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/admin/organizations/${orgId}/verify`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    },
    getThreatReports: async (status?: string): Promise<ThreatReport[]> => {
      const url = `${API_BASE_URL}/admin/threat-reports${status ? `?status=${status}` : ''}`;
      const res = await fetch(url, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<ThreatReport[]>(res);
    },
    updateThreatReportStatus: async (reportId: number, status: string, adminNotes?: string): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/admin/threat-reports/${reportId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      });
      return handleResponse<any>(res);
    },
    getModels: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/models`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any[]>(res);
    },
    getAuditLogs: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any[]>(res);
    },
    getHealth: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/health`, {
        headers: { ...getAuthHeader() }
      });
      return handleResponse<any>(res);
    }
  },

  assistant: {
    chat: async (message: string, history: any[] = []) => {
      const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ message, history })
      });
      return handleResponse<{ reply: string; category: string; suggested_actions: string[]; emergency_contacts: string[] }>(res);
    }
  }
};
