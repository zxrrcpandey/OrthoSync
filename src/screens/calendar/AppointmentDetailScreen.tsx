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
  appointmentId: string;
};

const STATUS_CONFIG: Record<
  Appointment['status'],
  { label: string; color: string; icon: string }
> = {
  scheduled: { label: 'Scheduled', color: Colors.status.scheduled, icon: 'calendar' },
  completed: { label: 'Completed', color: Colors.status.completed, icon: 'checkmark-circle' },
  missed: { label: 'Missed', color: Colors.status.missed, icon: 'close-circle' },
  cancelled: { label: 'Cancelled', color: Colors.status.cancelled, icon: 'ban' },
  hold: { label: 'On Hold', color: Colors.status.hold, icon: 'pause-circle' },
};

const LOCATION_TYPE_LABELS: Record<string, string> = {
  own_clinic: 'Own Clinic',
  hospital: 'Hospital',
  others_clinic: "Other's Clinic",
};

// ==========================================
// Helpers
// ==========================================

const formatDateDisplay = (dateStr: string): string => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const calculateDuration = (start: string, end: string): number => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

// ==========================================
// Component
// ==========================================

const AppointmentDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const params = route.params as RouteParams;

  const appointmentStore = useAppointmentStore();
  const { getPatientById } = usePatientStore();
  const { getLocationById } = useLocationStore();
  const { getTreatmentById } = useTreatmentStore();

  const appointment = appointmentStore.getAppointmentById(params.appointmentId);

  // --- Reschedule State ---
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');

  // --- Derived Data ---
  const patient = useMemo(
    () => (appointment ? getPatientById(appointment.patientId) : undefined),
    [appointment, getPatientById],
  );

  const location = useMemo(
    () => (appointment ? getLocationById(appointment.locationId) : undefined),
    [appointment, getLocationById],
  );

  const linkedTreatment = useMemo(
    () => (appointment?.treatmentId ? getTreatmentById(appointment.treatmentId) : undefined),
    [appointment, getTreatmentById],
  );

  // --- Handlers ---
  const handleMarkCompleted = useCallback(() => {
    if (!appointment) return;
    Alert.alert(
      t('appointment.confirmComplete', 'Mark as Completed'),
      t('appointment.confirmCompleteMessage', 'Are you sure this appointment is completed?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.confirm', 'Confirm'),
          onPress: () => appointmentStore.markCompleted(appointment.id),
        },
      ],
    );
  }, [appointment, appointmentStore, t]);

  const handleMarkMissed = useCallback(() => {
    if (!appointment) return;
    Alert.alert(
      t('appointment.confirmMissed', 'Mark as Missed'),
      t('appointment.confirmMissedMessage', 'Mark this appointment as missed?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.confirm', 'Confirm'),
          style: 'destructive',
          onPress: () => appointmentStore.markMissed(appointment.id),
        },
      ],
    );
  }, [appointment, appointmentStore, t]);

  const handleMarkHold = useCallback(() => {
    if (!appointment) return;
    appointmentStore.markHold(appointment.id);
  }, [appointment, appointmentStore]);

  const handleCancel = useCallback(() => {
    if (!appointment) return;
    Alert.alert(
      t('appointment.confirmCancel', 'Cancel Appointment'),
      t('appointment.confirmCancelMessage', 'Are you sure you want to cancel this appointment?'),
      [
        { text: t('common.no', 'No'), style: 'cancel' },
        {
          text: t('common.yes', 'Yes'),
          style: 'destructive',
          onPress: () => appointmentStore.markCancelled(appointment.id),
        },
      ],
    );
  }, [appointment, appointmentStore, t]);

  const handleOpenReschedule = useCallback(() => {
    if (!appointment) return;
    setRescheduleDate(appointment.date);
    setRescheduleStartTime(appointment.startTime);
    setRescheduleEndTime(appointment.endTime);
    setShowReschedule(true);
  }, [appointment]);

  const handleConfirmReschedule = useCallback(() => {
    if (!appointment) return;
    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      Alert.alert(t('common.error', 'Error'), t('appointment.rescheduleFieldsRequired', 'All fields are required'));
      return;
    }
    const dur = calculateDuration(rescheduleStartTime, rescheduleEndTime);
    if (dur <= 0) {
      Alert.alert(t('common.error', 'Error'), t('appointment.invalidTime', 'End time must be after start time'));
      return;
    }
    appointmentStore.reschedule(appointment.id, rescheduleDate, rescheduleStartTime, rescheduleEndTime);
    setShowReschedule(false);
  }, [appointment, rescheduleDate, rescheduleStartTime, rescheduleEndTime, appointmentStore, t]);

  const handleDelete = useCallback(() => {
    if (!appointment) return;
    Alert.alert(
      t('appointment.confirmDelete', 'Delete Appointment'),
      t('appointment.confirmDeleteMessage', 'This action cannot be undone. Are you sure?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            appointmentStore.deleteAppointment(appointment.id);
            navigation.goBack();
          },
        },
      ],
    );
  }, [appointment, appointmentStore, navigation, t]);

  // ==========================================
  // Render Helpers
  // ==========================================

  const renderGlassInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: {
      placeholder?: string;
      icon?: string;
    },
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
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
            style={[styles.textInput, options?.icon && styles.textInputWithIcon]}
            value={value}
            onChangeText={onChangeText}
            placeholder={options?.placeholder || ''}
            placeholderTextColor={Colors.text.tertiary}
            selectionColor={Colors.accent.main}
          />
        </View>
      </BlurView>
    </View>
  );

  // ==========================================
  // Missing Appointment
  // ==========================================

  if (!appointment) {
    return (
      <LinearGradient
        colors={Colors.gradient.primary}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('appointment.appointment', 'Appointment')}
          </Text>
          <View style={styles.headerButtonPlaceholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>
            {t('appointment.notFound', 'Appointment not found')}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // ==========================================
  // Section Renderers
  // ==========================================

  const statusConfig = STATUS_CONFIG[appointment.status];

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
        {t('appointment.appointment', 'Appointment')}
      </Text>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={22} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderAppointmentCard = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          {/* Status Badge */}
          <View style={[styles.statusBadgeLarge, { backgroundColor: statusConfig.color + '20' }]}>
            <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
            <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {/* Date */}
          <View style={styles.appointmentDateRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.appointmentDateText}>
              {formatDateDisplay(appointment.date)}
            </Text>
          </View>

          {/* Time */}
          <Text style={styles.appointmentTimeText}>
            {appointment.startTime} - {appointment.endTime}
          </Text>

          {/* Duration */}
          <View style={styles.durationBadge}>
            <Ionicons name="hourglass-outline" size={14} color={Colors.accent.main} />
            <Text style={styles.durationText}>
              {appointment.duration} {t('appointment.minutes', 'minutes')}
            </Text>
          </View>

          {/* Recurring Badge */}
          {appointment.isRecurring && (
            <View style={styles.recurringBadge}>
              <Ionicons name="repeat-outline" size={14} color={Colors.status.scheduled} />
              <Text style={styles.recurringBadgeText}>
                {t('appointment.recurring', 'Recurring')} -{' '}
                {appointment.recurringPattern?.frequency || ''}
              </Text>
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderPatientCard = () => {
    if (!patient) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <TouchableOpacity style={styles.cardContent} activeOpacity={0.7}>
            <Text style={styles.sectionTitle}>
              {t('appointment.patient', 'Patient')}
            </Text>
            <View style={styles.patientRow}>
              <View style={styles.patientAvatar}>
                <Ionicons name="person" size={24} color={Colors.accent.main} />
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.fullName}</Text>
                <Text style={styles.patientId}>{patient.patientId}</Text>
              </View>
            </View>
            <View style={styles.patientPhoneRow}>
              <Ionicons name="call-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.patientPhone}>{patient.phone}</Text>
            </View>
          </TouchableOpacity>
        </BlurView>
      </View>
    );
  };

  const renderLocationCard = () => {
    if (!location) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('appointment.location', 'Location')}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={20} color={Colors.accent.main} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <View style={styles.locationTypeBadge}>
                  <Text style={styles.locationTypeText}>
                    {LOCATION_TYPE_LABELS[location.type] || location.type}
                  </Text>
                </View>
              </View>
            </View>
            {location.address ? (
              <Text style={styles.locationAddress}>
                {location.address}
                {location.city ? `, ${location.city}` : ''}
              </Text>
            ) : null}
          </View>
        </BlurView>
      </View>
    );
  };

  const renderTreatmentCard = () => {
    if (!linkedTreatment) return null;

    const treatmentStatusColors: Record<string, string> = {
      planned: Colors.status.scheduled,
      in_progress: Colors.status.hold,
      on_hold: Colors.status.hold,
      completed: Colors.status.completed,
      cancelled: Colors.status.cancelled,
    };

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('appointment.treatment', 'Treatment')}
            </Text>
            <View style={styles.treatmentRow}>
              <Ionicons name="medkit-outline" size={20} color={Colors.accent.main} />
              <Text style={styles.treatmentName}>{linkedTreatment.treatmentName}</Text>
            </View>
            <View
              style={[
                styles.treatmentStatusBadge,
                {
                  backgroundColor:
                    (treatmentStatusColors[linkedTreatment.status] || Colors.text.tertiary) + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.treatmentStatusText,
                  {
                    color:
                      treatmentStatusColors[linkedTreatment.status] || Colors.text.tertiary,
                  },
                ]}
              >
                {linkedTreatment.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderStatusActions = () => {
    const { status } = appointment;

    if (status === 'completed') {
      return (
        <View style={styles.sectionWrapper}>
          <BlurView intensity={25} tint="light" style={styles.glassCard}>
            <View style={[styles.cardContent, styles.completedDisplay]}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.status.completed} />
              <Text style={styles.completedText}>
                {t('appointment.appointmentCompleted', 'Appointment Completed')}
              </Text>
            </View>
          </BlurView>
        </View>
      );
    }

    if (status === 'cancelled') return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('appointment.actions', 'Actions')}
            </Text>

            <View style={styles.actionsGrid}>
              {status === 'scheduled' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.status.completed + '20' }]}
                    onPress={handleMarkCompleted}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-circle-outline" size={22} color={Colors.status.completed} />
                    <Text style={[styles.actionButtonText, { color: Colors.status.completed }]}>
                      {t('appointment.markCompleted', 'Mark Completed')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.status.missed + '20' }]}
                    onPress={handleMarkMissed}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={22} color={Colors.status.missed} />
                    <Text style={[styles.actionButtonText, { color: Colors.status.missed }]}>
                      {t('appointment.markMissed', 'Mark Missed')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.status.hold + '20' }]}
                    onPress={handleMarkHold}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pause-circle-outline" size={22} color={Colors.status.hold} />
                    <Text style={[styles.actionButtonText, { color: Colors.status.hold }]}>
                      {t('appointment.putOnHold', 'Put on Hold')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.status.cancelled + '20' }]}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="ban-outline" size={22} color={Colors.status.cancelled} />
                    <Text style={[styles.actionButtonText, { color: Colors.status.cancelled }]}>
                      {t('appointment.cancel', 'Cancel')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {status === 'hold' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.status.scheduled + '20' }]}
                    onPress={handleOpenReschedule}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh-outline" size={22} color={Colors.status.scheduled} />
                    <Text style={[styles.actionButtonText, { color: Colors.status.scheduled }]}>
                      {t('appointment.resume', 'Resume (Reschedule)')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.status.cancelled + '20' }]}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="ban-outline" size={22} color={Colors.status.cancelled} />
                    <Text style={[styles.actionButtonText, { color: Colors.status.cancelled }]}>
                      {t('appointment.cancel', 'Cancel')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {status === 'missed' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.status.scheduled + '20' }]}
                  onPress={handleOpenReschedule}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={22} color={Colors.status.scheduled} />
                  <Text style={[styles.actionButtonText, { color: Colors.status.scheduled }]}>
                    {t('appointment.reschedule', 'Reschedule')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderRescheduleSection = () => {
    if (!showReschedule) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('appointment.reschedule', 'Reschedule')}
            </Text>

            {renderGlassInput(
              t('appointment.newDate', 'New Date'),
              rescheduleDate,
              setRescheduleDate,
              { placeholder: 'YYYY-MM-DD', icon: 'calendar-outline' },
            )}

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                {renderGlassInput(
                  t('appointment.newStartTime', 'New Start Time'),
                  rescheduleStartTime,
                  setRescheduleStartTime,
                  { placeholder: 'HH:MM', icon: 'time-outline' },
                )}
              </View>
              <View style={styles.timeField}>
                {renderGlassInput(
                  t('appointment.newEndTime', 'New End Time'),
                  rescheduleEndTime,
                  setRescheduleEndTime,
                  { placeholder: 'HH:MM', icon: 'time-outline' },
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.rescheduleConfirmWrapper}
              onPress={handleConfirmReschedule}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.accent.dark, Colors.accent.main]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rescheduleConfirmGradient}
              >
                <Ionicons name="checkmark-outline" size={20} color={Colors.white} />
                <Text style={styles.rescheduleConfirmText}>
                  {t('appointment.confirmReschedule', 'Confirm Reschedule')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rescheduleCancelButton}
              onPress={() => setShowReschedule(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.rescheduleCancelText}>
                {t('common.cancel', 'Cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderNotesCard = () => {
    if (!appointment.notes) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('appointment.notes', 'Notes')}
            </Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderDeleteButton = () => (
    <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + Spacing.lg }]}>
      <TouchableOpacity
        style={styles.deleteButtonWrapper}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.error} style={styles.deleteButtonIcon} />
        <Text style={styles.deleteButtonText}>
          {t('appointment.deleteAppointment', 'Delete Appointment')}
        </Text>
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
          {renderAppointmentCard()}
          {renderPatientCard()}
          {renderLocationCard()}
          {renderTreatmentCard()}
          {renderStatusActions()}
          {renderRescheduleSection()}
          {renderNotesCard()}
          {renderDeleteButton()}
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
  headerButtonPlaceholder: {
    width: 40,
    height: 40,
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
  textInputWithIcon: {
    paddingLeft: Spacing.sm,
  },

  // --- Status Badge (Large) ---
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.lg,
  },
  statusBadgeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginLeft: Spacing.sm,
  },

  // --- Appointment Card ---
  appointmentDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  appointmentDateText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  appointmentTimeText: {
    fontSize: FontSize.xxxl || 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  durationText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.accent.main,
    marginLeft: Spacing.xs,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.status.scheduled + '20',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  recurringBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.status.scheduled,
    marginLeft: Spacing.xs,
    textTransform: 'capitalize',
  },

  // --- Patient Card ---
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glass.greenMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  patientId: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  patientPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientPhone: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },

  // --- Location Card ---
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  locationInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  locationName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  locationTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
  },
  locationTypeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.accent.main,
  },
  locationAddress: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },

  // --- Treatment Card ---
  treatmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  treatmentName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  treatmentStatusBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  treatmentStatusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // --- Status Actions ---
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: '45%',
    flex: 1,
  },
  actionButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.sm,
    flexShrink: 1,
  },

  // --- Completed Display ---
  completedDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  completedText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.status.completed,
    marginTop: Spacing.sm,
  },

  // --- Reschedule ---
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeField: {
    flex: 1,
  },
  rescheduleConfirmWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  rescheduleConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  rescheduleConfirmText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  rescheduleCancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  rescheduleCancelText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
  },

  // --- Notes ---
  notesText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },

  // --- Empty State ---
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },

  // --- Delete Button ---
  bottomButtons: {
    marginTop: Spacing.lg,
  },
  deleteButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  deleteButtonIcon: {
    marginRight: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.error,
  },
});

export default AppointmentDetailScreen;
