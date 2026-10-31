import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Landmark, Info } from 'lucide-react-native';
import { radius, spacing, typography } from '@/lib/theme';

export function HeritageCurationNotice() {
  return (
    <View style={styles.banner}>
      <View style={styles.iconCol}>
        <Landmark size={18} color="#FFFFFF" />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>CULTURAL CURATION NOTICE</Text>
        <Text style={styles.body}>
          These preservation and heritage records are curated from public archives and cultural documentation. In a production release, data would be verified directly via institutional partnerships (e.g., FDCP Philippine Film Archive).
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconCol: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  body: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    lineHeight: 16,
  },
});

