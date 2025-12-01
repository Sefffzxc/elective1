// services/websocket.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('⚠️ WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    console.log('🔄 Attempting to connect to WebSocket...');

    try {
      this.ws = new WebSocket('ws://localhost:4001');

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        console.log('📋 Active listeners:', Array.from(this.listeners.keys()));
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          
          // Notify all listeners for this message type
          const typeListeners = this.listeners.get(message.type) || [];
          console.log(`📢 Notifying ${typeListeners.length} listeners for type: ${message.type}`);
          
          typeListeners.forEach(callback => {
            console.log('🔔 Calling listener callback');
            callback(message);
          });
          
          // Notify all wildcard listeners
          const allListeners = this.listeners.get('*') || [];
          allListeners.forEach(callback => callback(message));
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          console.error('Raw message:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnecting = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  subscribe(messageType, callback) {
    console.log(`📝 Subscribing to message type: ${messageType}`);
    
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    
    this.listeners.get(messageType).push(callback);
    console.log(`✅ Subscribed. Total listeners for ${messageType}: ${this.listeners.get(messageType).length}`);

    // Return unsubscribe function
    return () => {
      console.log(`🗑️ Unsubscribing from ${messageType}`);
      const callbacks = this.listeners.get(messageType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // Add method to check connection status
  getStatus() {
    if (!this.ws) return 'DISCONNECTED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// Create singleton instance
const wsService = new WebSocketService();

// Auto-connect on module load
console.log('🚀 Initializing WebSocket service');
wsService.connect();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.wsService = wsService;
  console.log('🔧 WebSocket service exposed as window.wsService for debugging');
}

export default wsService;