import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

export default function PatientsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('patient.patients')}</Text>
          <TouchableOpacity style={styles.addButton}>
            <BlurView intensity={20} tint="light" style={styles.addButtonBlur}>
              <Text style={styles.addIcon}>+</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <BlurView intensity={15} tint="light" style={styles.searchBlur}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('patient.searchPatient')}
              placeholderTextColor={Colors.text.tertiary}
            />
          </BlurView>
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>{t('common.noData')}</Text>
          <Text style={styles.emptySubtext}>Add your first patient to get started</Text>
        </View>
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
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    borderRadius: BorderRadius.round,
  },
  addIcon: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: FontWeight.bold,
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
  searchIcon: { fontSize: 18 },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
