import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore, usePatientStore, useAppointmentStore } from '../../store';
import { AppNotification } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { NotificationService } from '../../services/notificationService';

// ------------------------------------
// Types & Constants
// ------------------------------------

type NotificationType = 'appointment_reminder' | 'missed_appointment' | 'payment_due' | 'custom';

interface TypeOption {
  key: NotificationType;
  emoji: string;
  label: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  { key: 'appointment_reminder', emoji: '\uD83D\uDCC5', label: 'Appointment Reminder' },
  { key: 'missed_appointment', emoji: '\u274C', label: 'Missed Appointment Follow-up' },
  { key: 'payment_due', emoji: '\uD83D\uDCB0', label: 'Payment Reminder' },
  { key: 'custom', emoji: '\uD83D\uDCAC', label: 'Custom Message' },
];

// ------------------------------------
// Component
// ------------------------------------

export default function SendNotificationScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const {
    createAppointmentReminder,
    createMissedAppointmentNotification,
    createPaymentDueNotification,
    createCustomNotification,
  } = useNotificationStore();

  const { patients, searchPatients } = usePatientStore();
  const { getAppointmentsByPatient, getUpcomingAppointments } = useAppointmentStore();

  // State
  const [selectedType, setSelectedType] = useState<NotificationType>('appointment_reminder');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);

  // Message fields
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [editableMessage, setEditableMessage] = useState('');

  // Send via
  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  // Derived data
  const selectedPatient = useMemo(
    () => (selectedPatientId ? patients.find((p) => p.id === selectedPatientId) : null),
    [selectedPatientId, patients],
  );

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) {
      if (selectedType === 'appointment_reminder') {
        // Show patients with upcoming appointments
        const upcoming = getUpcomingAppointments(50);
        const patientIds = [...new Set(upcoming.map((a) => a.patientId))];
        return patients.filter((p) => patientIds.includes(p.id));
      }
      return patients.slice(0, 20);
    }
    return searchPatients(patientSearch);
  }, [patientSearch, patients, selectedType, getUpcomingAppointments, searchPatients]);

  // Get patient's upcoming appointment (for reminder type)
  const patientUpcomingAppointment = useMemo(() => {
    if (!selectedPatientId) return null;
    const patientAppointments = getAppointmentsByPatient(selectedPatientId);
    const today = new Date().toISOString().split('T')[0];
    return patientAppointments
      .filter((a) => a.date >= today && a.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))[0];
  }, [selectedPatientId, getAppointmentsByPatient]);

  // Get patient's missed appointment (for missed type)
  const patientMissedAppointment = useMemo(() => {
    if (!selectedPatientId) return null;
    const patientAppointments = getAppointmentsByPatient(selectedPatientId);
    return patientAppointments
      .filter((a) => a.status === 'missed')
      .sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [selectedPatientId, getAppointmentsByPatient]);

  // Auto-generate message when type or patient changes
  const autoMessage = useMemo(() => {
    if (!selectedPatient) return '';

    switch (selectedType) {
      case 'appointment_reminder':
        if (patientUpcomingAppointment) {
          return `Dear ${selectedPatient.fullName}, this is a reminder for your dental appointment on ${patientUpcomingAppointment.date} at ${patientUpcomingAppointment.startTime} at ${patientUpcomingAppointment.locationName}. Please arrive 10 minutes early.`;
        }
        return `Dear ${selectedPatient.fullName}, this is a reminder for your upcoming dental appointment. Please contact us for details.`;

      case 'missed_appointment':
        if (patientMissedAppointment) {
          return `Dear ${selectedPatient.fullName}, we noticed you missed your appointment on ${patientMissedAppointment.date}. Your dental health is important to us. Please contact us to reschedule.`;
        }
        return `Dear ${selectedPatient.fullName}, we noticed you missed a recent appointment. Please contact us to reschedule at your convenience.`;

      case 'payment_due':
        return `Dear ${selectedPatient.fullName}, this is a reminder about your pending payment. Please settle your dues at your earliest convenience.`;

      default:
        return '';
    }
  }, [selectedType, selectedPatient, patientUpcomingAppointment, patientMissedAppointment]);

  // When patient/type changes, reset editable message
  const handleSelectType = useCallback((type: NotificationType) => {
    setSelectedType(type);
    setEditableMessage('');
    setCustomTitle('');
    setCustomMessage('');
  }, []);

  const handleSelectPatient = useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientList(false);
    setPatientSearch('');
    setEditableMessage('');
  }, []);

  // Send notification
  const handleSend = useCallback(async () => {
    if (!selectedPatient && selectedType !== 'custom') {
      Alert.alert(
        t('notifications.error', 'Error'),
        t('notifications.selectPatient', 'Please select a patient.'),
      );
      return;
    }

    if (selectedType === 'custom' && (!customTitle.trim() || !customMessage.trim())) {
      Alert.alert(
        t('notifications.error', 'Error'),
        t('notifications.enterMessage', 'Please enter a title and message.'),
      );
      return;
    }

    try {
      const finalMessage = selectedType === 'custom'
        ? customMessage
        : (editableMessage || autoMessage);

      // Create notification in store
      let notification: AppNotification | null = null;

      switch (selectedType) {
        case 'appointment_reminder':
          if (patientUpcomingAppointment && selectedPatient) {
            notification = createAppointmentReminder({
              doctorId: patientUpcomingAppointment.doctorId,
              patientId: selectedPatient.id,
              patientName: selectedPatient.fullName,
              appointmentDate: patientUpcomingAppointment.date,
              appointmentTime: patientUpcomingAppointment.startTime,
              locationName: patientUpcomingAppointment.locationName,
            });
          }
          break;

        case 'missed_appointment':
          if (selectedPatient) {
            notification = createMissedAppointmentNotification({
              doctorId: patientMissedAppointment?.doctorId || '',
              patientId: selectedPatient.id,
              patientName: selectedPatient.fullName,
              appointmentDate: patientMissedAppointment?.date || '',
            });
          }
          break;

        case 'payment_due':
          if (selectedPatient) {
            notification = createPaymentDueNotification({
              doctorId: selectedPatient.doctorId,
              patientId: selectedPatient.id,
              patientName: selectedPatient.fullName,
              amount: 0,
              dueDate: new Date().toISOString().split('T')[0],
            });
          }
          break;

        case 'custom':
          notification = createCustomNotification({
            doctorId: '',
            patientId: selectedPatient?.id,
            title: customTitle,
            message: customMessage,
          });
          break;
      }

      // Send via WhatsApp if enabled
      if (whatsappEnabled && selectedPatient?.phone) {
        let whatsappMessage = finalMessage;

        if (selectedType === 'appointment_reminder' && patientUpcomingAppointment) {
          whatsappMessage = NotificationService.generateAppointmentReminderMessage({
            patientName: selectedPatient.fullName,
            doctorName: '',
            date: patientUpcomingAppointment.date,
            time: patientUpcomingAppointment.startTime,
            locationName: patientUpcomingAppointment.locationName,
          });
        } else if (selectedType === 'missed_appointment') {
          whatsappMessage = NotificationService.generateMissedAppointmentMessage({
            patientName: selectedPatient.fullName,
            doctorName: '',
            date: patientMissedAppointment?.date || '',
          });
        }

        await NotificationService.sendWhatsAppMessage({
          phone: selectedPatient.phone,
          message: whatsappMessage,
        });
      }

      // Send push notification if enabled
      if (pushEnabled && notification) {
        await NotificationService.scheduleLocalNotification({
          title: notification.title,
          body: notification.message,
          data: { notificationId: notification.id, type: notification.type },
          triggerDate: new Date(Date.now() + 1000), // immediate (1 second from now)
        });
      }

      Alert.alert(
        t('notifications.sent', 'Notification Sent'),
        t('notifications.sentMessage', 'The notification has been sent successfully.'),
        [{ text: t('common.ok', 'OK'), onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert(
        t('notifications.error', 'Error'),
        t('notifications.sendError', 'Failed to send notification. Please try again.'),
      );
    }
  }, [
    selectedPatient,
    selectedType,
    customTitle,
    customMessage,
    editableMessage,
    autoMessage,
    pushEnabled,
    whatsappEnabled,
    patientUpcomingAppointment,
    patientMissedAppointment,
    createAppointmentReminder,
    createMissedAppointmentNotification,
    createPaymentDueNotification,
    createCustomNotification,
    navigation,
    t,
  ]);

  // WhatsApp message preview
  const whatsappPreview = useMemo(() => {
    if (!whatsappEnabled || !selectedPatient) return '';

    if (selectedType === 'appointment_reminder' && patientUpcomingAppointment) {
      return NotificationService.generateAppointmentReminderMessage({
        patientName: selectedPatient.fullName,
        doctorName: '',
        date: patientUpcomingAppointment.date,
        time: patientUpcomingAppointment.startTime,
        locationName: patientUpcomingAppointment.locationName,
      });
    }

    if (selectedType === 'missed_appointment') {
      return NotificationService.generateMissedAppointmentMessage({
        patientName: selectedPatient.fullName,
        doctorName: '',
        date: patientMissedAppointment?.date || '',
      });
    }

    if (selectedType === 'custom') {
      return customMessage || '';
    }

    return editableMessage || autoMessage;
  }, [
    whatsappEnabled,
    selectedPatient,
    selectedType,
    patientUpcomingAppointment,
    patientMissedAppointment,
    customMessage,
    editableMessage,
    autoMessage,
  ]);

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
            {t('notifications.sendTitle', 'Send Notification')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ============ SECTION 1: NOTIFICATION TYPE ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('notifications.notificationType', 'Notification Type')}
            </Text>
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((option) => {
                const isSelected = option.key === selectedType;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                    onPress={() => handleSelectType(option.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.typeEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.typeLabel,
                        isSelected && styles.typeLabelSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {t(`notifications.type_${option.key}`, option.label)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        </View>

        {/* ============ SECTION 2: SELECT PATIENT ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('notifications.selectPatient', 'Select Patient')}
            </Text>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={Colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('notifications.searchPatient', 'Search patient by name...')}
                placeholderTextColor={Colors.text.tertiary}
                value={patientSearch}
                onChangeText={(text) => {
                  setPatientSearch(text);
                  setShowPatientList(true);
                }}
                onFocus={() => setShowPatientList(true)}
              />
              {patientSearch.length > 0 && (
                <TouchableOpacity onPress={() => { setPatientSearch(''); setShowPatientList(false); }}>
                  <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Selected Patient */}
            {selectedPatient && !showPatientList && (
              <View style={styles.selectedPatientCard}>
                <View style={styles.selectedPatientAvatar}>
                  <Text style={styles.selectedPatientAvatarText}>
                    {selectedPatient.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.selectedPatientInfo}>
                  <Text style={styles.selectedPatientName}>{selectedPatient.fullName}</Text>
                  <Text style={styles.selectedPatientMeta}>
                    {selectedPatient.patientId} {selectedPatient.phone ? `\u2022 ${selectedPatient.phone}` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPatientId(null);
                    setShowPatientList(false);
                  }}
                >
                  <Ionicons name="close-circle" size={22} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Patient List */}
            {showPatientList && (
              <View style={styles.patientListContainer}>
                {filteredPatients.length === 0 ? (
                  <Text style={styles.noResultsText}>
                    {t('notifications.noPatients', 'No patients found')}
                  </Text>
                ) : (
                  filteredPatients.slice(0, 10).map((patient) => (
                    <TouchableOpacity
                      key={patient.id}
                      style={styles.patientListItem}
                      onPress={() => handleSelectPatient(patient.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.patientListAvatar}>
                        <Text style={styles.patientListAvatarText}>
                          {patient.fullName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.patientListInfo}>
                        <Text style={styles.patientListName}>{patient.fullName}</Text>
                        <Text style={styles.patientListMeta}>
                          {patient.patientId} {patient.phone ? `\u2022 ${patient.phone}` : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </BlurView>
        </View>

        {/* ============ SECTION 3: MESSAGE ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('notifications.message', 'Message')}
            </Text>

            {selectedType === 'custom' ? (
              <>
                {/* Custom Title */}
                <Text style={styles.inputLabel}>
                  {t('notifications.titleLabel', 'Title')}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('notifications.titlePlaceholder', 'Enter notification title...')}
                  placeholderTextColor={Colors.text.tertiary}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />

                {/* Custom Message */}
                <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
                  {t('notifications.messageLabel', 'Message')}
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder={t('notifications.messagePlaceholder', 'Enter your message...')}
                  placeholderTextColor={Colors.text.tertiary}
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </>
            ) : (
              <>
                {/* Appointment details for reminder type */}
                {selectedType === 'appointment_reminder' && patientUpcomingAppointment && (
                  <View style={styles.appointmentDetailCard}>
                    <View style={styles.appointmentDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.accent.main} />
                      <Text style={styles.appointmentDetailText}>
                        {patientUpcomingAppointment.date}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetailRow}>
                      <Ionicons name="time-outline" size={16} color={Colors.accent.main} />
                      <Text style={styles.appointmentDetailText}>
                        {patientUpcomingAppointment.startTime} - {patientUpcomingAppointment.endTime}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetailRow}>
                      <Ionicons name="location-outline" size={16} color={Colors.accent.main} />
                      <Text style={styles.appointmentDetailText}>
                        {patientUpcomingAppointment.locationName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Missed appointment info */}
                {selectedType === 'missed_appointment' && patientMissedAppointment && (
                  <View style={styles.appointmentDetailCard}>
                    <View style={styles.appointmentDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.error} />
                      <Text style={styles.appointmentDetailText}>
                        Missed on {patientMissedAppointment.date}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetailRow}>
                      <Ionicons name="location-outline" size={16} color={Colors.error} />
                      <Text style={styles.appointmentDetailText}>
                        {patientMissedAppointment.locationName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Auto-generated editable message */}
                <Text style={styles.inputLabel}>
                  {t('notifications.autoMessage', 'Message (editable)')}
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editableMessage || autoMessage}
                  onChangeText={setEditableMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </>
            )}
          </BlurView>
        </View>

        {/* ============ SECTION 4: SEND VIA ============ */}
        <View style={styles.card}>
          <BlurView intensity={18} tint="light" style={styles.cardBlur}>
            <Text style={styles.sectionTitle}>
              {t('notifications.sendVia', 'Send Via')}
            </Text>

            {/* Push Notification Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="notifications-outline" size={20} color={Colors.text.primary} />
                <Text style={styles.toggleLabel}>
                  {t('notifications.pushNotification', 'Push Notification')}
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: Colors.glass.dark, true: Colors.accent.dark }}
                thumbColor={pushEnabled ? Colors.accent.main : Colors.text.tertiary}
              />
            </View>

            {/* WhatsApp Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.toggleLabel}>
                  {t('notifications.whatsapp', 'WhatsApp')}
                </Text>
              </View>
              <Switch
                value={whatsappEnabled}
                onValueChange={setWhatsappEnabled}
                trackColor={{ false: Colors.glass.dark, true: Colors.accent.dark }}
                thumbColor={whatsappEnabled ? Colors.accent.main : Colors.text.tertiary}
              />
            </View>

            {/* WhatsApp Preview */}
            {whatsappEnabled && whatsappPreview.length > 0 && (
              <View style={styles.whatsappPreview}>
                <View style={styles.whatsappPreviewHeader}>
                  <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                  <Text style={styles.whatsappPreviewTitle}>
                    {t('notifications.whatsappPreview', 'WhatsApp Preview')}
                  </Text>
                </View>
                <View style={styles.whatsappBubble}>
                  <Text style={styles.whatsappBubbleText}>{whatsappPreview}</Text>
                </View>
              </View>
            )}
          </BlurView>
        </View>
      </ScrollView>

      {/* ============ BOTTOM: SEND BUTTON ============ */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSend}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[Colors.accent.dark, Colors.accent.main]}
            style={styles.sendBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="send" size={20} color="#1B5E20" />
            <Text style={styles.sendBtnText}>
              {t('notifications.sendNotification', 'Send Notification')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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

  // ---- Type Grid ----
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.glass.borderLight,
  },
  typeCardSelected: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  typeEmoji: {
    fontSize: 28,
  },
  typeLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: Colors.text.primary,
    fontWeight: FontWeight.bold,
  },

  // ---- Search Input ----
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    paddingVertical: Spacing.md,
  },

  // ---- Selected Patient ----
  selectedPatientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.greenMedium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent.main,
  },
  selectedPatientAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.accent.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPatientAvatarText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  selectedPatientInfo: {
    flex: 1,
  },
  selectedPatientName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  selectedPatientMeta: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  // ---- Patient List ----
  patientListContainer: {
    maxHeight: 250,
    backgroundColor: Colors.glass.dark,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  patientListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  patientListAvatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.greenMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientListAvatarText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  patientListInfo: {
    flex: 1,
  },
  patientListName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  patientListMeta: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  noResultsText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    textAlign: 'center',
    padding: Spacing.xl,
  },

  // ---- Message Section ----
  inputLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  // ---- Appointment Detail ----
  appointmentDetailCard: {
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  appointmentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  appointmentDetailText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // ---- Toggle Rows ----
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },

  // ---- WhatsApp Preview ----
  whatsappPreview: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  whatsappPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  whatsappPreviewTitle: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  whatsappBubble: {
    backgroundColor: '#DCF8C6',
    borderRadius: BorderRadius.md,
    borderTopLeftRadius: 0,
    padding: Spacing.md,
  },
  whatsappBubbleText: {
    color: '#1A1A1A',
    fontSize: FontSize.sm,
    lineHeight: 20,
  },

  // ---- Bottom Bar ----
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  sendBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  sendBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  sendBtnText: {
    color: '#1B5E20',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
});
