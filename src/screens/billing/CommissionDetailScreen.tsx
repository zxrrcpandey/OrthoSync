import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCommissionStore, useLocationStore } from '../../store';
import { CommissionRecord, Settlement } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ------------------------------------
// Helpers
// ------------------------------------

const formatCurrency = (amount: number): string => {
  return '\u20B9' + amount.toLocaleString('en-IN');
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatMonth = (month: string): string => {
  const [year, m] = month.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[parseInt(m, 10) - 1]} ${year}`;
};

const commissionTypeLabels: Record<string, string> = {
  percentage: 'Percentage',
  fixed_per_patient: 'Fixed per Patient',
  fixed_per_visit: 'Fixed per Visit',
  rent: 'Fixed Rent',
  none: 'None',
};

const locationTypeLabels: Record<string, string> = {
  own_clinic: 'Own Clinic',
  hospital: 'Hospital',
  others_clinic: "Other's Clinic",
};

const statusColors: Record<CommissionRecord['status'], string> = {
  settled: Colors.success,
  partial: Colors.warning,
  pending: Colors.error,
};

const statusLabels: Record<CommissionRecord['status'], string> = {
  settled: 'Settled',
  partial: 'Partial',
  pending: 'Pending',
};

const modeLabels: Record<Settlement['mode'], string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
};

const modeColors: Record<Settlement['mode'], string> = {
  cash: Colors.success,
  upi: '#2196F3',
  bank_transfer: '#9C27B0',
};

// ------------------------------------
// Route param type
// ------------------------------------

type CommissionDetailRouteParams = {
  CommissionDetail: { locationId: string; month: string };
};

// ------------------------------------
// Component
// ------------------------------------

export default function CommissionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CommissionDetailRouteParams, 'CommissionDetail'>>();
  const { locationId, month } = route.params;

  const { getRecordByLocationAndMonth } = useCommissionStore();
  const { getLocationById } = useLocationStore();

  const record = getRecordByLocationAndMonth(locationId, month);
  const location = getLocationById(locationId);

  // Derived values
  const netRevenue = useMemo(() => {
    if (!record) return 0;
    return record.totalRevenue - record.materialCost;
  }, [record]);

  const settlementProgress = useMemo(() => {
    if (!record || record.commissionAmount <= 0) return 0;
    return Math.min(record.paidToOwner / record.commissionAmount, 1);
  }, [record]);

  // Commission rate display
  const commissionRateDisplay = useMemo(() => {
    if (!location) return '';
    const model = location.commissionModel;
    switch (model.type) {
      case 'percentage':
        return `${model.value}%`;
      case 'fixed_per_patient':
        return `${formatCurrency(model.value)}/patient`;
      case 'fixed_per_visit':
        return `${formatCurrency(model.value)}/visit`;
      case 'rent':
        return `${formatCurrency(model.value)}/month`;
      case 'none':
        return 'None';
      default:
        return '';
    }
  }, [location]);

  // ---- Share Report ----
  const handleShareReport = useCallback(async () => {
    if (!record || !location) return;

    const settlementLines = record.settlements
      .map(
        (s, idx) =>
          `${idx + 1}. ${formatDate(s.date)} - ${formatCurrency(s.amount)} (${modeLabels[s.mode]})`,
      )
      .join('\n');

    const reportText = `===================================
   OrthoSync Commission Report
===================================
Location: ${record.locationName}
Owner: ${record.ownerName}
Month: ${formatMonth(record.month)}

Revenue Breakdown:
- Total Revenue:     ${formatCurrency(record.totalRevenue)}
- Material Cost:     ${formatCurrency(record.materialCost)}
- Net Revenue:       ${formatCurrency(netRevenue)}

Commission:
- Rate:              ${commissionRateDisplay}
- Commission Amount: ${formatCurrency(record.commissionAmount)}

Settlement:
- Total Paid:        ${formatCurrency(record.paidToOwner)}
- Pending:           ${formatCurrency(record.pendingAmount)}
- Status:            ${statusLabels[record.status]}
${
  record.settlements.length > 0
    ? `\nSettlement History:\n${settlementLines}`
    : ''
}

Doctor's Net Earning: ${formatCurrency(record.doctorNetEarning)}
===================================
Generated by OrthoSync
Built by Dr. Pooja Gangare
===================================`;

    try {
      await Share.share({ message: reportText });
    } catch (_e) {
      // user cancelled
    }
  }, [record, location, netRevenue, commissionRateDisplay]);

  // ---- Navigate to Add Settlement ----
  const handleAddSettlement = useCallback(() => {
    navigation.navigate('AddSettlement', { locationId, month });
  }, [navigation, locationId, month]);

  // ---- Missing record ----
  if (!record) {
    return (
      <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top + Spacing.lg }]}>
          <Ionicons name="document-text-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>Commission record not found</Text>
          <TouchableOpacity
            style={styles.goBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.goBackBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {record.locationName}
          </Text>
          <TouchableOpacity
            onPress={handleShareReport}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* ============ MONTH & LOCATION INFO ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.monthTitle}>{formatMonth(record.month)}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{record.locationName}</Text>
            </View>

            {location && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.infoText}>
                  {locationTypeLabels[location.type] || location.type}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{record.ownerName}</Text>
            </View>

            {location && (
              <View style={styles.commissionModelRow}>
                <Ionicons name="calculator-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.infoText}>
                  {commissionTypeLabels[location.commissionModel.type] || location.commissionModel.type}
                  {' - '}
                  {commissionRateDisplay}
                </Text>
              </View>
            )}
          </BlurView>
        </View>

        {/* ============ FINANCIAL BREAKDOWN ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('commission.financialBreakdown', 'Financial Breakdown')}
            </Text>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Total Revenue</Text>
              <Text style={styles.lineValue}>{formatCurrency(record.totalRevenue)}</Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Material Cost</Text>
              <Text style={[styles.lineValue, { color: Colors.error }]}>
                ({formatCurrency(record.materialCost)})
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Net Revenue</Text>
              <Text style={styles.lineValue}>{formatCurrency(netRevenue)}</Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Commission Rate</Text>
              <Text style={styles.lineValue}>{commissionRateDisplay}</Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabelBold}>Commission Amount</Text>
              <Text style={styles.lineValueBold}>{formatCurrency(record.commissionAmount)}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.lineRow}>
              <Text style={styles.doctorNetLabel}>Doctor's Net Earning</Text>
              <Text style={styles.doctorNetValue}>
                {formatCurrency(record.doctorNetEarning)}
              </Text>
            </View>
          </BlurView>
        </View>

        {/* ============ SETTLEMENT STATUS ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('commission.settlementStatus', 'Settlement Status')}
            </Text>

            {/* Progress bar */}
            <Text style={styles.progressText}>
              {formatCurrency(record.paidToOwner)} / {formatCurrency(record.commissionAmount)}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${settlementProgress * 100}%` },
                ]}
              />
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Total Commission</Text>
              <Text style={styles.lineValue}>{formatCurrency(record.commissionAmount)}</Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Paid to Owner</Text>
              <Text style={[styles.lineValue, { color: Colors.success }]}>
                {formatCurrency(record.paidToOwner)}
              </Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Pending</Text>
              <Text
                style={[
                  styles.lineValue,
                  { color: record.pendingAmount > 0 ? Colors.warning : Colors.success },
                ]}
              >
                {formatCurrency(record.pendingAmount)}
              </Text>
            </View>

            <View style={styles.statusBadgeRow}>
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
            </View>
          </BlurView>
        </View>

        {/* ============ SETTLEMENT HISTORY ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <View style={styles.settlementHeaderRow}>
              <Text style={styles.sectionTitle}>
                {t('commission.settlements', 'Settlements')}
              </Text>
              {record.pendingAmount > 0 && (
                <TouchableOpacity
                  style={styles.addSettlementBtn}
                  onPress={handleAddSettlement}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={18} color={Colors.accent.main} />
                  <Text style={styles.addSettlementBtnText}>Add Settlement</Text>
                </TouchableOpacity>
              )}
            </View>

            {record.settlements.length === 0 ? (
              <View style={styles.emptySettlements}>
                <Ionicons name="wallet-outline" size={40} color={Colors.text.tertiary} />
                <Text style={styles.emptySettlementsText}>No settlements recorded yet</Text>
              </View>
            ) : (
              record.settlements.map((settlement, idx) => (
                <View key={settlement.id} style={styles.settlementItem}>
                  <View style={styles.settlementItemLeft}>
                    <Text style={styles.settlementDate}>{formatDate(settlement.date)}</Text>
                    <Text style={styles.settlementAmount}>
                      {formatCurrency(settlement.amount)}
                    </Text>
                    {settlement.notes ? (
                      <Text style={styles.settlementNotes} numberOfLines={2}>
                        {settlement.notes}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.modeBadge,
                      { backgroundColor: modeColors[settlement.mode] + '25' },
                    ]}
                  >
                    <Text
                      style={[styles.modeBadgeText, { color: modeColors[settlement.mode] }]}
                    >
                      {modeLabels[settlement.mode]}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </BlurView>
        </View>

        {/* ============ SHARE REPORT ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <TouchableOpacity
              style={styles.shareReportBtn}
              onPress={handleShareReport}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors.text.primary} />
              <Text style={styles.shareReportBtnText}>
                {t('commission.shareReport', 'Share Report with Owner')}
              </Text>
              <Ionicons name="share-social-outline" size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          </BlurView>
        </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  goBackBtn: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  goBackBtnText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
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
    marginHorizontal: Spacing.sm,
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

  // ---- Month & Location Info ----
  monthTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  infoText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  commissionModelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },

  // ---- Financial Breakdown ----
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },
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
  lineLabelBold: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  lineValueBold: {
    color: Colors.accent.main,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.glass.borderLight,
    marginVertical: Spacing.md,
  },
  doctorNetLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  doctorNetValue: {
    color: Colors.accent.main,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
  },

  // ---- Settlement Status ----
  progressText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.glass.dark,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent.main,
    borderRadius: BorderRadius.round,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ---- Settlement History ----
  settlementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addSettlementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  addSettlementBtnText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  emptySettlements: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptySettlementsText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    marginTop: Spacing.md,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  settlementItemLeft: {
    flex: 1,
  },
  settlementDate: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
  },
  settlementAmount: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  settlementNotes: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.md,
  },
  modeBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  // ---- Share Report ----
  shareReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  shareReportBtnText: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
});
