import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppointmentStore, useLocationStore } from '../../store';
import { Appointment } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COLORS: Record<Appointment['status'], string> = {
  scheduled: Colors.status.scheduled,
  completed: Colors.status.completed,
  missed: Colors.status.missed,
  cancelled: Colors.status.cancelled,
  hold: Colors.status.hold,
};

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  dateString: string;
}

function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarDay[] = [];

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ day, isCurrentMonth: false, dateString });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: true, dateString });
  }

  // Trailing days to fill 6 rows (42 cells)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: false, dateString });
  }

  return cells;
}

function formatSelectedDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = MONTH_NAMES;
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getStatusLabel(status: Appointment['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Location color palette for dots
const LOCATION_COLORS = [
  '#2196F3', '#E91E63', '#FF9800', '#9C27B0', '#00BCD4',
  '#FF5722', '#607D8B', '#795548', '#3F51B5', '#009688',
];

export default function CalendarViewScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | null>(null);

  const { appointments, getAppointmentsByDate, getAppointmentsByDateRange } = useAppointmentStore();
  const { getActiveLocations } = useLocationStore();

  const activeLocations = useMemo(() => getActiveLocations(), [getActiveLocations, appointments]);

  // Build location color map
  const locationColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    activeLocations.forEach((loc, index) => {
      map[loc.id] = LOCATION_COLORS[index % LOCATION_COLORS.length];
    });
    return map;
  }, [activeLocations]);

  const calendarGrid = useMemo(
    () => buildCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  // Get all appointments for the current month to compute dots
  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(new Date(currentYear, currentMonth + 1, 0).getDate()).padStart(2, '0')}`;

  const monthAppointments = useMemo(
    () => getAppointmentsByDateRange(monthStart, monthEnd),
    [getAppointmentsByDateRange, monthStart, monthEnd, appointments],
  );

  // Group appointments by date for dot display
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    monthAppointments.forEach((appt) => {
      if (!map[appt.date]) map[appt.date] = [];
      map[appt.date].push(appt);
    });
    return map;
  }, [monthAppointments]);

  // Get appointments for selected date, filtered by location
  const selectedDayAppointments = useMemo(() => {
    let appts = getAppointmentsByDate(selectedDate);
    if (selectedLocationFilter) {
      appts = appts.filter((a) => a.locationId === selectedLocationFilter);
    }
    return appts.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [getAppointmentsByDate, selectedDate, selectedLocationFilter, appointments]);

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const handleAddAppointment = useCallback(() => {
    navigation.navigate('AddAppointment', { date: selectedDate });
  }, [navigation, selectedDate]);

  const handleAppointmentPress = useCallback(
    (appointment: Appointment) => {
      navigation.navigate('AppointmentDetail', { appointmentId: appointment.id });
    },
    [navigation],
  );

  const renderDayCell = useCallback(
    (cell: CalendarDay, index: number) => {
      const isToday = cell.dateString === todayString;
      const isSelected = cell.dateString === selectedDate;
      const dayAppts = appointmentsByDate[cell.dateString] || [];

      // Get unique dot colors (by location)
      const dotColors: string[] = [];
      const seenLocations = new Set<string>();
      dayAppts.forEach((appt) => {
        if (!seenLocations.has(appt.locationId)) {
          seenLocations.add(appt.locationId);
          dotColors.push(locationColorMap[appt.locationId] || Colors.status.scheduled);
        }
      });

      return (
        <TouchableOpacity
          key={`${cell.dateString}-${index}`}
          style={[
            styles.dayCell,
            isSelected && styles.dayCellSelected,
          ]}
          onPress={() => setSelectedDate(cell.dateString)}
          activeOpacity={0.6}
        >
          <View style={[styles.dayNumberContainer, isToday && styles.todayCircle]}>
            <Text
              style={[
                styles.dayNumber,
                !cell.isCurrentMonth && styles.dayNumberDimmed,
                isToday && styles.dayNumberToday,
              ]}
            >
              {cell.day}
            </Text>
          </View>
          <View style={styles.dotsRow}>
            {dotColors.slice(0, 3).map((color, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: color }]} />
            ))}
          </View>
        </TouchableOpacity>
      );
    },
    [todayString, selectedDate, appointmentsByDate, locationColorMap],
  );

  const renderAppointmentCard = useCallback(
    ({ item }: { item: Appointment }) => {
      const locColor = locationColorMap[item.locationId] || Colors.status.scheduled;
      const statusColor = STATUS_COLORS[item.status];

      return (
        <TouchableOpacity
          style={styles.appointmentCard}
          onPress={() => handleAppointmentPress(item)}
          activeOpacity={0.7}
        >
          <BlurView intensity={15} tint="light" style={styles.appointmentCardBlur}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentTime}>
                {item.startTime} - {item.endTime}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
              </View>
            </View>

            <Text style={styles.appointmentPatient}>{item.patientName}</Text>

            <View style={styles.appointmentLocationRow}>
              <View style={[styles.locationDot, { backgroundColor: locColor }]} />
              <Text style={styles.appointmentLocation}>{item.locationName}</Text>
            </View>

            {item.treatmentId && (
              <Text style={styles.appointmentTreatment}>
                {t('calendar.treatment', { defaultValue: 'Treatment linked' })}
              </Text>
            )}
          </BlurView>
        </TouchableOpacity>
      );
    },
    [locationColorMap, handleAppointmentPress, t],
  );

  const renderLocationChip = useCallback(
    (locationId: string | null, label: string) => {
      const isActive = selectedLocationFilter === locationId;
      return (
        <TouchableOpacity
          key={locationId || 'all'}
          style={[styles.chip, isActive && styles.chipActive]}
          onPress={() => setSelectedLocationFilter(locationId)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
      );
    },
    [selectedLocationFilter],
  );

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('calendar.title', { defaultValue: 'Calendar' })}</Text>
          <TouchableOpacity onPress={handleAddAppointment} activeOpacity={0.7}>
            <LinearGradient
              colors={[Colors.accent.dark, Colors.accent.main]}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavCard}>
          <BlurView intensity={20} tint="light" style={styles.monthNavBlur}>
            <TouchableOpacity onPress={goToPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarCard}>
          <BlurView intensity={20} tint="light" style={styles.calendarCardBlur}>
            {/* Day Headers */}
            <View style={styles.dayHeadersRow}>
              {DAY_LABELS.map((label, i) => (
                <View key={i} style={styles.dayHeaderCell}>
                  <Text style={styles.dayHeaderText}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Date Cells */}
            <View style={styles.calendarGridContainer}>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <View key={rowIndex} style={styles.calendarRow}>
                  {calendarGrid.slice(rowIndex * 7, rowIndex * 7 + 7).map((cell, colIndex) =>
                    renderDayCell(cell, rowIndex * 7 + colIndex),
                  )}
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Location Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScrollView}
          contentContainerStyle={styles.chipContainer}
        >
          {renderLocationChip(null, t('common.all', { defaultValue: 'All' }))}
          {activeLocations.map((loc) => renderLocationChip(loc.id, loc.name))}
        </ScrollView>

        {/* Selected Day Appointments */}
        <Text style={styles.selectedDateLabel}>{formatSelectedDate(selectedDate)}</Text>

        {selectedDayAppointments.length > 0 ? (
          <FlatList
            data={selectedDayAppointments}
            renderItem={renderAppointmentCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.appointmentsList}
          />
        ) : (
          <View style={styles.emptyCard}>
            <BlurView intensity={15} tint="light" style={styles.emptyCardBlur}>
              <Ionicons name="calendar-outline" size={40} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>
                {t('calendar.noAppointments', { defaultValue: 'No appointments for this day' })}
              </Text>
            </BlurView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + Spacing.xl }]}
        onPress={handleAddAppointment}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.accent.dark, Colors.accent.main]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Month Navigation
  monthNavCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  monthNavBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  monthTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },

  // Calendar Grid
  calendarCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  calendarCardBlur: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dayHeaderText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  calendarGridContainer: {},
  calendarRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    minHeight: 48,
    borderRadius: BorderRadius.sm,
  },
  dayCellSelected: {
    borderWidth: 1.5,
    borderColor: Colors.accent.main,
    borderRadius: BorderRadius.sm,
  },
  dayNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    backgroundColor: Colors.accent.dark,
  },
  dayNumber: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  dayNumberDimmed: {
    color: Colors.text.tertiary,
  },
  dayNumberToday: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
    height: 6,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  // Location Filter Chips
  chipScrollView: {
    marginBottom: Spacing.lg,
  },
  chipContainer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  chipActive: {
    backgroundColor: Colors.glass.greenMedium,
    borderColor: Colors.accent.main,
  },
  chipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  chipTextActive: {
    color: Colors.accent.main,
    fontWeight: FontWeight.semibold,
  },

  // Selected Date
  selectedDateLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },

  // Appointment Cards
  appointmentsList: {
    gap: Spacing.md,
  },
  appointmentCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  appointmentCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  appointmentTime: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  appointmentPatient: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  appointmentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  appointmentLocation: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
  appointmentTreatment: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },

  // Empty State
  emptyCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  emptyCardBlur: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 6,
    shadowColor: Colors.accent.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
