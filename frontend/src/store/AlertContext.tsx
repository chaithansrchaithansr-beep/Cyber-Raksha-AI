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
      console.warn("Could not load initial threat alerts from backend", e);
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
      await fetchAlerts();
    } catch (e) {
      console.error("Failed to run SecOps threat drill", e);
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
