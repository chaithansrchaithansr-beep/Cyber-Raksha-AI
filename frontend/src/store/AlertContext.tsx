import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertItem } from '../types';
import { api } from '../services/api';
import { wsClient } from '../services/ws';

interface AlertContextType {
  alerts: AlertItem[];
  liveNotification: AlertItem | null;
  dismissLiveNotification: () => void;
  simulateThreatEvent: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [liveNotification, setLiveNotification] = useState<AlertItem | null>(null);

  const fetchAlerts = async () => {
    try {
      const data = await api.alerts.getAlerts();
      setAlerts(data);
    } catch (e) {
      // Fallback alerts
      setAlerts([
        {
          id: 1,
          title: "🚨 Active Phishing: Fake SBI YONO APK targeting Android users",
          message: "Malicious APK distributed via SMS claiming urgent reward point redemption.",
          severity: "critical",
          category: "phishing",
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "⚠ Surge in DISCOM Electricity Bill Disconnection Scams",
          message: "Consumers in northern states targeted with fraudulent power cut warnings.",
          severity: "high",
          category: "kyc_scam",
          active: true,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    fetchAlerts();
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((event: any) => {
      if (event.event_type === 'NEW_ALERT' || event.event_type === 'THREAT_SIMULATION') {
        const newAlert = event.alert as AlertItem;
        setAlerts((prev) => [newAlert, ...prev]);
        setLiveNotification(newAlert);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissLiveNotification = () => {
    setLiveNotification(null);
  };

  const simulateThreatEvent = async () => {
    try {
      await api.alerts.simulateThreatEvent();
    } catch (e) {
      // Offline fallback simulation
      const simulated: AlertItem = {
        id: Date.now(),
        title: `🚨 [SIMULATED EVENT] FastPay UPI Impersonation Wave (${new Date().toLocaleTimeString()})`,
        message: "Threat Fusion Engine detected coordinated APK download + SMS phishing campaign targeting Indian UPI users.",
        severity: "critical",
        category: "upi_fraud",
        active: true,
        created_at: new Date().toISOString()
      };
      setAlerts((prev) => [simulated, ...prev]);
      setLiveNotification(simulated);
    }
  };

  return (
    <AlertContext.Provider value={{
      alerts,
      liveNotification,
      dismissLiveNotification,
      simulateThreatEvent,
      refreshAlerts: fetchAlerts
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
