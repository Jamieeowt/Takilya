import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RotateCcw, Tv, Film as FilmIcon, Disc, Plus } from 'lucide-react-native';
import { UserDiaryItem } from '@/features/account/types';
import { RatingStars } from '@/components/ui/RatingStars';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/lib/theme';

interface ProfileDiaryTabProps {
  diary: UserDiaryItem[];
  onStartLoggingPress: () => void;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function ProfileDiaryTab({
  diary,
  onStartLoggingPress,
}: ProfileDiaryTabProps) {
  const router = useRouter();

  if (!diary || diary.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          title="No Films Logged Yet"
          description="Keep track of every Filipino film you watch, rate your experiences, and build your cinephile diary."
        />
        <Button
          label="Start Logging Films"
          variant="primary"
          onPress={onStartLoggingPress}
          icon={<Plus size={16} color="#000000" />}
          style={styles.emptyCta}
        />
      </View>
    );
  }

  const handleFilmPress = (filmId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  const getMediumLabel = (medium: string) => {
    switch (medium) {
      case 'in_cinema':
        return { label: 'In Cinema', icon: FilmIcon };
      case 'physical_media':
        return { label: 'Physical', icon: Disc };
      case 'digital_streaming':
      default:
        return { label: 'Streaming', icon: Tv };
    }
  };

  const renderDiaryItem = ({ item }: { item: UserDiaryItem }) => {
    const mediumInfo = getMediumLabel(item.medium);
    const MediumIcon = mediumInfo.icon;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View log for ${item.film_title}`}
        onPress={() => handleFilmPress(item.film_id)}
        style={styles.entryRow}>
        {/* Film Poster */}
        <View style={styles.posterWrapper}>
          <Image
            source={{ uri: item.poster_url || undefined }}
            placeholder={{ blurhash: DEFAULT_BLURHASH }}
            contentFit="cover"
            style={styles.poster}
          />
        </View>

        {/* Log Info */}
        <View style={styles.infoCol}>
          <View style={styles.headerMeta}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{item.watched_date}</Text>
            </View>

            <View style={styles.badgesWrap}>
              {item.is_rewatch && (
                <View style={styles.pillBadge}>
                  <RotateCcw size={10} color="#FFFFFF" />
                  <Text style={styles.pillText}>Rewatch</Text>
                </View>
              )}
              <View style={styles.pillBadge}>
                <MediumIcon size={10} color="#8A8A8A" />
                <Text style={styles.pillText}>{mediumInfo.label}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {item.film_title}{' '}
            <Text style={styles.year}>({item.release_year})</Text>
          </Text>

          {item.rating !== null && item.rating !== undefined ? (
            <View style={styles.ratingRow}>
              <RatingStars score={item.rating} size={13} />
              <Text style={styles.scoreText}>{item.rating.toFixed(1)} / 5.0</Text>
            </View>
          ) : null}

          {item.review_title ? (
            <Text style={styles.reviewHeadline} numberOfLines={1}>
              &ldquo;{item.review_title}&rdquo;
            </Text>
          ) : null}

          {item.notes ? (
            <Text style={styles.notes} numberOfLines={2}>
              {item.notes}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={diary}
        keyExtractor={(item) => item.id}
        renderItem={renderDiaryItem}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyCta: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 260,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  entryRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.md,
  },
  posterWrapper: {
    width: 76,
    height: 114,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#141414',
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4D4D4',
    letterSpacing: 0.3,
  },
  badgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#141414',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#D4D4D4',
  },
  title: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  year: {
    fontWeight: '400',
    color: '#8A8A8A',
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  reviewHeadline: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#D4D4D4',
    fontStyle: 'italic',
    marginTop: 4,
  },
  notes: {
    ...typography.body,
    fontSize: 11,
    lineHeight: 16,
    color: '#8A8A8A',
    marginTop: 4,
  },
});

