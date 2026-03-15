// ==========================================
// OrthoSync - Offline Banner Component
// ==========================================
// Displays a slim banner when the app is offline,
// shows pending sync count, and offers a Sync Now button.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline, pendingSyncCount, isSyncing, syncNow } = useNetworkStatus();

  // Nothing to show when online with no pending items
  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  const isOffline = !isOnline;

  return (
    <BlurView intensity={40} tint="dark" style={styles.container}>
      <View
        style={[
          styles.banner,
          isOffline ? styles.offlineBanner : styles.pendingBanner,
        ]}
      >
        {/* Left section: icon + status text */}
        <View style={styles.leftSection}>
          <Ionicons
            name={isOffline ? 'cloud-offline-outline' : 'cloud-upload-outline'}
            size={18}
            color={Colors.white}
          />
          <Text style={styles.statusText}>
            {isOffline ? "You're offline" : 'Back online'}
          </Text>
        </View>

        {/* Right section: pending count badge + sync button */}
        <View style={styles.rightSection}>
          {pendingSyncCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingSyncCount} {pendingSyncCount === 1 ? 'change' : 'changes'} pending
              </Text>
            </View>
          )}

          {isOnline && pendingSyncCount > 0 && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={syncNow}
              disabled={isSyncing}
              activeOpacity={0.7}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="sync-outline" size={14} color={Colors.white} />
                  <Text style={styles.syncButtonText}>Sync Now</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  offlineBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.25)',
    borderColor: 'rgba(255, 152, 0, 0.40)',
  },
  pendingBanner: {
    backgroundColor: 'rgba(33, 150, 243, 0.25)',
    borderColor: 'rgba(33, 150, 243, 0.40)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: BorderRadius.round,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  badgeText: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: BorderRadius.round,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  syncButtonText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
