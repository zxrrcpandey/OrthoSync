import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useLocationStore } from '../../store';
import { Location } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'all' | 'own_clinic' | 'hospital' | 'others_clinic';

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

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

// --- Stat Card ---
const StatCard = ({ title, value, emoji }: { title: string; value: string; emoji: string }) => (
  <View style={styles.statCard}>
    <BlurView intensity={20} tint="light" style={styles.statCardBlur}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </BlurView>
  </View>
);

// --- Filter Chip ---
const FilterChip = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.filterChip, isActive && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// --- Commission Badge ---
const CommissionBadge = ({ commission }: { commission: Location['commissionModel'] }) => {
  let label = '';
  switch (commission.type) {
    case 'percentage':
      label = `${commission.value}%`;
      break;
    case 'fixed_per_patient':
      label = `\u20B9${commission.value}/patient`;
      break;
    case 'fixed_per_visit':
      label = `\u20B9${commission.value}/visit`;
      break;
    case 'rent':
      label = `Rent \u20B9${commission.value}`;
      break;
    case 'none':
      label = 'No Commission';
      break;
  }

  return (
    <View style={styles.commissionBadge}>
      <Text style={styles.commissionBadgeText}>{label}</Text>
    </View>
  );
};

// --- Day Badges ---
const DayBadges = ({ workingDays }: { workingDays: Location['workingDays'] }) => {
  const activeDays = new Set(
    workingDays.filter((d) => d.isActive).map((d) => d.day)
  );

  return (
    <View style={styles.dayBadgesRow}>
      {DAY_KEYS.map((key, index) => (
        <View
          key={key}
          style={[
            styles.dayBadge,
            activeDays.has(key) ? styles.dayBadgeActive : styles.dayBadgeInactive,
          ]}
        >
          <Text
            style={[
              styles.dayBadgeText,
              activeDays.has(key) ? styles.dayBadgeTextActive : styles.dayBadgeTextInactive,
            ]}
          >
            {DAY_LABELS[index]}
          </Text>
        </View>
      ))}
    </View>
  );
};

// --- Location Card ---
const LocationCard = ({
  location,
  onPress,
}: {
  location: Location;
  onPress: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.locationCard} onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={18} tint="light" style={styles.locationCardBlur}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.locationEmoji}>{LOCATION_EMOJI[location.type]}</Text>
            <View style={styles.cardHeaderInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.locationName} numberOfLines={1}>
                  {location.name}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: location.isActive ? Colors.success : Colors.error },
                  ]}
                />
              </View>
              <Text style={styles.locationType}>
                {LOCATION_TYPE_LABEL[location.type]}
              </Text>
            </View>
          </View>
          <CommissionBadge commission={location.commissionModel} />
        </View>

        <Text style={styles.locationAddress} numberOfLines={2}>
          {location.address}
          {location.city ? `, ${location.city}` : ''}
        </Text>

        {(location.type === 'hospital' || location.type === 'others_clinic') &&
          location.ownerName && (
            <View style={styles.ownerRow}>
              <Ionicons name="person-outline" size={14} color={Colors.text.tertiary} />
              <Text style={styles.ownerText}>{location.ownerName}</Text>
            </View>
          )}

        <DayBadges workingDays={location.workingDays} />
      </BlurView>
    </TouchableOpacity>
  );
};

// --- Main Screen ---
export default function LocationsListScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { locations } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const totalLocations = locations.length;
  const activeLocations = locations.filter((l) => l.isActive).length;
  const typeBreakdown = useMemo(() => {
    const own = locations.filter((l) => l.type === 'own_clinic').length;
    const hosp = locations.filter((l) => l.type === 'hospital').length;
    const other = locations.filter((l) => l.type === 'others_clinic').length;
    return `${own}/${hosp}/${other}`;
  }, [locations]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    let result = locations;

    if (activeFilter !== 'all') {
      result = result.filter((l) => l.type === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.address.toLowerCase().includes(query) ||
          l.city?.toLowerCase().includes(query) ||
          l.ownerName?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [locations, activeFilter, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleAddLocation = useCallback(() => {
    navigation.navigate('AddLocation');
  }, [navigation]);

  const handleLocationPress = useCallback(
    (locationId: string) => {
      navigation.navigate('LocationDetail', { locationId });
    },
    [navigation]
  );

  const renderLocationCard = useCallback(
    ({ item }: { item: Location }) => (
      <LocationCard location={item} onPress={() => handleLocationPress(item.id)} />
    ),
    [handleLocationPress]
  );

  const keyExtractor = useCallback((item: Location) => item.id, []);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('common.all', 'All') },
    { key: 'own_clinic', label: t('location.ownClinic', 'Own Clinic') },
    { key: 'hospital', label: t('location.hospital', 'Hospital') },
    { key: 'others_clinic', label: t('location.othersClinic', "Other's Clinic") },
  ];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <BlurView intensity={15} tint="light" style={styles.emptyBlur}>
        <Text style={styles.emptyEmoji}>{'\uD83C\uDFE5'}</Text>
        <Text style={styles.emptyTitle}>{t('location.noLocations', 'No Locations Yet')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('location.addFirstLocation', 'Add your first clinic or hospital location to get started')}
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddLocation} activeOpacity={0.7}>
          <Text style={styles.emptyButtonText}>{t('location.addLocation', 'Add Location')}</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );

  const renderListHeader = () => (
    <>
      {/* Stats Bar */}
      <View style={styles.statsRow}>
        <StatCard
          emoji={'\uD83D\uDCCD'}
          title={t('location.total', 'Total')}
          value={String(totalLocations)}
        />
        <StatCard
          emoji={'\u2705'}
          title={t('location.active', 'Active')}
          value={String(activeLocations)}
        />
        <StatCard
          emoji={'\uD83D\uDCCA'}
          title={t('location.types', 'Own/Hosp/Oth')}
          value={typeBreakdown}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={18} tint="light" style={styles.searchBlur}>
          <Ionicons name="search-outline" size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('location.searchPlaceholder', 'Search locations...')}
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {filters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            isActive={activeFilter === filter.key}
            onPress={() => setActiveFilter(filter.key)}
          />
        ))}
      </ScrollView>
    </>
  );

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.headerTitle}>{t('location.locations', 'Locations')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddLocation} activeOpacity={0.7}>
          <BlurView intensity={20} tint="light" style={styles.addButtonBlur}>
            <Ionicons name="add" size={24} color={Colors.text.primary} />
          </BlurView>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLocations}
        renderItem={renderLocationCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          filteredLocations.length === 0 && styles.listContentEmpty,
        ]}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.text.primary}
          />
        }
        ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  addButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    height: 90,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  statCardBlur: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  statTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    marginTop: 2,
    textAlign: 'center',
  },

  // Search
  searchContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    padding: 0,
  },

  // Filters
  filtersScroll: {
    marginBottom: Spacing.lg,
  },
  filtersContainer: {
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: Colors.accent.main,
    borderColor: Colors.accent.main,
  },
  filterChipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  filterChipTextActive: {
    color: '#1B5E20',
    fontWeight: FontWeight.semibold,
  },

  // Location Card
  locationCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  locationCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  locationEmoji: {
    fontSize: 32,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  locationName: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationType: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  locationAddress: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  ownerText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
  },

  // Commission Badge
  commissionBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  commissionBadgeText: {
    color: Colors.accent.main,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  // Day Badges
  dayBadgesRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  dayBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  dayBadgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  dayBadgeTextActive: {
    color: Colors.accent.main,
  },
  dayBadgeTextInactive: {
    color: Colors.text.tertiary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  emptyBlur: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.accent.main,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  emptyButtonText: {
    color: '#1B5E20',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
