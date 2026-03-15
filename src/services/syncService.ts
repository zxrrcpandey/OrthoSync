// ==========================================
// OrthoSync - Offline Sync Service
// ==========================================
// Queues operations when offline and syncs when back online.
//
// DEPENDENCY: @react-native-community/netinfo
// Install with: npx expo install @react-native-community/netinfo

import AsyncStorage from '@react-native-async-storage/async-storage';

// NetInfo is imported dynamically to avoid crashes if not yet installed.
let NetInfo: typeof import('@react-native-community/netinfo').default | null = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  // NetInfo not installed yet -- fall back to assuming online
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  collection: string; // 'patients', 'appointments', 'bills', etc.
  data: any;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_KEY = 'orthosync_sync_queue';
const LAST_SYNC_KEY = 'orthosync_last_sync';
const MAX_RETRIES = 3;

export const SyncService = {
  // Add operation to sync queue (when offline)
  async addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queue = await this.getQueue();
    const newItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    queue.push(newItem);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  // Get pending sync queue
  async getQueue(): Promise<SyncQueueItem[]> {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  // Clear queue
  async clearQueue(): Promise<void> {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
  },

  // Remove item from queue
  async removeFromQueue(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  },

  // Get queue count
  async getQueueCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  },

  // Process sync queue (call when back online)
  // In a real app, this would push to Firebase. For now, it simulates sync.
  async processQueue(): Promise<{ synced: number; failed: number }> {
    const queue = await this.getQueue();
    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        // TODO: Replace with actual Firebase sync
        // await firestore.collection(item.collection).doc(item.data.id)[item.action](item.data);

        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 100));

        await this.removeFromQueue(item.id);
        synced++;
      } catch (error) {
        // Increment retry count
        item.retries++;
        if (item.retries >= MAX_RETRIES) {
          // Give up on this item after max retries
          await this.removeFromQueue(item.id);
        } else {
          // Update the item in the queue with incremented retry count
          const currentQueue = await this.getQueue();
          const idx = currentQueue.findIndex(q => q.id === item.id);
          if (idx !== -1) {
            currentQueue[idx] = item;
            await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(currentQueue));
          }
        }
        failed++;
      }
    }

    if (synced > 0) {
      await this.updateLastSyncTime();
    }

    return { synced, failed };
  },

  // Get last sync time
  async getLastSyncTime(): Promise<string | null> {
    return AsyncStorage.getItem(LAST_SYNC_KEY);
  },

  // Update last sync time
  async updateLastSyncTime(): Promise<void> {
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  },

  // Check network status
  async isOnline(): Promise<boolean> {
    try {
      if (!NetInfo) return true;
      const state = await NetInfo.fetch();
      return state.isConnected ?? true;
    } catch {
      return true; // Assume online if NetInfo not available
    }
  },

  // Subscribe to network changes
  subscribeToNetworkChanges(callback: (isConnected: boolean) => void): () => void {
    try {
      if (!NetInfo) return () => {};
      return NetInfo.addEventListener(state => {
        callback(state.isConnected ?? true);
      });
    } catch {
      return () => {}; // No-op unsubscribe
    }
  },
};
