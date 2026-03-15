import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard, GlassButton, GlassInput, Avatar } from '../../components/ui';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

const TOTAL_STEPS = 3;

const LOCATION_TYPES = [
  { key: 'own_clinic', label: 'Own Clinic', icon: 'business-outline' },
  { key: 'hospital', label: 'Hospital', icon: 'medkit-outline' },
  { key: 'others_clinic', label: "Other's Clinic", icon: 'home-outline' },
];

const DEFAULT_TREATMENTS = [
  { id: '1', name: 'Metal Braces', category: 'Orthodontics' },
  { id: '2', name: 'Ceramic Braces', category: 'Orthodontics' },
  { id: '3', name: 'Clear Aligners', category: 'Orthodontics' },
  { id: '4', name: 'Root Canal Treatment', category: 'Endodontics' },
  { id: '5', name: 'Dental Crown', category: 'Prosthodontics' },
  { id: '6', name: 'Teeth Whitening', category: 'Cosmetic' },
  { id: '7', name: 'Dental Implant', category: 'Prosthodontics' },
  { id: '8', name: 'Tooth Extraction', category: 'Oral Surgery' },
  { id: '9', name: 'Scaling & Polishing', category: 'Periodontics' },
  { id: '10', name: 'Composite Filling', category: 'General' },
  { id: '11', name: 'Dentures', category: 'Prosthodontics' },
  { id: '12', name: 'Retainer', category: 'Orthodontics' },
];

const DoctorSetupScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Profile
  const [fullName, setFullName] = useState('Dr. Pooja Gangare');
  const [specialization, setSpecialization] = useState('Orthodontics');
  const [degree, setDegree] = useState('BDS, MDS');

  // Step 2: Location
  const [locationType, setLocationType] = useState('own_clinic');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 3: Treatments
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const toggleTreatment = (id: string) => {
    setSelectedTreatments((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // TODO: call doctorStore.completeSetup
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Navigate to main app
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            {index > 0 && (
              <View
                style={[
                  styles.stepLine,
                  (isActive || isCompleted) && styles.stepLineActive,
                ]}
              />
            )}
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted,
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    (isActive || isCompleted) && styles.stepNumberActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderStep1 = () => (
    <>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{t('doctor.setupProfile')}</Text>
        <Text style={styles.stepSubtitle}>
          Confirm your profile information
        </Text>
      </View>

      <GlassCard style={styles.profileConfirmCard}>
        <View style={styles.profileCenter}>
          <TouchableOpacity activeOpacity={0.8} style={styles.avatarTouchable}>
            <Avatar name={fullName} size="lg" />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={18} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.addPhotoText}>Tap to add photo</Text>
        </View>

        <GlassInput
          label={t('doctor.fullName')}
          value={fullName}
          onChangeText={setFullName}
          icon="person-outline"
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
      </GlassCard>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Add Your First Location</Text>
        <Text style={styles.stepSubtitle}>
          Where do you practice?
        </Text>
      </View>

      {/* Location Type */}
      <GlassCard style={styles.sectionCard}>
        <Text style={styles.fieldGroupLabel}>Location Type</Text>
        <View style={styles.locationTypeRow}>
          {LOCATION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.locationTypeCard,
                locationType === type.key && styles.locationTypeCardActive,
              ]}
              onPress={() => setLocationType(type.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={
                  locationType === type.key
                    ? Colors.accent.main
                    : Colors.text.tertiary
                }
              />
              <Text
                style={[
                  styles.locationTypeLabel,
                  locationType === type.key && styles.locationTypeLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      <GlassCard style={styles.sectionCard}>
        <Text style={styles.fieldGroupLabel}>Location Details</Text>
        <GlassInput
          label="Location Name"
          value={locationName}
          onChangeText={setLocationName}
          placeholder="e.g., Smile Dental Clinic"
          icon="business-outline"
        />
        <GlassInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Full address"
          icon="location-outline"
          multiline
        />
        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <GlassInput
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="City"
            />
          </View>
          <View style={styles.halfInput}>
            <GlassInput
              label="Pincode"
              value={pincode}
              onChangeText={setPincode}
              placeholder="Pincode"
              keyboardType="number-pad"
            />
          </View>
        </View>
      </GlassCard>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Select Your Treatments</Text>
        <Text style={styles.stepSubtitle}>
          Choose the treatments you offer. You can add more later.
        </Text>
      </View>

      <GlassCard style={styles.sectionCard}>
        <View style={styles.treatmentSelectedCount}>
          <Text style={styles.treatmentCountText}>
            {selectedTreatments.length} selected
          </Text>
        </View>

        {DEFAULT_TREATMENTS.map((treatment) => {
          const isSelected = selectedTreatments.includes(treatment.id);
          return (
            <TouchableOpacity
              key={treatment.id}
              style={[
                styles.treatmentItem,
                isSelected && styles.treatmentItemActive,
              ]}
              onPress={() => toggleTreatment(treatment.id)}
              activeOpacity={0.7}
            >
              <View style={styles.treatmentInfo}>
                <Text
                  style={[
                    styles.treatmentName,
                    isSelected && styles.treatmentNameActive,
                  ]}
                >
                  {treatment.name}
                </Text>
                <Text style={styles.treatmentCategory}>{treatment.category}</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxActive,
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </GlassCard>
    </>
  );

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
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <View style={styles.navButtons}>
            {currentStep > 1 && (
              <GlassButton
                title={t('common.back')}
                onPress={handleBack}
                variant="outline"
                size="lg"
                style={styles.navButtonBack}
              />
            )}
            {currentStep < TOTAL_STEPS ? (
              <GlassButton
                title={t('common.next')}
                onPress={handleNext}
                variant="primary"
                size="lg"
                style={styles.navButtonNext}
              />
            ) : (
              <GlassButton
                title={t('auth.getStarted')}
                onPress={handleFinish}
                variant="primary"
                size="lg"
                loading={loading}
                style={styles.navButtonNext}
                icon={
                  <Ionicons name="rocket-outline" size={20} color={Colors.white} />
                }
              />
            )}
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
  },
  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.huge,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  stepCircleCompleted: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.accent.main,
  },
  stepNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.tertiary,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.glass.border,
    marginHorizontal: Spacing.sm,
  },
  stepLineActive: {
    backgroundColor: Colors.accent.main,
  },
  // Step Header
  stepHeader: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  // Step 1: Profile
  profileConfirmCard: {
    marginBottom: Spacing.lg,
  },
  profileCenter: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarTouchable: {
    position: 'relative',
  },
  cameraOverlay: {
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
  addPhotoText: {
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },
  // Step 2: Location
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  fieldGroupLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  locationTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationTypeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
  },
  locationTypeCardActive: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  locationTypeLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  locationTypeLabelActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },
  rowInputs: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.xs,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  // Step 3: Treatments
  treatmentSelectedCount: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  treatmentCountText: {
    fontSize: FontSize.sm,
    color: Colors.accent.light,
    fontWeight: FontWeight.semibold,
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
  },
  treatmentItemActive: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  treatmentInfo: {
    flex: 1,
  },
  treatmentName: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  treatmentNameActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },
  treatmentCategory: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  checkboxActive: {
    backgroundColor: Colors.accent.main,
    borderColor: Colors.accent.main,
  },
  // Navigation
  navButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  navButtonBack: {
    flex: 1,
    marginRight: Spacing.md,
  },
  navButtonNext: {
    flex: 1,
  },
});

export default DoctorSetupScreen;
