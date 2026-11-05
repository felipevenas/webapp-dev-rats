import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { wsUrl } from '@/core/config/env';
import { refreshSession, tokenStore } from '@/core/http/api-client';
import type { ChatEvent } from '@/core/types/api';

export type ChatSocketStatus = 'idle' | 'connecting' | 'connected' | 'offline';

type EventListener = (event: ChatEvent) => void;
type StatusListener = (status: ChatSocketStatus) => void;

/**
 * Conexão STOMP única por aba.
 *
 * O token vai no header do frame CONNECT (o browser não permite header no
 * upgrade). Quando o servidor fecha com 4001 (token expirado), o cliente renova
 * pelo refresh single-flight e reconecta. Se o refresh falhar, o AuthProvider
 * limpa a sessão no próximo 401 de HTTP.
 */
export class ChatSocket {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private eventListeners = new Set<EventListener>();
  private statusListeners = new Set<StatusListener>();
  private reconnectTimer: number | null = null;
  private attempt = 0;
  private active = false;
  private refreshing = false;
  private lastRefreshAt = 0;
  private currentStatus: ChatSocketStatus = 'idle';

  connect(): void {
    if (this.active) return;
    this.active = true;
    void this.open();
  }

  disconnect(): void {
    this.active = false;
    this.refreshing = false;
    this.lastRefreshAt = 0;
    this.clearReconnect();
    this.subscription?.unsubscribe();
    this.subscription = null;
    const client = this.client;
    this.client = null;
    if (client) void client.deactivate();
    this.setStatus('idle');
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => this.statusListeners.delete(listener);
  }

  sendTyping(conversationId: string): void {
    if (!this.client?.connected) return;
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId }),
    });
  }

  private async open(): Promise<void> {
    this.clearReconnect();
    this.setStatus('connecting');
    let token = tokenStore.get();
    if (!token) {
      token = await refreshSession();
    }
    if (!token || !this.active) {
      this.setStatus('offline');
      this.scheduleReconnect();
      return;
    }

    const previous = this.client;
    if (previous) {
      this.client = null;
      void previous.deactivate().catch(() => undefined);
    }

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 0,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      connectionTimeout: 10_000,
      debug: () => undefined,
    });

    client.onConnect = () => {
      if (this.client !== client || !this.active) return;
      this.attempt = 0;
      this.setStatus('connected');
      this.subscription?.unsubscribe();
      this.subscription = client.subscribe('/user/queue/chat', (message) => this.emit(message));
    };

    client.onWebSocketClose = (event) => {
      if (this.client !== client) return;
      this.subscription = null;
      this.setStatus('offline');
      if (!this.active || this.refreshing) return;
      if (event.code === 4001) {
        void this.refreshAndReconnect();
      } else if (event.code !== 4003) {
        this.scheduleReconnect();
      }
    };

    client.onStompError = () => {
      if (this.client !== client) return;
      this.setStatus('offline');
      if (!this.active || this.refreshing) return;
      //---- Um broker com erro persistente não pode disparar refresh em loop.
      if (Date.now() - this.lastRefreshAt < 30_000) {
        this.scheduleReconnect();
      } else {
        void this.refreshAndReconnect();
      }
    };

    client.onWebSocketError = () => {
      if (this.client !== client) return;
      this.setStatus('offline');
      if (this.active) this.scheduleReconnect();
    };

    this.client = client;
    client.activate();
  }

  private async refreshAndReconnect(): Promise<void> {
    if (this.refreshing) return;
    if (Date.now() - this.lastRefreshAt < 30_000) {
      this.scheduleReconnect();
      return;
    }
    this.refreshing = true;
    this.lastRefreshAt = Date.now();
    this.clearReconnect();
    this.subscription?.unsubscribe();
    this.subscription = null;
    const client = this.client;
    this.client = null;
    if (client) await client.deactivate().catch(() => undefined);
    try {
      const token = await refreshSession();
      if (!token || !this.active) {
        this.setStatus('offline');
        return;
      }
      await this.open();
    } finally {
      this.refreshing = false;
      if (this.active && this.currentStatus === 'offline') this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.active || this.refreshing || this.reconnectTimer != null) return;
    const base = Math.min(30_000, 1_000 * 2 ** Math.min(this.attempt, 5));
    const delay = base + Math.floor(Math.random() * 400);
    this.attempt += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      void this.open();
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer != null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private emit(message: IMessage): void {
    try {
      const event = JSON.parse(message.body) as ChatEvent;
      if (!event?.type) return;
      this.eventListeners.forEach((listener) => listener(event));
    } catch {
      //---- Evento malformado não pode derrubar o socket.
    }
  }

  private setStatus(status: ChatSocketStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }
}

export const chatSocket = new ChatSocket();
