import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Award, ChevronRight, Sparkles } from 'lucide-react-native';
import { NationalArtistItem } from '@/features/heritage/types';
import { radius, spacing, typography } from '@/lib/theme';

interface NationalArtistsRailProps {
  artists: NationalArtistItem[];
  title?: string;
  subtitle?: string;
  onViewAll?: () => void;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const CARD_WIDTH = 150;

export function NationalArtistsRail({
  artists,
  title = 'Order of National Artists',
  subtitle = 'Conferred supreme masters of Philippine Cinema and Broadcast Arts',
  onViewAll,
}: NationalArtistsRailProps) {
  const router = useRouter();

  if (!artists || artists.length === 0) return null;

  const handlePress = (personId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/person/[id]' as any,
      params: { id: personId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={styles.badgeRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.badgePill}>
              <Award size={10} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.badgePillText}>HERITAGE</Text>
            </View>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {onViewAll && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all National Artists"
            onPress={onViewAll}
            style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={14} color="#8A8A8A" />
          </Pressable>
        )}
      </View>

      {/* Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}>
        {artists.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`National Artist ${item.person.name}`}
            onPress={() => handlePress(item.person_id)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}>
            <View style={styles.photoWrap}>
              <Image
                source={{ uri: item.person.photo_url || undefined }}
                placeholder={DEFAULT_BLURHASH}
                contentFit="cover"
                transition={200}
                style={styles.photo}
              />
              <View style={styles.naBadge}>
                <Award size={10} color="#000000" strokeWidth={3} />
              </View>
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {item.person.name}
            </Text>
            <Text style={styles.yearText}>
              Conferred {item.year_conferred}
            </Text>
            <Text style={styles.roleText}>
              {item.person.role_type?.toUpperCase() || 'CINEMA'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  title: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: '#141414',
  },
  badgePillText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  subtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minHeight: 44,
  },
  viewAllText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  railContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: spacing.md,
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  photoWrap: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#141414',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  naBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  name: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  yearText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
    marginTop: 2,
  },
  roleText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});

