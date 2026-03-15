import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppointmentStore, usePatientStore, useLocationStore, useTreatmentStore } from '../../store';
import { Appointment } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ==========================================
// Types & Constants
// ==========================================

type RouteParams = {
  date?: string;
  locationId?: string;
};

type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly';

const DURATION_OPTIONS = [15, 30, 45, 60];

const FREQUENCY_OPTIONS: { key: RecurringFrequency; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Bi-weekly' },
  { key: 'monthly', label: 'Monthly' },
];

// ==========================================
// Helpers
// ==========================================

const getToday = (): string => new Date().toISOString().split('T')[0];

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

const calculateDuration = (start: string, end: string): number => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

const countRecurringAppointments = (
  startDate: string,
  endDate: string,
  frequency: RecurringFrequency,
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end && count < 52) {
    count++;
    switch (frequency) {
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'biweekly':
        current.setDate(current.getDate() + 14);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  return count;
};

// ==========================================
// Component
// ==========================================

const AddAppointmentScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const params = (route.params as RouteParams) || {};

  const { addAppointment, generateRecurringAppointments } = useAppointmentStore();
  const { patients } = usePatientStore();
  const { getActiveLocations } = useLocationStore();
  const { getPatientTreatments } = useTreatmentStore();

  const activeLocations = getActiveLocations();

  // --- Form State ---
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [date, setDate] = useState(params.date || getToday());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    params.locationId || null,
  );

  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState('');

  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Derived State ---
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return [];
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q),
    ).slice(0, 10);
  }, [patients, patientSearch]);

  const patientTreatments = useMemo(() => {
    if (!selectedPatientId) return [];
    return getPatientTreatments(selectedPatientId).filter(
      (pt) => pt.status === 'in_progress' || pt.status === 'planned',
    );
  }, [selectedPatientId, getPatientTreatments]);

  const duration = useMemo(() => calculateDuration(startTime, endTime), [startTime, endTime]);

  const recurringCount = useMemo(() => {
    if (!isRecurring || !recurringEndDate) return 0;
    return countRecurringAppointments(date, recurringEndDate, recurringFrequency);
  }, [isRecurring, date, recurringEndDate, recurringFrequency]);

  // --- Handlers ---
  const handleSelectPatient = useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
    setPatientSearch('');
    setShowPatientDropdown(false);
    setSelectedTreatmentId(null);
  }, []);

  const handleClearPatient = useCallback(() => {
    setSelectedPatientId(null);
    setSelectedTreatmentId(null);
  }, []);

  const handleQuickDuration = useCallback(
    (minutes: number) => {
      setEndTime(addMinutesToTime(startTime, minutes));
    },
    [startTime],
  );

  const handleSave = useCallback(() => {
    if (!selectedPatientId || !selectedPatient) {
      Alert.alert(t('common.error', 'Error'), t('appointment.patientRequired', 'Please select a patient'));
      return;
    }
    if (!date.trim()) {
      Alert.alert(t('common.error', 'Error'), t('appointment.dateRequired', 'Date is required'));
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert(t('common.error', 'Error'), t('appointment.timeRequired', 'Start and end time are required'));
      return;
    }
    if (duration <= 0) {
      Alert.alert(t('common.error', 'Error'), t('appointment.invalidTime', 'End time must be after start time'));
      return;
    }
    if (!selectedLocationId) {
      Alert.alert(t('common.error', 'Error'), t('appointment.locationRequired', 'Please select a location'));
      return;
    }

    const selectedLocation = activeLocations.find((l) => l.id === selectedLocationId);

    setSaving(true);

    const newAppointment: Appointment = {
      id: `appt_${Date.now()}`,
      patientId: selectedPatientId,
      patientName: selectedPatient.fullName,
      doctorId: '',
      locationId: selectedLocationId,
      locationName: selectedLocation?.name || '',
      treatmentId: selectedTreatmentId || undefined,
      date,
      startTime,
      endTime,
      duration,
      status: 'scheduled',
      isRecurring,
      recurringPattern: isRecurring
        ? {
            frequency: recurringFrequency,
            endDate: recurringEndDate || undefined,
          }
        : undefined,
      notes: notes.trim() || undefined,
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };

    addAppointment(newAppointment);

    if (isRecurring && recurringEndDate) {
      generateRecurringAppointments(newAppointment, recurringEndDate);
    }

    setSaving(false);
    navigation.goBack();
  }, [
    selectedPatientId, selectedPatient, date, startTime, endTime, duration,
    selectedLocationId, selectedTreatmentId, isRecurring, recurringFrequency,
    recurringEndDate, notes, activeLocations, t,
    addAppointment, generateRecurringAppointments, navigation,
  ]);

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
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {t('appointment.addAppointment', 'Add Appointment')}
      </Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderPatientSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('appointment.selectPatient', 'Select Patient')}
            <Text style={styles.requiredStar}> *</Text>
          </Text>

          {selectedPatient ? (
            <View style={styles.selectedPatientCard}>
              <View style={styles.selectedPatientInfo}>
                <View style={styles.patientAvatar}>
                  <Ionicons name="person" size={20} color={Colors.accent.main} />
                </View>
                <View style={styles.selectedPatientText}>
                  <Text style={styles.selectedPatientName}>{selectedPatient.fullName}</Text>
                  <Text style={styles.selectedPatientId}>{selectedPatient.patientId}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClearPatient} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={24} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <BlurView intensity={20} tint="light" style={styles.inputBlur}>
                <View style={styles.inputInner}>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={Colors.text.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, styles.textInputWithIcon]}
                    value={patientSearch}
                    onChangeText={(text) => {
                      setPatientSearch(text);
                      setShowPatientDropdown(text.length > 0);
                    }}
                    placeholder={t('appointment.searchPatient', 'Search by name, ID, or phone...')}
                    placeholderTextColor={Colors.text.tertiary}
                    selectionColor={Colors.accent.main}
                  />
                </View>
              </BlurView>

              {showPatientDropdown && filteredPatients.length > 0 && (
                <View style={styles.dropdownContainer}>
                  {filteredPatients.map((patient) => (
                    <TouchableOpacity
                      key={patient.id}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectPatient(patient.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dropdownItemIcon}>
                        <Ionicons name="person-outline" size={16} color={Colors.accent.main} />
                      </View>
                      <View style={styles.dropdownItemText}>
                        <Text style={styles.dropdownItemName}>{patient.fullName}</Text>
                        <Text style={styles.dropdownItemSub}>
                          {patient.patientId} | {patient.phone}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {showPatientDropdown && patientSearch.length > 0 && filteredPatients.length === 0 && (
                <Text style={styles.noResultsText}>
                  {t('appointment.noPatients', 'No patients found')}
                </Text>
              )}
            </>
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderDateTimeSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('appointment.dateTime', 'Date & Time')}
            <Text style={styles.requiredStar}> *</Text>
          </Text>

          {renderGlassInput(
            t('appointment.date', 'Date'),
            date,
            setDate,
            { placeholder: 'YYYY-MM-DD', icon: 'calendar-outline', required: true },
          )}

          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              {renderGlassInput(
                t('appointment.startTime', 'Start Time'),
                startTime,
                setStartTime,
                { placeholder: 'HH:MM', icon: 'time-outline', required: true },
              )}
            </View>
            <View style={styles.timeField}>
              {renderGlassInput(
                t('appointment.endTime', 'End Time'),
                endTime,
                setEndTime,
                { placeholder: 'HH:MM', icon: 'time-outline', required: true },
              )}
            </View>
          </View>

          {duration > 0 && (
            <View style={styles.durationBadge}>
              <Ionicons name="hourglass-outline" size={14} color={Colors.accent.main} />
              <Text style={styles.durationText}>
                {duration} {t('appointment.min', 'min')}
              </Text>
            </View>
          )}

          <Text style={styles.quickDurationLabel}>
            {t('appointment.quickDuration', 'Quick duration')}
          </Text>
          <View style={styles.chipsRow}>
            {DURATION_OPTIONS.map((mins) => {
              const isActive = duration === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => handleQuickDuration(mins)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {mins} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BlurView>
    </View>
  );

  const renderLocationSection = () => {
    if (activeLocations.length === 0) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('appointment.location', 'Location')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View style={styles.chipsRow}>
              {activeLocations.map((location) => {
                const isSelected = selectedLocationId === location.id;
                return (
                  <TouchableOpacity
                    key={location.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedLocationId(location.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'location-outline'}
                      size={14}
                      color={isSelected ? Colors.accent.main : Colors.text.tertiary}
                      style={styles.chipIcon}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {location.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderTreatmentSection = () => {
    if (!selectedPatientId) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('appointment.linkTreatment', 'Link to Treatment (Optional)')}
            </Text>

            {patientTreatments.length > 0 ? (
              <View style={styles.chipsRow}>
                {patientTreatments.map((pt) => {
                  const isSelected = selectedTreatmentId === pt.id;
                  return (
                    <TouchableOpacity
                      key={pt.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() =>
                        setSelectedTreatmentId(isSelected ? null : pt.id)
                      }
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'medkit-outline'}
                        size={14}
                        color={isSelected ? Colors.accent.main : Colors.text.tertiary}
                        style={styles.chipIcon}
                      />
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {pt.treatmentName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                {t('appointment.noActiveTreatments', 'No active treatments for this patient')}
              </Text>
            )}
          </View>
        </BlurView>
      </View>
    );
  };

  const renderRecurringSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <View style={styles.switchRow}>
            <Text style={styles.sectionTitle}>
              {t('appointment.recurringAppointment', 'Recurring Appointment')}
            </Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: Colors.glass.borderLight, true: Colors.accent.main }}
              thumbColor={Colors.white}
            />
          </View>

          {isRecurring && (
            <>
              <Text style={styles.inputLabel}>
                {t('appointment.frequency', 'Frequency')}
              </Text>
              <View style={styles.chipsRow}>
                {FREQUENCY_OPTIONS.map((option) => {
                  const isSelected = recurringFrequency === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setRecurringFrequency(option.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.recurringEndDateContainer}>
                {renderGlassInput(
                  t('appointment.endDate', 'End Date'),
                  recurringEndDate,
                  setRecurringEndDate,
                  { placeholder: 'YYYY-MM-DD', icon: 'calendar-outline' },
                )}
              </View>

              {recurringCount > 0 && (
                <View style={styles.recurringPreview}>
                  <Ionicons name="repeat-outline" size={16} color={Colors.accent.main} />
                  <Text style={styles.recurringPreviewText}>
                    {t('appointment.willCreate', 'Will create {{count}} appointments until {{date}}', {
                      count: recurringCount,
                      date: recurringEndDate,
                    })}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderNotesSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('appointment.notes', 'Notes')}
          </Text>
          {renderGlassInput(
            t('appointment.appointmentNotes', 'Appointment Notes'),
            notes,
            setNotes,
            {
              placeholder: t('appointment.notesPlaceholder', 'Add notes for this appointment...'),
              multiline: true,
              icon: 'document-text-outline',
            },
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderScheduleButton = () => (
    <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + Spacing.lg }]}>
      <TouchableOpacity
        style={styles.saveButtonWrapper}
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
          <Ionicons
            name="calendar-outline"
            size={20}
            color={Colors.white}
            style={styles.saveButtonIcon}
          />
          <Text style={styles.saveButtonText}>
            {t('appointment.scheduleAppointment', 'Schedule Appointment')}
          </Text>
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
          {renderPatientSection()}
          {renderDateTimeSection()}
          {renderLocationSection()}
          {renderTreatmentSection()}
          {renderRecurringSection()}
          {renderNotesSection()}
          {renderScheduleButton()}
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
  headerButton: {
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

  // --- Chips ---
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
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
  chipIcon: {
    marginRight: Spacing.xs,
  },

  // --- Patient Section ---
  selectedPatientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent.main,
    padding: Spacing.md,
  },
  selectedPatientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  selectedPatientText: {
    flex: 1,
  },
  selectedPatientName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  selectedPatientId: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  dropdownContainer: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  dropdownItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.greenMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  dropdownItemSub: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  noResultsText: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },

  // --- Date & Time ---
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeField: {
    flex: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  durationText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.accent.main,
    marginLeft: Spacing.xs,
  },
  quickDurationLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },

  // --- Recurring ---
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  recurringEndDateContainer: {
    marginTop: Spacing.md,
  },
  recurringPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  recurringPreviewText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
    flex: 1,
  },

  // --- Empty Text ---
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },

  // --- Bottom Buttons ---
  bottomButtons: {
    marginTop: Spacing.lg,
  },
  saveButtonWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
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

export default AddAppointmentScreen;
