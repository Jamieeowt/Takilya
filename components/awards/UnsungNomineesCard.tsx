import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { TrendingUp, Award, ChevronRight, HelpCircle } from 'lucide-react-native';
import { UnsungNomineeAnalytics } from '@/features/awards/types';
import { radius, spacing, typography } from '@/lib/theme';

interface UnsungNomineesCardProps {
  nominees: UnsungNomineeAnalytics[];
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function UnsungNomineesCard({ nominees }: UnsungNomineesCardProps) {
  const router = useRouter();

  if (!nominees || nominees.length === 0) return null;

  const handlePress = (id: string, type: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}

    if (type === 'film') {
      router.push({
        pathname: '/film/[id]' as any,
        params: { id },
      });
    } else {
      router.push({
        pathname: '/person/[id]' as any,
        params: { id },
      });
    }
  };

  return (
    <View style={styles.card}>
      {/* Header with Analytics badge */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <TrendingUp size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.headerTitle}>ANALYTICS: MOST NOMINATED (UNWON)</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Films that amassed massive guild acclaim and nominations without securing a win
        </Text>
      </View>

      {/* Nominees List */}
      <View style={styles.list}>
        {nominees.map((item, idx) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name} (${item.nominations_count} nominations)`}
            onPress={() => handlePress(item.id, item.type)}
            style={({ pressed }) => [
              styles.itemRow,
              pressed && styles.itemRowPressed,
            ]}>
            {/* Rank Number */}
            <View style={styles.rankCol}>
              <Text style={styles.rankNum}>#{idx + 1}</Text>
            </View>

            {/* Poster Thumbnail */}
            <View style={styles.thumbWrap}>
              <Image
                source={{ uri: item.poster_url || item.photo_url || undefined }}
                placeholder={DEFAULT_BLURHASH}
                contentFit="cover"
                transition={200}
                style={styles.thumb}
              />
            </View>

            {/* Info */}
            <View style={styles.infoCol}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.metaText}>
                {item.release_year ? `${item.release_year} • ` : ''}
                {item.director ? `Dir. ${item.director}` : ''}
              </Text>

              {/* Bodies */}
              <Text style={styles.bodiesText} numberOfLines={1}>
                Nominated at: {item.award_bodies.join(', ')}
              </Text>
            </View>

            {/* Nomination Count Badge */}
            <View style={styles.nomCountWrap}>
              <Award size={12} color="#8A8A8A" />
              <Text style={styles.nomCountNumber}>{item.nominations_count}</Text>
              <Text style={styles.nomCountLabel}>Noms</Text>
            </View>

            <ChevronRight size={16} color="#8A8A8A" />
          </Pressable>
        ))}
      </View>

      {/* Cinephile Footnote */}
      <View style={styles.footerNote}>
        <HelpCircle size={12} color="#8A8A8A" />
        <Text style={styles.footerNoteText}>
          Dynamic query computed across all FAMAS, Gawad Urian, and FAP records in Takilya.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  list: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.sm,
    minHeight: 56,
  },
  itemRowPressed: {
    backgroundColor: '#1F1F1F',
  },
  rankCol: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#8A8A8A',
  },
  thumbWrap: {
    width: 36,
    height: 48,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#2E2E2E',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    marginTop: 1,
  },
  bodiesText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 10,
    marginTop: 2,
  },
  nomCountWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#0A0A0A',
  },
  nomCountNumber: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  nomCountLabel: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  footerNoteText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
    flex: 1,
  },
});

