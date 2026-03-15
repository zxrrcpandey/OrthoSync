import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBillingStore, usePatientStore, useLocationStore } from '../../store';
import { Bill, Installment } from '../../types';
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

const statusColors: Record<Bill['status'], string> = {
  paid: Colors.status.paid,
  partial: '#FF9800',
  pending: Colors.status.pending,
  overdue: Colors.status.overdue,
};

const statusLabels: Record<Bill['status'], string> = {
  paid: 'Paid',
  partial: 'Partial',
  pending: 'Pending',
  overdue: 'Overdue',
};

// ------------------------------------
// Route param type
// ------------------------------------

type BillDetailRouteParams = {
  BillDetail: { billId: string };
};

// ------------------------------------
// Component
// ------------------------------------

export default function BillDetailScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<BillDetailRouteParams, 'BillDetail'>>();
  const { billId } = route.params;

  const {
    getBillById,
    recordPayment,
    markInstallmentPaid,
    deleteBill,
  } = useBillingStore();
  const { getPatientById } = usePatientStore();
  const { getLocationById } = useLocationStore();

  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'cash' | 'upi'>('cash');

  const bill = getBillById(billId);
  const patient = bill ? getPatientById(bill.patientId) : undefined;
  const location = bill ? getLocationById(bill.locationId) : undefined;

  // Derived values
  const subtotal = useMemo(() => {
    if (!bill) return 0;
    return bill.items.reduce((sum, item) => sum + item.amount, 0);
  }, [bill]);

  const equipmentTotal = useMemo(() => {
    if (!bill) return 0;
    return bill.items.reduce((sum, item) => sum + (item.equipmentCost || 0), 0);
  }, [bill]);

  const paidInstallments = useMemo(() => {
    if (!bill) return 0;
    return bill.installments.filter((i) => i.isPaid).length;
  }, [bill]);

  // ---- Handlers ----

  const handleRecordPayment = useCallback(() => {
    if (!bill) return;
    Alert.prompt(
      'Record Payment',
      `Balance due: ${formatCurrency(bill.balanceAmount)}\nEnter payment amount:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay (Cash)',
          onPress: (value: string | undefined) => {
            const amt = parseFloat(value || '0');
            if (amt > 0 && amt <= bill.balanceAmount) {
              recordPayment(bill.id, amt, 'cash');
            } else {
              Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            }
          },
        },
        {
          text: 'Pay (UPI)',
          onPress: (value: string | undefined) => {
            const amt = parseFloat(value || '0');
            if (amt > 0 && amt <= bill.balanceAmount) {
              recordPayment(bill.id, amt, 'upi');
            } else {
              Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            }
          },
        },
      ],
      'plain-text',
      '',
      'decimal-pad',
    );
  }, [bill, recordPayment]);

  const handleMarkAsPaid = useCallback(() => {
    if (!bill) return;
    Alert.alert(
      'Mark as Paid',
      `Pay full remaining balance of ${formatCurrency(bill.balanceAmount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => recordPayment(bill.id, bill.balanceAmount, bill.paymentMode),
        },
      ],
    );
  }, [bill, recordPayment]);

  const handleMarkInstallmentPaid = useCallback(
    (installment: Installment) => {
      if (!bill) return;
      Alert.alert(
        'Mark Installment Paid',
        `Mark installment of ${formatCurrency(installment.amount)} as paid?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Cash',
            onPress: () => markInstallmentPaid(bill.id, installment.id, 'cash'),
          },
          {
            text: 'UPI',
            onPress: () => markInstallmentPaid(bill.id, installment.id, 'upi'),
          },
        ],
      );
    },
    [bill, markInstallmentPaid],
  );

  const handleShareReceipt = useCallback(async () => {
    if (!bill) return;

    const itemLines = bill.items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.description.padEnd(20)} ${formatCurrency(item.amount)}`,
      )
      .join('\n');

    const receiptText = `===================================
        OrthoSync Receipt
===================================
Receipt No: BILL-${bill.id.slice(0, 5).toUpperCase()}
Date: ${formatDate(bill.createdAt)}

Patient: ${patient?.fullName || 'N/A'}
Patient ID: ${patient?.patientId || 'N/A'}
Location: ${location?.name || 'N/A'}

Items:
${itemLines}
-----------------------------------
Subtotal:            ${formatCurrency(subtotal)}
Equipment:           ${formatCurrency(equipmentTotal)}${bill.gstAmount > 0 ? `\nGST (18%):           ${formatCurrency(bill.gstAmount)}` : ''}
-----------------------------------
GRAND TOTAL:         ${formatCurrency(bill.grandTotal)}
Amount Paid:         ${formatCurrency(bill.paidAmount)}
Balance Due:         ${formatCurrency(bill.balanceAmount)}
-----------------------------------
Payment Mode: ${bill.paymentMode.charAt(0).toUpperCase() + bill.paymentMode.slice(1)}

Thank you for choosing OrthoSync!
Built by Dr. Pooja Gangare
===================================`;

    try {
      await Share.share({ message: receiptText });
    } catch (_e) {
      // user cancelled
    }
  }, [bill, patient, location, subtotal, equipmentTotal]);

  const handleDelete = useCallback(() => {
    if (!bill) return;
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBill(bill.id);
            navigation.goBack();
          },
        },
      ],
    );
  }, [bill, deleteBill, navigation]);

  // ---- Missing bill ----
  if (!bill) {
    return (
      <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top + Spacing.lg }]}>
          <Ionicons name="document-text-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>Bill not found</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ---- Installment progress ----
  const totalInstallments = bill.installments.length;
  const installmentProgress =
    totalInstallments > 0 ? paidInstallments / totalInstallments : 0;

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
          <Text style={styles.headerTitle}>{t('billing.billDetails', 'Bill Details')}</Text>
          <TouchableOpacity
            onPress={handleShareReceipt}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* ============ STATUS CARD ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[bill.status] },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {statusLabels[bill.status]}
                </Text>
              </View>
              <Text style={styles.billDate}>{formatDate(bill.createdAt)}</Text>
            </View>

            <View style={styles.statusInfoRow}>
              <Ionicons name="person-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.statusInfoText}>
                {patient?.fullName || 'Unknown Patient'}
              </Text>
              {patient?.patientId && (
                <Text style={styles.statusInfoSubtext}>{patient.patientId}</Text>
              )}
            </View>

            <View style={styles.statusInfoRow}>
              <Ionicons name="location-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.statusInfoText}>
                {location?.name || 'Unknown Location'}
              </Text>
            </View>
          </BlurView>
        </View>

        {/* ============ FINANCIAL SUMMARY ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('billing.financialSummary', 'Financial Summary')}
            </Text>

            {/* Bill Items */}
            <Text style={styles.subSectionTitle}>
              {t('billing.items', 'Bill Items')}
            </Text>
            {bill.items.map((item, idx) => (
              <View key={idx}>
                <View style={styles.lineRow}>
                  <Text style={styles.lineLabel} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={styles.lineValue}>{formatCurrency(item.amount)}</Text>
                </View>
                {(item.equipmentCost ?? 0) > 0 && (
                  <View style={[styles.lineRow, { paddingLeft: Spacing.lg }]}>
                    <Text style={styles.lineLabelSmall}>Equipment Cost</Text>
                    <Text style={styles.lineValueSmall}>
                      {formatCurrency(item.equipmentCost!)}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.separator} />

            {/* Totals */}
            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Subtotal</Text>
              <Text style={styles.lineValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Equipment Total</Text>
              <Text style={styles.lineValue}>{formatCurrency(equipmentTotal)}</Text>
            </View>
            {bill.gstAmount > 0 && (
              <View style={styles.lineRow}>
                <Text style={styles.lineLabel}>GST (18%)</Text>
                <Text style={styles.lineValue}>{formatCurrency(bill.gstAmount)}</Text>
              </View>
            )}

            <View style={styles.separator} />

            {/* Grand Total */}
            <View style={styles.lineRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(bill.grandTotal)}</Text>
            </View>
            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Amount Paid</Text>
              <Text style={[styles.lineValue, { color: Colors.status.paid }]}>
                {formatCurrency(bill.paidAmount)}
              </Text>
            </View>
            {bill.balanceAmount > 0 && (
              <View style={styles.lineRow}>
                <Text style={styles.lineLabel}>Balance Due</Text>
                <Text style={[styles.lineValue, { color: Colors.status.overdue }]}>
                  {formatCurrency(bill.balanceAmount)}
                </Text>
              </View>
            )}
          </BlurView>
        </View>

        {/* ============ PAYMENT ACTIONS ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('billing.paymentActions', 'Payment')}
            </Text>

            {/* Payment Mode Badge */}
            <View style={styles.paymentModeRow}>
              <Text style={styles.paymentModeLabel}>Mode:</Text>
              <View style={styles.paymentModeBadge}>
                <Ionicons
                  name={bill.paymentMode === 'cash' ? 'cash-outline' : 'qr-code-outline'}
                  size={14}
                  color={Colors.text.primary}
                />
                <Text style={styles.paymentModeBadgeText}>
                  {bill.paymentMode.toUpperCase()}
                </Text>
              </View>
            </View>

            {bill.balanceAmount > 0 && (
              <View style={styles.paymentBtnsRow}>
                <TouchableOpacity
                  style={styles.recordPaymentBtn}
                  onPress={handleRecordPayment}
                  activeOpacity={0.7}
                >
                  <Ionicons name="card-outline" size={18} color={Colors.text.primary} />
                  <Text style={styles.recordPaymentBtnText}>Record Payment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.markPaidBtn}
                  onPress={handleMarkAsPaid}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#1B5E20"
                  />
                  <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
                </TouchableOpacity>
              </View>
            )}
          </BlurView>
        </View>

        {/* ============ INSTALLMENTS ============ */}
        {bill.installments.length > 0 && (
          <View style={styles.card}>
            <BlurView intensity={18} tint="light" style={styles.cardBlur}>
              <Text style={styles.sectionTitle}>
                {t('billing.installmentPlan', 'Installment Plan')}
              </Text>

              {/* Progress */}
              <Text style={styles.installmentProgress}>
                {paidInstallments} of {totalInstallments} installments paid
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${installmentProgress * 100}%` },
                  ]}
                />
              </View>

              {/* List */}
              {bill.installments.map((inst, idx) => {
                const isOverdue =
                  !inst.isPaid && new Date(inst.dueDate) < new Date();
                return (
                  <View
                    key={inst.id}
                    style={[
                      styles.installmentRow,
                      isOverdue && styles.installmentOverdue,
                    ]}
                  >
                    <View style={styles.installmentInfo}>
                      <Text style={styles.installmentNumber}>#{idx + 1}</Text>
                      <View>
                        <Text style={styles.installmentAmount}>
                          {formatCurrency(inst.amount)}
                        </Text>
                        <Text style={styles.installmentDate}>
                          Due: {formatDate(inst.dueDate)}
                        </Text>
                        {inst.isPaid && inst.paidDate && (
                          <Text style={styles.installmentPaidDate}>
                            Paid: {formatDate(inst.paidDate)}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.installmentActions}>
                      {inst.isPaid ? (
                        <View style={styles.paidChip}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={Colors.status.paid}
                          />
                          <Text style={styles.paidChipText}>Paid</Text>
                        </View>
                      ) : (
                        <>
                          {isOverdue && (
                            <View style={styles.overdueChip}>
                              <Ionicons
                                name="alert-circle"
                                size={14}
                                color={Colors.status.overdue}
                              />
                              <Text style={styles.overdueChipText}>Overdue</Text>
                            </View>
                          )}
                          <TouchableOpacity
                            style={styles.markPaidSmallBtn}
                            onPress={() => handleMarkInstallmentPaid(inst)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.markPaidSmallBtnText}>Mark Paid</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
            </BlurView>
          </View>
        )}

        {/* ============ RECEIPT SECTION ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <TouchableOpacity
              style={styles.shareReceiptBtn}
              onPress={handleShareReceipt}
              activeOpacity={0.7}
            >
              <Ionicons name="receipt-outline" size={20} color={Colors.text.primary} />
              <Text style={styles.shareReceiptBtnText}>
                {t('billing.shareReceipt', 'Share Receipt')}
              </Text>
              <Ionicons name="share-social-outline" size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* ============ DELETE BUTTON ============ */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={styles.deleteBtnText}>
            {t('common.delete', 'Delete Bill')}
          </Text>
        </TouchableOpacity>
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
  backBtn: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backBtnText: {
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

  // ---- Status Card ----
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  billDate: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusInfoText: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  statusInfoSubtext: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginLeft: Spacing.xs,
  },

  // ---- Financial Summary ----
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },
  subSectionTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
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
  lineLabelSmall: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  lineValueSmall: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.glass.borderLight,
    marginVertical: Spacing.md,
  },
  grandTotalLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  grandTotalValue: {
    color: Colors.accent.main,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
  },

  // ---- Payment Actions ----
  paymentModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  paymentModeLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  paymentModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  paymentModeBadgeText: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  paymentBtnsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  recordPaymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.dark,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  recordPaymentBtnText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  markPaidBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  markPaidBtnText: {
    color: '#1B5E20',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // ---- Installments ----
  installmentProgress: {
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
  installmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  installmentOverdue: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    marginHorizontal: -Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  installmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  installmentNumber: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    width: 28,
  },
  installmentAmount: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  installmentDate: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  installmentPaidDate: {
    color: Colors.status.paid,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  installmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  paidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  paidChipText: {
    color: Colors.status.paid,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  overdueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(244, 67, 54, 0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  overdueChipText: {
    color: Colors.status.overdue,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  markPaidSmallBtn: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  markPaidSmallBtnText: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // ---- Receipt ----
  shareReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  shareReceiptBtnText: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },

  // ---- Delete ----
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  deleteBtnText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
