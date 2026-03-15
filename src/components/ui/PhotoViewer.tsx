import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PatientPhoto } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoViewerProps {
  visible: boolean;
  photo: PatientPhoto | null;
  onClose: () => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ visible, photo, onClose }) => {
  const insets = useSafeAreaInsets();

  if (!photo) return null;

  const getCategoryLabel = (category: PatientPhoto['category']): string => {
    const labels: Record<PatientPhoto['category'], string> = {
      extraoral_front: 'Extraoral - Front',
      extraoral_side: 'Extraoral - Side',
      intraoral: 'Intraoral',
      xray: 'X-Ray',
      opg: 'OPG',
      cephalogram: 'Cephalogram',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Close button */}
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + Spacing.md }]}
          activeOpacity={0.7}
          onPress={onClose}
        >
          <View style={styles.closeButtonBg}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </View>
        </TouchableOpacity>

        {/* Full-screen image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Photo info at bottom */}
        <View style={[styles.infoContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(photo.category)}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(photo.takenAt)}</Text>
          {photo.caption ? (
            <Text style={styles.captionText}>{photo.caption}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    zIndex: 10,
  },
  closeButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  infoContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.glass.greenMedium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  dateText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  captionText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    marginTop: Spacing.sm,
  },
});

export default PhotoViewer;
