import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, FontWeight } from '../../theme';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.title}>{t('appointment.calendar')}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>{t('common.noData')}</Text>
          <Text style={styles.emptySubtext}>Your appointments will appear here</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg },
  title: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
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
