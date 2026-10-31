import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Film } from 'lucide-react-native';
import { PersonFilmCredit } from '@/features/people/types';
import { radius, spacing, typography } from '@/lib/theme';

interface PersonFilmographyProps {
  credits: PersonFilmCredit[];
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function PersonFilmography({ credits }: PersonFilmographyProps) {
  const router = useRouter();

  const grouped = useMemo(() => {
    const directing: PersonFilmCredit[] = [];
    const writing: PersonFilmCredit[] = [];
    const acting: PersonFilmCredit[] = [];
    const other: PersonFilmCredit[] = [];

    credits.forEach((c) => {
      const r = c.role.toLowerCase();
      if (r === 'director') directing.push(c);
      else if (r === 'writer' || r === 'screenwriter') writing.push(c);
      else if (r.includes('actor') || r.includes('cast')) acting.push(c);
      else other.push(c);
    });

    return [
      { title: 'DIRECTED', items: directing },
      { title: 'WRITTEN', items: writing },
      { title: 'ACTING & ROLES', items: acting },
      { title: 'ADDITIONAL CREDITS', items: other },
    ].filter((g) => g.items.length > 0);
  }, [credits]);

  if (!credits || credits.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Film size={24} color="#8A8A8A" />
        <Text style={styles.emptyText}>No filmography credits listed yet.</Text>
      </View>
    );
  }

  const handleFilmPress = (filmId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  return (
    <View style={styles.container}>
      {grouped.map((group) => (
        <View key={group.title} style={styles.groupSection}>
          <Text style={styles.groupHeader}>{group.title}</Text>

          <View style={styles.groupList}>
            {group.items.map((credit) => (
              <Pressable
                key={`${credit.id || credit.film_id}-${credit.role}`}
                accessibilityRole="button"
                accessibilityLabel={`View film ${credit.film_title} (${credit.release_year})`}
                onPress={() => handleFilmPress(credit.film_id)}
                style={({ pressed }) => [
                  styles.creditRow,
                  pressed && styles.creditRowPressed,
                ]}>
                {/* Poster */}
                <View style={styles.posterWrapper}>
                  <Image
                    source={{ uri: credit.poster_url || undefined }}
                    placeholder={DEFAULT_BLURHASH}
                    contentFit="cover"
                    style={styles.poster}
                  />
                </View>

                {/* Details */}
                <View style={styles.creditInfo}>
                  <Text style={styles.filmTitle} numberOfLines={1}>
                    {credit.film_title}
                  </Text>
                  <Text style={styles.filmMeta}>
                    {credit.release_year}
                    {credit.character_name ? ` • as ${credit.character_name}` : ''}
                  </Text>
                </View>

                <ChevronRight size={16} color="#8A8A8A" />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  groupSection: {
    gap: spacing.xs,
  },
  groupHeader: {
    ...typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  groupList: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  creditRowPressed: {
    backgroundColor: '#141414',
  },
  posterWrapper: {
    width: 44,
    height: 62,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  creditInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  filmTitle: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  filmMeta: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
  },
  emptyWrap: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 13,
  },
});

