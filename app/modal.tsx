import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Ionicons name="film" size={32} color={colors.gold.primary} />
        </View>
        <Text style={styles.appName}>Takilya</Text>
        <Text style={styles.tagline}>Philippine Cinema Discovery & Reviews</Text>
        <Badge label="Films Only • No TV Series" variant="critic" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About Takilya</Text>
        <Text style={styles.cardBody}>
          Takilya is a dedicated mobile experience for discovering, rating, and discussing
          Philippine films. Mainstream, indie, and regional productions receive equal organic
          visibility.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Model & Architecture</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.gold.primary} />
          <Text style={styles.featureText}>Dual ratings: Critic & Audience scores shown separately</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.gold.primary} />
          <Text style={styles.featureText}>YouTube embeds only via react-native-youtube-iframe</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.gold.primary} />
          <Text style={styles.featureText}>Supabase Auth session persisted with expo-secure-store</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.gold.primary} />
          <Text style={styles.featureText}>State powered by @tanstack/react-query and zustand</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close info modal"
        onPress={() => router.back()}
        style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Done</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.gold.subtle,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  appName: {
    ...typography.titleLarge,
    color: colors.gold.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  cardBody: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  closeButton: {
    backgroundColor: colors.gold.primary,
    borderRadius: radius.xs,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  closeButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
