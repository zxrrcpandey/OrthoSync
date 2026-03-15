import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCommissionStore, useLocationStore, useBillingStore } from '../../store';
import { CommissionRecord, Location } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ------------------------------------
// Helpers
// ------------------------------------

const formatCurrency = (amount: number): string => {
  return '\u20B9' + amount.toLocaleString('en-IN');
};

const getMonthLabel = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const getLast6Months = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }
  return months;
};

const getCommissionModelLabel = (location: Location): string => {
  const model = location.commissionModel;
  switch (model.type) {
    case 'percentage':
      return `${model.value}%`;
    case 'fixed_per_patient':
      return `\u20B9${model.value}/patient`;
    case 'fixed_per_visit':
      return `\u20B9${model.value}/visit`;
    case 'rent':
      return `Rent \u20B9${model.value.toLocaleString('en-IN')}`;
    case 'none':
      return 'None';
    default:
      return '';
  }
};

const getLocationTypeBadge = (type: Location['type']): string => {
  switch (type) {
    case 'hospital':
      return 'Hospital';
    case 'others_clinic':
      return "Other's Clinic";
    default:
      return type;
  }
};

const statusColors: Record<CommissionRecord['status'], string> = {
  settled: Colors.status.paid,
  partial: '#FF9800',
  pending: Colors.status.pending,
};

const statusLabels: Record<CommissionRecord['status'], string> = {
  settled: 'Settled',
  partial: 'Partial',
  pending: 'Pending',
};

// ------------------------------------
// Component
// ------------------------------------

export default function CommissionDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { locations } = useLocationStore();
  const { bills } = useBillingStore();
  const {
    commissionRecords,
    getMonthlyRecords,
    getTotalCommissionPaid,
    getTotalCommissionPending,
    calculateCommission,
  } = useCommissionStore();

  const [selectedMonth, setSelectedMonth] = useState<string>(getLast6Months()[0]);
  const [refreshing, setRefreshing] = useState(false);

  const months = useMemo(() => getLast6Months(), []);

  // Filter locations: non-own clinics for commission
  const commissionLocations = useMemo(
    () => locations.filter((loc) => loc.type !== 'own_clinic' && loc.isActive),
    [locations],
  );

  // Own clinics
  const ownClinics = useMemo(
    () => locations.filter((loc) => loc.type === 'own_clinic' && loc.isActive),
    [locations],
  );

  // Monthly records
  const monthlyRecords = useMemo(
    () => getMonthlyRecords(selectedMonth),
    [selectedMonth, commissionRecords],
  );

  // All-time totals
  const totalCommission = useMemo(
    () => commissionRecords.reduce((sum, r) => sum + r.commissionAmount, 0),
    [commissionRecords],
  );
  const totalPaid = useMemo(() => getTotalCommissionPaid(), [commissionRecords]);
  const totalPending = useMemo(() => getTotalCommissionPending(), [commissionRecords]);

  // Own clinic revenue for selected month
  const ownClinicRevenue = useMemo(() => {
    const result: { location: Location; revenue: number }[] = [];
    for (const clinic of ownClinics) {
      const revenue = bills
        .filter((b) => b.locationId === clinic.id && b.createdAt.startsWith(selectedMonth))
        .reduce((sum, b) => sum + b.grandTotal, 0);
      result.push({ location: clinic, revenue });
    }
    return result;
  }, [ownClinics, bills, selectedMonth]);

  // Get record for a specific location in selected month
  const getRecordForLocation = useCallback(
    (locationId: string): CommissionRecord | undefined => {
      return monthlyRecords.find((r) => r.locationId === locationId);
    },
    [monthlyRecords],
  );

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Calculate commission for all locations
  const handleCalculateCommission = useCallback(() => {
    let calculated = 0;
    for (const loc of commissionLocations) {
      const locationBills = bills.filter(
        (b) => b.locationId === loc.id && b.createdAt.startsWith(selectedMonth),
      );

      const totalRevenue = locationBills.reduce((sum, b) => sum + b.grandTotal, 0);
      const materialCost = locationBills.reduce(
        (sum, b) => sum + b.items.reduce((s, item) => s + (item.equipmentCost || 0), 0),
        0,
      );
      const patientCount = new Set(locationBills.map((b) => b.patientId)).size;
      const visitCount = locationBills.length;

      calculateCommission({
        locationId: loc.id,
        locationName: loc.name,
        ownerName: loc.ownerName || '',
        month: selectedMonth,
        totalRevenue,
        materialCost,
        commissionType: loc.commissionModel.type,
        commissionValue: loc.commissionModel.value,
        calculatedOn: loc.commissionModel.calculatedOn || 'total_fee',
        patientCount,
        visitCount,
      });
      calculated++;
    }

    Alert.alert(
      t('commission.calculated', 'Commission Calculated'),
      t(
        'commission.calculatedMessage',
        `Commission calculated for ${calculated} location(s) for ${getMonthLabel(selectedMonth)}.`,
      ),
    );
  }, [commissionLocations, bills, selectedMonth, calculateCommission, t]);

  // Navigate to detail
  const handleViewDetails = useCallback(
    (locationId: string) => {
      navigation.navigate('CommissionDetail', { locationId, month: selectedMonth });
    },
    [navigation, selectedMonth],
  );

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />
        }
      >
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
            {t('commission.title', 'Commission & Settlement')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ============ SUMMARY STATS ============ */}
        <View style={styles.statsRow}>
          {/* Total Commission */}
          <View style={[styles.statCard, { flex: 1 }]}>
            <BlurView intensity={18} tint="light" style={styles.statCardBlur}>
              <Ionicons name="calculator-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.statValue}>{formatCurrency(totalCommission)}</Text>
              <Text style={styles.statLabel}>
                {t('commission.totalCommission', 'Total Commission')}
              </Text>
            </BlurView>
          </View>

          {/* Paid */}
          <View style={[styles.statCard, { flex: 1 }]}>
            <BlurView intensity={18} tint="light" style={styles.statCardBlur}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.status.paid} />
              <Text style={[styles.statValue, { color: Colors.status.paid }]}>
                {formatCurrency(totalPaid)}
              </Text>
              <Text style={styles.statLabel}>
                {t('commission.paidToOwners', 'Paid to Owners')}
              </Text>
            </BlurView>
          </View>

          {/* Pending */}
          <View style={[styles.statCard, { flex: 1 }]}>
            <BlurView intensity={18} tint="light" style={styles.statCardBlur}>
              <Ionicons name="time-outline" size={20} color={Colors.warning} />
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {formatCurrency(totalPending)}
              </Text>
              <Text style={styles.statLabel}>
                {t('commission.pending', 'Pending')}
              </Text>
            </BlurView>
          </View>
        </View>

        {/* ============ MONTH SELECTOR ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('commission.selectMonth', 'Select Month')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthChipsContainer}
            >
              {months.map((month) => {
                const isSelected = month === selectedMonth;
                return (
                  <TouchableOpacity
                    key={month}
                    style={[styles.monthChip, isSelected && styles.monthChipSelected]}
                    onPress={() => setSelectedMonth(month)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.monthChipText,
                        isSelected && styles.monthChipTextSelected,
                      ]}
                    >
                      {getMonthLabel(month)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </BlurView>
        </View>

        {/* ============ LOCATION-WISE COMMISSION CARDS ============ */}
        {commissionLocations.length > 0 &&
          commissionLocations.map((loc) => {
            const record = getRecordForLocation(loc.id);

            if (!record) return null;

            const paidProgress =
              record.commissionAmount > 0
                ? record.paidToOwner / record.commissionAmount
                : 0;

            return (
              <View key={loc.id} style={styles.card}>
                <BlurView intensity={18} tint="light" style={styles.cardBlur}>
                  {/* Location name + type badge */}
                  <View style={styles.locationHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationName}>{loc.name}</Text>
                      {loc.ownerName ? (
                        <Text style={styles.ownerName}>Owner: {loc.ownerName}</Text>
                      ) : null}
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {getLocationTypeBadge(loc.type)}
                      </Text>
                    </View>
                  </View>

                  {/* Commission model badge */}
                  <View style={styles.commissionModelRow}>
                    <View style={styles.commissionModelBadge}>
                      <Ionicons name="pricetag-outline" size={12} color={Colors.accent.main} />
                      <Text style={styles.commissionModelText}>
                        {getCommissionModelLabel(loc)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  {/* Revenue row */}
                  <View style={styles.lineRow}>
                    <Text style={styles.lineLabel}>
                      {t('commission.totalRevenue', 'Total Revenue')}
                    </Text>
                    <Text style={styles.lineValue}>{formatCurrency(record.totalRevenue)}</Text>
                  </View>

                  {/* Commission row */}
                  <View style={styles.lineRow}>
                    <Text style={styles.lineLabel}>
                      {t('commission.commission', 'Commission')}
                    </Text>
                    <Text style={styles.lineValue}>
                      {formatCurrency(record.commissionAmount)}
                    </Text>
                  </View>

                  {/* Material Cost row */}
                  <View style={styles.lineRow}>
                    <Text style={styles.lineLabel}>
                      {t('commission.materialCost', 'Material Cost')}
                    </Text>
                    <Text style={styles.lineValue}>{formatCurrency(record.materialCost)}</Text>
                  </View>

                  {/* Doctor's Net */}
                  <View style={styles.lineRow}>
                    <Text style={styles.doctorNetLabel}>
                      {t('commission.doctorNet', "Doctor's Net")}
                    </Text>
                    <Text style={styles.doctorNetValue}>
                      {formatCurrency(record.doctorNetEarning)}
                    </Text>
                  </View>

                  <View style={styles.separator} />

                  {/* Settlement status */}
                  <View style={styles.settlementRow}>
                    <Text style={styles.settlementText}>
                      <Text style={{ color: Colors.status.paid }}>
                        Paid {formatCurrency(record.paidToOwner)}
                      </Text>
                      {'  |  '}
                      <Text style={{ color: Colors.warning }}>
                        Pending {formatCurrency(record.pendingAmount)}
                      </Text>
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(paidProgress * 100, 100)}%` },
                      ]}
                    />
                  </View>

                  {/* Status badge + View Details */}
                  <View style={styles.cardFooter}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors[record.status] },
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {statusLabels[record.status]}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewDetailsBtn}
                      onPress={() => handleViewDetails(loc.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewDetailsBtnText}>
                        {t('commission.viewDetails', 'View Details')}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={Colors.accent.main}
                      />
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            );
          })}

        {/* ============ EMPTY STATE ============ */}
        {commissionLocations.length > 0 &&
          monthlyRecords.filter((r) =>
            commissionLocations.some((loc) => loc.id === r.locationId),
          ).length === 0 && (
            <View style={styles.card}>
              <BlurView intensity={18} tint="light" style={styles.emptyCardBlur}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.emptyTitle}>
                  {t('commission.noRecords', 'No Commission Records')}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {t(
                    'commission.noRecordsHint',
                    `No commission data for ${getMonthLabel(selectedMonth)}. Tap "Calculate Commission" below to generate.`,
                  )}
                </Text>
              </BlurView>
            </View>
          )}

        {/* ============ GENERATE COMMISSION BUTTON ============ */}
        {commissionLocations.length > 0 && (
          <View style={styles.card}>
            <BlurView intensity={18} tint="light" style={styles.cardBlur}>
              <TouchableOpacity
                style={styles.calculateBtn}
                onPress={handleCalculateCommission}
                activeOpacity={0.7}
              >
                <Ionicons name="calculator" size={20} color="#1B5E20" />
                <Text style={styles.calculateBtnText}>
                  {t('commission.calculate', 'Calculate Commission')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.calculateHint}>
                {t(
                  'commission.calculateHint',
                  `Auto-calculate commission for all locations for ${getMonthLabel(selectedMonth)}`,
                )}
              </Text>
            </BlurView>
          </View>
        )}

        {/* ============ OWN CLINIC SUMMARY ============ */}
        {ownClinics.length > 0 && (
          <View style={styles.card}>
            <BlurView intensity={18} tint="light" style={styles.cardBlur}>
              <View style={styles.ownClinicHeader}>
                <Ionicons name="home-outline" size={20} color={Colors.accent.main} />
                <Text style={styles.sectionTitle}>
                  {t('commission.ownClinicEarnings', 'Own Clinic Earnings')}
                </Text>
              </View>

              {ownClinicRevenue.map(({ location: clinic, revenue }) => (
                <View key={clinic.id} style={styles.ownClinicRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ownClinicName}>{clinic.name}</Text>
                    <Text style={styles.ownClinicSubtext}>
                      {t('commission.noCommission', 'No commission applicable')}
                    </Text>
                  </View>
                  <Text style={styles.ownClinicRevenue}>{formatCurrency(revenue)}</Text>
                </View>
              ))}
            </BlurView>
          </View>
        )}

        {/* ============ NO LOCATIONS STATE ============ */}
        {commissionLocations.length === 0 && ownClinics.length === 0 && (
          <View style={styles.card}>
            <BlurView intensity={18} tint="light" style={styles.emptyCardBlur}>
              <Ionicons name="business-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {t('commission.noLocations', 'No Locations Added')}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t(
                  'commission.noLocationsHint',
                  'Add hospital or clinic locations to start tracking commissions.',
                )}
              </Text>
            </BlurView>
          </View>
        )}
      </ScrollView>
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
    padding: Spacing.lg,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
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

  // ---- Summary Stats ----
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  statCardBlur: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
  },
  statLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },

  // ---- Glass Card ----
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  cardBlur: {
    padding: Spacing.lg,
    overflow: 'hidden',
  },

  // ---- Section Title ----
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },

  // ---- Month Selector ----
  monthChipsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  monthChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  monthChipSelected: {
    backgroundColor: Colors.accent.dark,
    borderColor: Colors.accent.main,
  },
  monthChipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  monthChipTextSelected: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },

  // ---- Location Commission Card ----
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  locationName: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  ownerName: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.sm,
  },
  typeBadgeText: {
    color: Colors.text.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  commissionModelRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  commissionModelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  commissionModelText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // ---- Line Rows ----
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  lineLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    flex: 1,
  },
  lineValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  doctorNetLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  doctorNetValue: {
    color: Colors.accent.main,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.glass.borderLight,
    marginVertical: Spacing.md,
  },

  // ---- Settlement ----
  settlementRow: {
    marginBottom: Spacing.sm,
  },
  settlementText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },

  // ---- Progress Bar ----
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.glass.dark,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent.main,
    borderRadius: BorderRadius.round,
  },

  // ---- Card Footer ----
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewDetailsBtnText: {
    color: Colors.accent.main,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // ---- Calculate Button ----
  calculateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  calculateBtnText: {
    color: '#1B5E20',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  calculateHint: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },

  // ---- Empty State ----
  emptyCardBlur: {
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

  // ---- Own Clinic ----
  ownClinicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ownClinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  ownClinicName: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  ownClinicSubtext: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  ownClinicRevenue: {
    color: Colors.accent.main,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
  },
});
