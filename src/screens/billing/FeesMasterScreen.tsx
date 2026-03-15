import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useTreatmentStore, useBillingStore, usePatientStore, useLocationStore } from '../../store';
import { Treatment, Bill, BillItem, Installment } from '../../types';

// ==========================================
// Helpers
// ==========================================

const formatCurrency = (amount: number): string => {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
};

const CATEGORIES = [
  'All',
  'Orthodontics',
  'Oral Surgery',
  'Preventive',
  'Endodontics',
  'Prosthodontics',
  'Restorative',
  'Cosmetic',
];

// ==========================================
// Treatment Card Component
// ==========================================

interface TreatmentCardProps {
  treatment: Treatment;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (fee: number, equipmentCost: number) => void;
  onToggle: () => void;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  treatment,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onToggle,
}) => {
  const { t } = useTranslation();
  const [editFee, setEditFee] = useState(String(treatment.defaultFee));
  const [editEquipment, setEditEquipment] = useState(String(treatment.equipmentCost));

  const profit = isEditing
    ? (parseFloat(editFee) || 0) - (parseFloat(editEquipment) || 0)
    : treatment.defaultFee - treatment.equipmentCost;

  const handleSave = () => {
    const fee = parseFloat(editFee) || 0;
    const equipment = parseFloat(editEquipment) || 0;
    if (fee <= 0) {
      Alert.alert(t('common.error'), 'Fee must be greater than 0');
      return;
    }
    if (equipment < 0) {
      Alert.alert(t('common.error'), 'Equipment cost cannot be negative');
      return;
    }
    if (equipment >= fee) {
      Alert.alert(t('common.error'), 'Equipment cost must be less than fee');
      return;
    }
    onSave(fee, equipment);
  };

  return (
    <View style={styles.cardWrapper}>
      <BlurView intensity={15} tint="light" style={styles.cardBlur}>
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {treatment.name}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{treatment.category}</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            {!isEditing && (
              <TouchableOpacity onPress={onEdit} style={styles.editButton} activeOpacity={0.7}>
                <Ionicons name="pencil" size={16} color={Colors.accent.main} />
              </TouchableOpacity>
            )}
            <Switch
              value={treatment.isActive}
              onValueChange={onToggle}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: Colors.accent.dark }}
              thumbColor={treatment.isActive ? Colors.accent.main : 'rgba(255,255,255,0.5)'}
              ios_backgroundColor="rgba(255,255,255,0.2)"
            />
          </View>
        </View>

        {/* Fee Row */}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Fee:</Text>
          {isEditing ? (
            <TextInput
              style={styles.feeInput}
              value={editFee}
              onChangeText={setEditFee}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
              selectTextOnFocus
            />
          ) : (
            <Text style={styles.feeValue}>{formatCurrency(treatment.defaultFee)}</Text>
          )}
        </View>

        {/* Equipment Cost Row */}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Equipment:</Text>
          {isEditing ? (
            <TextInput
              style={styles.feeInput}
              value={editEquipment}
              onChangeText={setEditEquipment}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.text.tertiary}
              selectTextOnFocus
            />
          ) : (
            <Text style={styles.feeValue}>{formatCurrency(treatment.equipmentCost)}</Text>
          )}
        </View>

        {/* Profit Row */}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Profit:</Text>
          <Text style={[styles.feeValue, { color: profit >= 0 ? Colors.accent.main : Colors.error }]}>
            {formatCurrency(profit)}
          </Text>
        </View>

        {/* Stages Badge */}
        {treatment.stages && treatment.stages.length > 0 && (
          <View style={styles.stagesBadge}>
            <Ionicons name="layers-outline" size={14} color={Colors.text.secondary} />
            <Text style={styles.stagesBadgeText}>
              {treatment.stages.length} stage{treatment.stages.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={onCancelEdit}
              style={[styles.actionBtn, styles.cancelBtn]}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.actionBtn, styles.saveBtn]}
              activeOpacity={0.7}
            >
              <Text style={styles.saveBtnText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </View>
  );
};

// ==========================================
// Main Component
// ==========================================

const FeesMasterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const treatments = useTreatmentStore((s) => s.treatments);
  const updateTreatment = useTreatmentStore((s) => s.updateTreatment);
  const toggleTreatment = useTreatmentStore((s) => s.toggleTreatment);
  const addCustomTreatment = useTreatmentStore((s) => s.addCustomTreatment);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtered treatments
  const filteredTreatments = useMemo(() => {
    if (selectedCategory === 'All') return treatments;
    return treatments.filter((t) => t.category === selectedCategory);
  }, [treatments, selectedCategory]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const active = treatments.filter((t) => t.isActive);
    const totalActive = active.length;
    const avgFee = totalActive > 0
      ? Math.round(active.reduce((sum, t) => sum + t.defaultFee, 0) / totalActive)
      : 0;
    const categories = new Set(treatments.map((t) => t.category)).size;
    return { totalActive, avgFee, categories };
  }, [treatments]);

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleSave = useCallback(
    (id: string, fee: number, equipmentCost: number) => {
      updateTreatment(id, { defaultFee: fee, equipmentCost });
      setEditingId(null);
    },
    [updateTreatment]
  );

  const handleToggle = useCallback(
    (id: string) => {
      toggleTreatment(id);
    },
    [toggleTreatment]
  );

  const handleAddCustom = useCallback(() => {
    Alert.prompt
      ? Alert.prompt('New Treatment', 'Enter treatment name:', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: (name?: string) => {
              if (name && name.trim()) {
                const newTreatment: Treatment = {
                  id: `treat_custom_${Date.now()}`,
                  name: name.trim(),
                  category: 'Restorative',
                  defaultFee: 1000,
                  equipmentCost: 0,
                  stages: [],
                  isActive: true,
                };
                addCustomTreatment(newTreatment);
              }
            },
          },
        ])
      : Alert.alert('Add Custom Treatment', 'This feature uses native prompt on iOS.', [
          { text: 'OK' },
        ]);
  }, [addCustomTreatment]);

  const renderItem = useCallback(
    ({ item }: { item: Treatment }) => (
      <TreatmentCard
        treatment={item}
        isEditing={editingId === item.id}
        onEdit={() => handleEdit(item.id)}
        onCancelEdit={handleCancelEdit}
        onSave={(fee, equipment) => handleSave(item.id, fee, equipment)}
        onToggle={() => handleToggle(item.id)}
      />
    ),
    [editingId, handleEdit, handleCancelEdit, handleSave, handleToggle]
  );

  const keyExtractor = useCallback((item: Treatment) => item.id, []);

  const ListHeader = () => (
    <>
      {/* Summary Card */}
      <View style={styles.summaryWrapper}>
        <BlurView intensity={20} tint="light" style={styles.summaryBlur}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summaryStats.totalActive}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(summaryStats.avgFee)}</Text>
              <Text style={styles.summaryLabel}>Avg Fee</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summaryStats.categories}</Text>
              <Text style={styles.summaryLabel}>Categories</Text>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={styles.categoryContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? 's' : ''}
      </Text>
    </>
  );

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('billing.feesMaster')}</Text>
          <TouchableOpacity
            onPress={handleAddCustom}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.accent.main} />
            <Text style={styles.addButtonText}>Add Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Treatment List */}
        <FlatList
          data={filteredTreatments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>No treatments found</Text>
              <Text style={styles.emptySubtext}>Try a different category filter</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: insets.bottom + 20 }} />}
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default FeesMasterScreen;

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginLeft: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
  },
  addButtonText: {
    color: Colors.accent.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },

  // Summary
  summaryWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  summaryBlur: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.glass.borderLight,
  },

  // Category Filter
  categoryContainer: {
    marginBottom: Spacing.md,
  },
  categoryScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent.main,
    borderColor: Colors.accent.main,
  },
  categoryChipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  categoryChipTextActive: {
    color: Colors.primary[900],
    fontWeight: FontWeight.semibold,
  },
  resultsCount: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },

  // Treatment Card
  cardWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  cardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardName: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.glass.greenMedium,
  },
  categoryBadgeText: {
    color: Colors.accent.light,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Fee Rows
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  feeLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  feeValue: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  feeInput: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.accent.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minWidth: 100,
    textAlign: 'right',
  },

  // Stages
  stagesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.glass.white,
    alignSelf: 'flex-start',
  },
  stagesBadgeText: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },

  // Edit Actions
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glass.borderLight,
  },
  actionBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  cancelBtn: {
    backgroundColor: Colors.glass.white,
  },
  cancelBtnText: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  saveBtn: {
    backgroundColor: Colors.accent.main,
  },
  saveBtnText: {
    color: Colors.primary[900],
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.massive,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
