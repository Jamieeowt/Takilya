import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowUpDown, Bookmark, Plus, X } from 'lucide-react-native';
import { UserWatchlistItem } from '@/features/account/types';
import { PosterCard, PosterCardFilm } from '@/components/ui/PosterCard';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { PosterRow } from '@/components/ui/PosterRow';
import { useAuth } from '@/features/auth';
import { useRecommendedFilms } from '@/features/films/useFilm';
import { radius, spacing, typography } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.md * 2;
const GAP = spacing.sm;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * 2) / 3);

interface ProfileWatchlistTabProps {
  watchlist: UserWatchlistItem[];
  onExplorePress?: () => void;
  onRemoveFromWatchlist?: (filmId: string) => void;
}

type SortOption = 'date_added' | 'release_date' | 'score';

const FILTER_TAGS = ['All', '70s & 80s', '2010s', '2020s', 'Drama', 'Indie'];

export function ProfileWatchlistTab({
  watchlist,
  onExplorePress,
  onRemoveFromWatchlist,
}: ProfileWatchlistTabProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: recommendedData = [] } = useRecommendedFilms(user?.id);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('date_added');

  const recommendedFilms: PosterCardFilm[] = useMemo(() => {
    return (recommendedData || []).map((film) => ({
      id: film.id,
      title: film.title,
      release_year: film.release_year,
      poster_url: film.poster_url,
      director: film.director,
      critic_score: film.critic_score,
      audience_score: film.audience_score,
    }));
  }, [recommendedData]);

  // Filter & Sort
  const filteredAndSortedList = useMemo(() => {
    let result = [...watchlist];

    // Filter
    if (selectedFilter === '70s & 80s') {
      result = result.filter((item) => item.release_year >= 1970 && item.release_year < 1990);
    } else if (selectedFilter === '2010s') {
      result = result.filter((item) => item.release_year >= 2010 && item.release_year < 2020);
    } else if (selectedFilter === '2020s') {
      result = result.filter((item) => item.release_year >= 2020);
    } else if (selectedFilter === 'Drama') {
      result = result.filter((item) => item.genres?.some((g) => g.toLowerCase().includes('drama')));
    } else if (selectedFilter === 'Indie') {
      result = result.filter((item) => item.genres?.some((g) => g.toLowerCase().includes('indie')));
    }

    // Sort
    if (sortBy === 'release_date') {
      result.sort((a, b) => b.release_year - a.release_year);
    } else if (sortBy === 'score') {
      result.sort((a, b) => (b.critic_score || 0) - (a.critic_score || 0));
    } else {
      // date_added
      result.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
    }

    return result;
  }, [watchlist, selectedFilter, sortBy]);

  const toggleSort = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (sortBy === 'date_added') setSortBy('release_date');
    else if (sortBy === 'release_date') setSortBy('score');
    else setSortBy('date_added');
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'release_date':
        return 'Release Date';
      case 'score':
        return 'Rating Score';
      case 'date_added':
      default:
        return 'Date Added';
    }
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          title="Your Watchlist is Empty"
          description="Save Philippine films you want to see. Track trailers, festival selections, and availability."
        />
        {onExplorePress && (
          <Button
            label="Explore Films"
            variant="primary"
            onPress={onExplorePress}
            icon={<Plus size={16} color="#000000" />}
            style={styles.emptyCta}
          />
        )}
        {recommendedFilms.length > 0 && (
          <View style={styles.emptyRecommendationShelf}>
            <PosterRow
              title="Recommended based on your Watchlist"
              subtitle="Philippine films matched with your taste and saved titles"
              films={recommendedFilms}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters & Sorting Bar */}
      <View style={styles.controlsRow}>
        <View style={styles.chipsScroll}>
          {FILTER_TAGS.map((tag) => {
            const isSelected = selectedFilter === tag;
            return (
              <Chip
                key={tag}
                label={tag}
                variant={isSelected ? 'filled' : 'outlined'}
                onPress={() => setSelectedFilter(tag)}
              />
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${getSortLabel()}`}
          onPress={toggleSort}
          style={styles.sortBtn}>
          <ArrowUpDown size={13} color="#FFFFFF" />
          <Text style={styles.sortText}>{getSortLabel()}</Text>
        </Pressable>
      </View>

      {/* 3-Column Poster Grid */}
      {filteredAndSortedList.length === 0 ? (
        <View style={styles.noFilterMatch}>
          <Text style={styles.noFilterText}>No films match "{selectedFilter}"</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredAndSortedList.map((item) => {
            const filmItem: PosterCardFilm = {
              id: item.film_id,
              title: item.title,
              release_year: item.release_year,
              poster_url: item.poster_url,
              critic_score: item.critic_score,
              audience_score: item.audience_score,
            };

            return (
              <View key={item.id} style={styles.cardContainer}>
                <PosterCard film={filmItem} width={CARD_WIDTH} />
                {onRemoveFromWatchlist && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.title} from watchlist`}
                    onPress={() => {
                      try {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      } catch {}
                      onRemoveFromWatchlist(item.film_id);
                    }}
                    style={styles.removeBtn}>
                    <X size={12} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Recommendation shelf at the bottom of the user's Watchlist */}
      {recommendedFilms.length > 0 && (
        <View style={styles.bottomRecommendationShelf}>
          <PosterRow
            title="Recommended based on your Watchlist"
            subtitle="Philippine films matched with your taste and saved titles"
            films={recommendedFilms}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
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
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  chipsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 10,
    backgroundColor: '#141414',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sortText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cardContainer: {
    position: 'relative',
    width: CARD_WIDTH,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  noFilterMatch: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  noFilterText: {
    fontSize: 13,
    color: '#8A8A8A',
  },
  bottomRecommendationShelf: {
    marginTop: spacing.xl,
    marginHorizontal: -spacing.md,
  },
  emptyRecommendationShelf: {
    marginTop: spacing.xl * 1.5,
    width: '100%',
  },
});

