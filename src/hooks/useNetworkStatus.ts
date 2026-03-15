// ==========================================
// OrthoSync - Network Status Hook
// ==========================================
// Monitors connectivity and auto-syncs when back online.

import { useState, useEffect, useCallback } from 'react';
import { SyncService } from '../services/syncService';
import { useAppStore } from '../store';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const setOnline = useAppStore(s => s.setOnline);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await SyncService.processQueue();
      const count = await SyncService.getQueueCount();
      setPendingSyncCount(count);
      const time = await SyncService.getLastSyncTime();
      setLastSyncTime(time);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Check initial status
    SyncService.isOnline().then(online => {
      setIsOnline(online);
      setOnline(online);
    });

    // Load pending count and last sync time
    SyncService.getQueueCount().then(setPendingSyncCount);
    SyncService.getLastSyncTime().then(setLastSyncTime);

    // Subscribe to network changes
    const unsubscribe = SyncService.subscribeToNetworkChanges(async (connected) => {
      setIsOnline(connected);
      setOnline(connected);

      if (connected) {
        // Auto-sync when back online
        await syncNow();
      }
    });

    return unsubscribe;
  }, [setOnline, syncNow]);

  return {
    isOnline,
    pendingSyncCount,
    lastSyncTime,
    isSyncing,
    syncNow,
  };
}
