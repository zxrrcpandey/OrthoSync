// ==========================================
// OrthoSync - Theme Settings Screen
// Preview & select from 5 themes
// ==========================================

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEME_LIST, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { ThemeName, ThemeConfig } from '../../theme/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - CARD_GAP) / 2;
const MINI_PHONE_WIDTH = CARD_WIDTH - Spacing.xl * 2;
const MINI_PHONE_HEIGHT = MINI_PHONE_WIDTH * 1.72;

// ─── Glass Card Wrapper ──────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode;
  style?: object;
  blurTint?: 'light' | 'dark' | 'default';
  borderColor?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blurTint = 'light',
  borderColor,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.glassCard,
        {
          borderColor: borderColor || colors.glass.borderLight,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.glass.white },
        ]}
      />
      <View style={styles.glassCardContent}>{children}</View>
    </View>
  );
};

// ─── Mini Phone Mockup (inside theme card) ───────────────

interface MiniPhoneProps {
  themeConfig: ThemeConfig;
}

const MiniPhone: React.FC<MiniPhoneProps> = ({ themeConfig }) => {
  const tc = themeConfig.colors;
  return (
    <View
      style={[
        styles.miniPhone,
        {
          width: MINI_PHONE_WIDTH,
          height: MINI_PHONE_HEIGHT,
          borderColor: tc.glass.border,
        },
      ]}
    >
      <LinearGradient
        colors={[...tc.gradient.primary]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Status bar dots */}
      <View style={styles.miniStatusBar}>
        <View style={[styles.miniDot, { backgroundColor: tc.text.tertiary, width: 16, borderRadius: 2, height: 4 }]} />
        <View style={[styles.miniDot, { backgroundColor: tc.text.tertiary, width: 8, borderRadius: 2, height: 4 }]} />
      </View>
      {/* Mini glass card */}
      <View
        style={[
          styles.miniGlassCard,
          {
            borderColor: tc.glass.borderLight,
            backgroundColor: tc.glass.white,
          },
        ]}
      >
        <View style={styles.miniCircleRow}>
          <View
            style={[
              styles.miniCircle,
              { backgroundColor: tc.accent.main },
            ]}
          />
          <View
            style={[
              styles.miniCircle,
              { backgroundColor: tc.primary[500] },
            ]}
          />
        </View>
        <View
          style={[
            styles.miniLine,
            { backgroundColor: tc.text.secondary },
          ]}
        />
        <View
          style={[
            styles.miniLineShort,
            { backgroundColor: tc.text.tertiary },
          ]}
        />
      </View>
      {/* Mini button */}
      <View style={styles.miniButtonWrap}>
        <LinearGradient
          colors={[...tc.gradient.accent]}
          style={styles.miniButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={[styles.miniButtonLine, { backgroundColor: tc.text.primary }]} />
        </LinearGradient>
      </View>
    </View>
  );
};

// ─── Theme Card ──────────────────────────────────────────

interface ThemeCardProps {
  themeConfig: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  themeConfig,
  isSelected,
  onSelect,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onSelect}
      style={[
        styles.themeCardOuter,
        { width: CARD_WIDTH },
      ]}
    >
      <View
        style={[
          styles.themeCardContainer,
          {
            borderColor: isSelected
              ? colors.accent.main
              : colors.glass.borderLight,
            borderWidth: isSelected ? 2.5 : 1,
            backgroundColor: colors.glass.white,
            overflow: 'hidden',
          },
        ]}
      >
        <BlurView
          intensity={30}
          tint={colors.blurTint}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.glass.white },
          ]}
        />
        <View style={styles.themeCardInner}>
          <MiniPhone themeConfig={themeConfig} />
          {/* Selected badge */}
          {isSelected && (
            <View
              style={[
                styles.checkBadge,
                { backgroundColor: colors.accent.main },
              ]}
            >
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          )}
          <Text
            style={[
              styles.themeCardEmoji,
            ]}
          >
            {themeConfig.emoji}
          </Text>
          <Text
            style={[
              styles.themeCardName,
              {
                color: isSelected ? colors.accent.main : colors.text.primary,
              },
            ]}
            numberOfLines={1}
          >
            {themeConfig.label}
          </Text>
          <Text
            style={[
              styles.themeCardDesc,
              { color: colors.text.tertiary },
            ]}
            numberOfLines={2}
          >
            {themeConfig.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ─────────────────────────────────────────

const ThemeSettingsScreen: React.FC = () => {
  const { colors, theme, setTheme, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Split themes for 2-col grid: first 4 in pairs, 5th centered
  const topRows = THEME_LIST.slice(0, 4);
  const lastTheme = THEME_LIST.length > 4 ? THEME_LIST[4] : null;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[...colors.gradient.primary]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: insets.bottom + Spacing.huge,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.glass.white }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Theme Settings
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Current Theme Card ─────────────────── */}
        <GlassCard blurTint={colors.blurTint} style={styles.currentCard}>
          <Text style={[styles.currentLabel, { color: colors.text.secondary }]}>
            Current Theme
          </Text>
          <View style={styles.currentRow}>
            <Text style={styles.currentEmoji}>{theme.emoji}</Text>
            <Text style={[styles.currentName, { color: colors.text.primary }]}>
              {theme.label}
            </Text>
          </View>
          <Text style={[styles.currentDesc, { color: colors.text.tertiary }]}>
            {theme.description}
          </Text>
        </GlassCard>

        {/* ── Theme Gallery ──────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Choose Your Theme
        </Text>

        {/* Grid rows (pairs of 2) */}
        {Array.from({ length: Math.ceil(topRows.length / 2) }).map(
          (_, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {topRows.slice(rowIdx * 2, rowIdx * 2 + 2).map((tc) => (
                <ThemeCard
                  key={tc.name}
                  themeConfig={tc}
                  isSelected={tc.name === themeName}
                  onSelect={() => setTheme(tc.name)}
                />
              ))}
            </View>
          ),
        )}

        {/* 5th card centered */}
        {lastTheme && (
          <View style={styles.gridRowCenter}>
            <ThemeCard
              themeConfig={lastTheme}
              isSelected={lastTheme.name === themeName}
              onSelect={() => setTheme(lastTheme.name)}
            />
          </View>
        )}

        {/* ── Live Preview Section ───────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Preview
        </Text>

        <GlassCard blurTint={colors.blurTint} style={styles.previewCard}>
          {/* Sample stat card */}
          <View
            style={[
              styles.previewStatCard,
              {
                backgroundColor: colors.glass.whiteMedium,
                borderColor: colors.glass.borderLight,
              },
            ]}
          >
            <Text style={[styles.previewStatNumber, { color: colors.accent.main }]}>
              128
            </Text>
            <Text style={[styles.previewStatLabel, { color: colors.text.secondary }]}>
              Total Patients
            </Text>
          </View>

          {/* Sample button */}
          <LinearGradient
            colors={[...colors.gradient.accent]}
            style={styles.previewButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.previewButtonText, { color: colors.text.primary }]}>
              Sample Button
            </Text>
          </LinearGradient>

          {/* Status badges */}
          <View style={styles.previewBadgeRow}>
            <View
              style={[
                styles.previewBadge,
                { backgroundColor: colors.status.scheduled + '30' },
              ]}
            >
              <View
                style={[styles.previewBadgeDot, { backgroundColor: colors.status.scheduled }]}
              />
              <Text style={[styles.previewBadgeText, { color: colors.status.scheduled }]}>
                Scheduled
              </Text>
            </View>
            <View
              style={[
                styles.previewBadge,
                { backgroundColor: colors.status.completed + '30' },
              ]}
            >
              <View
                style={[styles.previewBadgeDot, { backgroundColor: colors.status.completed }]}
              />
              <Text style={[styles.previewBadgeText, { color: colors.status.completed }]}>
                Completed
              </Text>
            </View>
            <View
              style={[
                styles.previewBadge,
                { backgroundColor: colors.status.missed + '30' },
              ]}
            >
              <View
                style={[styles.previewBadgeDot, { backgroundColor: colors.status.missed }]}
              />
              <Text style={[styles.previewBadgeText, { color: colors.status.missed }]}>
                Missed
              </Text>
            </View>
          </View>

          {/* Text color samples */}
          <View style={styles.previewTextSamples}>
            <Text style={[styles.previewTextPrimary, { color: colors.text.primary }]}>
              Primary Text
            </Text>
            <Text style={[styles.previewTextSecondary, { color: colors.text.secondary }]}>
              Secondary Text
            </Text>
            <Text style={[styles.previewTextTertiary, { color: colors.text.tertiary }]}>
              Tertiary Text
            </Text>
          </View>
        </GlassCard>

        {/* ── Apply Note ─────────────────────────── */}
        <View style={styles.applyNote}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.text.tertiary}
          />
          <Text style={[styles.applyNoteText, { color: colors.text.tertiary }]}>
            Theme is applied instantly across the entire app
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ThemeSettingsScreen;

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  headerSpacer: {
    width: 38,
  },

  // Glass card
  glassCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  glassCardContent: {
    padding: Spacing.lg,
  },

  // Current theme
  currentCard: {
    marginBottom: Spacing.xxl,
  },
  currentLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  currentEmoji: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  currentName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
  },
  currentDesc: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },

  // Section title
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },

  // Grid
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  gridRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },

  // Theme card
  themeCardOuter: {
    // width set inline
  },
  themeCardContainer: {
    borderRadius: BorderRadius.xl,
  },
  themeCardInner: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  themeCardEmoji: {
    fontSize: 20,
    marginTop: Spacing.sm,
  },
  themeCardName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  themeCardDesc: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },

  // Mini phone
  miniPhone: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  miniStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: Spacing.sm,
  },
  miniDot: {
    height: 4,
    borderRadius: 2,
  },
  miniGlassCard: {
    width: '90%',
    borderRadius: 6,
    borderWidth: 1,
    padding: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  miniCircleRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  miniCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  miniLine: {
    width: '70%',
    height: 3,
    borderRadius: 1.5,
    marginBottom: 3,
    opacity: 0.6,
  },
  miniLineShort: {
    width: '45%',
    height: 3,
    borderRadius: 1.5,
    opacity: 0.4,
  },
  miniButtonWrap: {
    width: '80%',
    marginTop: Spacing.xs,
  },
  miniButton: {
    borderRadius: 4,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniButtonLine: {
    width: '50%',
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },

  // Preview section
  previewCard: {
    marginBottom: Spacing.lg,
  },
  previewStatCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewStatNumber: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
  },
  previewStatLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  previewButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  previewBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  previewTextSamples: {
    gap: Spacing.xs,
  },
  previewTextPrimary: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  previewTextSecondary: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  previewTextTertiary: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },

  // Apply note
  applyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  applyNoteText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
