import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PatientPhoto } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhotoGridProps {
  photos: PatientPhoto[];
  columns?: number;
  onPhotoPress?: (photo: PatientPhoto) => void;
  onAddPress?: () => void;
  showAddButton?: boolean;
  emptyMessage?: string;
  filterCategory?: string | null;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  columns = 3,
  onPhotoPress,
  onAddPress,
  showAddButton = true,
  emptyMessage = 'No photos yet',
  filterCategory,
}) => {
  const gap = Spacing.sm;
  const totalGaps = (columns - 1) * gap + Spacing.lg * 2;
  const itemWidth = (SCREEN_WIDTH - totalGaps) / columns;

  const filteredPhotos = filterCategory
    ? photos.filter((p) => p.category.startsWith(filterCategory))
    : photos;

  const getCategoryLabel = (category: PatientPhoto['category']): string => {
    const labels: Record<PatientPhoto['category'], string> = {
      extraoral_front: 'Extraoral',
      extraoral_side: 'Extraoral',
      intraoral: 'Intraoral',
      xray: 'X-Ray',
      opg: 'OPG',
      cephalogram: 'Cephalo',
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
      });
    } catch {
      return dateStr;
    }
  };

  if (filteredPhotos.length === 0 && !showAddButton) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={48} color={Colors.text.tertiary} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const renderPhotoItem = (photo: PatientPhoto) => (
    <TouchableOpacity
      key={photo.id}
      style={[styles.photoItem, { width: itemWidth, height: itemWidth }]}
      activeOpacity={0.8}
      onPress={() => onPhotoPress?.(photo)}
    >
      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
      <View style={styles.photoOverlay}>
        <Text style={styles.categoryLabel} numberOfLines={1}>
          {getCategoryLabel(photo.category)}
        </Text>
        <Text style={styles.dateLabel} numberOfLines={1}>
          {formatDate(photo.takenAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAddButton = () => (
    <TouchableOpacity
      key="add-photo"
      style={[styles.addButton, { width: itemWidth, height: itemWidth }]}
      activeOpacity={0.7}
      onPress={onAddPress}
    >
      <Ionicons name="add" size={32} color={Colors.accent.main} />
      <Text style={styles.addButtonText}>Add</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.gridContainer}>
      {filteredPhotos.length === 0 && (
        <View style={styles.emptyInlineContainer}>
          <Ionicons name="images-outline" size={36} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
      <View style={styles.grid}>
        {showAddButton && renderAddButton()}
        {filteredPhotos.map(renderPhotoItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoItem: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  categoryLabel: {
    color: Colors.text.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  dateLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.regular,
  },
  addButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.glass.borderLight,
    borderStyle: 'dashed',
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyInlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  emptyText: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
});

export default PhotoGrid;
