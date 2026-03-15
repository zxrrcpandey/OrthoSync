import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, FontSize, FontWeight } from '../../theme';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 40,
  md: 60,
  lg: 80,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: FontSize.sm,
  md: FontSize.xl,
  lg: FontSize.xxxl,
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? '').toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'md' }) => {
  const dimension = sizeMap[size];
  const borderWidth = size === 'sm' ? 1.5 : 2;

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    borderWidth,
    borderColor: Colors.glass.border,
  };

  if (uri) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: dimension / 2 }]}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        tint="light"
        intensity={25}
      />
      <View style={styles.initialsContainer}>
        <Text style={[styles.initials, { fontSize: fontSizeMap[size] }]}>
          {getInitials(name)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.glass.whiteMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.text.primary,
    fontWeight: FontWeight.bold,
  },
});

export default Avatar;
