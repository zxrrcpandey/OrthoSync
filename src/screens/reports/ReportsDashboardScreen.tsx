import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  useBillingStore,
  usePatientStore,
  useAppointmentStore,
  useLocationStore,
  useTreatmentStore,
  useCommissionStore,
} from '../../store';
import { Bill, Appointment } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ==========================================
// Types
// ==========================================

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

interface LocationRevenue {
  locationId: string;
  locationName: string;
  revenue: number;
  commissionPaid: number;
}

interface TreatmentRevenue {
  treatmentId: string;
  treatmentName: string;
  count: number;
  revenue: number;
}

// ==========================================
// Helpers
// ==========================================

const formatCurrency = (amount: number): string => {
  if (amount === 0) return '\u20B90';
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  return `${amount < 0 ? '-' : ''}\u20B9${formatted}`;
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const getWeekAgo = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
};

const getCurrentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentYear = (): string => `${new Date().getFullYear()}`;

const getPeriodLabel = (period: Period): string => {
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  switch (period) {
    case 'today':
      return `${now.getDate()}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    case 'week':
      return 'Last 7 Days';
    case 'month':
      return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    case 'year':
      return `${now.getFullYear()}`;
    case 'all':
      return 'All Time';
  }
};

const filterByPeriod = <T extends { createdAt: string }>(
  items: T[],
  period: Period,
  dateField: keyof T = 'createdAt' as keyof T,
): T[] => {
  switch (period) {
    case 'today': {
      const today = getToday();
      return items.filter((item) => String(item[dateField]).startsWith(today));
    }
    case 'week': {
      const weekAgo = getWeekAgo();
      return items.filter((item) => String(item[dateField]) >= weekAgo);
    }
    case 'month': {
      const month = getCurrentMonth();
      return items.filter((item) => String(item[dateField]).startsWith(month));
    }
    case 'year': {
      const year = getCurrentYear();
      return items.filter((item) => String(item[dateField]).startsWith(year));
    }
    case 'all':
      return items;
  }
};

const filterAppointmentsByPeriod = (
  items: Appointment[],
  period: Period,
): Appointment[] => {
  switch (period) {
    case 'today': {
      const today = getToday();
      return items.filter((a) => a.date.startsWith(today));
    }
    case 'week': {
      const weekAgo = getWeekAgo();
      return items.filter((a) => a.date >= weekAgo);
    }
    case 'month': {
      const month = getCurrentMonth();
      return items.filter((a) => a.date.startsWith(month));
    }
    case 'year': {
      const year = getCurrentYear();
      return items.filter((a) => a.date.startsWith(year));
    }
    case 'all':
      return items;
  }
};

// ==========================================
// Sub-components
// ==========================================

const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.glassCard, style]}>
    <BlurView intensity={20} tint="light" style={styles.glassCardBlur}>
      {children}
    </BlurView>
  </View>
);

const SectionTitle = ({ title, icon }: { title: string; icon: string }) => (
  <View style={styles.sectionTitleRow}>
    <Ionicons name={icon as any} size={20} color={Colors.accent.main} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const PeriodChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const StatItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <View style={styles.statItem}>
    <Text style={[styles.statItemValue, color ? { color } : null]}>{value}</Text>
    <Text style={styles.statItemLabel}>{label}</Text>
  </View>
);

const OverviewCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) => (
  <View style={styles.overviewCard}>
    <BlurView intensity={20} tint="light" style={styles.overviewCardBlur}>
      <View style={[styles.overviewIconWrap, { backgroundColor: color + '30' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.overviewValue}>{value}</Text>
      <Text style={styles.overviewLabel}>{label}</Text>
    </BlurView>
  </View>
);

const HorizontalBar = ({
  value,
  maxValue,
  color = Colors.accent.main,
}: {
  value: number;
  maxValue: number;
  color?: string;
}) => {
  const width = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0;
  return (
    <View style={styles.barContainer}>
      <View style={[styles.barFill, { width: `${width}%`, backgroundColor: color }]} />
    </View>
  );
};

// ==========================================
// Main Screen
// ==========================================

export default function ReportsDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  // Store data
  const bills = useBillingStore((s) => s.bills);
  const patients = usePatientStore((s) => s.patients);
  const appointments = useAppointmentStore((s) => s.appointments);
  const locations = useLocationStore((s) => s.locations);
  const patientTreatments = useTreatmentStore((s) => s.patientTreatments);
  const treatments = useTreatmentStore((s) => s.treatments);
  const commissionRecords = useCommissionStore((s) => s.commissionRecords);

  // ---- Filtered data ----
  const filteredBills = useMemo(
    () => filterByPeriod(bills, selectedPeriod),
    [bills, selectedPeriod],
  );

  const filteredAppointments = useMemo(
    () => filterAppointmentsByPeriod(appointments, selectedPeriod),
    [appointments, selectedPeriod],
  );

  const filteredPatients = useMemo(
    () => filterByPeriod(patients, selectedPeriod),
    [patients, selectedPeriod],
  );

  // ---- Revenue Summary ----
  const revenueSummary = useMemo(() => {
    const totalBilled = filteredBills.reduce((s, b) => s + b.grandTotal, 0);
    const totalCollected = filteredBills.reduce((s, b) => s + b.paidAmount, 0);
    const totalPending = filteredBills.reduce((s, b) => s + b.balanceAmount, 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
    return { totalBilled, totalCollected, totalPending, collectionRate };
  }, [filteredBills]);

  // ---- Overview Stats ----
  const overviewStats = useMemo(
    () => ({
      totalRevenue: revenueSummary.totalCollected,
      totalPatients: filteredPatients.length,
      totalAppointments: filteredAppointments.length,
      pendingPayments: revenueSummary.totalPending,
    }),
    [revenueSummary, filteredPatients, filteredAppointments],
  );

  // ---- Location Revenue ----
  const locationRevenue = useMemo((): LocationRevenue[] => {
    const revenueMap: Record<string, LocationRevenue> = {};

    filteredBills.forEach((bill) => {
      if (!revenueMap[bill.locationId]) {
        const loc = locations.find((l) => l.id === bill.locationId);
        revenueMap[bill.locationId] = {
          locationId: bill.locationId,
          locationName: loc?.name || 'Unknown Location',
          revenue: 0,
          commissionPaid: 0,
        };
      }
      revenueMap[bill.locationId].revenue += bill.paidAmount;
    });

    commissionRecords.forEach((rec) => {
      if (revenueMap[rec.locationId]) {
        revenueMap[rec.locationId].commissionPaid += rec.paidToOwner;
      }
    });

    return Object.values(revenueMap).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBills, locations, commissionRecords]);

  // ---- Treatment Revenue ----
  const treatmentRevenue = useMemo((): TreatmentRevenue[] => {
    const treatMap: Record<string, TreatmentRevenue> = {};

    filteredBills.forEach((bill) => {
      const tId = bill.treatmentId || 'general';
      if (!treatMap[tId]) {
        const pt = patientTreatments.find((p) => p.id === tId);
        const masterTreat = treatments.find((tr) => tr.id === tId);
        treatMap[tId] = {
          treatmentId: tId,
          treatmentName: pt?.treatmentName || masterTreat?.name || 'General',
          count: 0,
          revenue: 0,
        };
      }
      treatMap[tId].count += 1;
      treatMap[tId].revenue += bill.paidAmount;
    });

    return Object.values(treatMap).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBills, patientTreatments, treatments]);

  // ---- Appointment Stats ----
  const appointmentStats = useMemo(() => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter((a) => a.status === 'completed').length;
    const missed = filteredAppointments.filter((a) => a.status === 'missed').length;
    const cancelled = filteredAppointments.filter((a) => a.status === 'cancelled').length;
    const hold = filteredAppointments.filter((a) => a.status === 'hold').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, missed, cancelled, hold, completionRate };
  }, [filteredAppointments]);

  // ---- Patient Stats ----
  const patientStats = useMemo(() => {
    const total = patients.length;
    const newThisPeriod = filteredPatients.length;
    const male = filteredPatients.filter((p) => p.gender === 'male').length;
    const female = filteredPatients.filter((p) => p.gender === 'female').length;
    const other = filteredPatients.filter((p) => p.gender === 'other').length;

    return { total, newThisPeriod, male, female, other };
  }, [patients, filteredPatients]);

  // ---- Commission Summary ----
  const commissionSummary = useMemo(() => {
    const totalOwed = commissionRecords.reduce((s, r) => s + r.commissionAmount, 0);
    const totalPaid = commissionRecords.reduce((s, r) => s + r.paidToOwner, 0);
    const pending = commissionRecords.reduce((s, r) => s + r.pendingAmount, 0);
    return { totalOwed, totalPaid, pending };
  }, [commissionRecords]);

  // ---- Export Handlers ----
  const generateReport = useCallback((): string => {
    const period = getPeriodLabel(selectedPeriod);
    const now = new Date();
    const generated = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const locBreakdown = locationRevenue
      .map(
        (l, i) =>
          `${i + 1}. ${l.locationName} - ${formatCurrency(l.revenue)}${l.commissionPaid > 0 ? ` (Commission: ${formatCurrency(l.commissionPaid)})` : ''}`,
      )
      .join('\n');

    const treatBreakdown = treatmentRevenue
      .map(
        (tr, i) =>
          `${i + 1}. ${tr.treatmentName} x${tr.count} - ${formatCurrency(tr.revenue)}`,
      )
      .join('\n');

    return `==========================================
     OrthoSync Analytics Report
==========================================
Period: ${period}
Generated: ${generated}

REVENUE SUMMARY
- Total Billed:      ${formatCurrency(revenueSummary.totalBilled)}
- Collected:         ${formatCurrency(revenueSummary.totalCollected)}
- Pending:           ${formatCurrency(revenueSummary.totalPending)}
- Collection Rate:   ${revenueSummary.collectionRate}%

LOCATION BREAKDOWN
${locBreakdown || 'No data'}

TREATMENT BREAKDOWN
${treatBreakdown || 'No data'}

APPOINTMENTS
- Total: ${appointmentStats.total} | Completed: ${appointmentStats.completed} | Missed: ${appointmentStats.missed}
- Completion Rate: ${appointmentStats.completionRate}%

PATIENTS
- Total: ${patientStats.total} | New: ${patientStats.newThisPeriod}
- Male: ${patientStats.male} | Female: ${patientStats.female}

COMMISSION
- Total Owed: ${formatCurrency(commissionSummary.totalOwed)}
- Paid: ${formatCurrency(commissionSummary.totalPaid)}
- Pending: ${formatCurrency(commissionSummary.pending)}

==========================================
Generated by OrthoSync
Built by Dr. Pooja Gangare
==========================================`;
  }, [
    selectedPeriod,
    revenueSummary,
    locationRevenue,
    treatmentRevenue,
    appointmentStats,
    patientStats,
    commissionSummary,
  ]);

  const generateDailySummary = useCallback((): string => {
    const todayBills = filterByPeriod(bills, 'today');
    const todayAppts = filterAppointmentsByPeriod(appointments, 'today');
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const collected = todayBills.reduce((s, b) => s + b.paidAmount, 0);
    const billed = todayBills.reduce((s, b) => s + b.grandTotal, 0);
    const completed = todayAppts.filter((a) => a.status === 'completed').length;
    const missed = todayAppts.filter((a) => a.status === 'missed').length;

    return `==========================================
     OrthoSync Daily Summary
==========================================
Date: ${dateStr}

REVENUE
- Billed Today:   ${formatCurrency(billed)}
- Collected:      ${formatCurrency(collected)}

APPOINTMENTS
- Total: ${todayAppts.length}
- Completed: ${completed}
- Missed: ${missed}

==========================================
Generated by OrthoSync
Built by Dr. Pooja Gangare
==========================================`;
  }, [bills, appointments]);

  const handleShareReport = useCallback(async () => {
    try {
      const report = generateReport();
      await Share.share({ message: report, title: 'OrthoSync Analytics Report' });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share report. Please try again.');
      }
    }
  }, [generateReport]);

  const handleShareDailySummary = useCallback(async () => {
    try {
      const report = generateDailySummary();
      await Share.share({ message: report, title: 'OrthoSync Daily Summary' });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share report. Please try again.');
      }
    }
  }, [generateDailySummary]);

  // ---- Derived values for bars ----
  const maxLocationRevenue = useMemo(
    () => Math.max(...locationRevenue.map((l) => l.revenue), 1),
    [locationRevenue],
  );
  const maxTreatmentRevenue = useMemo(
    () => Math.max(...treatmentRevenue.map((tr) => tr.revenue), 1),
    [treatmentRevenue],
  );

  // ==========================================
  // Render
  // ==========================================

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="light" style={styles.headerButtonBlur}>
              <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <TouchableOpacity
            onPress={handleShareReport}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="light" style={styles.headerButtonBlur}>
              <Ionicons name="share-outline" size={22} color={Colors.text.primary} />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* ---- Period Selector ---- */}
        <GlassCard>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodRow}
          >
            {periods.map((p) => (
              <PeriodChip
                key={p.key}
                label={p.label}
                active={selectedPeriod === p.key}
                onPress={() => setSelectedPeriod(p.key)}
              />
            ))}
          </ScrollView>
        </GlassCard>

        {/* ---- Overview Stats ---- */}
        <View style={styles.overviewGrid}>
          <OverviewCard
            icon="cash-outline"
            label="Total Revenue"
            value={formatCurrency(overviewStats.totalRevenue)}
            color={Colors.accent.main}
          />
          <OverviewCard
            icon="people-outline"
            label="Total Patients"
            value={String(overviewStats.totalPatients)}
            color={Colors.info}
          />
          <OverviewCard
            icon="calendar-outline"
            label="Appointments"
            value={String(overviewStats.totalAppointments)}
            color={Colors.warning}
          />
          <OverviewCard
            icon="hourglass-outline"
            label="Pending Payments"
            value={formatCurrency(overviewStats.pendingPayments)}
            color={Colors.error}
          />
        </View>

        {/* ---- Revenue Summary ---- */}
        <SectionTitle title="Revenue Summary" icon="wallet-outline" />
        <GlassCard>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Total Billed</Text>
            <Text style={styles.revValue}>{formatCurrency(revenueSummary.totalBilled)}</Text>
          </View>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Total Collected</Text>
            <Text style={[styles.revValue, { color: Colors.accent.main }]}>
              {formatCurrency(revenueSummary.totalCollected)}
            </Text>
          </View>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Total Pending</Text>
            <Text style={[styles.revValue, { color: Colors.warning }]}>
              {formatCurrency(revenueSummary.totalPending)}
            </Text>
          </View>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Collection Rate</Text>
            <Text style={[styles.revValue, { color: Colors.accent.main }]}>
              {revenueSummary.collectionRate}%
            </Text>
          </View>
          {/* Visual bar */}
          <View style={styles.collectionBarWrap}>
            <View style={styles.collectionBarBg}>
              <View
                style={[
                  styles.collectionBarFill,
                  {
                    width: `${revenueSummary.collectionRate}%`,
                    backgroundColor: Colors.accent.main,
                  },
                ]}
              />
              <View
                style={[
                  styles.collectionBarFill,
                  {
                    width: `${100 - revenueSummary.collectionRate}%`,
                    backgroundColor: Colors.warning + '60',
                  },
                ]}
              />
            </View>
            <View style={styles.collectionLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.accent.main }]} />
                <Text style={styles.legendText}>Collected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.legendText}>Pending</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* ---- Location Revenue ---- */}
        <SectionTitle title="Revenue by Location" icon="location-outline" />
        <GlassCard>
          {locationRevenue.length === 0 ? (
            <Text style={styles.emptyText}>No revenue data for this period</Text>
          ) : (
            locationRevenue.map((loc) => (
              <View key={loc.locationId} style={styles.locRow}>
                <View style={styles.locHeader}>
                  <Text style={styles.locName} numberOfLines={1}>
                    {loc.locationName}
                  </Text>
                  <Text style={styles.locRevenue}>{formatCurrency(loc.revenue)}</Text>
                </View>
                <HorizontalBar value={loc.revenue} maxValue={maxLocationRevenue} />
                {loc.commissionPaid > 0 && (
                  <Text style={styles.locCommission}>
                    Commission Paid: {formatCurrency(loc.commissionPaid)}
                  </Text>
                )}
              </View>
            ))
          )}
        </GlassCard>

        {/* ---- Treatment Revenue ---- */}
        <SectionTitle title="Revenue by Treatment" icon="medkit-outline" />
        <GlassCard>
          {treatmentRevenue.length === 0 ? (
            <Text style={styles.emptyText}>No treatment data for this period</Text>
          ) : (
            treatmentRevenue.map((tr) => (
              <View key={tr.treatmentId} style={styles.locRow}>
                <View style={styles.locHeader}>
                  <Text style={styles.locName} numberOfLines={1}>
                    {tr.treatmentName}
                  </Text>
                  <Text style={styles.locRevenue}>
                    x{tr.count} - {formatCurrency(tr.revenue)}
                  </Text>
                </View>
                <HorizontalBar
                  value={tr.revenue}
                  maxValue={maxTreatmentRevenue}
                  color={Colors.info}
                />
              </View>
            ))
          )}
        </GlassCard>

        {/* ---- Appointment Stats ---- */}
        <SectionTitle title="Appointment Summary" icon="calendar-outline" />
        <GlassCard>
          <View style={styles.apptStatsRow}>
            <StatItem label="Total" value={String(appointmentStats.total)} />
            <StatItem
              label="Completed"
              value={String(appointmentStats.completed)}
              color={Colors.success}
            />
            <StatItem
              label="Missed"
              value={String(appointmentStats.missed)}
              color={Colors.error}
            />
            <StatItem
              label="Cancelled"
              value={String(appointmentStats.cancelled)}
              color={Colors.text.tertiary}
            />
            <StatItem
              label="Hold"
              value={String(appointmentStats.hold)}
              color={Colors.warning}
            />
          </View>
          <View style={styles.completionRateWrap}>
            <Text style={styles.completionLabel}>Completion Rate</Text>
            <Text style={styles.completionValue}>{appointmentStats.completionRate}%</Text>
          </View>
        </GlassCard>

        {/* ---- Patient Stats ---- */}
        <SectionTitle title="Patient Summary" icon="people-outline" />
        <GlassCard>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Total Registered</Text>
            <Text style={styles.revValue}>{patientStats.total}</Text>
          </View>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>New This Period</Text>
            <Text style={[styles.revValue, { color: Colors.accent.main }]}>
              {patientStats.newThisPeriod}
            </Text>
          </View>
          <View style={styles.genderRow}>
            <View style={styles.genderItem}>
              <Ionicons name="male-outline" size={18} color={Colors.info} />
              <Text style={styles.genderLabel}>Male</Text>
              <Text style={styles.genderValue}>{patientStats.male}</Text>
            </View>
            <View style={styles.genderItem}>
              <Ionicons name="female-outline" size={18} color="#E91E63" />
              <Text style={styles.genderLabel}>Female</Text>
              <Text style={styles.genderValue}>{patientStats.female}</Text>
            </View>
            <View style={styles.genderItem}>
              <Ionicons name="person-outline" size={18} color={Colors.warning} />
              <Text style={styles.genderLabel}>Other</Text>
              <Text style={styles.genderValue}>{patientStats.other}</Text>
            </View>
          </View>
        </GlassCard>

        {/* ---- Commission Summary ---- */}
        <SectionTitle title="Commission Summary" icon="receipt-outline" />
        <GlassCard>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Total Commission Owed</Text>
            <Text style={styles.revValue}>
              {formatCurrency(commissionSummary.totalOwed)}
            </Text>
          </View>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Total Paid</Text>
            <Text style={[styles.revValue, { color: Colors.accent.main }]}>
              {formatCurrency(commissionSummary.totalPaid)}
            </Text>
          </View>
          <View style={styles.revRow}>
            <Text style={styles.revLabel}>Pending Settlement</Text>
            <Text style={[styles.revValue, { color: Colors.warning }]}>
              {formatCurrency(commissionSummary.pending)}
            </Text>
          </View>
        </GlassCard>

        {/* ---- Export Section ---- */}
        <SectionTitle title="Export Reports" icon="download-outline" />
        <GlassCard>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleShareReport}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.accent.dark, Colors.accent.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exportButtonGradient}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors.text.dark} />
              <Text style={styles.exportButtonText}>Share as Text Report</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, { marginTop: Spacing.md }]}
            onPress={handleShareDailySummary}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.primary[700], Colors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exportButtonGradient}
            >
              <Ionicons name="today-outline" size={20} color={Colors.text.primary} />
              <Text style={[styles.exportButtonText, { color: Colors.text.primary }]}>
                Share Daily Summary
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },

  // Glass Card
  glassCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  glassCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },

  // Period Selector
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  chipActive: {
    backgroundColor: Colors.accent.main,
    borderColor: Colors.accent.main,
  },
  chipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  chipTextActive: {
    color: Colors.text.dark,
    fontWeight: FontWeight.bold,
  },

  // Overview Grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  overviewCard: {
    width: '47%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  overviewCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    alignItems: 'flex-start',
  },
  overviewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  overviewValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  overviewLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  // Section Title
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },

  // Revenue Summary
  revRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  revLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  revValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // Collection Bar
  collectionBarWrap: {
    marginTop: Spacing.lg,
  },
  collectionBarBg: {
    height: 12,
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.glass.white,
  },
  collectionBarFill: {
    height: '100%',
  },
  collectionLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
  },

  // Location / Treatment rows
  locRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  locHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  locName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
    marginRight: Spacing.sm,
  },
  locRevenue: {
    color: Colors.accent.main,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  locCommission: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },

  // Horizontal Bar
  barContainer: {
    height: 6,
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },

  // Appointment Stats
  apptStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  statItemValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  statItemLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  completionRateWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glass.borderLight,
  },
  completionLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  completionValue: {
    color: Colors.accent.main,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
  },

  // Gender Row
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glass.borderLight,
  },
  genderItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  genderLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
  },
  genderValue: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  // Export
  exportButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  exportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  exportButtonText: {
    color: Colors.text.dark,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // Empty
  emptyText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
