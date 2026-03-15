import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard, GlassButton, GlassInput } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

type LoginTab = 'email' | 'phone';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<LoginTab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      // TODO: call authStore.login
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      // TODO: call authStore.sendOtp
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigation.navigate('OtpVerification', { phone: `+91${phone}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="medical" size={48} color={Colors.accent.main} />
            </View>
            <Text style={styles.appName}>{t('common.appName')}</Text>
            <Text style={styles.tagline}>{t('common.tagline')}</Text>
          </View>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>{t('auth.welcomeBack')}</Text>

          {/* Tab Selector */}
          <GlassCard style={styles.tabCard}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'email' && styles.tabActive]}
                onPress={() => setActiveTab('email')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={activeTab === 'email' ? Colors.white : Colors.text.tertiary}
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'email' && styles.tabTextActive,
                  ]}
                >
                  {t('auth.email')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'phone' && styles.tabActive]}
                onPress={() => setActiveTab('phone')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={activeTab === 'phone' ? Colors.white : Colors.text.tertiary}
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'phone' && styles.tabTextActive,
                  ]}
                >
                  {t('auth.phone')}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Form Card */}
          <GlassCard style={styles.formCard}>
            {activeTab === 'email' ? (
              <>
                <GlassInput
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="doctor@example.com"
                  icon="mail-outline"
                  keyboardType="email-address"
                />
                <GlassInput
                  label={t('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  icon="lock-closed-outline"
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.forgotPasswordRow}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>
                    {t('auth.forgotPassword')}
                  </Text>
                </TouchableOpacity>
                <GlassButton
                  title={t('auth.login')}
                  onPress={handleEmailLogin}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  style={styles.submitButton}
                />
              </>
            ) : (
              <>
                <Text style={styles.phoneLabel}>{t('auth.phone')}</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.prefixBox}>
                    <Text style={styles.prefixText}>+91</Text>
                  </View>
                  <View style={styles.phoneInputWrapper}>
                    <GlassInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="9876543210"
                      keyboardType="phone-pad"
                      icon="call-outline"
                    />
                  </View>
                </View>
                <GlassButton
                  title={t('auth.sendOtp')}
                  onPress={handleSendOtp}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  style={styles.submitButton}
                />
              </>
            )}
          </GlassCard>

          {/* Register Link */}
          <View style={styles.bottomLinkRow}>
            <Text style={styles.bottomLinkText}>{t('auth.noAccount')} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomLinkAction}>{t('auth.register')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.glass.whiteMedium,
    borderWidth: 2,
    borderColor: Colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extrabold,
    color: Colors.text.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  welcomeText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  tabCard: {
    marginBottom: Spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.glass.greenStrong,
  },
  tabIcon: {
    marginRight: Spacing.xs,
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    color: Colors.accent.light,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  phoneLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  prefixBox: {
    height: 50,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.whiteMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  prefixText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLinkText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  bottomLinkAction: {
    color: Colors.accent.light,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});

export default LoginScreen;
