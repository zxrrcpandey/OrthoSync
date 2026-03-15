import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTreatmentStore, usePatientStore } from '../../store';
import { TreatmentVisit, PatientPhoto } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

// ==========================================
// AddTreatmentVisitScreen
// ==========================================

const AddTreatmentVisitScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const treatmentId = route.params?.treatmentId as string;
  const patientId = route.params?.patientId as string;

  const getTreatmentById = useTreatmentStore((s) => s.getTreatmentById);
  const addVisitToTreatment = useTreatmentStore((s) => s.addVisitToTreatment);
  const treatments = useTreatmentStore((s) => s.treatments);
  const addPhotoToPatient = usePatientStore((s) => s.addPhotoToPatient);

  const treatment = getTreatmentById(treatmentId);

  // Resolve master treatment for stage definitions
  const masterTreatment = useMemo(() => {
    if (!treatment) return undefined;
    return treatments.find((t) => t.id === treatment.treatmentId);
  }, [treatment, treatments]);

  const stages = masterTreatment?.stages ?? [];
  const hasStages = stages.length > 0;

  // ---- Form state ----
  const today = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(today);
  const [procedureDone, setProcedureDone] = useState('');
  const [selectedStage, setSelectedStage] = useState<string | undefined>(
    treatment?.currentStage ?? undefined,
  );
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<{ uri: string; id: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ---- Photo picker ----
  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: () => pickImage('camera'),
      },
      {
        text: 'Gallery',
        onPress: () => pickImage('gallery'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const photoId = `vphoto_${Date.now()}_${photos.length}`;
        setPhotos((prev) => [...prev, { uri: asset.uri, id: photoId }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // ---- Save ----
  const handleSave = () => {
    if (!procedureDone.trim()) {
      Alert.alert('Required', 'Please enter the procedure done during this visit.');
      return;
    }

    setIsSaving(true);

    try {
      const visitId = `visit_${Date.now()}`;

      // Build visit photos
      const visitPhotos: PatientPhoto[] = photos.map((p, index) => ({
        id: p.id,
        uri: p.uri,
        category: 'other' as const,
        visitId,
        caption: `Visit photo - ${procedureDone.trim()}`,
        takenAt: visitDate,
      }));

      // Resolve stage name for display
      const stageName = selectedStage
        ? stages.find((s) => s.id === selectedStage)?.name ?? selectedStage
        : undefined;

      const visit: TreatmentVisit = {
        id: visitId,
        date: visitDate,
        procedureDone: procedureDone.trim(),
        notes: notes.trim(),
        photos: visitPhotos,
        stage: stageName,
      };

      // Add visit to treatment
      addVisitToTreatment(treatmentId, visit);

      // Also add photos to patient's photo gallery
      visitPhotos.forEach((photo) => {
        addPhotoToPatient(patientId, photo);
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save visit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Missing treatment ----
  if (!treatment) {
    return (
      <LinearGradient colors={[...Colors.gradient.primary]} style={styles.flex}>
        <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.text.tertiary} />
          <Text style={styles.missingTitle}>Treatment Not Found</Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
            <Text style={styles.backButtonLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...Colors.gradient.primary]} style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxxl + 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== Header ===== */}
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Add Visit</Text>

            <TouchableOpacity
              style={[styles.headerButton, styles.saveHeaderButton]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <Ionicons
                name="checkmark"
                size={22}
                color={isSaving ? Colors.text.tertiary : Colors.accent.main}
              />
            </TouchableOpacity>
          </View>

          {/* Treatment context */}
          <View style={styles.contextBadge}>
            <Ionicons name="medical-outline" size={14} color={Colors.accent.main} />
            <Text style={styles.contextBadgeText}>{treatment.treatmentName}</Text>
          </View>

          {/* ===== Section 1 - Visit Date ===== */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Visit Date</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color={Colors.accent.main} />
              <TextInput
                style={styles.textInput}
                value={visitDate}
                onChangeText={setVisitDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="default"
              />
            </View>
          </View>

          {/* ===== Section 2 - Procedure ===== */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Procedure Done *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="construct-outline" size={20} color={Colors.accent.main} />
              <TextInput
                style={styles.textInput}
                value={procedureDone}
                onChangeText={setProcedureDone}
                placeholder="e.g., Wire change, Bracket bonding..."
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            {/* Stage selector (chips) */}
            {hasStages && (
              <View style={styles.stageSection}>
                <Text style={styles.stageLabel}>Stage</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.stageChipsContainer}
                >
                  {stages.map((stage) => {
                    const isSelected = selectedStage === stage.id;
                    return (
                      <TouchableOpacity
                        key={stage.id}
                        style={[styles.stageChip, isSelected && styles.stageChipSelected]}
                        onPress={() =>
                          setSelectedStage(isSelected ? undefined : stage.id)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.stageChipText,
                            isSelected && styles.stageChipTextSelected,
                          ]}
                        >
                          {stage.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* ===== Section 3 - Notes ===== */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes for this visit..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* ===== Section 4 - Visit Photos ===== */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Visit Photos</Text>

            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoSlot}>
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.photoRemoveButton}
                    onPress={() => handleRemovePhoto(photo.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add photo button */}
              <TouchableOpacity
                style={styles.addPhotoSlot}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={28} color={Colors.text.tertiary} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* ===== Bottom Save Button ===== */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[...Colors.gradient.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors.text.dark}
              />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Visit'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  // ---- Missing ----
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  missingTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.lg,
  },
  backButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent.main,
    marginTop: Spacing.xxl,
  },
  backButtonLargeText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  saveHeaderButton: {
    backgroundColor: Colors.glass.greenMedium,
    borderColor: Colors.accent.main,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },

  // ---- Context badge ----
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    marginBottom: Spacing.md,
  },
  contextBadgeText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // ---- Glass Card ----
  glassCard: {
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },

  // ---- Input ----
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    paddingVertical: Spacing.xs,
  },
  textArea: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    minHeight: 100,
  },

  // ---- Stage chips ----
  stageSection: {
    marginTop: Spacing.lg,
  },
  stageLabel: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  stageChipsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stageChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  stageChipSelected: {
    backgroundColor: Colors.glass.greenMedium,
    borderColor: Colors.accent.main,
  },
  stageChipText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  stageChipTextSelected: {
    color: Colors.accent.main,
    fontWeight: FontWeight.semibold,
  },

  // ---- Photo Grid ----
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  photoSlot: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 11,
  },
  addPhotoSlot: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.glass.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  addPhotoText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // ---- Bottom Bar ----
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: 'rgba(27, 94, 32, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.glass.borderLight,
  },
  saveButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  saveButtonText: {
    color: Colors.text.dark,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});

export default AddTreatmentVisitScreen;
