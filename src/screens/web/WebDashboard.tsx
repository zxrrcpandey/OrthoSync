import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  usePatientStore, useAppointmentStore, useBillingStore,
  useLocationStore, useTreatmentStore, useCommissionStore, useNotificationStore,
} from '../../store';
import useAuthStore from '../../store/authStore';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ==========================================
// Types
// ==========================================
type NavSection =
  | 'dashboard' | 'patients' | 'appointments' | 'billing'
  | 'locations' | 'treatments' | 'commission' | 'reports'
  | 'notifications' | 'settings';

interface NavItem {
  key: NavSection;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '\u2302' },
  { key: 'patients', label: 'Patients', icon: '\u263A' },
  { key: 'appointments', label: 'Appointments', icon: '\u2637' },
  { key: 'billing', label: 'Billing', icon: '\u20B9' },
  { key: 'locations', label: 'Locations', icon: '\u2691' },
  { key: 'treatments', label: 'Treatments', icon: '\u2695' },
  { key: 'commission', label: 'Commission', icon: '\u2696' },
  { key: 'reports', label: 'Reports', icon: '\u2610' },
  { key: 'notifications', label: 'Notifications', icon: '\u2709' },
  { key: 'settings', label: 'Settings', icon: '\u2699' },
];

// ==========================================
// Helpers
// ==========================================
const formatINR = (amount: number): string => {
  return '\u20B9' + amount.toLocaleString('en-IN');
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const getCurrentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (time: string): string => {
  const [h, m] = time.split(':');
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr % 12 || 12;
  return `${hr12}:${m} ${ampm}`;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled': return Colors.status.scheduled;
    case 'completed': return Colors.status.completed;
    case 'missed': return Colors.status.missed;
    case 'cancelled': return Colors.status.cancelled;
    case 'hold': return Colors.status.hold;
    case 'in_progress': return Colors.status.inProgress;
    case 'pending': return Colors.status.pending;
    case 'paid': return Colors.status.paid;
    case 'partial': return Colors.warning;
    case 'overdue': return Colors.status.overdue;
    case 'settled': return Colors.status.completed;
    default: return Colors.text.tertiary;
  }
};

// ==========================================
// Component: StatusBadge
// ==========================================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '30' }]}>
    <Text style={[styles.statusBadgeText, { color: getStatusColor(status) }]}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </Text>
  </View>
);

// ==========================================
// Component: GlassCard
// ==========================================
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: any;
  dark?: boolean;
}> = ({ children, style, dark }) => (
  <View style={[styles.glassCard, dark && styles.glassCardDark, style]}>
    {children}
  </View>
);

// ==========================================
// Component: StatCard
// ==========================================
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => (
  <GlassCard style={styles.statCard}>
    <View style={[styles.statIconWrap, { backgroundColor: color + '25' }]}>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </GlassCard>
);

// ==========================================
// Component: TableHeader
// ==========================================
const TableHeader: React.FC<{ columns: { label: string; flex: number }[] }> = ({ columns }) => (
  <View style={styles.tableHeaderRow}>
    {columns.map((col, i) => (
      <Text key={i} style={[styles.tableHeaderText, { flex: col.flex }]}>
        {col.label}
      </Text>
    ))}
  </View>
);

// ==========================================
// Component: EmptyState
// ==========================================
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

// ==========================================
// Main Component: WebDashboard
// ==========================================
export default function WebDashboard() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState(getToday());

  // Stores
  const { user } = useAuthStore();
  const { patients, searchPatients } = usePatientStore();
  const { appointments, getTodayAppointments, getUpcomingAppointments, getAppointmentsByDate } = useAppointmentStore();
  const { bills, getTotalRevenue, getTotalPending, getMonthlyRevenue } = useBillingStore();
  const { locations } = useLocationStore();
  const { treatments } = useTreatmentStore();
  const { commissionRecords, getTotalCommissionPending, getTotalCommissionPaid } = useCommissionStore();
  const { notifications, getUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  // Memoized data
  const todayAppointments = useMemo(() => getTodayAppointments(), [appointments]);
  const upcomingAppointments = useMemo(() => getUpcomingAppointments(10), [appointments]);
  const totalRevenue = useMemo(() => getTotalRevenue(), [bills]);
  const totalPending = useMemo(() => getTotalPending(), [bills]);
  const monthlyRevenue = useMemo(() => getMonthlyRevenue(getCurrentMonth()), [bills]);
  const unreadCount = useMemo(() => getUnreadCount(), [notifications]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    return searchPatients(searchQuery);
  }, [patients, searchQuery]);

  const filteredAppointments = useMemo(() => {
    return getAppointmentsByDate(dateFilter);
  }, [appointments, dateFilter]);

  const filteredBills = useMemo(() => {
    if (billStatusFilter === 'all') return bills;
    return bills.filter((b) => b.status === billStatusFilter);
  }, [bills, billStatusFilter]);

  // Reports data
  const reportsData = useMemo(() => {
    const completedAppts = appointments.filter((a) => a.status === 'completed').length;
    const missedAppts = appointments.filter((a) => a.status === 'missed').length;
    const totalAppts = appointments.length;
    const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;
    const avgBillAmount = bills.length > 0
      ? Math.round(bills.reduce((sum, b) => sum + b.grandTotal, 0) / bills.length)
      : 0;
    const collectionRate = totalRevenue + totalPending > 0
      ? Math.round((totalRevenue / (totalRevenue + totalPending)) * 100)
      : 0;

    // Revenue by location
    const revenueByLocation = locations.map((loc) => ({
      name: loc.name,
      revenue: bills.filter((b) => b.locationId === loc.id).reduce((sum, b) => sum + b.paidAmount, 0),
      patients: patients.filter((p) => p.locationIds.includes(loc.id)).length,
    }));

    // Treatment popularity
    const treatmentCounts: Record<string, number> = {};
    bills.forEach((b) => {
      if (b.treatmentId) {
        const t = treatments.find((t) => t.id === b.treatmentId);
        const name = t?.name || 'Unknown';
        treatmentCounts[name] = (treatmentCounts[name] || 0) + 1;
      }
    });
    const topTreatments = Object.entries(treatmentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      completedAppts, missedAppts, totalAppts, completionRate,
      avgBillAmount, collectionRate, revenueByLocation, topTreatments,
    };
  }, [appointments, bills, patients, locations, treatments, totalRevenue, totalPending]);

  // ==========================================
  // Section Renderers
  // ==========================================

  const renderDashboard = () => (
    <View style={styles.sectionContent}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Total Patients" value={String(patients.length)} icon={'\u263A'} color="#4CAF50" />
        <StatCard label="Today's Appointments" value={String(todayAppointments.length)} icon={'\u2637'} color="#2196F3" />
        <StatCard label="Monthly Revenue" value={formatINR(monthlyRevenue)} icon={'\u20B9'} color="#FF9800" />
        <StatCard label="Pending Payments" value={formatINR(totalPending)} icon={'\u23F3'} color="#F44336" />
      </View>

      {/* Two Column Layout */}
      <View style={styles.twoColumnLayout}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <GlassCard>
            <Text style={styles.cardTitle}>Today's Appointments</Text>
            {todayAppointments.length === 0 ? (
              <EmptyState message="No appointments today" />
            ) : (
              todayAppointments.map((appt) => (
                <View key={appt.id} style={styles.appointmentRow}>
                  <View style={styles.appointmentTime}>
                    <Text style={styles.timeText}>{formatTime(appt.startTime)}</Text>
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentName}>{appt.patientName}</Text>
                    <Text style={styles.appointmentLocation}>{appt.locationName}</Text>
                  </View>
                  <StatusBadge status={appt.status} />
                </View>
              ))
            )}
          </GlassCard>

          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            {notifications.slice(0, 5).map((notif) => (
              <View key={notif.id} style={styles.activityRow}>
                <View style={[styles.activityDot, { backgroundColor: notif.isRead ? Colors.text.tertiary : Colors.accent.main }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{notif.title}</Text>
                  <Text style={styles.activityMessage} numberOfLines={1}>{notif.message}</Text>
                  <Text style={styles.activityTime}>{formatDate(notif.createdAt)}</Text>
                </View>
              </View>
            ))}
            {notifications.length === 0 && <EmptyState message="No recent activity" />}
          </GlassCard>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <GlassCard>
            <Text style={styles.cardTitle}>Quick Stats</Text>
            <View style={styles.quickStatRow}>
              <Text style={styles.quickStatLabel}>Total Revenue</Text>
              <Text style={styles.quickStatValue}>{formatINR(totalRevenue)}</Text>
            </View>
            <View style={styles.quickStatRow}>
              <Text style={styles.quickStatLabel}>Active Locations</Text>
              <Text style={styles.quickStatValue}>{locations.filter((l) => l.isActive).length}</Text>
            </View>
            <View style={styles.quickStatRow}>
              <Text style={styles.quickStatLabel}>Active Treatments</Text>
              <Text style={styles.quickStatValue}>{treatments.filter((t) => t.isActive).length}</Text>
            </View>
            <View style={styles.quickStatRow}>
              <Text style={styles.quickStatLabel}>Pending Commission</Text>
              <Text style={styles.quickStatValue}>{formatINR(getTotalCommissionPending())}</Text>
            </View>
            <View style={styles.quickStatRow}>
              <Text style={styles.quickStatLabel}>Unread Notifications</Text>
              <Text style={styles.quickStatValue}>{unreadCount}</Text>
            </View>
          </GlassCard>

          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={styles.cardTitle}>Upcoming Appointments</Text>
            {upcomingAppointments.length === 0 ? (
              <EmptyState message="No upcoming appointments" />
            ) : (
              upcomingAppointments.slice(0, 5).map((appt) => (
                <View key={appt.id} style={styles.upcomingRow}>
                  <View>
                    <Text style={styles.upcomingName}>{appt.patientName}</Text>
                    <Text style={styles.upcomingDate}>{formatDate(appt.date)} at {formatTime(appt.startTime)}</Text>
                  </View>
                  <Text style={styles.upcomingLocation}>{appt.locationName}</Text>
                </View>
              ))
            )}
          </GlassCard>
        </View>
      </View>
    </View>
  );

  const renderPatients = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Patients ({patients.length})</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, or phone..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <GlassCard>
        <TableHeader columns={[
          { label: 'Patient ID', flex: 1 },
          { label: 'Name', flex: 2 },
          { label: 'Age', flex: 0.5 },
          { label: 'Gender', flex: 0.8 },
          { label: 'Phone', flex: 1.5 },
          { label: 'City', flex: 1 },
          { label: 'Created', flex: 1 },
        ]} />
        <ScrollView style={{ maxHeight: 600 }}>
          {filteredPatients.length === 0 ? (
            <EmptyState message="No patients found" />
          ) : (
            filteredPatients.map((p) => (
              <View key={p.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{p.patientId}</Text>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: FontWeight.semibold }]}>{p.fullName}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{p.age}</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>{p.gender}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{p.phone}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{p.city || '-'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(p.createdAt)}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </GlassCard>
    </View>
  );

  const renderAppointments = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Appointments</Text>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Date:</Text>
          <TextInput
            style={[styles.searchInput, { width: 180 }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.text.tertiary}
            value={dateFilter}
            onChangeText={setDateFilter}
          />
        </View>
      </View>
      <GlassCard>
        <TableHeader columns={[
          { label: 'Time', flex: 1 },
          { label: 'Patient', flex: 2 },
          { label: 'Location', flex: 1.5 },
          { label: 'Duration', flex: 0.8 },
          { label: 'Status', flex: 1 },
          { label: 'Notes', flex: 2 },
        ]} />
        <ScrollView style={{ maxHeight: 600 }}>
          {filteredAppointments.length === 0 ? (
            <EmptyState message="No appointments for this date" />
          ) : (
            filteredAppointments.map((a) => (
              <View key={a.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {formatTime(a.startTime)} - {formatTime(a.endTime)}
                </Text>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: FontWeight.semibold }]}>{a.patientName}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{a.locationName}</Text>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>{a.duration} min</Text>
                <View style={{ flex: 1 }}>
                  <StatusBadge status={a.status} />
                </View>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{a.notes || '-'}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </GlassCard>
    </View>
  );

  const renderBilling = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Billing ({bills.length})</Text>
        <View style={styles.filterRow}>
          {['all', 'pending', 'partial', 'paid', 'overdue'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, billStatusFilter === status && styles.filterChipActive]}
              onPress={() => setBillStatusFilter(status)}
            >
              <Text style={[styles.filterChipText, billStatusFilter === status && styles.filterChipTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary cards */}
      <View style={styles.statsRow}>
        <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={'\u2713'} color="#4CAF50" />
        <StatCard label="Pending" value={formatINR(totalPending)} icon={'\u23F3'} color="#F44336" />
        <StatCard label="This Month" value={formatINR(monthlyRevenue)} icon={'\u2605'} color="#FF9800" />
        <StatCard label="Total Bills" value={String(bills.length)} icon={'\u2610'} color="#2196F3" />
      </View>

      <GlassCard>
        <TableHeader columns={[
          { label: 'Date', flex: 1 },
          { label: 'Patient', flex: 1.5 },
          { label: 'Total', flex: 1 },
          { label: 'Paid', flex: 1 },
          { label: 'Balance', flex: 1 },
          { label: 'Mode', flex: 0.8 },
          { label: 'Status', flex: 1 },
        ]} />
        <ScrollView style={{ maxHeight: 500 }}>
          {filteredBills.length === 0 ? (
            <EmptyState message="No bills found" />
          ) : (
            filteredBills.map((b) => {
              const patient = patients.find((p) => p.id === b.patientId);
              return (
                <View key={b.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(b.createdAt)}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5, fontWeight: FontWeight.semibold }]}>
                    {patient?.fullName || 'Unknown'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatINR(b.grandTotal)}</Text>
                  <Text style={[styles.tableCell, { flex: 1, color: Colors.accent.main }]}>{formatINR(b.paidAmount)}</Text>
                  <Text style={[styles.tableCell, { flex: 1, color: b.balanceAmount > 0 ? Colors.error : Colors.text.secondary }]}>
                    {formatINR(b.balanceAmount)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{b.paymentMode.toUpperCase()}</Text>
                  <View style={{ flex: 1 }}>
                    <StatusBadge status={b.status} />
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </GlassCard>
    </View>
  );

  const renderLocations = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Locations ({locations.length})</Text>
      <View style={styles.locationsGrid}>
        {locations.length === 0 ? (
          <GlassCard style={{ width: '100%' }}><EmptyState message="No locations added yet" /></GlassCard>
        ) : (
          locations.map((loc) => (
            <GlassCard key={loc.id} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={[styles.locationTypeBadge, {
                  backgroundColor: loc.type === 'own_clinic' ? Colors.accent.main + '30'
                    : loc.type === 'hospital' ? Colors.info + '30' : Colors.warning + '30'
                }]}>
                  <Text style={[styles.locationTypeText, {
                    color: loc.type === 'own_clinic' ? Colors.accent.main
                      : loc.type === 'hospital' ? Colors.info : Colors.warning
                  }]}>
                    {loc.type.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.activeDot, { backgroundColor: loc.isActive ? Colors.accent.main : Colors.error }]} />
              </View>
              <Text style={styles.locationName}>{loc.name}</Text>
              <Text style={styles.locationAddress}>{loc.address}</Text>
              <Text style={styles.locationCity}>{loc.city}, {loc.state} - {loc.pincode}</Text>
              {loc.ownerName && (
                <Text style={styles.locationOwner}>Owner: {loc.ownerName}</Text>
              )}
              <View style={styles.locationMeta}>
                <Text style={styles.locationMetaText}>
                  {loc.workingDays.filter((d) => d.isActive).length} working days
                </Text>
                <Text style={styles.locationMetaText}>
                  Commission: {loc.commissionModel.type.replace(/_/g, ' ')}
                </Text>
              </View>
            </GlassCard>
          ))
        )}
      </View>
    </View>
  );

  const renderTreatments = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Treatments ({treatments.length})</Text>
      <GlassCard>
        <TableHeader columns={[
          { label: 'Name', flex: 2 },
          { label: 'Category', flex: 1.5 },
          { label: 'Fee', flex: 1 },
          { label: 'Equipment Cost', flex: 1 },
          { label: 'Duration (days)', flex: 1 },
          { label: 'Stages', flex: 0.8 },
          { label: 'Status', flex: 0.8 },
        ]} />
        <ScrollView style={{ maxHeight: 600 }}>
          {treatments.map((t) => (
            <View key={t.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: FontWeight.semibold }]}>{t.name}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{t.category}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{formatINR(t.defaultFee)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{formatINR(t.equipmentCost)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{t.estimatedDuration || '-'}</Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>{t.stages?.length || 0}</Text>
              <View style={{ flex: 0.8 }}>
                <View style={[styles.statusBadge, {
                  backgroundColor: t.isActive ? Colors.accent.main + '30' : Colors.error + '30',
                }]}>
                  <Text style={[styles.statusBadgeText, {
                    color: t.isActive ? Colors.accent.main : Colors.error,
                  }]}>
                    {t.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </GlassCard>
    </View>
  );

  const renderCommission = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Commission Records</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Total Paid" value={formatINR(getTotalCommissionPaid())} icon={'\u2713'} color="#4CAF50" />
        <StatCard label="Total Pending" value={formatINR(getTotalCommissionPending())} icon={'\u23F3'} color="#F44336" />
        <StatCard label="Total Records" value={String(commissionRecords.length)} icon={'\u2610'} color="#2196F3" />
      </View>

      <GlassCard>
        <TableHeader columns={[
          { label: 'Month', flex: 0.8 },
          { label: 'Location', flex: 1.5 },
          { label: 'Owner', flex: 1 },
          { label: 'Revenue', flex: 1 },
          { label: 'Commission', flex: 1 },
          { label: 'Material Cost', flex: 1 },
          { label: 'Doctor Net', flex: 1 },
          { label: 'Paid', flex: 1 },
          { label: 'Pending', flex: 1 },
          { label: 'Status', flex: 0.8 },
        ]} />
        <ScrollView style={{ maxHeight: 500 }}>
          {commissionRecords.length === 0 ? (
            <EmptyState message="No commission records" />
          ) : (
            commissionRecords.map((r) => (
              <View key={r.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.8 }]}>{r.month}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: FontWeight.semibold }]}>{r.locationName}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{r.ownerName}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatINR(r.totalRevenue)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatINR(r.commissionAmount)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatINR(r.materialCost)}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: Colors.accent.main }]}>{formatINR(r.doctorNetEarning)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatINR(r.paidToOwner)}</Text>
                <Text style={[styles.tableCell, { flex: 1, color: r.pendingAmount > 0 ? Colors.error : Colors.text.secondary }]}>
                  {formatINR(r.pendingAmount)}
                </Text>
                <View style={{ flex: 0.8 }}>
                  <StatusBadge status={r.status} />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </GlassCard>
    </View>
  );

  const renderReports = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Reports & Analytics</Text>

      {/* Overview Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Completion Rate" value={`${reportsData.completionRate}%`} icon={'\u2713'} color="#4CAF50" />
        <StatCard label="Missed Appointments" value={String(reportsData.missedAppts)} icon={'\u2717'} color="#F44336" />
        <StatCard label="Avg Bill Amount" value={formatINR(reportsData.avgBillAmount)} icon={'\u20B9'} color="#FF9800" />
        <StatCard label="Collection Rate" value={`${reportsData.collectionRate}%`} icon={'\u2605'} color="#2196F3" />
      </View>

      <View style={styles.twoColumnLayout}>
        {/* Revenue by Location */}
        <View style={styles.leftColumn}>
          <GlassCard>
            <Text style={styles.cardTitle}>Revenue by Location</Text>
            {reportsData.revenueByLocation.length === 0 ? (
              <EmptyState message="No location data" />
            ) : (
              reportsData.revenueByLocation.map((loc, i) => (
                <View key={i} style={styles.reportRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.reportItemName}>{loc.name}</Text>
                    <Text style={styles.reportItemSub}>{loc.patients} patients</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.reportItemValue}>{formatINR(loc.revenue)}</Text>
                    {/* Simple bar */}
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, {
                        width: `${Math.min(100, reportsData.revenueByLocation.length > 0
                          ? (loc.revenue / Math.max(...reportsData.revenueByLocation.map((l) => l.revenue), 1)) * 100
                          : 0)}%`,
                      }]} />
                    </View>
                  </View>
                </View>
              ))
            )}
          </GlassCard>

          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={styles.cardTitle}>Appointment Summary</Text>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Total Appointments</Text>
              <Text style={styles.reportItemValue}>{reportsData.totalAppts}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Completed</Text>
              <Text style={[styles.reportItemValue, { color: Colors.accent.main }]}>{reportsData.completedAppts}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Missed</Text>
              <Text style={[styles.reportItemValue, { color: Colors.error }]}>{reportsData.missedAppts}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Completion Rate</Text>
              <Text style={styles.reportItemValue}>{reportsData.completionRate}%</Text>
            </View>
          </GlassCard>
        </View>

        {/* Top Treatments */}
        <View style={styles.rightColumn}>
          <GlassCard>
            <Text style={styles.cardTitle}>Top Treatments</Text>
            {reportsData.topTreatments.length === 0 ? (
              <EmptyState message="No treatment data" />
            ) : (
              reportsData.topTreatments.map(([name, count], i) => (
                <View key={i} style={styles.reportRow}>
                  <View style={styles.rankCircle}>
                    <Text style={styles.rankText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.reportItemName, { flex: 1 }]}>{name}</Text>
                  <Text style={styles.reportItemValue}>{count} bills</Text>
                </View>
              ))
            )}
          </GlassCard>

          <GlassCard style={{ marginTop: Spacing.lg }}>
            <Text style={styles.cardTitle}>Financial Summary</Text>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Total Revenue</Text>
              <Text style={styles.reportItemValue}>{formatINR(totalRevenue)}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Total Pending</Text>
              <Text style={[styles.reportItemValue, { color: Colors.error }]}>{formatINR(totalPending)}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>This Month</Text>
              <Text style={[styles.reportItemValue, { color: Colors.accent.main }]}>{formatINR(monthlyRevenue)}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Commission Paid</Text>
              <Text style={styles.reportItemValue}>{formatINR(getTotalCommissionPaid())}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportItemName}>Commission Pending</Text>
              <Text style={[styles.reportItemValue, { color: Colors.warning }]}>{formatINR(getTotalCommissionPending())}</Text>
            </View>
          </GlassCard>
        </View>
      </View>
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Notifications ({notifications.length})</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllButtonText}>Mark All as Read ({unreadCount})</Text>
          </TouchableOpacity>
        )}
      </View>
      <GlassCard>
        <ScrollView style={{ maxHeight: 600 }}>
          {notifications.length === 0 ? (
            <EmptyState message="No notifications" />
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notificationRow, !notif.isRead && styles.notificationUnread]}
                onPress={() => markAsRead(notif.id)}
              >
                <View style={[styles.notifTypeBadge, {
                  backgroundColor:
                    notif.type === 'appointment_reminder' ? Colors.info + '30'
                    : notif.type === 'missed_appointment' ? Colors.error + '30'
                    : notif.type === 'payment_due' ? Colors.warning + '30'
                    : Colors.text.tertiary + '30',
                }]}>
                  <Text style={[styles.notifTypeText, {
                    color:
                      notif.type === 'appointment_reminder' ? Colors.info
                      : notif.type === 'missed_appointment' ? Colors.error
                      : notif.type === 'payment_due' ? Colors.warning
                      : Colors.text.secondary,
                  }]}>
                    {notif.type.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                </View>
                <Text style={styles.notifDate}>{formatDate(notif.createdAt)}</Text>
                {!notif.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </GlassCard>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <GlassCard>
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Profile</Text>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Name</Text>
            <Text style={styles.settingsValue}>{user?.fullName || 'Not set'}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Email</Text>
            <Text style={styles.settingsValue}>{user?.email || 'Not set'}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Phone</Text>
            <Text style={styles.settingsValue}>{user?.phone || 'Not set'}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Specialization</Text>
            <Text style={styles.settingsValue}>{user?.specialization || 'Not set'}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Registration No.</Text>
            <Text style={styles.settingsValue}>{user?.registrationNumber || 'Not set'}</Text>
          </View>
        </View>

        <View style={[styles.settingsSection, { marginTop: Spacing.xl }]}>
          <Text style={styles.settingsSectionTitle}>Preferences</Text>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Currency</Text>
            <Text style={styles.settingsValue}>{user?.settings?.defaultCurrency || 'INR'}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>GST Enabled</Text>
            <Text style={styles.settingsValue}>{user?.settings?.gstEnabled ? 'Yes' : 'No'}</Text>
          </View>
          {user?.settings?.gstEnabled && (
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>GST Number</Text>
              <Text style={styles.settingsValue}>{user?.settings?.gstNumber || 'Not set'}</Text>
            </View>
          )}
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Language</Text>
            <Text style={styles.settingsValue}>{user?.language === 'hi' ? 'Hindi' : 'English'}</Text>
          </View>
        </View>

        <View style={[styles.settingsSection, { marginTop: Spacing.xl }]}>
          <Text style={styles.settingsSectionTitle}>Subscription</Text>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Plan</Text>
            <Text style={styles.settingsValue}>{user?.subscription?.plan?.toUpperCase() || 'FREE'}</Text>
          </View>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Photos Used</Text>
            <Text style={styles.settingsValue}>
              {user?.subscription?.photosUsed || 0} / {user?.subscription?.photosLimit || 0}
            </Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'patients': return renderPatients();
      case 'appointments': return renderAppointments();
      case 'billing': return renderBilling();
      case 'locations': return renderLocations();
      case 'treatments': return renderTreatments();
      case 'commission': return renderCommission();
      case 'reports': return renderReports();
      case 'notifications': return renderNotifications();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <LinearGradient
      colors={Colors.gradient.dark}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>OrthoSync</Text>
          <Text style={styles.logoSubtext}>Admin Panel</Text>
        </View>

        <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => {
                  setActiveSection(item.key);
                  setSearchQuery('');
                }}
              >
                <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{item.icon}</Text>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                {item.key === 'notifications' && unreadCount > 0 && (
                  <View style={styles.navBadge}>
                    <Text style={styles.navBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sidebarFooter}>
          <View style={styles.doctorAvatar}>
            <Text style={styles.doctorAvatarText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'D'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName} numberOfLines={1}>{user?.fullName || 'Doctor'}</Text>
            <Text style={styles.doctorRole}>{user?.specialization || 'Orthodontist'}</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>
            {NAV_ITEMS.find((n) => n.key === activeSection)?.label || 'Dashboard'}
          </Text>
          <View style={styles.topBarRight}>
            <TextInput
              style={styles.topSearchInput}
              placeholder="Quick search..."
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) setActiveSection('patients');
              }}
            />
            <TouchableOpacity
              style={styles.notificationBell}
              onPress={() => setActiveSection('notifications')}
            >
              <Text style={styles.bellIcon}>{'\u2709'}</Text>
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollInner}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

// ==========================================
// Styles
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%' as any,
  },

  // Sidebar
  sidebar: {
    width: 250,
    backgroundColor: 'rgba(0, 30, 0, 0.60)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.10)',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  logoArea: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: Spacing.lg,
  },
  logoText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.accent.main,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  navList: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  navIcon: {
    fontSize: FontSize.lg,
    color: Colors.text.tertiary,
    width: 28,
    textAlign: 'center',
  },
  navIconActive: {
    color: Colors.accent.main,
  },
  navLabel: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  navLabelActive: {
    color: Colors.accent.main,
    fontWeight: FontWeight.semibold,
  },
  navBadge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  navBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  sidebarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  doctorAvatarText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  doctorName: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  doctorRole: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
  },

  // Main Content
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(0, 20, 0, 0.40)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  topBarTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topSearchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    width: 250,
    marginRight: Spacing.lg,
  },
  notificationBell: {
    position: 'relative',
    padding: Spacing.sm,
  },
  bellIcon: {
    fontSize: FontSize.xl,
    color: Colors.text.secondary,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollInner: {
    padding: Spacing.xxl,
    paddingBottom: Spacing.massive,
  },

  // Section Content
  sectionContent: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statIcon: {
    fontSize: FontSize.xxl,
  },
  statValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    fontWeight: FontWeight.medium,
  },

  // Glass Card
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(12px)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    }),
  },
  glassCardDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Two Column Layout
  twoColumnLayout: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  leftColumn: {
    flex: 3,
  },
  rightColumn: {
    flex: 2,
  },

  // Appointment Row
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  appointmentTime: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.lg,
  },
  timeText: {
    color: Colors.accent.light,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  appointmentLocation: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: Spacing.md,
  },
  activityTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  activityMessage: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  activityTime: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginTop: 4,
  },

  // Quick Stats
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickStatLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  quickStatValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // Upcoming
  upcomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  upcomingName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  upcomingDate: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  upcomingLocation: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },

  // Table Styles
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: Spacing.sm,
  },
  tableHeaderText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    paddingRight: Spacing.sm,
  },

  // Search Input
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    minWidth: 250,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  filterLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterChipActive: {
    backgroundColor: Colors.accent.main + '25',
    borderColor: Colors.accent.main,
  },
  filterChipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  filterChipTextActive: {
    color: Colors.accent.main,
    fontWeight: FontWeight.semibold,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },

  // Empty State
  emptyState: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyStateText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontStyle: 'italic',
  },

  // Locations Grid
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  locationCard: {
    width: '48%' as any,
    minWidth: 320,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationTypeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  locationTypeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  locationCity: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  locationOwner: {
    fontSize: FontSize.sm,
    color: Colors.accent.light,
    marginTop: Spacing.sm,
  },
  locationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  locationMetaText: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
  },

  // Reports
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  reportItemName: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  reportItemSub: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  reportItemValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  barContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginTop: 4,
  },
  bar: {
    height: 4,
    backgroundColor: Colors.accent.main,
    borderRadius: 2,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  // Notifications
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.sm,
  },
  notificationUnread: {
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
  },
  notifTypeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  notifTypeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  notifTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  notifMessage: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  notifDate: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginLeft: Spacing.md,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.main,
    marginLeft: Spacing.sm,
  },
  markAllButton: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: Colors.accent.main,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  markAllButtonText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // Settings
  settingsSection: {},
  settingsSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.accent.main,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  settingsLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  settingsValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
