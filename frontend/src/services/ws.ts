type MessageCallback = (data: any) => void;

const getDefaultWsUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim();
    const wsProto = cleanUrl.startsWith('https') ? 'wss' : 'ws';
    const host = cleanUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return `${wsProto}://${host}/ws`;
  }
  return 'ws://localhost:8000/ws';
};

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: MessageCallback[] = [];
  private reconnectInterval: number = 4000;
  private isExplicitlyClosed: boolean = false;

  public connect(url: string = getDefaultWsUrl()) {
    this.isExplicitlyClosed = false;
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[CYBER RAKSHA WS] Real-time threat channel connected.');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((callback) => callback(data));
        } catch (e) {
          console.error('[CYBER RAKSHA WS] Error parsing message', e);
        }
      };

      this.socket.onclose = () => {
        if (!this.isExplicitlyClosed) {
          setTimeout(() => this.connect(url), this.reconnectInterval);
        }
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (err) {
      console.warn('[CYBER RAKSHA WS] Connection failed, retrying...', err);
      setTimeout(() => this.connect(url), this.reconnectInterval);
    }
  }

  public subscribe(callback: MessageCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public close() {
    this.isExplicitlyClosed = true;
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const wsClient = new WebSocketClient();
