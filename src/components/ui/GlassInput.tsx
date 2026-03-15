import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  StyleProp,
  KeyboardTypeOptions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

interface GlassInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const GlassInput: React.FC<GlassInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  icon,
  error,
  keyboardType = 'default',
  multiline = false,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          error ? styles.containerError : undefined,
          multiline && styles.containerMultiline,
        ]}
      >
        <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={20} />
        <View style={styles.innerRow}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={20}
              color={Colors.text.secondary}
              style={styles.icon}
            />
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.text.tertiary}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
            ]}
          />
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    backgroundColor: Colors.glass.white,
    overflow: 'hidden',
    height: 50,
  },
  containerFocused: {
    borderColor: Colors.accent.main,
  },
  containerError: {
    borderColor: Colors.error,
  },
  containerMultiline: {
    height: 120,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    height: '100%',
  },
  inputMultiline: {
    paddingTop: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default GlassInput;
