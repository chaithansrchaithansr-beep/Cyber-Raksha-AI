import { 
  ScanResult, FusionResult, ThreatReport, ThreatCluster, AlertItem, 
  NationalAnalytics, HeatmapState, CitizenDashboardData, OrgDomainItem, OrgIncidentItem
} from '../types';

export const mockAlerts: AlertItem[] = [
  {
    id: 1,
    title: "Nationwide SBI YONO APK Malware Phishing Alert",
    message: "Critical wave of WhatsApp APK distributions (SBI_Rewards.apk) masquerading as annual loyalty redemption points. Exfiltrates SMS OTPs.",
    severity: "critical",
    category: "Banking Trojan",
    active: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    title: "Electricity Bill Power Disconnection SMS Threat",
    message: "Urgent SMS claiming power supply will be cut at 9:30 PM due to unpaid DISCOM dues. Deceptive officer mobile numbers attached.",
    severity: "high",
    category: "Extortion SMS",
    active: true,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 3,
    title: "UPI QR Code Reverse Auto-Debit Traps",
    message: "Fake marketplace buyers sending QR codes with embedded `am=` debit parameters claiming citizen must scan to 'receive refund'.",
    severity: "high",
    category: "UPI Scam",
    active: true,
    created_at: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 4,
    title: "Telegram Part-Time YouTube Rating Work-From-Home Fraud",
    message: "Victims lured with ₹500 initial returns for video likes, then coerced into high-yield crypto escrow deposits.",
    severity: "medium",
    category: "Employment Scam",
    active: true,
    created_at: new Date(Date.now() - 28800000).toISOString()
  }
];

export const mockThreatClusters: ThreatCluster[] = [
  {
    id: 1,
    cluster_code: "CR-2026-00305",
    campaign_title: "Nationwide SBI YONO KYC Suspension & UPI Trap",
    cluster_type: "Coordinated Banking Trojan",
    severity: "CRITICAL",
    confidence: 97.4,
    report_count: 142,
    first_seen: new Date(Date.now() - 86400000 * 4).toISOString(),
    last_seen: new Date().toISOString(),
    status: "ACTIVE",
    target_brands: ["State Bank of India", "YONO", "NPCI / UPI"],
    common_indicators: [
      "sbi-rewards-yono.xyz",
      "SMS urgency 'KYC suspended today'",
      "Embedded PhonePe receiver QR",
      "Dynamic WhatsApp forward chains"
    ],
    affected_states: ["Maharashtra", "Karnataka", "Delhi", "Telangana", "Uttar Pradesh"]
  },
  {
    id: 2,
    cluster_code: "CR-2026-00219",
    campaign_title: "State DISCOM Bill Overdue Threat Wave",
    cluster_type: "Utility Extortion",
    severity: "HIGH",
    confidence: 94.1,
    report_count: 88,
    first_seen: new Date(Date.now() - 86400000 * 7).toISOString(),
    last_seen: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "INVESTIGATING",
    target_brands: ["BESCOM", "MSEDCL", "UPPCL", "Tata Power"],
    common_indicators: [
      "Electricity disconnection tonight at 9:30 PM",
      "Unregistered mobile contact spoofing",
      "TeamViewer / AnyDesk quick-support download links"
    ],
    affected_states: ["Karnataka", "Maharashtra", "Gujarat", "Tamil Nadu"]
  }
];

export const mockHeatmap: HeatmapState[] = [
  { state_code: "MH", state_name: "Maharashtra", report_count: 3420, severity: "CRITICAL", top_threat_category: "UPI PIN Traps", trend: "+14%" },
  { state_code: "KA", state_name: "Karnataka", report_count: 2890, severity: "CRITICAL", top_threat_category: "Fake Tech Job Escrows", trend: "+8%" },
  { state_code: "DL", state_name: "Delhi NCR", report_count: 2410, severity: "HIGH", top_threat_category: "KYC Banking Trojans", trend: "-3%" },
  { state_code: "UP", state_name: "Uttar Pradesh", report_count: 2150, severity: "HIGH", top_threat_category: "Electricity Disconnection SMS", trend: "+19%" },
  { state_code: "TG", state_name: "Telangana", report_count: 1840, severity: "HIGH", top_threat_category: "Part-Time Task Frauds", trend: "+5%" },
  { state_code: "TN", state_name: "Tamil Nadu", report_count: 1420, severity: "MODERATE", top_threat_category: "Phishing URLs", trend: "-6%" },
  { state_code: "GJ", state_name: "Gujarat", report_count: 1290, severity: "MODERATE", top_threat_category: "Stock Trading WhatsApp Groups", trend: "+12%" },
  { state_code: "WB", state_name: "West Bengal", report_count: 1120, severity: "MODERATE", top_threat_category: "Loan App Extortion", trend: "+4%" },
  { state_code: "RJ", state_name: "Rajasthan", report_count: 980, severity: "MODERATE", top_threat_category: "Lottery & Gift Card Frauds", trend: "-2%" }
];

export const mockNationalAnalytics: NationalAnalytics = {
  total_scans: 48920,
  high_risk_threats: 18400,
  verified_campaigns: 142,
  active_alerts: 4,
  citizens_protected: 94250,
  average_risk_score: 68.4,
  threat_trends: [
    { date: "Mon", total_scans: 6200, phishing: 2100, scam_messages: 2800, upi_frauds: 1300 },
    { date: "Tue", total_scans: 6800, phishing: 2400, scam_messages: 3100, upi_frauds: 1300 },
    { date: "Wed", total_scans: 7400, phishing: 2800, scam_messages: 3300, upi_frauds: 1300 },
    { date: "Thu", total_scans: 7100, phishing: 2600, scam_messages: 3200, upi_frauds: 1300 },
    { date: "Fri", total_scans: 8200, phishing: 3100, scam_messages: 3700, upi_frauds: 1400 },
    { date: "Sat", total_scans: 6900, phishing: 2500, scam_messages: 3100, upi_frauds: 1300 },
    { date: "Sun", total_scans: 6320, phishing: 2200, scam_messages: 2900, upi_frauds: 1220 }
  ],
  category_distribution: [
    { category: "Phishing URLs", count: 17700, percentage: 36.2 },
    { category: "SMS & WhatsApp Scams", count: 22200, percentage: 45.4 },
    { category: "UPI & QR Traps", count: 9020, percentage: 18.4 }
  ],
  severity_distribution: [
    { severity: "CRITICAL", count: 18400 },
    { severity: "HIGH", count: 14200 },
    { severity: "MODERATE", count: 10120 },
    { severity: "LOW", count: 6200 }
  ],
  state_heatmaps: mockHeatmap
};

export const generateMockScanResult = (
  scanType: string,
  target: string,
  forceRisk?: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK'
): ScanResult => {
  const lower = target.toLowerCase();
  const isSuspicious = forceRisk 
    ? (forceRisk === 'HIGH RISK' || forceRisk === 'CRITICAL RISK')
    : (lower.includes('yono') || lower.includes('reward') || lower.includes('bill') || 
       lower.includes('pay') || lower.includes('xyz') || lower.includes('work') || 
       lower.includes('192.168.') || lower.includes('upi') || lower.includes('pin') || 
       lower.includes('disconnect') || lower.includes('kyc') || lower.includes('apk') ||
       lower.includes('urgent'));

  const classification = forceRisk || (isSuspicious ? 'CRITICAL RISK' : 'LOW RISK');
  const risk_score = isSuspicious ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 15) + 5;
  const confidence = isSuspicious ? Math.floor(Math.random() * 5) + 94 : Math.floor(Math.random() * 5) + 95;

  const hash = 'sha256-' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    id: Date.now(),
    scan_type: scanType,
    input_preview: target.slice(0, 80),
    classification,
    risk_score,
    confidence,
    detected_indicators: isSuspicious
      ? [
          'High Lexical Entropy & Lookalike Domain Impersonation',
          'Urgency Extortion Keywords Detected (Indian Scam Taxonomy)',
          'Coercive Call to Action Requesting Immediate Payment',
          'Absence of Verified Cryptographic Publisher Signature'
        ]
      : [
          'Verified Domain / Sender Infrastructure',
          'Standard Lexical Entropy Consistent with Benign Content',
          'Valid HTTPS Certificate Authority Signature'
        ],
    ai_explanation: isSuspicious
      ? `Autonomous AI multi-vector scanner inspected '${target.slice(0, 40)}...' and detected structural threat indicators typical of coordinated scam campaigns. High risk of credential harvesting or payment diversion.`
      : `Verified input structure demonstrates low threat risk. Destination conforms to legitimate national web standards and contains no blacklisted deception signatures.`,
    recommendations: isSuspicious
      ? [
          'NEVER enter your UPI PIN, ATM PIN, passwords, or SMS OTPs.',
          'Do NOT download attachments or third-party APK files.',
          'Report deceptive sender details to the 1930 National Cybercrime Helpline.',
          'Notify CERT-In for coordinated infrastructure takedown.'
        ]
      : [
          'Standard digital hygiene precautions apply.',
          'Verify URL address bar matches official bank portal before entering sensitive tokens.'
        ],
    details: {
      domain_entropy: isSuspicious ? 4.86 : 2.14,
      nlp_urgency_score: isSuspicious ? 0.94 : 0.08,
      heuristic_penalties: isSuspicious ? 65 : 0,
      ml_model_confidence: confidence / 100.0
    },
    analysis_method: 'AI Multi-Vector Correlation Engine & Random Forest Classifier',
    report_integrity_hash: hash,
    created_at: new Date().toISOString()
  };
};

export const mockCitizenDashboardData: CitizenDashboardData = {
  user_name: 'Aarav Sharma',
  email: 'citizen@cyberraksha.gov.in',
  total_scans: 12,
  high_risk_scans: 3,
  total_reports: 2,
  reported_incidents: 2,
  safety_score: 88,
  cyber_safety_score: 88,
  safety_status: 'WELL DEFENDED',
  risk_label: 'LOW EXPOSURE',
  recent_scans: [
    generateMockScanResult('url', 'http://sbi-rewards-yono.xyz/login.php', 'CRITICAL RISK'),
    generateMockScanResult('message', 'Dear customer, electricity bill unpaid. Power cut at 9:30 PM. Call 9876543210.', 'CRITICAL RISK'),
    generateMockScanResult('url', 'https://onlinesbi.sbi', 'LOW RISK')
  ],
  active_alerts: [
    {
      id: 1,
      title: "Nationwide SBI YONO Phishing Wave",
      message: "Scam links claiming annual rewards expiring today.",
      severity: "CRITICAL",
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

export const mockOrgDashboardData = {
  organization_name: "National Cyber Defense Alliance",
  verified_domain: "cyberraksha.gov.in",
  monitored_domains_count: 6,
  active_threats_count: 2,
  contained_threats_count: 18,
  team_members_count: 5,
  brand_reputation_score: 94,
  recent_incidents: [
    {
      id: 1,
      title: "Lookalike Domain Spoofing Detected: cyberraksha-verify.online",
      severity: "HIGH",
      status: "CONTAINED",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 2,
      title: "Impersonation SMS Campaign Detected targeting State Bank Customers",
      severity: "CRITICAL",
      status: "INVESTIGATING",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ]
};

export const mockOrgDomains: OrgDomainItem[] = [
  {
    id: 1,
    org_id: 1,
    domain: "cyberraksha.gov.in",
    status: "verified",
    is_verified: true,
    risk_score: 4,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 2,
    org_id: 1,
    domain: "infosec-defense.in",
    status: "verified",
    is_verified: true,
    risk_score: 8,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];

export const mockOrgIncidents: OrgIncidentItem[] = [
  {
    id: 1,
    org_id: 1,
    title: "Typosquatting Domain Registered: cyberraksha-support.xyz",
    description: "Domain registered via offshore registrar with DNS pointing to known phishing proxy server.",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    investigation_notes: "Cert-In takedown advisory submitted.",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 2,
    org_id: 1,
    title: "Credential Harvesting Form detected impersonating official portal",
    description: "Phishing page scraped official login CSS to deceive regional officers.",
    severity: "HIGH",
    status: "CONTAINED",
    investigation_notes: "ISP DNS blocking enforced.",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];
