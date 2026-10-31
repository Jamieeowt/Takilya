import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { VerifiedBadge } from './VerifiedBadge';
import { AVATAR_IMAGE_PROPS } from '@/lib/image';

interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: number;
  isVerified?: boolean;
  style?: ViewStyle;
}

export function Avatar({
  url,
  name = 'User',
  size = 44,
  isVerified = false,
  style,
}: AvatarProps) {
  const initial = (name || 'U').charAt(0).toUpperCase();

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {url ? (
        <Image
          source={{ uri: url }}
          {...AVATAR_IMAGE_PROPS}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}>
          <Text style={[styles.initial, { fontSize: Math.round(size * 0.42) }]}>
            {initial}
          </Text>
        </View>
      )}

      {isVerified && (
        <View style={styles.verifiedWrap}>
          <VerifiedBadge size={Math.round(size * 0.35)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  placeholder: {
    backgroundColor: '#1F1F1F',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedWrap: {
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
});

