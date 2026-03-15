import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useLocationStore } from '../../store';
import { Location, WorkingDay, CommissionModel } from '../../types';

const LOCATION_EMOJI: Record<Location['type'], string> = {
  hospital: '\uD83C\uDFE5',
  own_clinic: '\uD83C\uDFE2',
  others_clinic: '\uD83C\uDFEA',
};

const LOCATION_TYPE_LABEL: Record<Location['type'], string> = {
  hospital: 'Hospital',
  own_clinic: 'Own Clinic',
  others_clinic: "Other's Clinic",
};

const DAY_FULL_LABELS: Record<WorkingDay['day'], string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const DAY_ORDER: WorkingDay['day'][] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const COMMISSION_TYPE_LABEL: Record<CommissionModel['type'], string> = {
  percentage: 'Percentage',
  fixed_per_patient: 'Fixed per Patient',
  fixed_per_visit: 'Fixed per Visit',
  rent: 'Monthly Rent',
  none: 'None',
};

// --- Glass Card Wrapper ---
const GlassCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) => (
  <View style={styles.glassCard}>
    <BlurView intensity={18} tint="light" style={styles.glassCardBlur}>
      <View style={styles.cardTitleRow}>
        <Ionicons name={icon} size={18} color={Colors.accent.main} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </BlurView>
  </View>
);

// --- Info Row ---
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

// --- Schedule Day Row ---
const ScheduleDayRow = ({ day }: { day: WorkingDay }) => (
  <View style={[styles.scheduleDayRow, !day.isActive && styles.scheduleDayInactive]}>
    <Text style={[styles.scheduleDayName, !day.isActive && styles.scheduleDayNameInactive]}>
      {DAY_FULL_LABELS[day.day]}
    </Text>
    <View style={styles.scheduleDayRight}>
      {day.isActive ? (
        <Text style={styles.scheduleDayTime}>
          {day.startTime} - {day.endTime}
        </Text>
      ) : (
        <Text style={styles.scheduleDayClosed}>Closed</Text>
      )}
      <View
        style={[
          styles.scheduleIndicator,
          { backgroundColor: day.isActive ? Colors.success : 'rgba(255,255,255,0.15)' },
        ]}
      />
    </View>
  </View>
);

// --- Main Screen ---
export default function LocationDetailScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { locationId } = route.params as { locationId: string };

  const { getLocationById, toggleLocationActive, deleteLocation } = useLocationStore();
  const location = getLocationById(locationId);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    navigation.navigate('EditLocation', { locationId });
  }, [navigation, locationId]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('location.deleteLocation', 'Delete Location'),
      t(
        'location.deleteConfirmation',
        'Are you sure you want to delete this location? This action cannot be undone.'
      ),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            deleteLocation(locationId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [t, deleteLocation, locationId, navigation]);

  const handleToggleActive = useCallback(() => {
    toggleLocationActive(locationId);
  }, [toggleLocationActive, locationId]);

  // Sort working days by proper order
  const sortedWorkingDays = useMemo(() => {
    if (!location) return [];
    return [...location.workingDays].sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
    );
  }, [location]);

  // Format commission value
  const commissionDisplay = useMemo(() => {
    if (!location) return '';
    const { commissionModel } = location;
    switch (commissionModel.type) {
      case 'percentage':
        return `${commissionModel.value}%`;
      case 'fixed_per_patient':
        return `\u20B9${commissionModel.value} / patient`;
      case 'fixed_per_visit':
        return `\u20B9${commissionModel.value} / visit`;
      case 'rent':
        return `\u20B9${commissionModel.value} / month`;
      case 'none':
        return 'N/A';
      default:
        return '';
    }
  }, [location]);

  const calculatedOnLabel = useMemo(() => {
    if (!location?.commissionModel.calculatedOn) return null;
    return location.commissionModel.calculatedOn === 'total_fee'
      ? 'Total Fee'
      : 'Fee minus Material';
  }, [location]);

  const settlementLabel = useMemo(() => {
    if (!location) return '';
    const freq = location.commissionModel.settlementFrequency;
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  }, [location]);

  if (!location) {
    return (
      <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
        <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
          <Text style={styles.errorText}>
            {t('location.notFound', 'Location not found')}
          </Text>
          <TouchableOpacity style={styles.backLink} onPress={handleBack}>
            <Text style={styles.backLinkText}>{t('common.goBack', 'Go Back')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const showOwnerInfo =
    (location.type === 'hospital' || location.type === 'others_clinic') &&
    (location.ownerName || location.ownerPhone);

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack} activeOpacity={0.7}>
          <BlurView intensity={20} tint="light" style={styles.headerButtonBlur}>
            <Ionicons name="chevron-back" size={22} color={Colors.text.primary} />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="light" style={styles.headerButtonBlur}>
              <Ionicons name="create-outline" size={20} color={Colors.text.primary} />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="light" style={styles.headerButtonDeleteBlur}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Type Badge */}
        <View style={styles.typeBadgeContainer}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeEmoji}>{LOCATION_EMOJI[location.type]}</Text>
            <Text style={styles.typeBadgeText}>{LOCATION_TYPE_LABEL[location.type]}</Text>
          </View>
        </View>

        {/* Location Name */}
        <Text style={styles.locationName}>{location.name}</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: location.isActive ? Colors.success : Colors.error },
            ]}
          />
          <Text style={styles.statusText}>
            {location.isActive
              ? t('location.active', 'Active')
              : t('location.inactive', 'Inactive')}
          </Text>
        </View>

        {/* Location Info Card */}
        <GlassCard
          title={t('location.locationInfo', 'Location Info')}
          icon="location-outline"
        >
          <InfoRow label={t('location.name', 'Name')} value={location.name} />
          <InfoRow label={t('location.address', 'Address')} value={location.address} />
          <InfoRow label={t('location.city', 'City')} value={location.city} />
          <InfoRow label={t('location.state', 'State')} value={location.state} />
          <InfoRow label={t('location.pincode', 'Pincode')} value={location.pincode} />
          <InfoRow label={t('location.phone', 'Phone')} value={location.phone} />
        </GlassCard>

        {/* Owner Info Card */}
        {showOwnerInfo && (
          <GlassCard
            title={t('location.ownerInfo', 'Owner Info')}
            icon="person-outline"
          >
            <InfoRow
              label={t('location.ownerName', 'Owner Name')}
              value={location.ownerName}
            />
            <InfoRow
              label={t('location.ownerPhone', 'Owner Phone')}
              value={location.ownerPhone}
            />
          </GlassCard>
        )}

        {/* Working Schedule Card */}
        <GlassCard
          title={t('location.workingSchedule', 'Working Schedule')}
          icon="calendar-outline"
        >
          {sortedWorkingDays.map((day) => (
            <ScheduleDayRow key={day.day} day={day} />
          ))}
          {sortedWorkingDays.length === 0 && (
            <Text style={styles.noDataText}>
              {t('location.noSchedule', 'No schedule configured')}
            </Text>
          )}
        </GlassCard>

        {/* Commission Model Card */}
        <GlassCard
          title={t('location.commissionModel', 'Commission Model')}
          icon="cash-outline"
        >
          <InfoRow
            label={t('location.type', 'Type')}
            value={COMMISSION_TYPE_LABEL[location.commissionModel.type]}
          />
          <InfoRow label={t('location.value', 'Value')} value={commissionDisplay} />
          {calculatedOnLabel && (
            <InfoRow
              label={t('location.calculatedOn', 'Calculated On')}
              value={calculatedOnLabel}
            />
          )}
          <InfoRow
            label={t('location.settlement', 'Settlement')}
            value={settlementLabel}
          />
        </GlassCard>

        {/* Quick Stats Card */}
        <GlassCard
          title={t('location.quickStats', 'Quick Stats')}
          icon="stats-chart-outline"
        >
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>0</Text>
              <Text style={styles.quickStatLabel}>
                {t('location.totalPatients', 'Total Patients')}
              </Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{'\u20B9'}0</Text>
              <Text style={styles.quickStatLabel}>
                {t('location.totalRevenue', 'Total Revenue')}
              </Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{'\u20B9'}0</Text>
              <Text style={styles.quickStatLabel}>
                {t('location.pendingCommission', 'Pending Commission')}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Active/Inactive Toggle */}
        <View style={styles.toggleCard}>
          <BlurView intensity={18} tint="light" style={styles.toggleCardBlur}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons
                  name={location.isActive ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={location.isActive ? Colors.success : Colors.error}
                />
                <View>
                  <Text style={styles.toggleTitle}>
                    {t('location.locationStatus', 'Location Status')}
                  </Text>
                  <Text style={styles.toggleSubtitle}>
                    {location.isActive
                      ? t('location.activeDescription', 'This location is currently active')
                      : t('location.inactiveDescription', 'This location is currently inactive')}
                  </Text>
                </View>
              </View>
              <Switch
                value={location.isActive}
                onValueChange={handleToggleActive}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(0, 230, 118, 0.4)' }}
                thumbColor={location.isActive ? Colors.accent.main : '#ccc'}
              />
            </View>
          </BlurView>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <BlurView intensity={18} tint="light" style={styles.deleteButtonBlur}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={styles.deleteButtonText}>
              {t('location.deleteLocation', 'Delete Location')}
            </Text>
          </BlurView>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  backLink: {
    marginTop: Spacing.lg,
  },
  backLinkText: {
    color: Colors.accent.main,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  headerButtonDeleteBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },

  // Type Badge
  typeBadgeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.sm,
  },
  typeBadgeEmoji: {
    fontSize: 18,
  },
  typeBadgeText: {
    color: Colors.text.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // Location Name
  locationName: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },

  // Glass Card
  glassCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  glassCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    flex: 1,
  },
  infoValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1.5,
    textAlign: 'right',
  },

  // Schedule Day Row
  scheduleDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  scheduleDayInactive: {
    opacity: 0.45,
  },
  scheduleDayName: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  scheduleDayNameInactive: {
    color: Colors.text.tertiary,
  },
  scheduleDayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scheduleDayTime: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  scheduleDayClosed: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  scheduleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noDataText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },

  // Quick Stats
  quickStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  quickStatValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  quickStatLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Toggle Card
  toggleCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  toggleCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  toggleTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  toggleSubtitle: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },

  // Delete Button
  deleteButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  deleteButtonBlur: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
