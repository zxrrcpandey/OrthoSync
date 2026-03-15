import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard, GlassButton, GlassInput } from '../../components/ui';
import { Colors, Spacing, FontSize, FontWeight } from '../../theme';

const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      // TODO: call authStore.sendResetLink
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={sent ? 'mail-open' : 'lock-open'}
                size={48}
                color={Colors.accent.main}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {sent ? 'Check Your Email' : t('auth.resetPassword')}
          </Text>
          <Text style={styles.subtitle}>
            {sent
              ? `We've sent a password reset link to ${email}. Please check your inbox.`
              : 'Enter your registered email address and we\'ll send you a link to reset your password.'}
          </Text>

          {!sent ? (
            <>
              <GlassCard style={styles.formCard}>
                <GlassInput
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="doctor@example.com"
                  icon="mail-outline"
                  keyboardType="email-address"
                />
              </GlassCard>

              <GlassButton
                title="Send Reset Link"
                onPress={handleSendReset}
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!email.trim()}
                style={styles.sendButton}
              />
            </>
          ) : (
            <GlassButton
              title="Open Email App"
              onPress={() => {
                // Could use Linking.openURL('mailto:') here
              }}
              variant="glass"
              size="lg"
              style={styles.sendButton}
            />
          )}

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={Colors.accent.light}
              style={styles.backToLoginIcon}
            />
            <Text style={styles.backToLoginText}>
              {t('common.back')} to {t('auth.login')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.glass.whiteMedium,
    borderWidth: 2,
    borderColor: Colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  formCard: {
    marginBottom: Spacing.xxl,
  },
  sendButton: {
    marginBottom: Spacing.xxl,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToLoginIcon: {
    marginRight: Spacing.xs,
  },
  backToLoginText: {
    color: Colors.accent.light,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});

export default ForgotPasswordScreen;
