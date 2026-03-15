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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTreatmentStore, useLocationStore } from '../../store';
import { PatientTreatment, Treatment, TreatmentStage } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ==========================================
// Helpers
// ==========================================

const formatDuration = (days?: number): string => {
  if (!days) return '--';
  if (days < 30) return `${days} day${days > 1 ? 's' : ''}`;
  const months = Math.round(days / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
};

const formatCurrency = (amount: number): string => {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
};

const getTodayString = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const addDaysToDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// ==========================================
// Component
// ==========================================

const AddTreatmentScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const { patientId } = route.params as { patientId: string };

  const { getActiveTreatments, addPatientTreatment } = useTreatmentStore();
  const { getActiveLocations } = useLocationStore();

  const activeTreatments = getActiveTreatments();
  const activeLocations = getActiveLocations();

  // --- Form State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [fee, setFee] = useState('');
  const [equipmentCost, setEquipmentCost] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // --- Filtered Treatments ---
  const filteredTreatments = useMemo(() => {
    if (!searchQuery.trim()) return activeTreatments;
    const query = searchQuery.toLowerCase();
    return activeTreatments.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query),
    );
  }, [activeTreatments, searchQuery]);

  // --- Treatment Selection ---
  const handleSelectTreatment = useCallback(
    (treatment: Treatment) => {
      setSelectedTreatment(treatment);
      setFee(String(treatment.defaultFee));
      setEquipmentCost(String(treatment.equipmentCost));
      if (treatment.estimatedDuration) {
        setExpectedEndDate(addDaysToDate(startDate, treatment.estimatedDuration));
      } else {
        setExpectedEndDate('');
      }
    },
    [startDate],
  );

  // --- Validation & Save ---
  const handleSave = useCallback(() => {
    if (!selectedTreatment) {
      Alert.alert(
        t('common.error', 'Error'),
        t('treatment.selectTreatmentRequired', 'Please select a treatment type'),
      );
      return;
    }
    if (!selectedLocationId) {
      Alert.alert(
        t('common.error', 'Error'),
        t('treatment.selectLocationRequired', 'Please select a location'),
      );
      return;
    }
    const feeNum = Number(fee);
    if (!fee.trim() || isNaN(feeNum) || feeNum <= 0) {
      Alert.alert(
        t('common.error', 'Error'),
        t('treatment.validFeeRequired', 'Please enter a valid fee amount'),
      );
      return;
    }

    setSaving(true);

    const sortedStages = selectedTreatment.stages
      ? [...selectedTreatment.stages].sort((a, b) => a.order - b.order)
      : [];

    const newPatientTreatment: PatientTreatment = {
      id: `pt_treat_${Date.now()}`,
      patientId,
      doctorId: '',
      locationId: selectedLocationId,
      treatmentId: selectedTreatment.id,
      treatmentName: selectedTreatment.name,
      status: 'in_progress',
      currentStage: sortedStages.length > 0 ? sortedStages[0].name : undefined,
      startDate,
      expectedEndDate: expectedEndDate || undefined,
      fee: feeNum,
      equipmentCost: Number(equipmentCost) || 0,
      notes: notes.trim() || undefined,
      photos: [],
      visits: [],
      createdAt: new Date().toISOString(),
    };

    addPatientTreatment(newPatientTreatment);
    setSaving(false);
    navigation.goBack();
  }, [
    selectedTreatment, selectedLocationId, fee, equipmentCost,
    startDate, expectedEndDate, notes, patientId,
    t, addPatientTreatment, navigation,
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
      prefix?: string;
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
          {options?.prefix && (
            <Text style={styles.inputPrefix}>{options.prefix}</Text>
          )}
          <TextInput
            style={[
              styles.textInput,
              options?.multiline && styles.textInputMultiline,
              (options?.icon || options?.prefix) && styles.textInputWithIcon,
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
        {t('treatment.startTreatment', 'Start Treatment')}
      </Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderTreatmentSelectionSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('treatment.treatmentType', 'Treatment Type')}
          </Text>

          {/* Search Input */}
          <BlurView intensity={20} tint="light" style={styles.searchBlur}>
            <View style={styles.searchInner}>
              <Ionicons
                name="search-outline"
                size={18}
                color={Colors.text.tertiary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('treatment.searchTreatments', 'Search treatments...')}
                placeholderTextColor={Colors.text.tertiary}
                selectionColor={Colors.accent.main}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          </BlurView>

          {/* Treatment List */}
          {filteredTreatments.map((treatment) => {
            const isSelected = selectedTreatment?.id === treatment.id;
            return (
              <TouchableOpacity
                key={treatment.id}
                style={[
                  styles.treatmentCard,
                  isSelected && styles.treatmentCardSelected,
                ]}
                onPress={() => handleSelectTreatment(treatment)}
                activeOpacity={0.7}
              >
                <View style={styles.treatmentCardHeader}>
                  <Text style={styles.treatmentName}>{treatment.name}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.accent.main} />
                  )}
                </View>

                <View style={styles.treatmentCardMeta}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{treatment.category}</Text>
                  </View>
                  <Text style={styles.treatmentDuration}>
                    <Ionicons name="time-outline" size={12} color={Colors.text.tertiary} />
                    {' '}{formatDuration(treatment.estimatedDuration)}
                  </Text>
                </View>

                <View style={styles.treatmentCardFees}>
                  <Text style={styles.treatmentFee}>
                    {t('treatment.fee', 'Fee')}: {formatCurrency(treatment.defaultFee)}
                  </Text>
                  <Text style={styles.treatmentEquipment}>
                    {t('treatment.equipment', 'Equipment')}: {formatCurrency(treatment.equipmentCost)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredTreatments.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={Colors.text.tertiary} />
              <Text style={styles.emptyStateText}>
                {t('treatment.noTreatmentsFound', 'No treatments found')}
              </Text>
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderDetailsSection = () => {
    if (!selectedTreatment) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('treatment.treatmentDetails', 'Treatment Details')}
            </Text>

            {renderGlassInput(
              t('treatment.fee', 'Fee'),
              fee,
              setFee,
              {
                placeholder: 'Enter fee amount',
                keyboardType: 'numeric',
                prefix: '\u20B9',
                required: true,
              },
            )}

            {renderGlassInput(
              t('treatment.equipmentCost', 'Equipment Cost'),
              equipmentCost,
              setEquipmentCost,
              {
                placeholder: 'Enter equipment cost',
                keyboardType: 'numeric',
                prefix: '\u20B9',
              },
            )}

            {renderGlassInput(
              t('treatment.startDate', 'Start Date'),
              startDate,
              setStartDate,
              {
                placeholder: 'YYYY-MM-DD',
                icon: 'calendar-outline',
                required: true,
              },
            )}

            {renderGlassInput(
              t('treatment.expectedEndDate', 'Expected End Date'),
              expectedEndDate,
              setExpectedEndDate,
              {
                placeholder: 'YYYY-MM-DD',
                icon: 'calendar-outline',
              },
            )}

            {renderGlassInput(
              t('treatment.notes', 'Notes'),
              notes,
              setNotes,
              {
                placeholder: 'Add any notes about this treatment...',
                multiline: true,
                icon: 'document-text-outline',
              },
            )}
          </View>
        </BlurView>
      </View>
    );
  };

  const renderLocationSection = () => {
    if (activeLocations.length === 0) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('treatment.location', 'Location')}
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

  const renderStagesSection = () => {
    if (!selectedTreatment?.stages || selectedTreatment.stages.length === 0) return null;

    const sortedStages = [...selectedTreatment.stages].sort((a, b) => a.order - b.order);

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('treatment.treatmentStages', 'Treatment Stages')}
            </Text>

            <View style={styles.stagesContainer}>
              {sortedStages.map((stage, index) => {
                const isFirst = index === 0;
                const isLast = index === sortedStages.length - 1;

                return (
                  <View key={stage.id} style={styles.stageRow}>
                    {/* Vertical Timeline */}
                    <View style={styles.stageTimeline}>
                      <View
                        style={[
                          styles.stageCircle,
                          isFirst && styles.stageCircleActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stageCircleText,
                            isFirst && styles.stageCircleTextActive,
                          ]}
                        >
                          {stage.order}
                        </Text>
                      </View>
                      {!isLast && <View style={styles.stageLine} />}
                    </View>

                    {/* Stage Info */}
                    <View style={styles.stageInfo}>
                      <Text
                        style={[
                          styles.stageName,
                          isFirst && styles.stageNameActive,
                        ]}
                      >
                        {stage.name}
                      </Text>
                      {stage.estimatedDays != null && (
                        <Text style={styles.stageDays}>
                          {formatDuration(stage.estimatedDays)}
                        </Text>
                      )}
                      {isFirst && (
                        <View style={styles.currentStageBadge}>
                          <Text style={styles.currentStageBadgeText}>
                            {t('treatment.currentStage', 'Current Stage')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderStartButton = () => (
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
            name="medical-outline"
            size={20}
            color={Colors.white}
            style={styles.saveButtonIcon}
          />
          <Text style={styles.saveButtonText}>
            {t('treatment.startTreatment', 'Start Treatment')}
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
          {renderTreatmentSelectionSection()}
          {renderDetailsSection()}
          {renderLocationSection()}
          {renderStagesSection()}
          {renderStartButton()}
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

  // --- Search ---
  searchBlur: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    marginBottom: Spacing.lg,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.white,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
  },

  // --- Treatment Cards ---
  treatmentCard: {
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.glass.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  treatmentCardSelected: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  treatmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  treatmentName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  treatmentCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  categoryBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.accent.light,
  },
  treatmentDuration: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    fontWeight: FontWeight.medium,
  },
  treatmentCardFees: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  treatmentFee: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  treatmentEquipment: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text.tertiary,
    fontWeight: FontWeight.medium,
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
  inputPrefix: {
    marginLeft: Spacing.md,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
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

  // --- Treatment Stages ---
  stagesContainer: {
    paddingLeft: Spacing.xs,
  },
  stageRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  stageTimeline: {
    alignItems: 'center',
    width: 36,
    marginRight: Spacing.md,
  },
  stageCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.glass.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCircleActive: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  stageCircleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.tertiary,
  },
  stageCircleTextActive: {
    color: Colors.accent.main,
  },
  stageLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.glass.borderLight,
    marginVertical: Spacing.xs,
  },
  stageInfo: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  stageName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.secondary,
  },
  stageNameActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.bold,
  },
  stageDays: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  currentStageBadge: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  currentStageBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.accent.main,
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

export default AddTreatmentScreen;
