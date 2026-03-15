import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTreatmentStore, useLocationStore, usePatientStore } from '../../store';
import { PatientTreatment, TreatmentVisit } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ==========================================
// TreatmentDetailScreen
// ==========================================

const STATUS_CONFIG: Record<
  PatientTreatment['status'],
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  in_progress: { label: 'In Progress', color: Colors.status.inProgress, icon: 'sync-outline' },
  completed: { label: 'Completed', color: Colors.status.completed, icon: 'checkmark-circle-outline' },
  on_hold: { label: 'On Hold', color: Colors.status.hold, icon: 'pause-circle-outline' },
  planned: { label: 'Planned', color: Colors.status.scheduled, icon: 'calendar-outline' },
  cancelled: { label: 'Cancelled', color: Colors.status.cancelled, icon: 'close-circle-outline' },
};

const TreatmentDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const treatmentId = route.params?.treatmentId as string;
  const patientId = route.params?.patientId as string;

  const getTreatmentById = useTreatmentStore((s) => s.getTreatmentById);
  const updatePatientTreatment = useTreatmentStore((s) => s.updatePatientTreatment);
  const deletePatientTreatment = useTreatmentStore((s) => s.deletePatientTreatment);
  const treatments = useTreatmentStore((s) => s.treatments);

  const getPatientById = usePatientStore((s) => s.getPatientById);
  const getLocationById = useLocationStore((s) => s.getLocationById);

  const treatment = getTreatmentById(treatmentId);
  const patient = getPatientById(patientId);
  const location = treatment ? getLocationById(treatment.locationId) : undefined;

  // Resolve the master treatment to get stage definitions
  const masterTreatment = useMemo(() => {
    if (!treatment) return undefined;
    return treatments.find((t) => t.id === treatment.treatmentId);
  }, [treatment, treatments]);

  const stages = masterTreatment?.stages ?? [];
  const hasStages = stages.length > 0;

  // Current stage index
  const currentStageIndex = useMemo(() => {
    if (!hasStages || !treatment?.currentStage) return 0;
    const idx = stages.findIndex((s) => s.id === treatment.currentStage);
    return idx >= 0 ? idx : 0;
  }, [hasStages, treatment, stages]);

  const progressPercent = hasStages
    ? Math.round(((currentStageIndex + 1) / stages.length) * 100)
    : 0;

  // ---- Helpers ----

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  // ---- Actions ----

  const handleStatusChange = (newStatus: PatientTreatment['status']) => {
    if (!treatment) return;
    const updates: Partial<PatientTreatment> = { status: newStatus };
    if (newStatus === 'completed') {
      updates.actualEndDate = new Date().toISOString().split('T')[0];
    }
    updatePatientTreatment(treatmentId, updates);
  };

  const handleAdvanceStage = () => {
    if (!treatment || !hasStages) return;
    const nextIndex = currentStageIndex + 1;
    if (nextIndex < stages.length) {
      updatePatientTreatment(treatmentId, {
        currentStage: stages[nextIndex].id,
      });
    }
  };

  const handleMarkStageComplete = () => {
    if (!treatment || !hasStages) return;
    // If on last stage, mark the whole treatment complete
    if (currentStageIndex === stages.length - 1) {
      Alert.alert(
        'Complete Treatment',
        'This is the last stage. Mark the entire treatment as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: () => handleStatusChange('completed'),
          },
        ],
      );
    } else {
      handleAdvanceStage();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Treatment',
      `Are you sure you want to delete this treatment? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePatientTreatment(treatmentId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleAddVisit = () => {
    navigation.navigate('AddTreatmentVisit', {
      treatmentId,
      patientId,
    });
  };

  // ---- Status badge ----
  const statusConfig = treatment ? STATUS_CONFIG[treatment.status] : STATUS_CONFIG.planned;

  // ---- Missing treatment ----
  if (!treatment) {
    return (
      <LinearGradient colors={[...Colors.gradient.primary]} style={styles.flex}>
        <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.missingTitle}>Treatment Not Found</Text>
          <Text style={styles.missingSubtitle}>
            This treatment may have been deleted.
          </Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
            <Text style={styles.backButtonLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ---- Sorted visits (newest first) ----
  const sortedVisits = [...treatment.visits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // ---- Render ----

  return (
    <LinearGradient colors={[...Colors.gradient.primary]} style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Header ===== */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {treatment.treatmentName}
            </Text>
            <View style={[styles.statusBadgeSmall, { backgroundColor: statusConfig.color + '30' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusBadgeSmallText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.headerButton, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* ===== Treatment Summary Card ===== */}
        <View style={styles.summaryCard}>
          <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={20} />
          <View style={styles.summaryContent}>
            {/* Treatment name */}
            <Text style={styles.treatmentNameLarge}>{treatment.treatmentName}</Text>

            {/* Patient name */}
            {patient && (
              <Text style={styles.patientNameLabel}>
                <Ionicons name="person-outline" size={14} color={Colors.text.tertiary} />
                {'  '}{patient.fullName}
              </Text>
            )}

            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '25' }]}>
              <Ionicons name={statusConfig.icon} size={18} color={statusConfig.color} />
              <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            {/* Location */}
            {location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={Colors.accent.main} />
                <Text style={styles.locationText}>{location.name}</Text>
              </View>
            )}

            {/* Fee & Equipment */}
            <View style={styles.feeRow}>
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Fee</Text>
                <Text style={styles.feeValue}>{formatCurrency(treatment.fee)}</Text>
              </View>
              <View style={styles.feeDivider} />
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Equipment</Text>
                <Text style={styles.feeValue}>{formatCurrency(treatment.equipmentCost)}</Text>
              </View>
            </View>

            {/* Date range */}
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.text.tertiary} />
              <Text style={styles.dateText}>
                {formatDate(treatment.startDate)}
                {treatment.expectedEndDate ? ` \u2192 ${formatDate(treatment.expectedEndDate)}` : ''}
              </Text>
            </View>

            {/* Progress bar (if has stages) */}
            {hasStages && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercent}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressStageText}>
                  Stage {currentStageIndex + 1} of {stages.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ===== Stage Progress ===== */}
        {hasStages && (
          <View style={styles.glassCard}>
            <Text style={styles.cardTitle}>Treatment Stages</Text>

            {/* Vertical stepper */}
            <View style={styles.stageTimeline}>
              {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isUpcoming = index > currentStageIndex;

                return (
                  <View key={stage.id} style={styles.stageItem}>
                    {/* Connector line (top) */}
                    {index > 0 && (
                      <View
                        style={[
                          styles.stageConnectorTop,
                          {
                            backgroundColor: isCompleted || isCurrent
                              ? Colors.status.completed
                              : Colors.glass.borderLight,
                          },
                        ]}
                      />
                    )}

                    {/* Circle indicator */}
                    <View style={styles.stageIndicatorRow}>
                      <View
                        style={[
                          styles.stageCircle,
                          isCompleted && styles.stageCircleCompleted,
                          isCurrent && styles.stageCircleCurrent,
                          isUpcoming && styles.stageCircleUpcoming,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={14} color={Colors.white} />
                        ) : isCurrent ? (
                          <View style={styles.stageCircleInner} />
                        ) : null}
                      </View>

                      <View style={styles.stageInfo}>
                        <Text
                          style={[
                            styles.stageName,
                            isCurrent && styles.stageNameCurrent,
                            isCompleted && styles.stageNameCompleted,
                          ]}
                        >
                          {stage.name}
                        </Text>
                        {stage.estimatedDays ? (
                          <Text style={styles.stageDuration}>
                            ~{stage.estimatedDays} {stage.estimatedDays === 1 ? 'day' : 'days'}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Connector line (bottom) */}
                    {index < stages.length - 1 && (
                      <View
                        style={[
                          styles.stageConnectorBottom,
                          {
                            backgroundColor: isCompleted
                              ? Colors.status.completed
                              : Colors.glass.borderLight,
                          },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Stage action buttons */}
            {treatment.status === 'in_progress' && (
              <View style={styles.stageActions}>
                {currentStageIndex < stages.length - 1 && (
                  <TouchableOpacity
                    style={styles.advanceStageButton}
                    onPress={handleAdvanceStage}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-forward-circle-outline" size={18} color={Colors.status.inProgress} />
                    <Text style={[styles.stageActionText, { color: Colors.status.inProgress }]}>
                      Advance Stage
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.completeStageButton}
                  onPress={handleMarkStageComplete}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.status.completed} />
                  <Text style={[styles.stageActionText, { color: Colors.status.completed }]}>
                    {currentStageIndex === stages.length - 1 ? 'Complete Treatment' : 'Mark Stage Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ===== Status Actions ===== */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Actions</Text>
          <View style={styles.statusActionsRow}>
            {treatment.status === 'in_progress' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.status.completed + '25' }]}
                  onPress={() =>
                    Alert.alert('Mark Complete', 'Mark this treatment as completed?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Complete', onPress: () => handleStatusChange('completed') },
                    ])
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={18} color={Colors.status.completed} />
                  <Text style={[styles.actionButtonText, { color: Colors.status.completed }]}>
                    Mark Complete
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.status.hold + '25' }]}
                  onPress={() =>
                    Alert.alert('Put on Hold', 'Put this treatment on hold?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Hold', onPress: () => handleStatusChange('on_hold') },
                    ])
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons name="pause-circle" size={18} color={Colors.status.hold} />
                  <Text style={[styles.actionButtonText, { color: Colors.status.hold }]}>
                    Put on Hold
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {treatment.status === 'on_hold' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.status.inProgress + '25' }]}
                onPress={() => handleStatusChange('in_progress')}
                activeOpacity={0.7}
              >
                <Ionicons name="play-circle" size={18} color={Colors.status.inProgress} />
                <Text style={[styles.actionButtonText, { color: Colors.status.inProgress }]}>
                  Resume
                </Text>
              </TouchableOpacity>
            )}
            {treatment.status !== 'cancelled' && treatment.status !== 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelActionButton]}
                onPress={() =>
                  Alert.alert('Cancel Treatment', 'Are you sure you want to cancel this treatment?', [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Cancel Treatment',
                      style: 'destructive',
                      onPress: () => handleStatusChange('cancelled'),
                    },
                  ])
                }
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                  Cancel Treatment
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ===== Visit Timeline ===== */}
        <View style={styles.glassCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Visit History</Text>
            <TouchableOpacity
              style={styles.addVisitButton}
              onPress={handleAddVisit}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.accent.main} />
              <Text style={styles.addVisitButtonText}>Add Visit</Text>
            </TouchableOpacity>
          </View>

          {sortedVisits.length === 0 ? (
            <View style={styles.emptyVisits}>
              <Ionicons name="document-text-outline" size={40} color={Colors.text.tertiary} />
              <Text style={styles.emptyVisitsText}>No visits recorded yet</Text>
            </View>
          ) : (
            sortedVisits.map((visit, index) => (
              <View
                key={visit.id}
                style={[
                  styles.visitItem,
                  index < sortedVisits.length - 1 && styles.visitItemBorder,
                ]}
              >
                {/* Date */}
                <Text style={styles.visitDate}>{formatDate(visit.date)}</Text>

                {/* Procedure */}
                <Text style={styles.visitProcedure}>{visit.procedureDone}</Text>

                {/* Stage badge */}
                {visit.stage && (
                  <View style={styles.visitStageBadge}>
                    <Text style={styles.visitStageText}>{visit.stage}</Text>
                  </View>
                )}

                {/* Notes */}
                {visit.notes ? (
                  <Text style={styles.visitNotes}>{visit.notes}</Text>
                ) : null}

                {/* Photo thumbnails */}
                {visit.photos && visit.photos.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.visitPhotosScroll}
                    contentContainerStyle={styles.visitPhotosContainer}
                  >
                    {visit.photos.map((photo) => (
                      <TouchableOpacity
                        key={photo.id}
                        activeOpacity={0.8}
                        onPress={() =>
                          Alert.alert('Photo', 'Full photo viewer coming soon.')
                        }
                      >
                        <Image
                          source={{ uri: photo.uri }}
                          style={styles.visitPhotoThumb}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </View>

        {/* ===== Financial Summary ===== */}
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Financial Summary</Text>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Treatment Fee</Text>
            <Text style={styles.financeValue}>{formatCurrency(treatment.fee)}</Text>
          </View>
          <View style={styles.financeRow}>
            <Text style={styles.financeLabel}>Equipment Cost</Text>
            <Text style={styles.financeValue}>{formatCurrency(treatment.equipmentCost)}</Text>
          </View>
          <View style={[styles.financeRow, styles.financeTotalRow]}>
            <Text style={styles.financeTotalLabel}>Total Cost</Text>
            <Text style={styles.financeTotalValue}>
              {formatCurrency(treatment.fee + treatment.equipmentCost)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  // ---- Missing treatment ----
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  missingTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.lg,
  },
  missingSubtitle: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  backButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent.main,
    marginTop: Spacing.xxl,
  },
  backButtonLargeText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeSmallText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderColor: 'rgba(244, 67, 54, 0.30)',
  },

  // ---- Summary Card ----
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
    backgroundColor: Colors.glass.white,
    marginBottom: Spacing.md,
  },
  summaryContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  treatmentNameLarge: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  patientNameLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.md,
  },
  statusBadgeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  locationText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  feeItem: {
    alignItems: 'center',
  },
  feeLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  feeValue: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  feeDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.glass.borderLight,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dateText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },

  // ---- Progress Bar ----
  progressContainer: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  progressPercent: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.glass.borderLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.accent.main,
  },
  progressStageText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // ---- Glass Card ----
  glassCard: {
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  // ---- Stage Timeline ----
  stageTimeline: {
    marginLeft: Spacing.sm,
  },
  stageItem: {
    position: 'relative',
  },
  stageIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stageCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.glass.borderLight,
    backgroundColor: 'transparent',
  },
  stageCircleCompleted: {
    backgroundColor: Colors.status.completed,
    borderColor: Colors.status.completed,
  },
  stageCircleCurrent: {
    borderColor: Colors.status.inProgress,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  stageCircleUpcoming: {
    borderColor: Colors.glass.borderLight,
    backgroundColor: 'transparent',
  },
  stageCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.status.inProgress,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  stageNameCurrent: {
    color: Colors.status.inProgress,
    fontWeight: FontWeight.bold,
  },
  stageNameCompleted: {
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  stageDuration: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    marginTop: 2,
  },
  stageConnectorTop: {
    position: 'absolute',
    left: 13,
    top: 0,
    width: 2,
    height: Spacing.sm,
  },
  stageConnectorBottom: {
    position: 'absolute',
    left: 13,
    bottom: 0,
    width: 2,
    height: Spacing.sm,
  },
  stageActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    flexWrap: 'wrap',
  },
  advanceStageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.status.inProgress + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.status.inProgress + '40',
  },
  completeStageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.status.completed + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.status.completed + '40',
  },
  stageActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // ---- Status Actions ----
  statusActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  cancelActionButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.error + '40',
  },

  // ---- Visit Timeline ----
  addVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent.main,
  },
  addVisitButtonText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  emptyVisits: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyVisitsText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.sm,
  },
  visitItem: {
    paddingVertical: Spacing.md,
  },
  visitItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  visitDate: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  visitProcedure: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  visitStageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  visitStageText: {
    color: Colors.accent.main,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  visitNotes: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.sm,
  },
  visitPhotosScroll: {
    marginTop: Spacing.sm,
  },
  visitPhotosContainer: {
    gap: Spacing.sm,
  },
  visitPhotoThumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.glass.borderLight,
  },

  // ---- Financial Summary ----
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  financeLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  financeValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  financeTotalRow: {
    borderBottomWidth: 0,
    marginTop: Spacing.xs,
  },
  financeTotalLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  financeTotalValue: {
    color: Colors.accent.main,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});

export default TreatmentDetailScreen;
