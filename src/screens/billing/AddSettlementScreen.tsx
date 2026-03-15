import React, { useState, useMemo, useCallback } from 'react';
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

const formatMonth = (month: string): string => {
  const [year, m] = month.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[parseInt(m, 10) - 1]} ${year}`;
};

const getTodayString = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// ------------------------------------
// Route param type
// ------------------------------------

type AddSettlementRouteParams = {
  AddSettlement: { locationId: string; month: string };
};

// ------------------------------------
// Payment Mode type
// ------------------------------------

type PaymentMode = 'cash' | 'upi' | 'bank_transfer';

const paymentModes: { key: PaymentMode; label: string; icon: string }[] = [
  { key: 'cash', label: 'Cash', icon: 'cash-outline' },
  { key: 'upi', label: 'UPI', icon: 'qr-code-outline' },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: 'swap-horizontal-outline' },
];

// ------------------------------------
// Component
// ------------------------------------

export default function AddSettlementScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AddSettlementRouteParams, 'AddSettlement'>>();
  const { locationId, month } = route.params;

  const { getRecordByLocationAndMonth, addSettlement } = useCommissionStore();
  const { getLocationById } = useLocationStore();

  const record = getRecordByLocationAndMonth(locationId, month);
  const location = getLocationById(locationId);

  const remaining = useMemo(() => {
    if (!record) return 0;
    return record.pendingAmount;
  }, [record]);

  // Form state
  const [amount, setAmount] = useState(remaining > 0 ? remaining.toString() : '');
  const [selectedMode, setSelectedMode] = useState<PaymentMode>('cash');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');

  // ---- Handlers ----

  const handleRecordSettlement = useCallback(() => {
    if (!record) {
      Alert.alert('Error', 'Commission record not found.');
      return;
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (parsedAmount > remaining) {
      Alert.alert(
        'Amount Exceeds Remaining',
        `The amount cannot exceed the remaining balance of ${formatCurrency(remaining)}.`,
      );
      return;
    }

    if (!date.trim()) {
      Alert.alert('Invalid Date', 'Please enter a valid date.');
      return;
    }

    const settlement: Settlement = {
      id: `sett_${Date.now()}`,
      amount: parsedAmount,
      date: date.trim(),
      mode: selectedMode,
      notes: notes.trim() || undefined,
    };

    addSettlement(record.id, settlement);
    navigation.goBack();
  }, [record, amount, remaining, date, selectedMode, notes, addSettlement, navigation]);

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
        keyboardShouldPersistTaps="handled"
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
            {t('commission.addSettlement', 'Add Settlement')}
          </Text>
          <View style={styles.headerIconPlaceholder} />
        </View>

        {/* ============ COMMISSION SUMMARY ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('commission.commissionSummary', 'Commission Summary')}
            </Text>

            <View style={styles.summaryRow}>
              <Ionicons name="location-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.summaryText}>{record.locationName}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.summaryText}>{formatMonth(record.month)}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Total Commission</Text>
              <Text style={styles.lineValue}>{formatCurrency(record.commissionAmount)}</Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Already Paid</Text>
              <Text style={[styles.lineValue, { color: Colors.success }]}>
                {formatCurrency(record.paidToOwner)}
              </Text>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabelBold}>Remaining</Text>
              <Text style={styles.remainingValue}>{formatCurrency(remaining)}</Text>
            </View>
          </BlurView>
        </View>

        {/* ============ SETTLEMENT FORM ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('commission.settlementDetails', 'Settlement Details')}
            </Text>

            {/* Amount */}
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>{'\u20B9'}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            {/* Payment Mode */}
            <Text style={styles.fieldLabel}>Payment Mode</Text>
            <View style={styles.modeChipsRow}>
              {paymentModes.map((mode) => {
                const isSelected = selectedMode === mode.key;
                return (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.modeChip,
                      isSelected && styles.modeChipSelected,
                    ]}
                    onPress={() => setSelectedMode(mode.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={16}
                      color={isSelected ? Colors.accent.main : Colors.text.tertiary}
                    />
                    <Text
                      style={[
                        styles.modeChipText,
                        isSelected && styles.modeChipTextSelected,
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date */}
            <Text style={styles.fieldLabel}>Date</Text>
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.text.tertiary}
            />

            {/* Notes */}
            <Text style={styles.fieldLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </BlurView>
        </View>

        {/* ============ SUBMIT BUTTON ============ */}
        <TouchableOpacity
          onPress={handleRecordSettlement}
          activeOpacity={0.8}
          style={styles.submitBtnWrapper}
        >
          <LinearGradient
            colors={[Colors.accent.dark, Colors.accent.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#1B5E20" />
            <Text style={styles.submitBtnText}>
              {t('commission.recordSettlement', 'Record Settlement')}
            </Text>
          </LinearGradient>
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
  headerIconPlaceholder: {
    width: 40,
    height: 40,
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

  // ---- Section Title ----
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },

  // ---- Commission Summary ----
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.glass.borderLight,
    marginVertical: Spacing.md,
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
  remainingValue: {
    color: Colors.warning,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  // ---- Form Fields ----
  fieldLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.dark,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    paddingHorizontal: Spacing.md,
  },
  currencySymbol: {
    color: Colors.accent.main,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    paddingVertical: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.glass.dark,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },

  // ---- Payment Mode Chips ----
  modeChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass.dark,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.glass.borderLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  modeChipSelected: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  modeChipText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  modeChipTextSelected: {
    color: Colors.accent.main,
  },

  // ---- Submit Button ----
  submitBtnWrapper: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  submitBtnText: {
    color: '#1B5E20',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});
