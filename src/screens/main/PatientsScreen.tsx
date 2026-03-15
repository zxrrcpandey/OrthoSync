import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { usePatientStore } from '../../store';
import { PatientsStackParamList } from '../../navigation/types';
import { Patient } from '../../types';

type Nav = NativeStackNavigationProp<PatientsStackParamList>;

const PatientCard = ({ patient, onPress }: { patient: Patient; onPress: () => void }) => {
  const initials = patient.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={15} tint="light" style={styles.cardBlur}>
        <View style={styles.cardAvatar}>
          <Text style={styles.cardAvatarText}>{initials}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{patient.fullName}</Text>
          <Text style={styles.cardSubtext}>
            {patient.patientId} • {patient.age}y • {patient.gender}
          </Text>
          <Text style={styles.cardPhone}>📱 +91 {patient.phone}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardPhotos}>📷 {patient.photos.length}</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

export default function PatientsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const patients = usePatientStore((s) => s.patients);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  }, [patients, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('patient.patients')}</Text>
            <Text style={styles.subtitle}>
              {patients.length} {t('dashboard.totalPatients').toLowerCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPatient')}
          >
            <LinearGradient
              colors={[Colors.accent.main, Colors.accent.dark] as const}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={26} color={Colors.primary[900]} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <BlurView intensity={15} tint="light" style={styles.searchBlur}>
            <Ionicons name="search" size={18} color={Colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('patient.searchPatient')}
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {/* Patient List */}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PatientCard
              patient={item}
              onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyTitle}>{t('common.noData')}</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'No patients match your search' : 'Add your first patient to get started'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('AddPatient')}
                >
                  <LinearGradient
                    colors={[Colors.accent.main, Colors.accent.dark] as const}
                    style={styles.emptyButtonGradient}
                  >
                    <Text style={styles.emptyButtonText}>{t('patient.addPatient')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  list: {
    paddingBottom: 120,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  cardBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.md,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glass.greenMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.glass.border,
  },
  cardAvatarText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  cardInfo: { flex: 1 },
  cardName: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  cardSubtext: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  cardPhone: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  cardPhotos: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: { fontSize: 60, marginBottom: Spacing.lg },
  emptyTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },
  emptySubtext: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.xxl,
  },
  emptyButtonGradient: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    color: Colors.primary[900],
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});
