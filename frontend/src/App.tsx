import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { LanguageProvider } from './store/LanguageContext';
import { AlertProvider } from './store/AlertContext';
import { LiveAlertToast } from './components/LiveAlertToast';
import { AccessDenied } from './components/AccessDenied';
import { Role } from './types';

import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';

// Citizen Pages
import { CitizenDashboard } from './pages/CitizenDashboard';
import { CitizenReportScamPage } from './pages/CitizenReportScamPage';
import { CitizenMyReportsPage } from './pages/CitizenMyReportsPage';
import { UrlScannerPage } from './pages/UrlScannerPage';
import { EmailAnalyzerPage } from './pages/EmailAnalyzerPage';
import { MessageScannerPage } from './pages/MessageScannerPage';
import { WebsiteAnalyzerPage } from './pages/WebsiteAnalyzerPage';
import { ScreenshotAnalyzerPage } from './pages/ScreenshotAnalyzerPage';
import { QrScannerPage } from './pages/QrScannerPage';
import { IncidentReportsPage } from './pages/IncidentReportsPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { AssistantPage } from './pages/AssistantPage';
import { AcademyPage } from './pages/AcademyPage';
import { ThreatAlertsPage } from './pages/ThreatAlertsPage';

// Organization Pages
import { OrgDashboardPage } from './pages/OrgDashboardPage';
import { OrgDomainsPage } from './pages/OrgDomainsPage';
import { OrgIncidentsPage } from './pages/OrgIncidentsPage';
import { OrgTeamPage } from './pages/OrgTeamPage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminOrgsPage } from './pages/AdminOrgsPage';
import { AdminThreatReviewPage } from './pages/AdminThreatReviewPage';
import { AdminSystemHealthPage } from './pages/AdminSystemHealthPage';
import { ThreatFusionPage } from './pages/ThreatFusionPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { ThreatIntelligencePage } from './pages/ThreatIntelligencePage';

// Shared User Account Pages
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route wrapper with RBAC Authorization
interface ProtectedPortalProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedPortal: React.FC<ProtectedPortalProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-xs">
        INITIALIZING CYBER RAKSHA NODE...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <DashboardLayout>
        <AccessDenied requiredRole={allowedRoles.join(' / ').toUpperCase()} />
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LanguageProvider>
        <AuthProvider>
          <AlertProvider>
            <LiveAlertToast />
            <Routes>
              {/* Public Authentication Routes Wrapped in PublicLayout */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
              <Route path="/reset-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

              {/* Citizen & Shared Core Scanners */}
              <Route path="/citizen/dashboard" element={<ProtectedPortal><CitizenDashboard /></ProtectedPortal>} />
              <Route path="/dashboard" element={<ProtectedPortal><CitizenDashboard /></ProtectedPortal>} />
              <Route path="/citizen/report-scam" element={<ProtectedPortal allowedRoles={['citizen', 'admin']}><CitizenReportScamPage /></ProtectedPortal>} />
              <Route path="/citizen/my-reports" element={<ProtectedPortal allowedRoles={['citizen', 'admin']}><CitizenMyReportsPage /></ProtectedPortal>} />
              <Route path="/scan/url" element={<ProtectedPortal><UrlScannerPage /></ProtectedPortal>} />
              <Route path="/scan/email" element={<ProtectedPortal><EmailAnalyzerPage /></ProtectedPortal>} />
              <Route path="/scan/message" element={<ProtectedPortal><MessageScannerPage /></ProtectedPortal>} />
              <Route path="/scan/website" element={<ProtectedPortal><WebsiteAnalyzerPage /></ProtectedPortal>} />
              <Route path="/scan/screenshot" element={<ProtectedPortal><ScreenshotAnalyzerPage /></ProtectedPortal>} />
              <Route path="/scan/qr" element={<ProtectedPortal><QrScannerPage /></ProtectedPortal>} />
              <Route path="/reports" element={<ProtectedPortal><IncidentReportsPage /></ProtectedPortal>} />
              <Route path="/history" element={<ProtectedPortal><ScanHistoryPage /></ProtectedPortal>} />
              <Route path="/assistant" element={<ProtectedPortal><AssistantPage /></ProtectedPortal>} />
              <Route path="/academy" element={<ProtectedPortal><AcademyPage /></ProtectedPortal>} />
              <Route path="/alerts" element={<ProtectedPortal><ThreatAlertsPage /></ProtectedPortal>} />

              {/* Organization Protected Portal */}
              <Route 
                path="/organization/dashboard" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgDashboardPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/org/dashboard" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgDashboardPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/organization/domains" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgDomainsPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/org/domains" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgDomainsPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/organization/incidents" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgIncidentsPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/org/incidents" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgIncidentsPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/organization/team" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgTeamPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/org/team" 
                element={
                  <ProtectedPortal allowedRoles={['organization', 'admin']}>
                    <OrgTeamPage />
                  </ProtectedPortal>
                } 
              />

              {/* Administrator Strictly Protected SecOps Center */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/admin/organizations" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <AdminOrgsPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/admin/threats" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <AdminThreatReviewPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/admin/threat-reports" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <AdminThreatReviewPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/admin/system-health" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <AdminSystemHealthPage />
                  </ProtectedPortal>
                } 
              />

              {/* Admin-Restricted National Intelligence Radar */}
              <Route 
                path="/fusion" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <ThreatFusionPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/heatmap" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <HeatmapPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <AnalyticsDashboardPage />
                  </ProtectedPortal>
                } 
              />
              <Route 
                path="/threats" 
                element={
                  <ProtectedPortal allowedRoles={['admin']}>
                    <ThreatIntelligencePage />
                  </ProtectedPortal>
                } 
              />

              {/* Identity & Account Management */}
              <Route path="/profile" element={<ProtectedPortal><ProfilePage /></ProtectedPortal>} />
              <Route path="/security" element={<ProtectedPortal><SecuritySettingsPage /></ProtectedPortal>} />
              <Route path="/settings" element={<ProtectedPortal><SettingsPage /></ProtectedPortal>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AlertProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
