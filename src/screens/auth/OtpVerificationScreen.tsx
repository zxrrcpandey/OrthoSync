import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard, GlassButton } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

type OtpVerificationParams = {
  OtpVerification: { phone: string };
};

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 30;

const OtpVerificationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<OtpVerificationParams, 'OtpVerification'>>();
  const phone = route.params?.phone ?? '+91 XXXXX';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '');
      if (digit.length > 1) {
        // Handle paste
        const digits = digit.slice(0, OTP_LENGTH).split('');
        const newOtp = [...otp];
        digits.forEach((d, i) => {
          if (index + i < OTP_LENGTH) {
            newOtp[index + i] = d;
          }
        });
        setOtp(newOtp);
        const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
        return;
      }

      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) return;

    setLoading(true);
    try {
      // TODO: call authStore.verifyOtp
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    // TODO: call authStore.resendOtp
  };

  const maskedPhone = phone.length > 5
    ? `${phone.slice(0, phone.length - 5)}XXXXX`
    : phone;

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
              <Ionicons name="shield-checkmark" size={48} color={Colors.accent.main} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('auth.verifyOtp')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.enterOtp')} {maskedPhone}
          </Text>

          {/* OTP Inputs */}
          <GlassCard style={styles.otpCard}>
            <View style={styles.otpRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    otp[index] ? styles.otpBoxFilled : undefined,
                  ]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    value={otp[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="number-pad"
                    maxLength={OTP_LENGTH}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Verify Button */}
          <GlassButton
            title={t('auth.verifyOtp')}
            onPress={handleVerify}
            variant="primary"
            size="lg"
            loading={loading}
            disabled={otp.join('').length !== OTP_LENGTH}
            style={styles.verifyButton}
          />

          {/* Resend */}
          <View style={styles.resendRow}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendActive}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendText}>
                Resend OTP in{' '}
                <Text style={styles.resendTimer}>{countdown}s</Text>
              </Text>
            )}
          </View>
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
  },
  otpCard: {
    marginBottom: Spacing.xxl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  otpBoxFilled: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  verifyButton: {
    marginBottom: Spacing.xl,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  resendTimer: {
    color: Colors.accent.light,
    fontWeight: FontWeight.bold,
  },
  resendActive: {
    color: Colors.accent.light,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textDecorationLine: 'underline',
  },
});

export default OtpVerificationScreen;
