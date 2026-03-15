import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePatientStore, useLocationStore } from '../../store';
import { Patient, PatientPhoto } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ==========================================
// Types & Constants
// ==========================================

type Gender = 'male' | 'female' | 'other';

type PhotoCategory = PatientPhoto['category'];

interface PhotoCategoryItem {
  key: PhotoCategory;
  label: string;
  emoji: string;
}

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PHOTO_CATEGORIES: PhotoCategoryItem[] = [
  { key: 'extraoral_front', label: 'Extraoral Front', emoji: '\uD83D\uDCF8' },
  { key: 'extraoral_side', label: 'Extraoral Side', emoji: '\uD83D\uDCF8' },
  { key: 'intraoral', label: 'Intraoral', emoji: '\uD83D\uDCF8' },
  { key: 'xray', label: 'X-Ray', emoji: '\uD83D\uDCF8' },
  { key: 'opg', label: 'OPG', emoji: '\uD83D\uDCF8' },
  { key: 'cephalogram', label: 'Cephalogram', emoji: '\uD83D\uDCF8' },
];

// ==========================================
// Component
// ==========================================

const AddPatientScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { addPatient, generatePatientId } = usePatientStore();
  const { getActiveLocations } = useLocationStore();

  const activeLocations = getActiveLocations();

  // --- Form State ---
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [categoryPhotos, setCategoryPhotos] = useState<Record<string, PatientPhoto>>({});
  const [saving, setSaving] = useState(false);

  // --- Image Picker ---
  const showImagePickerAlert = useCallback(
    (onImageSelected: (uri: string) => void) => {
      Alert.alert(
        t('patient.selectPhoto', 'Select Photo'),
        t('patient.chooseOption', 'Choose an option'),
        [
          {
            text: t('common.cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: t('patient.takePhoto', 'Take Photo'),
            onPress: async () => {
              const permission = await ImagePicker.requestCameraPermissionsAsync();
              if (!permission.granted) {
                Alert.alert(
                  t('common.error', 'Error'),
                  t('patient.cameraPermission', 'Camera permission is required'),
                );
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                onImageSelected(result.assets[0].uri);
              }
            },
          },
          {
            text: t('patient.chooseFromGallery', 'Choose from Gallery'),
            onPress: async () => {
              const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permission.granted) {
                Alert.alert(
                  t('common.error', 'Error'),
                  t('patient.galleryPermission', 'Gallery permission is required'),
                );
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                onImageSelected(result.assets[0].uri);
              }
            },
          },
        ],
      );
    },
    [t],
  );

  const handleProfilePhotoPick = useCallback(() => {
    showImagePickerAlert((uri) => setProfilePhoto(uri));
  }, [showImagePickerAlert]);

  const handleCategoryPhotoPick = useCallback(
    (category: PhotoCategory) => {
      showImagePickerAlert((uri) => {
        const photo: PatientPhoto = {
          id: `photo_${Date.now()}_${category}`,
          uri,
          category,
          takenAt: new Date().toISOString(),
        };
        setCategoryPhotos((prev) => ({ ...prev, [category]: photo }));
      });
    },
    [showImagePickerAlert],
  );

  const handleRemoveCategoryPhoto = useCallback((category: PhotoCategory) => {
    setCategoryPhotos((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  }, []);

  const toggleLocation = useCallback((locationId: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId],
    );
  }, []);

  // --- Validation & Save ---
  const handleSave = useCallback(() => {
    if (!fullName.trim()) {
      Alert.alert(t('common.error', 'Error'), t('patient.nameRequired', 'Full name is required'));
      return;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert(t('common.error', 'Error'), t('patient.ageRequired', 'Valid age is required'));
      return;
    }
    if (!gender) {
      Alert.alert(t('common.error', 'Error'), t('patient.genderRequired', 'Gender is required'));
      return;
    }
    if (!phone.trim()) {
      Alert.alert(t('common.error', 'Error'), t('patient.phoneRequired', 'Phone number is required'));
      return;
    }

    setSaving(true);

    const photos: PatientPhoto[] = Object.values(categoryPhotos);

    const now = new Date().toISOString();
    const patientId = generatePatientId();

    const newPatient: Patient = {
      id: `patient_${Date.now()}`,
      patientId,
      doctorId: '', // Will be set by the store/backend
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      medicalHistory: medicalHistory.trim() || undefined,
      allergies: allergies.trim() || undefined,
      bloodGroup: bloodGroup || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      locationIds: selectedLocationIds,
      photos,
      createdAt: now,
      updatedAt: now,
    };

    addPatient(newPatient);
    setSaving(false);
    navigation.goBack();
  }, [
    fullName, age, gender, phone, email, address, city,
    medicalHistory, allergies, bloodGroup, emergencyContact,
    selectedLocationIds, categoryPhotos, t,
    addPatient, generatePatientId, navigation,
  ]);

  // ==========================================
  // Render Helpers
  // ==========================================

  const renderGlassInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: {
      placeholder?: string;
      multiline?: boolean;
      keyboardType?: TextInput['props']['keyboardType'];
      icon?: string;
      required?: boolean;
      prefix?: string;
    },
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {options?.required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <BlurView intensity={20} tint="light" style={styles.inputBlur}>
        <View style={styles.inputInner}>
          {options?.icon && (
            <Ionicons
              name={options.icon as any}
              size={18}
              color={Colors.text.tertiary}
              style={styles.inputIcon}
            />
          )}
          {options?.prefix && (
            <Text style={styles.inputPrefix}>{options.prefix}</Text>
          )}
          <TextInput
            style={[
              styles.textInput,
              options?.multiline && styles.textInputMultiline,
              (options?.icon || options?.prefix) && styles.textInputWithIcon,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={options?.placeholder || ''}
            placeholderTextColor={Colors.text.tertiary}
            multiline={options?.multiline}
            numberOfLines={options?.multiline ? 3 : 1}
            keyboardType={options?.keyboardType}
            selectionColor={Colors.accent.main}
          />
        </View>
      </BlurView>
    </View>
  );

  // ==========================================
  // Section Renderers
  // ==========================================

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {t('patient.addPatient', 'Add Patient')}
      </Text>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleSave}
        activeOpacity={0.7}
        disabled={saving}
      >
        <Ionicons name="checkmark" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderProfilePhotoSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={[styles.cardContent, styles.cardContentCentered]}>
          <TouchableOpacity
            style={styles.profilePhotoContainer}
            onPress={handleProfilePhotoPick}
            activeOpacity={0.7}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Ionicons name="person-outline" size={40} color={Colors.text.tertiary} />
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profilePhotoLabel}>
            {t('patient.tapToAddPhoto', 'Tap to add photo')}
          </Text>
        </View>
      </BlurView>
    </View>
  );

  const renderPersonalInfoSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('patient.personalInformation', 'Personal Information')}
          </Text>

          {renderGlassInput(
            t('patient.fullName', 'Full Name'),
            fullName,
            setFullName,
            {
              placeholder: 'Enter full name',
              icon: 'person-outline',
              required: true,
            },
          )}

          {renderGlassInput(
            t('patient.age', 'Age'),
            age,
            setAge,
            {
              placeholder: 'Enter age',
              keyboardType: 'numeric',
              icon: 'calendar-outline',
              required: true,
            },
          )}

          {/* Gender Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {t('patient.gender', 'Gender')}
              <Text style={styles.requiredStar}> *</Text>
            </Text>
            <View style={styles.chipsRow}>
              {GENDER_OPTIONS.map((option) => {
                const isSelected = gender === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setGender(option.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {renderGlassInput(
            t('patient.phone', 'Phone'),
            phone,
            setPhone,
            {
              placeholder: 'Enter phone number',
              keyboardType: 'phone-pad',
              prefix: '+91',
              required: true,
            },
          )}

          {renderGlassInput(
            t('patient.email', 'Email'),
            email,
            setEmail,
            {
              placeholder: 'Enter email (optional)',
              keyboardType: 'email-address',
              icon: 'mail-outline',
            },
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderAddressSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('patient.address', 'Address')}
          </Text>

          {renderGlassInput(
            t('patient.addressField', 'Address'),
            address,
            setAddress,
            {
              placeholder: 'Enter address',
              multiline: true,
              icon: 'location-outline',
            },
          )}

          {renderGlassInput(
            t('patient.city', 'City'),
            city,
            setCity,
            {
              placeholder: 'Enter city',
              icon: 'business-outline',
            },
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderMedicalInfoSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('patient.medicalInformation', 'Medical Information')}
          </Text>

          {/* Blood Group */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {t('patient.bloodGroup', 'Blood Group')}
            </Text>
            <View style={styles.chipsRow}>
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = bloodGroup === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.chip, styles.chipSmall, isSelected && styles.chipActive]}
                    onPress={() => setBloodGroup(isSelected ? null : bg)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {renderGlassInput(
            t('patient.medicalHistory', 'Medical History'),
            medicalHistory,
            setMedicalHistory,
            {
              placeholder: 'Enter relevant medical history',
              multiline: true,
              icon: 'document-text-outline',
            },
          )}

          {renderGlassInput(
            t('patient.allergies', 'Allergies'),
            allergies,
            setAllergies,
            {
              placeholder: 'Enter known allergies',
              multiline: true,
              icon: 'warning-outline',
            },
          )}

          {renderGlassInput(
            t('patient.emergencyContact', 'Emergency Contact'),
            emergencyContact,
            setEmergencyContact,
            {
              placeholder: 'Emergency contact number',
              keyboardType: 'phone-pad',
              icon: 'call-outline',
            },
          )}
        </View>
      </BlurView>
    </View>
  );

  const renderLocationSection = () => {
    if (activeLocations.length === 0) return null;

    return (
      <View style={styles.sectionWrapper}>
        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionTitle}>
              {t('patient.primaryLocation', 'Primary Location')}
            </Text>
            <View style={styles.chipsRow}>
              {activeLocations.map((location) => {
                const isSelected = selectedLocationIds.includes(location.id);
                return (
                  <TouchableOpacity
                    key={location.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleLocation(location.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'location-outline'}
                      size={14}
                      color={isSelected ? Colors.accent.main : Colors.text.tertiary}
                      style={styles.chipIcon}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {location.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderDentalPhotosSection = () => (
    <View style={styles.sectionWrapper}>
      <BlurView intensity={25} tint="light" style={styles.glassCard}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>
            {t('patient.dentalPhotos', 'Dental Photos')}
          </Text>

          <View style={styles.photoGrid}>
            {PHOTO_CATEGORIES.map((cat) => {
              const photo = categoryPhotos[cat.key];
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={styles.photoCategoryCard}
                  onPress={() => handleCategoryPhotoPick(cat.key)}
                  activeOpacity={0.7}
                >
                  {photo ? (
                    <View style={styles.photoThumbnailContainer}>
                      <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                      <TouchableOpacity
                        style={styles.photoDeleteButton}
                        onPress={() => handleRemoveCategoryPhoto(cat.key)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera-outline" size={28} color={Colors.text.tertiary} />
                    </View>
                  )}
                  <Text style={styles.photoCategoryLabel} numberOfLines={1}>
                    {cat.emoji} {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BlurView>
    </View>
  );

  const renderRegisterButton = () => (
    <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + Spacing.lg }]}>
      <TouchableOpacity
        style={styles.saveButtonWrapper}
        onPress={handleSave}
        activeOpacity={0.8}
        disabled={saving}
      >
        <LinearGradient
          colors={[Colors.accent.dark, Colors.accent.main]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButtonGradient}
        >
          <Ionicons
            name="person-add-outline"
            size={20}
            color={Colors.white}
            style={styles.saveButtonIcon}
          />
          <Text style={styles.saveButtonText}>
            {t('patient.registerPatient', 'Register Patient')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ==========================================
  // Main Render
  // ==========================================

  return (
    <LinearGradient
      colors={Colors.gradient.primary}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderProfilePhotoSection()}
          {renderPersonalInfoSection()}
          {renderAddressSection()}
          {renderMedicalInfoSection()}
          {renderLocationSection()}
          {renderDentalPhotosSection()}
          {renderRegisterButton()}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.massive,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },

  // --- Section Wrapper ---
  sectionWrapper: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  glassCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  cardContent: {
    padding: Spacing.xl,
  },
  cardContentCentered: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },

  // --- Profile Photo ---
  profilePhotoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.glass.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profilePhotoLabel: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.text.tertiary,
    fontWeight: FontWeight.medium,
  },

  // --- Glass Input ---
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  requiredStar: {
    color: Colors.error,
    fontSize: FontSize.sm,
  },
  inputBlur: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.white,
    minHeight: 48,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  inputPrefix: {
    marginLeft: Spacing.md,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textInputWithIcon: {
    paddingLeft: Spacing.sm,
  },

  // --- Chips ---
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipSmall: {
    paddingHorizontal: Spacing.md,
  },
  chipActive: {
    borderColor: Colors.accent.main,
    backgroundColor: Colors.glass.greenMedium,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.tertiary,
  },
  chipTextActive: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },
  chipIcon: {
    marginRight: Spacing.xs,
  },

  // --- Dental Photos Grid ---
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  photoCategoryCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  photoThumbnailContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  photoDeleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glass.white,
    borderWidth: 1.5,
    borderColor: Colors.glass.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCategoryLabel: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // --- Bottom Buttons ---
  bottomButtons: {
    marginTop: Spacing.lg,
  },
  saveButtonWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  saveButtonIcon: {
    marginRight: Spacing.sm,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});

export default AddPatientScreen;
