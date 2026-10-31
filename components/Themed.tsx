import { Text as DefaultText, View as DefaultView, TextProps as DefaultTextProps, ViewProps as DefaultViewProps } from 'react-native';
import { colors } from '@/lib/theme';

export interface ThemedTextProps extends DefaultTextProps {
  variant?: 'primary' | 'secondary' | 'muted' | 'gold';
}

export function ThemedText({ style, variant = 'primary', ...props }: ThemedTextProps) {
  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.tertiary,
    gold: colors.gold.primary,
  };

  return <DefaultText style={[{ color: colorMap[variant] }, style]} {...props} />;
}

export interface ThemedViewProps extends DefaultViewProps {
  variant?: 'primary' | 'secondary' | 'card' | 'elevated';
}

export function ThemedView({ style, variant = 'primary', ...props }: ThemedViewProps) {
  const bgMap = {
    primary: colors.background.primary,
    secondary: colors.background.secondary,
    card: colors.background.secondary,
    elevated: colors.background.elevated,
  };

  return <DefaultView style={[{ backgroundColor: bgMap[variant] }, style]} {...props} />;
}

export { ThemedText as Text, ThemedView as View, ThemedTextProps as TextProps, ThemedViewProps as ViewProps };
