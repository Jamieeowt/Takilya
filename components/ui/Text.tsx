import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography } from '@/lib/theme';

export type TextVariant = 'display' | 'title' | 'body' | 'caption' | 'mono';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({
  variant = 'body',
  color = '#FFFFFF',
  style,
  children,
  ...props
}: TextProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'display':
        return styles.display;
      case 'title':
        return styles.title;
      case 'caption':
        return styles.caption;
      case 'mono':
        return styles.mono;
      case 'body':
      default:
        return styles.body;
    }
  };

  return (
    <RNText style={[getVariantStyle(), { color }, style]} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  display: {
    ...typography.display,
  },
  title: {
    ...typography.title,
  },
  body: {
    ...typography.body,
  },
  caption: {
    ...typography.caption,
  },
  mono: {
    ...typography.mono,
  },
});

