import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

type StatusType =
  | 'scheduled'
  | 'completed'
  | 'missed'
  | 'cancelled'
  | 'hold'
  | 'inProgress'
  | 'pending'
  | 'paid'
  | 'overdue';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
}

const getStatusColor = (type?: StatusType): string => {
  if (type && Colors.status[type]) {
    return Colors.status[type];
  }
  return Colors.primary[500];
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const color = getStatusColor(type);

  return (
    <View style={[styles.badge, { backgroundColor: color + '26' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});

export default StatusBadge;
