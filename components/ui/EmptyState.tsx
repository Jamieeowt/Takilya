import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { radius, typography } from '@/lib/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconCircle}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: '#8A8A8A',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: 16,
  },
});

