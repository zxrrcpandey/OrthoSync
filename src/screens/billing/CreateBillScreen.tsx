import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useTreatmentStore, useBillingStore, usePatientStore, useLocationStore } from '../../store';
import { Treatment, Bill, BillItem, Installment } from '../../types';

// ==========================================
// Helpers
// ==========================================

const formatCurrency = (amount: number): string => {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
};

const getTodayISO = (): string => {
  return new Date().toISOString();
};

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const formatDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateDisplay = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ==========================================
// Types
// ==========================================

interface RouteParams {
  patientId?: string;
  treatmentId?: string;
}

interface LocalBillItem {
  id: string;
  description: string;
  amount: string;
  equipmentCost: string;
}

interface LocalInstallment {
  id: string;
  amount: string;
  dueDate: string;
}

// ==========================================
// Section Components
// ==========================================

interface SectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <View style={styles.sectionWrapper}>
    <BlurView intensity={15} tint="light" style={styles.sectionBlur}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={Colors.accent.main} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </BlurView>
  </View>
);

// ==========================================
// Main Component
// ==========================================

const CreateBillScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};

  // Stores
  const patients = usePatientStore((s) => s.patients);
  const getPatientById = usePatientStore((s) => s.getPatientById);
  const treatments = useTreatmentStore((s) => s.treatments);
  const getActiveTreatments = useTreatmentStore((s) => s.getActiveTreatments);
  const locations = useLocationStore((s) => s.locations);
  const getActiveLocations = useLocationStore((s) => s.getActiveLocations);
  const addBill = useBillingStore((s) => s.addBill);

  // --- State ---
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    params.patientId || null
  );
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(!params.patientId);

  // Bill Items
  const [billItems, setBillItems] = useState<LocalBillItem[]>(() => {
    if (params.treatmentId) {
      const treat = treatments.find((t) => t.id === params.treatmentId);
      if (treat) {
        return [
          {
            id: `item_${Date.now()}`,
            description: treat.name,
            amount: String(treat.defaultFee),
            equipmentCost: String(treat.equipmentCost),
          },
        ];
      }
    }
    return [
      {
        id: `item_${Date.now()}`,
        description: '',
        amount: '',
        equipmentCost: '',
      },
    ];
  });

  // Location
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // GST
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState('18');

  // Payment
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi'>('cash');
  const [isFullPayment, setIsFullPayment] = useState(true);
  const [amountPaid, setAmountPaid] = useState('');

  // Installments
  const [numInstallments, setNumInstallments] = useState('3');
  const [installments, setInstallments] = useState<LocalInstallment[]>([]);

  // --- Derived ---
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return getPatientById(selectedPatientId) || null;
  }, [selectedPatientId, getPatientById]);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  }, [patients, patientSearch]);

  const activeLocations = useMemo(() => getActiveLocations(), [locations]);

  const subtotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [billItems]);

  const equipmentTotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + (parseFloat(item.equipmentCost) || 0), 0);
  }, [billItems]);

  const gstAmount = useMemo(() => {
    if (!gstEnabled) return 0;
    const pct = parseFloat(gstPercentage) || 0;
    return Math.round((subtotal * pct) / 100);
  }, [subtotal, gstEnabled, gstPercentage]);

  const grandTotal = subtotal + gstAmount;

  const paidAmount = isFullPayment ? grandTotal : parseFloat(amountPaid) || 0;
  const balanceAmount = Math.max(0, grandTotal - paidAmount);

  // --- Generate installments when relevant state changes ---
  useEffect(() => {
    if (isFullPayment || balanceAmount <= 0) {
      setInstallments([]);
      return;
    }

    const count = parseInt(numInstallments, 10) || 1;
    const perInstallment = Math.floor(balanceAmount / count);
    const remainder = balanceAmount - perInstallment * count;
    const now = new Date();

    const generated: LocalInstallment[] = [];
    for (let i = 0; i < count; i++) {
      const amt = i === 0 ? perInstallment + remainder : perInstallment;
      const dueDate = formatDate(addMonths(now, i + 1));
      generated.push({
        id: `inst_${Date.now()}_${i}`,
        amount: String(amt),
        dueDate,
      });
    }
    setInstallments(generated);
  }, [balanceAmount, numInstallments, isFullPayment]);

  // --- Handlers ---
  const handleSelectPatient = useCallback((id: string) => {
    setSelectedPatientId(id);
    setShowPatientList(false);
    setPatientSearch('');
  }, []);

  const handleAddItem = useCallback(() => {
    setBillItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        description: '',
        amount: '',
        equipmentCost: '',
      },
    ]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateItem = useCallback(
    (id: string, field: keyof LocalBillItem, value: string) => {
      setBillItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    },
    []
  );

  const handleUpdateInstallmentAmount = useCallback((id: string, value: string) => {
    setInstallments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, amount: value } : inst))
    );
  }, []);

  const handleAddTreatmentSuggestion = useCallback(
    (treat: Treatment) => {
      setBillItems((prev) => [
        ...prev,
        {
          id: `item_${Date.now()}`,
          description: treat.name,
          amount: String(treat.defaultFee),
          equipmentCost: String(treat.equipmentCost),
        },
      ]);
    },
    []
  );

  const handleGenerateBill = useCallback(() => {
    // Validate
    if (!selectedPatientId) {
      Alert.alert(t('common.error'), 'Please select a patient');
      return;
    }
    const validItems = billItems.filter(
      (item) => item.description.trim() && (parseFloat(item.amount) || 0) > 0
    );
    if (validItems.length === 0) {
      Alert.alert(t('common.error'), 'Please add at least one bill item with a valid amount');
      return;
    }
    if (!selectedLocationId) {
      Alert.alert(t('common.error'), 'Please select a location');
      return;
    }

    // Build bill
    const billId = `bill_${Date.now()}`;
    const items: BillItem[] = validItems.map((item) => ({
      description: item.description.trim(),
      amount: parseFloat(item.amount) || 0,
      equipmentCost: parseFloat(item.equipmentCost) || undefined,
    }));

    const billInstallments: Installment[] = installments.map((inst, index) => ({
      id: `inst_${Date.now()}_${index}`,
      amount: parseFloat(inst.amount) || 0,
      dueDate: inst.dueDate,
      isPaid: false,
    }));

    let status: Bill['status'];
    if (balanceAmount <= 0) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    } else {
      status = 'pending';
    }

    const bill: Bill = {
      id: billId,
      patientId: selectedPatientId,
      doctorId: '', // Will be set by the app context
      locationId: selectedLocationId,
      treatmentId: params.treatmentId,
      items,
      totalAmount: subtotal,
      gstAmount,
      grandTotal,
      paidAmount,
      balanceAmount,
      paymentMode,
      installments: billInstallments,
      status,
      createdAt: getTodayISO(),
    };

    addBill(bill);
    Alert.alert(t('common.success') || 'Success', 'Bill generated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }, [
    selectedPatientId,
    billItems,
    selectedLocationId,
    subtotal,
    gstAmount,
    grandTotal,
    paidAmount,
    balanceAmount,
    paymentMode,
    installments,
    params.treatmentId,
    addBill,
    navigation,
    t,
  ]);

  // --- Treatment suggestions ---
  const treatmentSuggestions = useMemo(() => {
    return getActiveTreatments().slice(0, 5);
  }, [treatments]);

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('billing.createBill')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section 1: Select Patient */}
          <Section title="Select Patient" icon="person-outline">
            {selectedPatient && !showPatientList ? (
              <View>
                <View style={styles.selectedPatientCard}>
                  <View style={styles.patientAvatar}>
                    <Ionicons name="person" size={20} color={Colors.accent.main} />
                  </View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{selectedPatient.fullName}</Text>
                    <Text style={styles.patientMeta}>
                      {selectedPatient.patientId} | {selectedPatient.phone}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPatientList(true);
                      setSelectedPatientId(null);
                    }}
                    style={styles.changeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changeBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.searchInputWrapper}>
                  <Ionicons name="search" size={18} color={Colors.text.tertiary} />
                  <TextInput
                    style={styles.searchInput}
                    value={patientSearch}
                    onChangeText={setPatientSearch}
                    placeholder="Search by name, ID, or phone..."
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                {filteredPatients.map((patient) => (
                  <TouchableOpacity
                    key={patient.id}
                    onPress={() => handleSelectPatient(patient.id)}
                    style={styles.patientOption}
                    activeOpacity={0.7}
                  >
                    <View style={styles.patientAvatar}>
                      <Ionicons name="person" size={16} color={Colors.accent.main} />
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientOptionName}>{patient.fullName}</Text>
                      <Text style={styles.patientOptionMeta}>
                        {patient.patientId} | {patient.phone}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {filteredPatients.length === 0 && (
                  <Text style={styles.noResults}>No patients found</Text>
                )}
              </View>
            )}
          </Section>

          {/* Section 2: Bill Items */}
          <Section title="Bill Items" icon="receipt-outline">
            {billItems.map((item, index) => (
              <View key={item.id} style={styles.billItemCard}>
                <View style={styles.billItemHeader}>
                  <Text style={styles.billItemIndex}>#{index + 1}</Text>
                  {billItems.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={22} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.itemDescInput}
                  value={item.description}
                  onChangeText={(v) => handleUpdateItem(item.id, 'description', v)}
                  placeholder="Description"
                  placeholderTextColor={Colors.text.tertiary}
                />
                <View style={styles.itemAmountRow}>
                  <View style={styles.itemAmountField}>
                    <Text style={styles.itemAmountLabel}>Amount (\u20B9)</Text>
                    <TextInput
                      style={styles.itemAmountInput}
                      value={item.amount}
                      onChangeText={(v) => handleUpdateItem(item.id, 'amount', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  </View>
                  <View style={styles.itemAmountField}>
                    <Text style={styles.itemAmountLabel}>Equipment (\u20B9)</Text>
                    <TextInput
                      style={styles.itemAmountInput}
                      value={item.equipmentCost}
                      onChangeText={(v) => handleUpdateItem(item.id, 'equipmentCost', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleAddItem}
              style={styles.addItemBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color={Colors.accent.main} />
              <Text style={styles.addItemBtnText}>Add Item</Text>
            </TouchableOpacity>

            {/* Treatment Suggestions */}
            {treatmentSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Quick add from treatments:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {treatmentSuggestions.map((treat) => (
                    <TouchableOpacity
                      key={treat.id}
                      onPress={() => handleAddTreatmentSuggestion(treat)}
                      style={styles.suggestionChip}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionChipText} numberOfLines={1}>
                        {treat.name}
                      </Text>
                      <Text style={styles.suggestionChipFee}>
                        {formatCurrency(treat.defaultFee)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </Section>

          {/* Section 3: Location */}
          <Section title="Location" icon="location-outline">
            <View style={styles.locationChips}>
              {activeLocations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  onPress={() => setSelectedLocationId(loc.id)}
                  style={[
                    styles.locationChip,
                    selectedLocationId === loc.id && styles.locationChipActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="business-outline"
                    size={14}
                    color={
                      selectedLocationId === loc.id
                        ? Colors.primary[900]
                        : Colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.locationChipText,
                      selectedLocationId === loc.id && styles.locationChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {loc.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {activeLocations.length === 0 && (
                <Text style={styles.noResults}>No active locations</Text>
              )}
            </View>
          </Section>

          {/* Section 4: Billing Summary */}
          <Section title="Billing Summary" icon="calculator-outline">
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLineLabel}>Subtotal</Text>
              <Text style={styles.summaryLineValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLineLabel}>Equipment Total</Text>
              <Text style={styles.summaryLineValue}>{formatCurrency(equipmentTotal)}</Text>
            </View>

            <View style={styles.gstRow}>
              <View style={styles.gstToggle}>
                <Text style={styles.summaryLineLabel}>GST</Text>
                <Switch
                  value={gstEnabled}
                  onValueChange={setGstEnabled}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: Colors.accent.dark }}
                  thumbColor={gstEnabled ? Colors.accent.main : 'rgba(255,255,255,0.5)'}
                  ios_backgroundColor="rgba(255,255,255,0.2)"
                />
              </View>
              {gstEnabled && (
                <View style={styles.gstPercentWrapper}>
                  <TextInput
                    style={styles.gstPercentInput}
                    value={gstPercentage}
                    onChangeText={setGstPercentage}
                    keyboardType="numeric"
                    placeholder="18"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                  <Text style={styles.gstPercentSign}>%</Text>
                </View>
              )}
            </View>

            {gstEnabled && (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLineLabel}>GST Amount</Text>
                <Text style={styles.summaryLineValue}>{formatCurrency(gstAmount)}</Text>
              </View>
            )}

            <View style={[styles.summaryLine, styles.grandTotalLine]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </Section>

          {/* Section 5: Payment */}
          <Section title="Payment" icon="wallet-outline">
            <Text style={styles.fieldLabel}>Payment Mode</Text>
            <View style={styles.paymentModeRow}>
              <TouchableOpacity
                onPress={() => setPaymentMode('cash')}
                style={[
                  styles.paymentModeChip,
                  paymentMode === 'cash' && styles.paymentModeChipActive,
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color={paymentMode === 'cash' ? Colors.primary[900] : Colors.text.secondary}
                />
                <Text
                  style={[
                    styles.paymentModeText,
                    paymentMode === 'cash' && styles.paymentModeTextActive,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPaymentMode('upi')}
                style={[
                  styles.paymentModeChip,
                  paymentMode === 'upi' && styles.paymentModeChipActive,
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={paymentMode === 'upi' ? Colors.primary[900] : Colors.text.secondary}
                />
                <Text
                  style={[
                    styles.paymentModeText,
                    paymentMode === 'upi' && styles.paymentModeTextActive,
                  ]}
                >
                  UPI
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fullPaymentRow}>
              <Text style={styles.fieldLabel}>Full Payment</Text>
              <Switch
                value={isFullPayment}
                onValueChange={setIsFullPayment}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: Colors.accent.dark }}
                thumbColor={isFullPayment ? Colors.accent.main : 'rgba(255,255,255,0.5)'}
                ios_backgroundColor="rgba(255,255,255,0.2)"
              />
            </View>

            {!isFullPayment && (
              <>
                <Text style={styles.fieldLabel}>Amount Paid (\u20B9)</Text>
                <TextInput
                  style={styles.paymentInput}
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.text.tertiary}
                />
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={styles.balanceValue}>{formatCurrency(balanceAmount)}</Text>
                </View>
              </>
            )}
          </Section>

          {/* Section 6: Installments */}
          {!isFullPayment && balanceAmount > 0 && (
            <Section title="Setup Installments (EMI)" icon="calendar-outline">
              <Text style={styles.fieldLabel}>Number of installments</Text>
              <TextInput
                style={styles.installmentCountInput}
                value={numInstallments}
                onChangeText={setNumInstallments}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor={Colors.text.tertiary}
              />

              {installments.map((inst, index) => (
                <View key={inst.id} style={styles.installmentRow}>
                  <View style={styles.installmentIndex}>
                    <Text style={styles.installmentIndexText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.installmentDetail}>
                    <View style={styles.installmentAmountRow}>
                      <Text style={styles.installmentLabel}>Amount</Text>
                      <TextInput
                        style={styles.installmentAmountInput}
                        value={inst.amount}
                        onChangeText={(v) => handleUpdateInstallmentAmount(inst.id, v)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={Colors.text.tertiary}
                      />
                    </View>
                    <View style={styles.installmentDateRow}>
                      <Text style={styles.installmentLabel}>Due</Text>
                      <Text style={styles.installmentDate}>
                        {formatDateDisplay(inst.dueDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Section>
          )}

          {/* Generate Bill Button */}
          <TouchableOpacity onPress={handleGenerateBill} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.accent.dark, Colors.accent.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateBtn}
            >
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary[900]} />
              <Text style={styles.generateBtnText}>Generate Bill</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: insets.bottom + 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default CreateBillScreen;

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginLeft: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },

  // Section
  sectionWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  sectionBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  // Patient Selection
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    paddingVertical: Spacing.md,
  },
  selectedPatientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  patientMeta: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
  },
  changeBtnText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  patientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  patientOptionName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  patientOptionMeta: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
  },
  noResults: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },

  // Bill Items
  billItemCard: {
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  billItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  billItemIndex: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  itemDescInput: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  itemAmountRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemAmountField: {
    flex: 1,
  },
  itemAmountLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  itemAmountInput: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent.main,
    borderStyle: 'dashed',
  },
  addItemBtnText: {
    color: Colors.accent.main,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: Spacing.lg,
  },
  suggestionsLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    alignItems: 'center',
  },
  suggestionChipText: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    maxWidth: 120,
  },
  suggestionChipFee: {
    color: Colors.accent.main,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },

  // Location
  locationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  locationChipActive: {
    backgroundColor: Colors.accent.main,
    borderColor: Colors.accent.main,
  },
  locationChipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    maxWidth: 120,
  },
  locationChipTextActive: {
    color: Colors.primary[900],
    fontWeight: FontWeight.semibold,
  },

  // Billing Summary
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLineLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  summaryLineValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  gstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  gstToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  gstPercentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  gstPercentInput: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    width: 60,
    textAlign: 'center',
  },
  gstPercentSign: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  grandTotalLine: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glass.borderLight,
  },
  grandTotalLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  grandTotalValue: {
    color: Colors.accent.main,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },

  // Payment
  fieldLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  paymentModeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  paymentModeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  paymentModeChipActive: {
    backgroundColor: Colors.accent.main,
    borderColor: Colors.accent.main,
  },
  paymentModeText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  paymentModeTextActive: {
    color: Colors.primary[900],
    fontWeight: FontWeight.bold,
  },
  fullPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  paymentInput: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  balanceLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  balanceValue: {
    color: Colors.warning,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  // Installments
  installmentCountInput: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    width: 100,
  },
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  installmentIndex: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.greenMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  installmentIndexText: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  installmentDetail: {
    flex: 1,
  },
  installmentAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  installmentLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
  },
  installmentAmountInput: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    width: 100,
    textAlign: 'right',
  },
  installmentDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  installmentDate: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // Generate Button
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  generateBtnText: {
    color: Colors.primary[900],
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});
