import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

type ButtonVariant = 'primary' | 'glass' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizeConfig: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
  sm: { height: 36, paddingHorizontal: Spacing.md, fontSize: FontSize.sm, borderRadius: BorderRadius.sm },
  md: { height: 48, paddingHorizontal: Spacing.xl, fontSize: FontSize.md, borderRadius: BorderRadius.md },
  lg: { height: 56, paddingHorizontal: Spacing.xxl, fontSize: FontSize.lg, borderRadius: BorderRadius.lg },
};

const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const config = sizeConfig[size];
  const opacity = disabled ? 0.5 : 1;

  const buttonStyle: ViewStyle = {
    height: config.height,
    paddingHorizontal: config.paddingHorizontal,
    borderRadius: config.borderRadius,
    opacity,
  };

  const renderContent = () => (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator color={Colors.text.primary} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { fontSize: config.fontSize }]}>{title}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={style}
      >
        <LinearGradient
          colors={[Colors.primary[700], Colors.primary[500]] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, buttonStyle]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.base, styles.outline, buttonStyle, style]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // glass variant
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
    >
      <View style={[styles.base, styles.glass, buttonStyle]}>
        <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={20} />
        {renderContent()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glass: {
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.glass.border,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  text: {
    color: Colors.text.primary,
    fontWeight: FontWeight.semibold,
  },
});

export default GlassButton;
