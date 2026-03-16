import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useTheme } from '../../theme';
import { useBillingStore } from '../../store';
import { BillingStackParamList } from '../../navigation/types';
import { Bill } from '../../types';
import type { ThemeColors } from '../../theme';

type Nav = NativeStackNavigationProp<BillingStackParamList>;

const formatCurrency = (amount: number): string =>
  '₹' + amount.toLocaleString('en-IN');

const BillCard = ({ bill, onPress, colors }: { bill: Bill; onPress: () => void; colors: ThemeColors }) => {
  const statusColors: Record<string, string> = {
    paid: Colors.success,
    partial: Colors.warning,
    pending: '#FFC107',
    overdue: Colors.error,
  };
  return (
    <TouchableOpacity style={styles.billCard} onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={15} tint="light" style={[styles.billCardBlur, { borderColor: colors.glass.borderLight }]}>
        <View style={styles.billCardHeader}>
          <Text style={[styles.billCardId, { color: colors.text.secondary }]}>#{bill.id.slice(-6).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[bill.status] || colors.text.tertiary) + '33' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[bill.status] || colors.text.tertiary }]} />
            <Text style={[styles.statusText, { color: statusColors[bill.status] || colors.text.tertiary }]}>
              {bill.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.billAmount, { color: colors.text.primary }]}>{formatCurrency(bill.grandTotal)}</Text>
        <View style={styles.billCardFooter}>
          <Text style={[styles.billCardDate, { color: colors.text.tertiary }]}>
            {new Date(bill.createdAt).toLocaleDateString('en-IN')}
          </Text>
          <Text style={[styles.billCardBalance, { color: colors.text.secondary }]}>
            Balance: {formatCurrency(bill.balanceAmount)}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const bills = useBillingStore((s) => s.bills);
  const getTotalRevenue = useBillingStore((s) => s.getTotalRevenue);
  const getTotalPending = useBillingStore((s) => s.getTotalPending);
  const { colors } = useTheme();

  const totalRevenue = getTotalRevenue();
  const totalPending = getTotalPending();
  const totalBills = bills.length;

  return (
    <LinearGradient colors={colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('billing.billing')}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <BlurView intensity={15} tint="light" style={[styles.statBlur, { borderColor: colors.glass.borderLight }]}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Total Collected</Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>{formatCurrency(totalRevenue)}</Text>
            </BlurView>
          </View>
          <View style={styles.statCard}>
            <BlurView intensity={15} tint="light" style={[styles.statBlur, { borderColor: colors.glass.borderLight }]}>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t('billing.balance')}</Text>
              <Text style={[styles.statValue, totalPending > 0 ? { color: Colors.warning } : { color: colors.text.primary }]}>
                {formatCurrency(totalPending)}
              </Text>
            </BlurView>
          </View>
        </View>

        <View style={styles.statCard}>
          <BlurView intensity={15} tint="light" style={[styles.statBlur, { borderColor: colors.glass.borderLight }]}>
            <View style={styles.statsInlineRow}>
              <View style={styles.statsInlineItem}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Total Bills</Text>
                <Text style={[styles.statValue, { color: colors.text.primary }]}>{totalBills}</Text>
              </View>
              <View style={[styles.statsDivider, { backgroundColor: colors.glass.borderLight }]} />
              <View style={styles.statsInlineItem}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Paid</Text>
                <Text style={[styles.statValue, { color: Colors.success }]}>
                  {bills.filter((b) => b.status === 'paid').length}
                </Text>
              </View>
              <View style={[styles.statsDivider, { backgroundColor: colors.glass.borderLight }]} />
              <View style={styles.statsInlineItem}>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Pending</Text>
                <Text style={[styles.statValue, { color: Colors.warning }]}>
                  {bills.filter((b) => b.status !== 'paid').length}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Quick Actions</Text>
        {[
          { emoji: '📋', title: t('billing.feesMaster'), subtitle: 'Manage treatment rates & costs', onPress: () => navigation.navigate('FeesMaster') },
          { emoji: '💳', title: t('billing.createBill'), subtitle: 'Generate new bill for patient', onPress: () => navigation.navigate('CreateBill', {}) },
          { emoji: '🏦', title: t('commission.commission'), subtitle: 'Track clinic owner commissions', onPress: () => navigation.navigate('CommissionDashboard') },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <BlurView intensity={15} tint="light" style={[styles.menuBlur, { borderColor: colors.glass.borderLight }]}>
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text.primary }]}>{item.title}</Text>
                <Text style={[styles.menuSubtitle, { color: colors.text.secondary }]}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </BlurView>
          </TouchableOpacity>
        ))}

        {/* Recent Bills */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recent Bills</Text>
        {bills.length === 0 ? (
          <View style={styles.emptyCard}>
            <BlurView intensity={15} tint="light" style={[styles.emptyCardBlur, { borderColor: colors.glass.borderLight }]}>
              <Text style={styles.emptyEmoji}>💰</Text>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>{t('common.noData')}</Text>
              <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>Create your first bill to see it here</Text>
            </BlurView>
          </View>
        ) : (
          bills
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
            .map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
                colors={colors}
              />
            ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  statBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  statsInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsInlineItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    height: 30,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  menuItem: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  menuBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  menuEmoji: { fontSize: 28 },
  menuText: { flex: 1 },
  menuTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  menuSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  billCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  billCardBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  billCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  billCardId: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  billAmount: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  billCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  billCardDate: {
    fontSize: FontSize.sm,
  },
  billCardBalance: {
    fontSize: FontSize.sm,
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  emptyCardBlur: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
});
