import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../theme';
import { BorderRadius, Spacing } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  onPress?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 25,
  onPress,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={intensity} />
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
    backgroundColor: Colors.glass.white,
  },
  content: {
    padding: Spacing.lg,
  },
});

export default GlassCard;
