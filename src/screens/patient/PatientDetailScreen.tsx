import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePatientStore, useLocationStore } from '../../store';
import { Patient, PatientPhoto } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import PhotoGrid from '../../components/ui/PhotoGrid';
import PhotoViewer from '../../components/ui/PhotoViewer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabKey = 'overview' | 'photos' | 'treatments' | 'billing';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'overview', label: 'Overview', icon: 'person-outline' },
  { key: 'photos', label: 'Photos', icon: 'images-outline' },
  { key: 'treatments', label: 'Treatments', icon: 'medical-outline' },
  { key: 'billing', label: 'Billing', icon: 'receipt-outline' },
];

const PHOTO_CATEGORIES = [
  { key: null, label: 'All' },
  { key: 'extraoral', label: 'Extraoral' },
  { key: 'intraoral', label: 'Intraoral' },
  { key: 'xray', label: 'X-Ray' },
  { key: 'opg', label: 'OPG' },
  { key: 'cephalogram', label: 'Cephalo' },
];

const PatientDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const patientId = route.params?.patientId;

  const getPatientById = usePatientStore((s) => s.getPatientById);
  const deletePatient = usePatientStore((s) => s.deletePatient);
  const locations = useLocationStore((s) => s.locations);
  const getLocationById = useLocationStore((s) => s.getLocationById);

  const patient = getPatientById(patientId);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [photoCategory, setPhotoCategory] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PatientPhoto | null>(null);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);

  // Derive initials for avatar
  const initials = useMemo(() => {
    if (!patient) return '?';
    const parts = patient.fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || '?';
  }, [patient]);

  // Location names for badges
  const patientLocations = useMemo(() => {
    if (!patient) return [];
    return patient.locationIds
      .map((id) => getLocationById(id))
      .filter(Boolean);
  }, [patient, getLocationById]);

  const primaryLocation = useMemo(() => {
    if (!patient) return null;
    if (patient.locationIds.length > 0) {
      return getLocationById(patient.locationIds[0]);
    }
    return null;
  }, [patient, getLocationById]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${patient?.fullName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePatient(patientId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handlePhotoPress = (photo: PatientPhoto) => {
    setSelectedPhoto(photo);
    setPhotoViewerVisible(true);
  };

  const handleClosePhotoViewer = () => {
    setPhotoViewerVisible(false);
    setSelectedPhoto(null);
  };

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

  const formatGender = (gender: string): string => {
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  // ---- Missing patient ----
  if (!patient) {
    return (
      <LinearGradient colors={[...Colors.gradient.primary]} style={styles.flex}>
        <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.missingTitle}>Patient Not Found</Text>
          <Text style={styles.missingSubtitle}>
            This patient may have been deleted.
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

  // ---- Render tabs ----

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Contact Info Card */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={Colors.accent.main} />
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{patient.phone}</Text>
        </View>
        {patient.email ? (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.accent.main} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{patient.email}</Text>
          </View>
        ) : null}
        {patient.address ? (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={Colors.accent.main} />
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{patient.address}</Text>
          </View>
        ) : null}
        {patient.city ? (
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={Colors.accent.main} />
            <Text style={styles.infoLabel}>City</Text>
            <Text style={styles.infoValue}>{patient.city}</Text>
          </View>
        ) : null}
        {patient.emergencyContact ? (
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.warning} />
            <Text style={styles.infoLabel}>Emergency</Text>
            <Text style={styles.infoValue}>{patient.emergencyContact}</Text>
          </View>
        ) : null}
      </View>

      {/* Medical Info Card */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>Medical Information</Text>
        {patient.bloodGroup ? (
          <View style={styles.infoRow}>
            <View style={styles.bloodGroupBadge}>
              <Text style={styles.bloodGroupText}>{patient.bloodGroup}</Text>
            </View>
            <Text style={styles.infoLabel}>Blood Group</Text>
          </View>
        ) : null}
        {patient.medicalHistory ? (
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Medical History</Text>
            <Text style={styles.infoBlockValue}>{patient.medicalHistory}</Text>
          </View>
        ) : null}
        {patient.allergies ? (
          <View style={styles.infoBlock}>
            <Text style={[styles.infoLabel, { color: Colors.warning }]}>Allergies</Text>
            <Text style={styles.infoBlockValue}>{patient.allergies}</Text>
          </View>
        ) : null}
        {!patient.bloodGroup && !patient.medicalHistory && !patient.allergies && (
          <Text style={styles.noDataText}>No medical information recorded</Text>
        )}
      </View>

      {/* Registration Info Card */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>Registration Info</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.accent.main} />
          <Text style={styles.infoLabel}>Registered</Text>
          <Text style={styles.infoValue}>{formatDate(patient.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color={Colors.accent.main} />
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>{formatDate(patient.updatedAt)}</Text>
        </View>
        {primaryLocation ? (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={Colors.accent.main} />
            <Text style={styles.infoLabel}>Primary Location</Text>
            <Text style={styles.infoValue}>{primaryLocation.name}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderPhotosTab = () => (
    <View style={styles.tabContent}>
      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsContainer}
      >
        {PHOTO_CATEGORIES.map((cat) => {
          const isActive = photoCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.label}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.7}
              onPress={() => setPhotoCategory(cat.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Photo grid */}
      <View style={styles.photoGridWrapper}>
        <PhotoGrid
          photos={patient.photos}
          columns={3}
          onPhotoPress={handlePhotoPress}
          onAddPress={() => {
            // Navigate to add photo flow (to be implemented)
            Alert.alert('Add Photo', 'Photo capture will be available in a future update.');
          }}
          showAddButton
          emptyMessage="No photos in this category"
          filterCategory={photoCategory}
        />
      </View>
    </View>
  );

  const renderTreatmentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateEmoji}>🦷</Text>
        <Text style={styles.emptyStateTitle}>No treatments yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Start a treatment plan for this patient
        </Text>
        <TouchableOpacity
          style={styles.emptyStateButton}
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert('Add Treatment', 'Treatment management will be available in Phase 4.');
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.text.primary} />
          <Text style={styles.emptyStateButtonText}>Add Treatment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBillingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateEmoji}>💰</Text>
        <Text style={styles.emptyStateTitle}>No bills yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Create a bill for this patient
        </Text>
        <TouchableOpacity
          style={styles.emptyStateButton}
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert('Create Bill', 'Billing will be available in Phase 5.');
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.text.primary} />
          <Text style={styles.emptyStateButtonText}>Create Bill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'photos':
        return renderPhotosTab();
      case 'treatments':
        return renderTreatmentsTab();
      case 'billing':
        return renderBillingTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <LinearGradient colors={[...Colors.gradient.primary]} style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{patient.patientId}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() =>
                navigation.navigate('EditPatient', { patientId: patient.id })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Patient Summary Card */}
        <View style={styles.summaryCard}>
          <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={20} />
          <View style={styles.summaryContent}>
            {/* Avatar */}
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Name + ID */}
            <Text style={styles.patientName}>{patient.fullName}</Text>
            <Text style={styles.patientIdText}>{patient.patientId}</Text>

            {/* Quick info row */}
            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoItem}>
                <Text style={styles.quickInfoLabel}>Age</Text>
                <Text style={styles.quickInfoValue}>{patient.age}</Text>
              </View>
              <View style={styles.quickInfoDivider} />
              <View style={styles.quickInfoItem}>
                <Text style={styles.quickInfoLabel}>Gender</Text>
                <Text style={styles.quickInfoValue}>{formatGender(patient.gender)}</Text>
              </View>
              <View style={styles.quickInfoDivider} />
              <View style={styles.quickInfoItem}>
                <Ionicons name="call" size={14} color={Colors.accent.main} />
                <Text style={styles.quickInfoValue}>{patient.phone}</Text>
              </View>
            </View>

            {/* Location badges */}
            {patientLocations.length > 0 && (
              <View style={styles.locationBadgesRow}>
                {patientLocations.map((loc) =>
                  loc ? (
                    <View key={loc.id} style={styles.locationBadge}>
                      <Ionicons name="location" size={12} color={Colors.accent.main} />
                      <Text style={styles.locationBadgeText}>{loc.name}</Text>
                    </View>
                  ) : null
                )}
              </View>
            )}
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContainer}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={isActive ? Colors.accent.main : Colors.text.tertiary}
                />
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tab Content */}
        {renderActiveTab()}
      </ScrollView>

      {/* Photo Viewer Modal */}
      <PhotoViewer
        visible={photoViewerVisible}
        photo={selectedPhoto}
        onClose={handleClosePhotoViewer}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
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
  headerBadge: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  headerBadgeText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderColor: 'rgba(244, 67, 54, 0.30)',
  },

  // ---- Patient Summary Card ----
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
    backgroundColor: Colors.glass.white,
  },
  summaryContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glass.greenMedium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.main,
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: Colors.accent.main,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
  },
  patientName: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  patientIdText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
  },
  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickInfoLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  quickInfoValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  quickInfoDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.glass.borderLight,
  },
  locationBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass.green,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  locationBadgeText: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },

  // ---- Tab Bar ----
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  tabActive: {
    backgroundColor: Colors.glass.greenMedium,
    borderColor: Colors.accent.main,
  },
  tabText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  tabTextActive: {
    color: Colors.accent.main,
    fontWeight: FontWeight.semibold,
  },

  // ---- Tab Content ----
  tabContent: {
    paddingHorizontal: Spacing.lg,
  },

  // ---- Glass Card ----
  glassCard: {
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },

  // ---- Info Rows ----
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  infoLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    minWidth: 80,
  },
  infoValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    flex: 1,
  },
  infoBlock: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  infoBlockValue: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.xs,
  },
  bloodGroupBadge: {
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  bloodGroupText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  noDataText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    fontStyle: 'italic',
  },

  // ---- Photos Tab ----
  filterChipsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.glass.greenMedium,
    borderColor: Colors.accent.main,
  },
  filterChipText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  filterChipTextActive: {
    color: Colors.accent.main,
    fontWeight: FontWeight.semibold,
  },
  photoGridWrapper: {
    marginTop: Spacing.sm,
  },

  // ---- Empty States ----
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  emptyStateSubtitle: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent.main,
    marginTop: Spacing.xl,
  },
  emptyStateButtonText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // ---- Missing Patient ----
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
});

export default PatientDetailScreen;
