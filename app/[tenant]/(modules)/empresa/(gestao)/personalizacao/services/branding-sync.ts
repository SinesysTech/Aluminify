/**
 * Branding Synchronization Service
 *
 * Handles cross-tab synchronization of branding updates using the BroadcastChannel API.
 * This ensures that when branding is updated in one tab, other open tabs for the same
 * tenant reflect the changes immediately without needing a reload.
 */

type BrandingUpdateMessage = {
  type: "UPDATE" | "INVALIDATE";
  empresaId: string;
  data?: any;
  timestamp: number;
};

export class BrandingSync {
  private channel: BroadcastChannel | null = null;
  private readonly CHANNEL_NAME = "tenant-branding-sync";
  private listeners: Set<(message: BrandingUpdateMessage) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(this.CHANNEL_NAME);
      this.channel.onmessage = this.handleMessage.bind(this);
    }
  }

  /**
   * Publish an update to other tabs
   */
  publishUpdate(empresaId: string, data?: any) {
    this.postMessage({
      type: "UPDATE",
      empresaId,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Publish invalidation signal to other tabs
   */
  publishInvalidation(empresaId: string) {
    this.postMessage({
      type: "INVALIDATE",
      empresaId,
      timestamp: Date.now(),
    });
  }

  /**
   * Subscribe to messages
   */
  subscribe(callback: (message: BrandingUpdateMessage) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Close channel (cleanup)
   */
  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }

  private postMessage(message: BrandingUpdateMessage) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
  }

  private handleMessage(event: MessageEvent<BrandingUpdateMessage>) {
    if (this.listeners.size > 0 && event.data) {
      this.listeners.forEach((listener) => listener(event.data));
    }
  }
}
