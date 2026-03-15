import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard, GlassButton, GlassInput, Avatar } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

const DoctorProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState('Dr. Pooja Gangare');
  const [email, setEmail] = useState('pooja@orthosync.in');
  const [phone, setPhone] = useState('9876543210');
  const [specialization, setSpecialization] = useState('Orthodontics');
  const [degree, setDegree] = useState('BDS, MDS (Orthodontics)');
  const [registrationNumber, setRegistrationNumber] = useState('MH-12345');

  // Settings state
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [gstEnabled, setGstEnabled] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: call authStore/doctorStore.updateProfile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('doctor.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('doctor.logout'),
          style: 'destructive',
          onPress: () => {
            // TODO: call authStore.logout
          },
        },
      ],
    );
  };

  const handleChangePhoto = () => {
    // TODO: implement image picker
    Alert.alert('Change Photo', 'Camera / Gallery picker will be implemented');
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('doctor.profile')}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
              activeOpacity={0.7}
            >
              {saving ? (
                <Text style={styles.editButtonText}>{t('common.loading')}</Text>
              ) : (
                <Text style={styles.editButtonText}>
                  {isEditing ? t('common.save') : t('common.edit')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar name={fullName} size="lg" />
              {isEditing && (
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleChangePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={18} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.avatarName}>{fullName}</Text>
            <Text style={styles.avatarSpecialization}>{specialization}</Text>
          </View>

          {/* Personal Info Card */}
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={Colors.accent.main} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            {isEditing ? (
              <>
                <GlassInput
                  label={t('doctor.fullName')}
                  value={fullName}
                  onChangeText={setFullName}
                  icon="person-outline"
                />
                <GlassInput
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  icon="mail-outline"
                  keyboardType="email-address"
                />
                <GlassInput
                  label={t('auth.phone')}
                  value={phone}
                  onChangeText={setPhone}
                  icon="call-outline"
                  keyboardType="phone-pad"
                />
                <GlassInput
                  label={t('doctor.specialization')}
                  value={specialization}
                  onChangeText={setSpecialization}
                  icon="medical-outline"
                />
                <GlassInput
                  label={t('doctor.degree')}
                  value={degree}
                  onChangeText={setDegree}
                  icon="school-outline"
                />
                <GlassInput
                  label={t('doctor.registrationNumber')}
                  value={registrationNumber}
                  onChangeText={setRegistrationNumber}
                  icon="document-text-outline"
                />
              </>
            ) : (
              <>
                <ProfileField icon="person-outline" label={t('doctor.fullName')} value={fullName} />
                <ProfileField icon="mail-outline" label={t('auth.email')} value={email} />
                <ProfileField icon="call-outline" label={t('auth.phone')} value={`+91 ${phone}`} />
                <ProfileField icon="medical-outline" label={t('doctor.specialization')} value={specialization} />
                <ProfileField icon="school-outline" label={t('doctor.degree')} value={degree} />
                <ProfileField icon="document-text-outline" label={t('doctor.registrationNumber')} value={registrationNumber} />
              </>
            )}
          </GlassCard>

          {/* App Settings Card */}
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color={Colors.accent.main} />
              <Text style={styles.sectionTitle}>{t('doctor.settings')}</Text>
            </View>

            {/* Language Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={20} color={Colors.text.secondary} />
                <Text style={styles.settingLabel}>{t('doctor.language')}</Text>
              </View>
              <View style={styles.languageToggle}>
                <TouchableOpacity
                  style={[
                    styles.langOption,
                    language === 'en' && styles.langOptionActive,
                  ]}
                  onPress={() => setLanguage('en')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      language === 'en' && styles.langOptionTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.langOption,
                    language === 'hi' && styles.langOptionActive,
                  ]}
                  onPress={() => setLanguage('hi')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      language === 'hi' && styles.langOptionTextActive,
                    ]}
                  >
                    HI
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* GST Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="receipt-outline" size={20} color={Colors.text.secondary} />
                <Text style={styles.settingLabel}>GST</Text>
              </View>
              <Switch
                value={gstEnabled}
                onValueChange={setGstEnabled}
                trackColor={{
                  false: Colors.glass.darkMedium,
                  true: Colors.accent.main,
                }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.glass.darkMedium}
              />
            </View>
          </GlassCard>

          {/* Subscription Card */}
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="diamond-outline" size={20} color={Colors.accent.main} />
              <Text style={styles.sectionTitle}>{t('doctor.subscription')}</Text>
            </View>

            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionPlan}>
                <Text style={styles.subscriptionPlanLabel}>Current Plan</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>FREE</Text>
                </View>
              </View>
              <View style={styles.subscriptionDetail}>
                <Text style={styles.subscriptionDetailLabel}>Photos Used</Text>
                <Text style={styles.subscriptionDetailValue}>12 / 50</Text>
              </View>
            </View>

            <GlassButton
              title="Upgrade Plan"
              onPress={() => {
                // TODO: navigate to subscription screen
              }}
              variant="glass"
              size="md"
              style={styles.upgradeButton}
            />
          </GlassCard>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutInner}>
              <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              <Text style={styles.logoutText}>{t('doctor.logout')}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

// Helper component for read-only profile fields
interface ProfileFieldProps {
  icon: string;
  label: string;
  value: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon, label, value }) => (
  <View style={fieldStyles.container}>
    <Ionicons
      name={icon as any}
      size={20}
      color={Colors.text.tertiary}
      style={fieldStyles.icon}
    />
    <View style={fieldStyles.textContainer}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Text style={fieldStyles.value}>{value}</Text>
    </View>
  </View>
);

const fieldStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.glass.borderLight,
  },
  icon: {
    marginRight: Spacing.md,
    width: 24,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.massive,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
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
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  editButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.whiteMedium,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  editButtonText: {
    color: Colors.accent.light,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  avatarSpecialization: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.glass.borderLight,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
    fontWeight: FontWeight.medium,
  },
  languageToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
  },
  langOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  langOptionActive: {
    backgroundColor: Colors.glass.greenStrong,
  },
  langOptionText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  langOptionTextActive: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  subscriptionPlan: {
    flex: 1,
  },
  subscriptionPlanLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.greenStrong,
  },
  planBadgeText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  subscriptionDetail: {
    alignItems: 'flex-end',
  },
  subscriptionDetailLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  subscriptionDetailValue: {
    fontSize: FontSize.lg,
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },
  upgradeButton: {
    marginTop: Spacing.xs,
  },
  logoutButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.30)',
    backgroundColor: 'rgba(244, 67, 54, 0.10)',
    overflow: 'hidden',
  },
  logoutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.sm,
  },
});

export default DoctorProfileScreen;
