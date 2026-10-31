import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RotateCcw, ChevronRight } from 'lucide-react-native';
import { UserDiaryItem } from '@/features/account/types';
import { RatingStars } from '@/components/ui/RatingStars';
import { radius, spacing, typography } from '@/lib/theme';

interface RecentActivityRowProps {
  activity: UserDiaryItem[];
  onViewAllPress: () => void;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function RecentActivityRow({
  activity,
  onViewAllPress,
}: RecentActivityRowProps) {
  const router = useRouter();

  if (!activity || activity.length === 0) {
    return null;
  }

  const handlePress = (filmId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View full diary"
          onPress={() => {
            void Haptics.selectionAsync();
            onViewAllPress();
          }}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>Full Diary</Text>
          <ChevronRight size={14} color="#8A8A8A" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {activity.slice(0, 6).map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Logged ${item.film_title} (${item.release_year}) with ${item.rating || 'no'} stars`}
            onPress={() => handlePress(item.film_id)}
            style={styles.card}>
            <View style={styles.posterContainer}>
              <Image
                source={{ uri: item.poster_url || undefined }}
                placeholder={{ blurhash: DEFAULT_BLURHASH }}
                contentFit="cover"
                style={styles.poster}
              />
              {item.is_rewatch && (
                <View style={styles.rewatchBadge}>
                  <RotateCcw size={10} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.filmTitle} numberOfLines={1}>
                {item.film_title}
              </Text>
              <Text style={styles.watchedDate}>{item.watched_date}</Text>

              {item.rating !== null && item.rating !== undefined ? (
                <View style={styles.starsWrapper}>
                  <RatingStars score={item.rating} size={11} />
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  scrollList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: 110,
  },
  posterContainer: {
    width: 110,
    height: 165,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  rewatchBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    marginTop: 6,
  },
  filmTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  watchedDate: {
    fontSize: 10,
    color: '#8A8A8A',
    marginTop: 1,
  },
  starsWrapper: {
    marginTop: 3,
  },
});

