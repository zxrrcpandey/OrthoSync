import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard, GlassButton, GlassInput } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

const SPECIALIZATIONS = [
  'Orthodontics',
  'General Dentistry',
  'Endodontics',
  'Prosthodontics',
  'Periodontics',
  'Oral Surgery',
  'Pedodontics',
  'Other',
];

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showSpecPicker, setShowSpecPicker] = useState(false);
  const [degree, setDegree] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // TODO: call authStore.register
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <GradientBackground>
        <View style={styles.centeredContainer}>
          <GlassCard style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.accent.main} />
            </View>
            <Text style={styles.successTitle}>{t('auth.register')}</Text>
            <Text style={styles.successMessage}>
              {t('auth.verificationPending')}
            </Text>
            <GlassButton
              title={t('auth.login')}
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              size="lg"
              style={styles.successButton}
            />
          </GlassCard>
        </View>
      </GradientBackground>
    );
  }

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
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.subtitle}>
            Join OrthoSync and manage your practice effortlessly
          </Text>

          {/* Personal Info Card */}
          <GlassCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <GlassInput
              label={t('doctor.fullName')}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Dr. John Doe"
              icon="person-outline"
            />

            <GlassInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="doctor@example.com"
              icon="mail-outline"
              keyboardType="email-address"
            />

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
                />
              </View>
            </View>
          </GlassCard>

          {/* Security Card */}
          <GlassCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Security</Text>

            <GlassInput
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
              icon="lock-closed-outline"
              secureTextEntry
            />

            <GlassInput
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              icon="lock-closed-outline"
              secureTextEntry
            />
          </GlassCard>

          {/* Professional Info Card */}
          <GlassCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Professional Details</Text>

            {/* Specialization Picker */}
            <Text style={styles.fieldLabel}>{t('doctor.specialization')}</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowSpecPicker(!showSpecPicker)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="medical-outline"
                size={20}
                color={Colors.text.secondary}
                style={styles.pickerIcon}
              />
              <Text
                style={[
                  styles.pickerText,
                  !specialization && styles.pickerPlaceholder,
                ]}
              >
                {specialization || 'Select specialization'}
              </Text>
              <Ionicons
                name={showSpecPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.text.secondary}
              />
            </TouchableOpacity>

            {showSpecPicker && (
              <View style={styles.pickerDropdown}>
                {SPECIALIZATIONS.map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[
                      styles.pickerOption,
                      specialization === spec && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      setSpecialization(spec);
                      setShowSpecPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        specialization === spec && styles.pickerOptionTextActive,
                      ]}
                    >
                      {spec}
                    </Text>
                    {specialization === spec && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.accent.main}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <GlassInput
              label={t('doctor.degree')}
              value={degree}
              onChangeText={setDegree}
              placeholder="BDS, MDS (Orthodontics)"
              icon="school-outline"
            />

            <GlassInput
              label={t('doctor.registrationNumber')}
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              placeholder="DCI/State Reg. Number"
              icon="document-text-outline"
            />
          </GlassCard>

          {/* Register Button */}
          <GlassButton
            title={t('auth.register')}
            onPress={handleRegister}
            variant="primary"
            size="lg"
            loading={loading}
            style={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.bottomLinkRow}>
            <Text style={styles.bottomLinkText}>{t('auth.hasAccount')} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomLinkAction}>{t('auth.login')}</Text>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.massive,
    paddingTop: Spacing.md,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xxl,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
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
  fieldLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  pickerButton: {
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  pickerIcon: {
    marginRight: Spacing.sm,
  },
  pickerText: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  pickerPlaceholder: {
    color: Colors.text.tertiary,
  },
  pickerDropdown: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.whiteMedium,
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.glass.borderLight,
  },
  pickerOptionActive: {
    backgroundColor: Colors.glass.greenMedium,
  },
  pickerOptionText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
  },
  pickerOptionTextActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },
  registerButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
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
  successCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  successIcon: {
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  successMessage: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  successButton: {
    width: '100%',
  },
});

export default RegisterScreen;
