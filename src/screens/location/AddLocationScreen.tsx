import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useLocationStore } from '../../store';
import { Location, WorkingDay, CommissionModel } from '../../types';

// ==========================================
// Types
// ==========================================

type LocationType = 'own_clinic' | 'hospital' | 'others_clinic';

type CommissionType = CommissionModel['type'];
type CalculatedOn = 'total_fee' | 'fee_minus_material';
type SettlementFrequency = 'weekly' | 'monthly' | 'custom';

type DayKey = WorkingDay['day'];

interface RouteParams {
  locationId?: string;
}

// ==========================================
// Constants
// ==========================================

const LOCATION_TYPES: { key: LocationType; label: string; emoji: string; icon: string }[] = [
  { key: 'own_clinic', label: 'Own Clinic', emoji: '\uD83C\uDFE2', icon: 'business-outline' },
  { key: 'hospital', label: 'Hospital', emoji: '\uD83C\uDFE5', icon: 'medkit-outline' },
  { key: 'others_clinic', label: "Other's Clinic", emoji: '\uD83C\uDFEA', icon: 'home-outline' },
];

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
];

const COMMISSION_TYPES: { key: CommissionType; label: string }[] = [
  { key: 'percentage', label: 'Percentage' },
  { key: 'fixed_per_patient', label: 'Fixed/Patient' },
  { key: 'fixed_per_visit', label: 'Fixed/Visit' },
  { key: 'rent', label: 'Monthly Rent' },
];

const SETTLEMENT_OPTIONS: { key: SettlementFrequency; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'custom', label: 'Custom' },
];

const DEFAULT_WORKING_DAYS: WorkingDay[] = DAYS.map((d) => ({
  day: d.key,
  startTime: '09:00',
  endTime: '17:00',
  isActive: d.key !== 'sun',
}));

// ==========================================
// Component
// ==========================================

const AddLocationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const insets = useSafeAreaInsets();

  const { addLocation, updateLocation, getLocationById } = useLocationStore();

  const locationId = route.params?.locationId;
  const isEditing = !!locationId;

  // --- Form State ---
  const [locationType, setLocationType] = useState<LocationType>('own_clinic');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(DEFAULT_WORKING_DAYS);

  // Commission
  const [commissionType, setCommissionType] = useState<CommissionType>('none');
  const [commissionValue, setCommissionValue] = useState('');
  const [calculatedOn, setCalculatedOn] = useState<CalculatedOn>('total_fee');
  const [settlementFrequency, setSettlementFrequency] = useState<SettlementFrequency>('monthly');

  const [saving, setSaving] = useState(false);

  // --- Load Existing Location (Edit Mode) ---
  useEffect(() => {
    if (isEditing && locationId) {
      const existing = getLocationById(locationId);
      if (existing) {
        setLocationType(existing.type);
        setName(existing.name);
        setAddress(existing.address);
        setCity(existing.city);
        setState(existing.state);
        setPincode(existing.pincode);
        setPhone(existing.phone || '');
        setOwnerName(existing.ownerName || '');
        setOwnerPhone(existing.ownerPhone || '');
        setWorkingDays(existing.workingDays);
        setCommissionType(existing.commissionModel.type);
        setCommissionValue(existing.commissionModel.value.toString());
        setCalculatedOn(existing.commissionModel.calculatedOn || 'total_fee');
        setSettlementFrequency(existing.commissionModel.settlementFrequency);
      }
    }
  }, [isEditing, locationId]);

  // --- Set defaults when location type changes ---
  useEffect(() => {
    if (!isEditing) {
      if (locationType === 'own_clinic') {
        setCommissionType('none');
        setCommissionValue('0');
      } else {
        setCommissionType('percentage');
        setCommissionValue('30');
      }
    }
  }, [locationType, isEditing]);

  // --- Working Day Helpers ---
  const toggleDayActive = useCallback((dayKey: DayKey) => {
    setWorkingDays((prev) =>
      prev.map((d) => (d.day === dayKey ? { ...d, isActive: !d.isActive } : d)),
    );
  }, []);

  const updateDayTime = useCallback(
    (dayKey: DayKey, field: 'startTime' | 'endTime', value: string) => {
      setWorkingDays((prev) =>
        prev.map((d) => (d.day === dayKey ? { ...d, [field]: value } : d)),
      );
    },
    [],
  );

  // --- Commission Value Label ---
  const getCommissionValueLabel = (): string => {
    switch (commissionType) {
      case 'percentage':
        return t('location.commissionPercentage', 'Percentage (%)');
      case 'rent':
        return t('location.monthlyRent', 'Monthly Rent (\u20B9)');
      default:
        return t('location.amount', 'Amount (\u20B9)');
    }
  };

  // --- Validation & Save ---
  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert(t('common.error', 'Error'), t('location.nameRequired', 'Location name is required'));
      return;
    }
    if (!address.trim()) {
      Alert.alert(t('common.error', 'Error'), t('location.addressRequired', 'Address is required'));
      return;
    }
    if (!city.trim()) {
      Alert.alert(t('common.error', 'Error'), t('location.cityRequired', 'City is required'));
      return;
    }

    setSaving(true);

    const commissionModel: CommissionModel = {
      type: locationType === 'own_clinic' ? 'none' : commissionType,
      value: parseFloat(commissionValue) || 0,
      calculatedOn: commissionType === 'percentage' ? calculatedOn : undefined,
      settlementFrequency,
    };

    if (isEditing && locationId) {
      const updates: Partial<Location> = {
        name: name.trim(),
        type: locationType,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        phone: phone.trim() || undefined,
        ownerName: ownerName.trim() || undefined,
        ownerPhone: ownerPhone.trim() || undefined,
        workingDays,
        commissionModel,
      };
      updateLocation(locationId, updates);
    } else {
      const newLocation: Location = {
        id: `loc_${Date.now()}`,
        doctorId: '', // Will be set by the store/backend
        name: name.trim(),
        type: locationType,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        phone: phone.trim() || undefined,
        ownerName: ownerName.trim() || undefined,
        ownerPhone: ownerPhone.trim() || undefined,
        workingDays,
        commissionModel,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addLocation(newLocation);
    }

    setSaving(false);
    navigation.goBack();
  }, [
    name, address, city, state, pincode, phone,
    ownerName, ownerPhone, locationType, workingDays,
    commissionType, commissionValue, calculatedOn, settlementFrequency,
    isEditing, locationId,
  ]);

  const showOwnerFields = locationType === 'hospital' || locationType === 'others_clinic';
  const showCommissionSection = locationType !== 'own_clinic';

  // ==========================================
  // Render Helpers
  // ==========================================

  const renderGlassInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: {
      placeholder?: string;
      multiline?: boolean;
      keyboardType?: TextInput['props']['keyboardType'];
      icon?: string;
      required?: boolean;
    },
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {options?.required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <BlurView intensity={20} tint="light" style={styles.inputBlur}>
        <View style={styles.inputInner}>
          {options?.icon && (
            <Ionicons
              name={options.icon as any}
              size={18}
              color={Colors.text.tertiary}
              style={styles.inputIcon}
            />
          )}
          <TextInput
            style={[
              styles.textInput,
              options?.multiline && styles.textInputMultiline,
              options?.icon && styles.textInputWithIcon,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={options?.placeholder || ''}
            placeholderTextColor={Colors.text.tertiary}
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 3 : 1}
            keyboardType={options?.keyboardType}
            selectionColor={Colors.accent.main}
          />
        </View>
      </BlurView>
    </View>
  );

  // ==========================================
  // Section Renderers
  // ==========================================

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {isEditing
          ? t('location.editLocation', 'Edit Location')
          : t('location.addLocation', 'Add Location')}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderLocationTypeSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('location.locationType', 'Location Type')}
          </Text>
          <View style={styles.locationTypeRow}>
            {LOCATION_TYPES.map((type) => {
              const isSelected = locationType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.locationTypeCard,
                    isSelected && styles.locationTypeCardActive,
                  ]}
                  onPress={() => setLocationType(type.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.locationTypeEmoji}>{type.emoji}</Text>
                  <Ionicons
                    name={type.icon as any}
                    size={22}
                    color={isSelected ? Colors.accent.main : Colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.locationTypeLabel,
                      isSelected && styles.locationTypeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BlurView>
    </View>
  );

  const renderLocationDetails = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('location.locationDetails', 'Location Details')}
          </Text>

          {renderGlassInput(
            t('location.name', 'Location Name'),
            name,
            setName,
            {
              placeholder: 'e.g., Smile Dental Clinic',
              icon: 'business-outline',
              required: true,
            },
          )}

          {renderGlassInput(
            t('location.address', 'Address'),
            address,
            setAddress,
            {
              placeholder: 'Full address',
              icon: 'location-outline',
              multiline: true,
              required: true,
            },
          )}

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              {renderGlassInput(
                t('location.city', 'City'),
                city,
                setCity,
                { placeholder: 'City', required: true },
              )}
            </View>
            <View style={styles.halfInput}>
              {renderGlassInput(
                t('location.state', 'State'),
                state,
                setState,
                { placeholder: 'State' },
              )}
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              {renderGlassInput(
                t('location.pincode', 'Pincode'),
                pincode,
                setPincode,
                { placeholder: 'Pincode', keyboardType: 'number-pad' },
              )}
            </View>
            <View style={styles.halfInput}>
              {renderGlassInput(
                t('location.phone', 'Phone'),
                phone,
                setPhone,
                { placeholder: 'Phone number', keyboardType: 'phone-pad' },
              )}
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );

  const renderOwnerDetails = () => {
    if (!showOwnerFields) return null;
    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('location.ownerDetails', 'Owner Details')}
            </Text>

            {renderGlassInput(
              t('location.ownerName', 'Owner Name'),
              ownerName,
              setOwnerName,
              { placeholder: 'Hospital / clinic owner name', icon: 'person-outline' },
            )}

            {renderGlassInput(
              t('location.ownerPhone', 'Owner Phone'),
              ownerPhone,
              setOwnerPhone,
              { placeholder: 'Owner phone number', keyboardType: 'phone-pad', icon: 'call-outline' },
            )}
          </View>
        </BlurView>
      </View>
    );
  };

  const renderWorkingSchedule = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('location.workingSchedule', 'Working Schedule')}
          </Text>

          {workingDays.map((wd) => {
            const dayInfo = DAYS.find((d) => d.key === wd.day)!;
            return (
              <View
                key={wd.day}
                style={[styles.scheduleRow, !wd.isActive && styles.scheduleRowInactive]}
              >
                {/* Day Name */}
                <Text
                  style={[
                    styles.scheduleDayText,
                    !wd.isActive && styles.scheduleDayTextInactive,
                  ]}
                >
                  {dayInfo.label}
                </Text>

                {/* Toggle */}
                <TouchableOpacity
                  style={[styles.toggle, wd.isActive && styles.toggleActive]}
                  onPress={() => toggleDayActive(wd.day)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      wd.isActive && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>

                {/* Time Inputs */}
                <View style={styles.timeInputsContainer}>
                  <TextInput
                    style={[styles.timeInput, !wd.isActive && styles.timeInputInactive]}
                    value={wd.startTime}
                    onChangeText={(val) => updateDayTime(wd.day, 'startTime', val)}
                    placeholder="09:00"
                    placeholderTextColor={Colors.text.tertiary}
                    editable={wd.isActive}
                    maxLength={5}
                    keyboardType="numbers-and-punctuation"
                  />
                  <Text style={[styles.timeSeparator, !wd.isActive && styles.timeSeparatorInactive]}>
                    -
                  </Text>
                  <TextInput
                    style={[styles.timeInput, !wd.isActive && styles.timeInputInactive]}
                    value={wd.endTime}
                    onChangeText={(val) => updateDayTime(wd.day, 'endTime', val)}
                    placeholder="17:00"
                    placeholderTextColor={Colors.text.tertiary}
                    editable={wd.isActive}
                    maxLength={5}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            );
          })}
        </View>
      </BlurView>
    </View>
  );

  const renderCommissionSection = () => {
    if (!showCommissionSection) return null;
    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('location.commissionModel', 'Commission Model')}
            </Text>

            {/* Commission Type Chips */}
            <Text style={styles.fieldLabel}>
              {t('location.commissionType', 'Commission Type')}
            </Text>
            <View style={styles.chipsRow}>
              {COMMISSION_TYPES.map((ct) => {
                const isSelected = commissionType === ct.key;
                return (
                  <TouchableOpacity
                    key={ct.key}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setCommissionType(ct.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {ct.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Commission Value */}
            {commissionType !== 'none' && (
              <>
                {renderGlassInput(
                  getCommissionValueLabel(),
                  commissionValue,
                  setCommissionValue,
                  {
                    placeholder: commissionType === 'percentage' ? 'e.g., 30' : 'e.g., 500',
                    keyboardType: 'numeric',
                  },
                )}

                {/* Calculated On (percentage only) */}
                {commissionType === 'percentage' && (
                  <>
                    <Text style={styles.fieldLabel}>
                      {t('location.calculatedOn', 'Calculated On')}
                    </Text>
                    <View style={styles.toggleOptionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.toggleOption,
                          calculatedOn === 'total_fee' && styles.toggleOptionActive,
                        ]}
                        onPress={() => setCalculatedOn('total_fee')}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.toggleOptionText,
                            calculatedOn === 'total_fee' && styles.toggleOptionTextActive,
                          ]}
                        >
                          {t('location.totalFee', 'Total Fee')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.toggleOption,
                          calculatedOn === 'fee_minus_material' && styles.toggleOptionActive,
                        ]}
                        onPress={() => setCalculatedOn('fee_minus_material')}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.toggleOptionText,
                            calculatedOn === 'fee_minus_material' && styles.toggleOptionTextActive,
                          ]}
                        >
                          {t('location.feeMinusMaterial', 'Fee - Material Cost')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Settlement Frequency */}
                <Text style={styles.fieldLabel}>
                  {t('location.settlementFrequency', 'Settlement Frequency')}
                </Text>
                <View style={styles.chipsRow}>
                  {SETTLEMENT_OPTIONS.map((opt) => {
                    const isSelected = settlementFrequency === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setSettlementFrequency(opt.key)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </BlurView>
      </View>
    );
  };

  const renderBottomButtons = () => (
    <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + Spacing.lg }]}>
      {isEditing && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>
            {t('common.cancel', 'Cancel')}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.saveButtonWrapper, isEditing && styles.saveButtonWithCancel]}
        onPress={handleSave}
        activeOpacity={0.8}
        disabled={saving}
      >
        <LinearGradient
          colors={[Colors.accent.dark, Colors.accent.main]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButtonGradient}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons
                name={isEditing ? 'checkmark-circle-outline' : 'add-circle-outline'}
                size={20}
                color={Colors.white}
                style={styles.saveButtonIcon}
              />
              <Text style={styles.saveButtonText}>
                {isEditing
                  ? t('location.updateLocation', 'Update Location')
                  : t('location.saveLocation', 'Save Location')}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ==========================================
  // Main Render
  // ==========================================

  return (
    <LinearGradient
      colors={Colors.gradient.primary}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderLocationTypeSection()}
          {renderLocationDetails()}
          {renderOwnerDetails()}
          {renderWorkingSchedule()}
          {renderCommissionSection()}
          {renderBottomButtons()}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.massive,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginRight: 40, // balance the back button
  },
  headerSpacer: {
    width: 0,
  },

  // --- Section Wrapper ---
  sectionWrapper: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  glassCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  cardContent: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },

  // --- Location Type ---
  locationTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationTypeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
  },
  locationTypeCardActive: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  locationTypeEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  locationTypeLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  locationTypeLabelActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },

  // --- Glass Input ---
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  requiredStar: {
    color: Colors.error,
    fontSize: FontSize.sm,
  },
  inputBlur: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.white,
    minHeight: 48,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textInputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  rowInputs: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.xs,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },

  // --- Working Schedule ---
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glass.borderLight,
  },
  scheduleRowInactive: {
    opacity: 0.45,
  },
  scheduleDayText: {
    width: 80,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  scheduleDayTextInactive: {
    color: Colors.text.tertiary,
  },

  // Custom Toggle
  toggle: {
    width: 44,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.darkMedium,
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: Spacing.md,
  },
  toggleActive: {
    backgroundColor: Colors.accent.main,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.glass.whiteSolid,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.white,
  },

  // Time Inputs
  timeInputsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeInput: {
    width: 58,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    paddingHorizontal: Spacing.xs,
  },
  timeInputInactive: {
    color: Colors.text.tertiary,
    backgroundColor: Colors.glass.dark,
  },
  timeSeparator: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.sm,
    fontWeight: FontWeight.bold,
  },
  timeSeparatorInactive: {
    color: Colors.text.tertiary,
  },

  // --- Commission ---
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipActive: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
  },
  chipTextActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },

  // Toggle Options (Calculated On)
  toggleOptionsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.glass.white,
  },
  toggleOptionActive: {
    backgroundColor: Colors.glass.greenMedium,
  },
  toggleOptionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
  },
  toggleOptionTextActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },

  // --- Bottom Buttons ---
  bottomButtons: {
    marginTop: Spacing.lg,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.white,
    marginBottom: Spacing.md,
  },
  cancelButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
  },
  saveButtonWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  saveButtonWithCancel: {
    // No special styling needed, cancel is above
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  saveButtonIcon: {
    marginRight: Spacing.sm,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});

export default AddLocationScreen;
