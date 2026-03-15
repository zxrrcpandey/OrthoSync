import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  usePatientStore,
  useAppointmentStore,
  useBillingStore,
  useLocationStore,
  useNotificationStore,
} from '../../store';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ─── Helpers ────────────────────────────────────────────────

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatCurrency = (amount: number): string =>
  `\u20B9${amount.toLocaleString('en-IN')}`;

const getTimeAgo = (dateString: string): string => {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return new Date(dateString).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
};

const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    scheduled: Colors.status.scheduled,
    completed: Colors.status.completed,
    missed: Colors.status.missed,
    cancelled: Colors.status.cancelled,
    hold: Colors.status.hold,
    pending: Colors.status.pending,
    paid: Colors.status.paid,
    overdue: Colors.status.overdue,
  };
  return map[status] ?? Colors.text.tertiary;
};

// ─── Sub-components ─────────────────────────────────────────

const StatCard = ({
  title,
  value,
  emoji,
}: {
  title: string;
  value: string;
  emoji: string;
}) => (
  <View style={styles.statCard}>
    <BlurView intensity={20} tint="light" style={styles.statCardBlur}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </BlurView>
  </View>
);

const QuickAction = ({
  title,
  emoji,
  onPress,
}: {
  title: string;
  emoji: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <BlurView intensity={15} tint="light" style={styles.quickActionBlur}>
      <Text style={styles.quickActionEmoji}>{emoji}</Text>
      <Text style={styles.quickActionText}>{title}</Text>
    </BlurView>
  </TouchableOpacity>
);

// ─── Main Screen ────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Store data
  const patients = usePatientStore((s) => s.patients);
  const appointments = useAppointmentStore((s) => s.appointments);
  const getTodayAppointments = useAppointmentStore((s) => s.getTodayAppointments);
  const getUpcomingAppointments = useAppointmentStore((s) => s.getUpcomingAppointments);
  const bills = useBillingStore((s) => s.bills);
  const locations = useLocationStore((s) => s.locations);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);

  // ── Computed values ──

  const todayAppointments = useMemo(() => getTodayAppointments(), [appointments]);

  const upcomingAppointments = useMemo(
    () => getUpcomingAppointments(3),
    [appointments],
  );

  const unreadCount = useMemo(() => getUnreadCount(), [getUnreadCount]);

  const pendingPayments = useMemo(
    () => bills.reduce((sum, b) => sum + b.balanceAmount, 0),
    [bills],
  );

  const monthlyEarnings = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return bills
      .filter((b) => b.createdAt.startsWith(currentMonth))
      .reduce((sum, b) => sum + b.paidAmount, 0);
  }, [bills]);

  // ── Recent Activity ──

  interface ActivityItem {
    id: string;
    emoji: string;
    description: string;
    time: string;
    createdAt: string;
  }

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    // Recent patients (last 3)
    const sortedPatients = [...patients]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
    sortedPatients.forEach((p) => {
      items.push({
        id: `patient-${p.id}`,
        emoji: '\uD83D\uDC64',
        description: `New patient: ${p.fullName}`,
        time: getTimeAgo(p.createdAt),
        createdAt: p.createdAt,
      });
    });

    // Recent bills (last 3)
    const sortedBills = [...bills]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
    sortedBills.forEach((b) => {
      items.push({
        id: `bill-${b.id}`,
        emoji: '\uD83D\uDCB3',
        description: `Bill ${formatCurrency(b.grandTotal)} - ${b.status}`,
        time: getTimeAgo(b.createdAt),
        createdAt: b.createdAt,
      });
    });

    // Recent appointments (last 3)
    const sortedAppts = [...appointments]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
    sortedAppts.forEach((a) => {
      items.push({
        id: `appt-${a.id}`,
        emoji: '\uD83D\uDCC5',
        description: `Appointment: ${a.patientName} at ${a.startTime}`,
        time: getTimeAgo(a.createdAt),
        createdAt: a.createdAt,
      });
    });

    // Sort combined by createdAt descending, take first 5
    return items
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }, [patients, bills, appointments]);

  // ─── Render ───

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()} {'\uD83D\uDC4B'}
            </Text>
            <Text style={styles.doctorName}>Dr. Pooja Gangare</Text>
          </View>
          <TouchableOpacity style={styles.notifButton} activeOpacity={0.7}>
            <BlurView intensity={20} tint="light" style={styles.notifBlur}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* ── Today's Overview ── */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            emoji={'\uD83D\uDC65'}
            title="Total Patients"
            value={String(patients.length)}
          />
          <StatCard
            emoji={'\uD83D\uDCC5'}
            title="Today's Appointments"
            value={String(todayAppointments.length)}
          />
          <StatCard
            emoji={'\u23F3'}
            title="Pending Payments"
            value={formatCurrency(pendingPayments)}
          />
          <StatCard
            emoji={'\uD83D\uDCB0'}
            title="Monthly Earnings"
            value={formatCurrency(monthlyEarnings)}
          />
        </View>

        {/* ── Today's Appointments ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          {todayAppointments.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{todayAppointments.length}</Text>
            </View>
          )}
        </View>

        {todayAppointments.length > 0 ? (
          <FlatList
            data={todayAppointments}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.apptListContent}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.8} style={styles.apptCard}>
                <BlurView intensity={18} tint="light" style={styles.apptCardBlur}>
                  <Text style={styles.apptTime}>{item.startTime}</Text>
                  <Text style={styles.apptPatient} numberOfLines={1}>
                    {item.patientName}
                  </Text>
                  <Text style={styles.apptLocation} numberOfLines={1}>
                    {item.locationName}
                  </Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColor(item.status) },
                      ]}
                    />
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.glassCard}>
            <BlurView intensity={15} tint="light" style={styles.glassCardBlur}>
              <Text style={styles.emptyText}>
                {'\uD83D\uDCC6'} No appointments today
              </Text>
            </BlurView>
          </View>
        )}

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            emoji={'\u2795'}
            title="Add Patient"
            onPress={() => console.log('Add Patient')}
          />
          <QuickAction
            emoji={'\uD83D\uDCC5'}
            title="New Appointment"
            onPress={() => console.log('New Appointment')}
          />
          <QuickAction
            emoji={'\uD83D\uDCB3'}
            title="Create Bill"
            onPress={() => console.log('Create Bill')}
          />
          <QuickAction
            emoji={'\uD83C\uDFE5'}
            title="Add Location"
            onPress={() => console.log('Add Location')}
          />
        </View>

        {/* ── Recent Activity ── */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.glassCard}>
          <BlurView intensity={15} tint="light" style={styles.glassCardBlur}>
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <View key={item.id} style={styles.activityRow}>
                  <Text style={styles.activityEmoji}>{item.emoji}</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <Text style={styles.activityTime}>{item.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCenter}>
                <Text style={styles.emptyText}>Start by adding patients and appointments</Text>
              </View>
            )}
          </BlurView>
        </View>

        {/* ── Upcoming Appointments ── */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.glassCard}>
          <BlurView intensity={15} tint="light" style={styles.glassCardBlur}>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt) => (
                <View key={appt.id} style={styles.upcomingRow}>
                  <View style={styles.upcomingDateBox}>
                    <Text style={styles.upcomingDateDay}>
                      {new Date(appt.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.upcomingDateMonth}>
                      {new Date(appt.date).toLocaleDateString('en-IN', {
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <View style={styles.upcomingInfo}>
                    <Text style={styles.upcomingPatient} numberOfLines={1}>
                      {appt.patientName}
                    </Text>
                    <Text style={styles.upcomingMeta}>
                      {appt.startTime} - {appt.locationName}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCenter}>
                <Text style={styles.emptyText}>No upcoming appointments</Text>
              </View>
            )}
          </BlurView>
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
  },
  doctorName: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  notifButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  notifBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.round,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  // Sections
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countBadge: {
    backgroundColor: Colors.accent.main,
    borderRadius: BorderRadius.round,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: Spacing.lg,
  },
  countBadgeText: {
    color: Colors.black,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    height: 110,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  statCardBlur: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  statEmoji: { fontSize: 24, marginBottom: Spacing.xs },
  statValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  statTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  // Today's appointment cards
  apptListContent: {
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
  apptCard: {
    width: 160,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  apptCardBlur: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.xs,
  },
  apptTime: {
    color: Colors.accent.main,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  apptPatient: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  apptLocation: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    textTransform: 'capitalize',
  },

  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAction: {
    width: '47%',
    height: 70,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  quickActionBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.md,
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },

  // Glass card (shared for sections)
  glassCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  glassCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  activityEmoji: { fontSize: 20 },
  activityContent: { flex: 1 },
  activityDesc: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  activityTime: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  // Upcoming
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  upcomingDateBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glass.greenMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingDateDay: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: 20,
  },
  upcomingDateMonth: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
  },
  upcomingInfo: { flex: 1 },
  upcomingPatient: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  upcomingMeta: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  // Empty states
  emptyCenter: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
