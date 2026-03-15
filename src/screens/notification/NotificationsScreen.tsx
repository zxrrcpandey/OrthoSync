import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore, usePatientStore, useAppointmentStore } from '../../store';
import { AppNotification } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { NotificationService } from '../../services/notificationService';

// ------------------------------------
// Helpers
// ------------------------------------

type FilterType = 'all' | 'appointment_reminder' | 'missed_appointment' | 'payment_due' | 'custom';

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'appointment_reminder', label: 'Reminders' },
  { key: 'missed_appointment', label: 'Missed' },
  { key: 'payment_due', label: 'Payments' },
  { key: 'custom', label: 'Custom' },
];

const getNotificationEmoji = (type: AppNotification['type']): string => {
  switch (type) {
    case 'appointment_reminder':
      return '\uD83D\uDD14';
    case 'missed_appointment':
      return '\u274C';
    case 'payment_due':
      return '\uD83D\uDCB0';
    case 'custom':
      return '\uD83D\uDCAC';
    case 'system':
      return '\u2699\uFE0F';
    default:
      return '\uD83D\uDD14';
  }
};

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// ------------------------------------
// Component
// ------------------------------------

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadCount,
    createAppointmentReminder,
  } = useNotificationStore();

  const { patients } = usePatientStore();
  const { getAppointmentsByDate } = useAppointmentStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const unreadCount = useMemo(() => getUnreadCount(), [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // Generate reminders for tomorrow's appointments
  const handleGenerateReminders = useCallback(() => {
    const tomorrowDate = getTomorrowDate();
    const tomorrowAppointments = getAppointmentsByDate(tomorrowDate);

    if (tomorrowAppointments.length === 0) {
      Alert.alert(
        t('notifications.noAppointments', 'No Appointments'),
        t(
          'notifications.noAppointmentsTomorrow',
          'There are no appointments scheduled for tomorrow.',
        ),
      );
      return;
    }

    let count = 0;
    for (const appt of tomorrowAppointments) {
      if (appt.status === 'scheduled') {
        createAppointmentReminder({
          doctorId: appt.doctorId,
          patientId: appt.patientId,
          patientName: appt.patientName,
          appointmentDate: appt.date,
          appointmentTime: appt.startTime,
          locationName: appt.locationName,
        });
        count++;
      }
    }

    Alert.alert(
      t('notifications.remindersGenerated', 'Reminders Generated'),
      t(
        'notifications.remindersGeneratedMessage',
        `${count} reminder(s) created for tomorrow's appointments.`,
      ),
    );
  }, [getAppointmentsByDate, createAppointmentReminder, t]);

  // Clear all notifications
  const handleClearAll = useCallback(() => {
    Alert.alert(
      t('notifications.clearAll', 'Clear All'),
      t('notifications.clearAllConfirm', 'Are you sure you want to delete all notifications?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ],
    );
  }, [clearAll, t]);

  // Delete single notification
  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        t('notifications.delete', 'Delete Notification'),
        t('notifications.deleteConfirm', 'Delete this notification?'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.delete', 'Delete'),
            style: 'destructive',
            onPress: () => deleteNotification(id),
          },
        ],
      );
    },
    [deleteNotification, t],
  );

  // Render notification card
  const renderNotificationItem = useCallback(
    ({ item }: { item: AppNotification }) => {
      const emoji = getNotificationEmoji(item.type);
      const timeAgo = getTimeAgo(item.createdAt);

      return (
        <TouchableOpacity
          onPress={() => {
            if (!item.isRead) markAsRead(item.id);
          }}
          onLongPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
          style={styles.notifCardWrapper}
        >
          <View
            style={[
              styles.notifCard,
              !item.isRead && styles.notifCardUnread,
            ]}
          >
            <BlurView intensity={18} tint="light" style={styles.notifCardBlur}>
              {/* Left: Emoji */}
              <View style={styles.notifEmojiContainer}>
                <Text style={styles.notifEmoji}>{emoji}</Text>
              </View>

              {/* Center: Content */}
              <View style={styles.notifContent}>
                <Text
                  style={[
                    styles.notifTitle,
                    !item.isRead && styles.notifTitleUnread,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={styles.notifMessage} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.notifTime}>{timeAgo}</Text>
              </View>

              {/* Right: Unread dot */}
              {!item.isRead && <View style={styles.unreadDot} />}
            </BlurView>
          </View>
        </TouchableOpacity>
      );
    },
    [markAsRead, handleDelete],
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <BlurView intensity={18} tint="light" style={styles.emptyBlur}>
        <Ionicons name="notifications-off-outline" size={56} color={Colors.text.tertiary} />
        <Text style={styles.emptyTitle}>
          {t('notifications.noNotifications', 'No notifications yet')}
        </Text>
        <Text style={styles.emptySubtitle}>
          {t(
            'notifications.noNotificationsDesc',
            'Notifications about appointments, payments, and reminders will appear here.',
          )}
        </Text>
      </BlurView>
    </View>
  );

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.sm }]}>
        {/* ============ HEADER ============ */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('notifications.title', 'Notifications')}
          </Text>
          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={styles.markAllReadBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={18} color={Colors.accent.main} />
              <Text style={styles.markAllReadText}>
                {t('notifications.markAllRead', 'Mark All Read')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* ============ UNREAD COUNT ============ */}
        {unreadCount > 0 && (
          <View style={styles.unreadBadgeRow}>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount} {t('notifications.unread', 'unread notification')}{unreadCount > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* ============ FILTER TABS ============ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContainer}
          style={styles.filterTabsScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = tab.key === activeFilter;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {t(`notifications.filter_${tab.key}`, tab.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ============ NOTIFICATION LIST ============ */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && styles.listContentEmpty,
          ]}
          style={styles.list}
        />

        {/* ============ BOTTOM ACTIONS ============ */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <BlurView intensity={22} tint="light" style={styles.bottomActionsBlur}>
            {/* Send Notification */}
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => navigation.navigate('SendNotification')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.accent.dark, Colors.accent.main]}
                style={styles.actionBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="send" size={18} color="#1B5E20" />
                <Text style={styles.actionBtnPrimaryText}>
                  {t('notifications.sendNotification', 'Send Notification')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Generate Reminders + Clear All row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtnSecondary, { flex: 1 }]}
                onPress={handleGenerateReminders}
                activeOpacity={0.7}
              >
                <Ionicons name="alarm-outline" size={18} color={Colors.accent.main} />
                <Text style={styles.actionBtnSecondaryText}>
                  {t('notifications.generateReminders', 'Generate Reminders')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtnDanger, { flex: 1 }]}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
                <Text style={styles.actionBtnDangerText}>
                  {t('notifications.clearAll', 'Clear All')}
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </LinearGradient>
  );
}

// ------------------------------------
// Styles
// ------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },
  markAllReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
  },
  markAllReadText: {
    color: Colors.accent.main,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  // ---- Unread Badge ----
  unreadBadgeRow: {
    marginBottom: Spacing.md,
  },
  unreadBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  unreadBadgeText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // ---- Filter Tabs ----
  filterTabsScroll: {
    maxHeight: 44,
    marginBottom: Spacing.md,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  filterChipSelected: {
    backgroundColor: Colors.accent.dark,
    borderColor: Colors.accent.main,
  },
  filterChipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  filterChipTextSelected: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },

  // ---- Notification List ----
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // ---- Notification Card ----
  notifCardWrapper: {
    marginBottom: Spacing.sm,
  },
  notifCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.main,
  },
  notifCardBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  notifEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmoji: {
    fontSize: 22,
  },
  notifContent: {
    flex: 1,
    gap: 2,
  },
  notifTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  notifTitleUnread: {
    color: Colors.text.primary,
    fontWeight: FontWeight.bold,
  },
  notifMessage: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  notifTime: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.info,
  },

  // ---- Empty State ----
  emptyContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  emptyBlur: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
    overflow: 'hidden',
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ---- Bottom Actions ----
  bottomActions: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.glass.borderLight,
  },
  bottomActionsBlur: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  actionBtnPrimary: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionBtnPrimaryText: {
    color: '#1B5E20',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.greenMedium,
  },
  actionBtnSecondaryText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },
  actionBtnDangerText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
