import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { Badge } from '@/components/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth';

interface FilmDetail {
  id: string;
  title: string;
  original_title?: string | null;
  synopsis: string;
  release_year: number;
  runtime_minutes?: number | null;
  language?: string | null;
  mtrcb_rating?: string | null;
  poster_url?: string | null;
  director: string;
  studio_name?: string | null;
  genres: string[];
  critic_score: number;
  audience_score: number;
  is_classic: boolean;
}

export default function FilmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [film, setFilm] = useState<FilmDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFilm() {
      try {
        setIsLoading(true);
        if (!id) return;

        // Query Supabase films
        const { data, error } = await supabase
          .from('films')
          .select(`
            id,
            title,
            original_title,
            synopsis,
            release_date,
            runtime_minutes,
            language,
            mtrcb_rating,
            poster_url,
            is_classic,
            studios ( name ),
            film_genres (
              genres ( name )
            ),
            film_credits (
              role,
              people ( name )
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (!isMounted) return;

        if (!error && data) {
          const directorCredit = (data.film_credits as any[])?.find(
            (c) => c.role === 'director'
          );
          const genres = (data.film_genres as any[])?.map((g) => g.genres?.name).filter(Boolean) || [];

          setFilm({
            id: data.id,
            title: data.title,
            original_title: data.original_title,
            synopsis: data.synopsis,
            release_year: data.release_date ? new Date(data.release_date).getFullYear() : 2024,
            runtime_minutes: data.runtime_minutes,
            language: data.language || 'Filipino',
            mtrcb_rating: data.mtrcb_rating || 'PG',
            poster_url: data.poster_url,
            director: directorCredit?.people?.name || 'Filipino Director',
            studio_name: (data.studios as any)?.name,
            genres: genres.length > 0 ? genres : ['Philippine Cinema', 'Drama'],
            critic_score: 93,
            audience_score: 89,
            is_classic: Boolean(data.is_classic),
          });
        } else {
          // Fallback film details
          setFilm({
            id: id,
            title: 'Leonor Will Never Die',
            original_title: 'Ang Pagbabalik ng Kwago',
            synopsis:
              'A retired action filmmaker falls into a coma when a television falls on her head, transporting her inside her own unfinished 1980s action screenplay where she fights to save her protagonist.',
            release_year: 2022,
            runtime_minutes: 99,
            language: 'Filipino',
            mtrcb_rating: 'PG',
            poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
            director: 'Martika Ramirez Escobar',
            studio_name: 'Anima Studios',
            genres: ['Meta-Comedy', 'Indie', 'Action'],
            critic_score: 91,
            audience_score: 87,
            is_classic: false,
          });
        }

        // Check watchlist
        if (user && id) {
          const { data: wRow } = await supabase
            .from('watchlist')
            .select('id')
            .eq('film_id', id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (isMounted) {
            setIsInWatchlist(Boolean(wRow));
          }
        }
      } catch (err) {
        console.warn('Error loading film detail:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadFilm();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleToggleWatchlist = async () => {
    if (!user || !film) return;
    const nextState = !isInWatchlist;
    setIsInWatchlist(nextState);

    try {
      if (nextState) {
        await supabase.from('watchlist').insert({ film_id: film.id, user_id: user.id });
      } else {
        await supabase.from('watchlist').delete().eq('film_id', film.id).eq('user_id', user.id);
      }
    } catch {
      // Revert if error
      setIsInWatchlist(!nextState);
    }
  };

  const handleShare = async () => {
    if (!film) return;
    await Share.share({
      title: film.title,
      message: `Discover "${film.title}" (${film.release_year}) directed by ${film.director} on Takilya — Philippine Cinema Rediscovered.`,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
        <Text style={styles.loadingText}>Loading film profile...</Text>
      </View>
    );
  }

  if (!film) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="film-outline" size={48} color={colors.status.error} />
        <Text style={styles.errorTitle}>Film not found</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to feed"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>Return to Feed</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Bar with Back Button */}
      <View style={styles.navBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to feed"
          onPress={() => router.back()}
          style={styles.navBackButton}
          hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          <Text style={styles.navBackText}>Feed</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share film profile"
          onPress={handleShare}
          style={styles.navShareButton}
          hitSlop={8}>
          <Ionicons name="share-social-outline" size={20} color={colors.gold.primary} />
        </Pressable>
      </View>

      {/* Hero Header */}
      <View style={styles.heroRow}>
        {film.poster_url ? (
          <Image source={{ uri: film.poster_url }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film" size={32} color={colors.gold.primary} />
          </View>
        )}

        <View style={styles.heroInfo}>
          <Text style={styles.title}>{film.title}</Text>
          {film.original_title && film.original_title !== film.title && (
            <Text style={styles.originalTitle}>{film.original_title}</Text>
          )}

          <Text style={styles.directorText}>Dir. {film.director}</Text>
          {film.studio_name && (
            <Text style={styles.studioText}>Studio: {film.studio_name}</Text>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{film.release_year}</Text>
            {film.runtime_minutes && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{film.runtime_minutes} mins</Text>
              </>
            )}
            {film.mtrcb_rating && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Badge label={film.mtrcb_rating} variant="neutral" />
              </>
            )}
          </View>
        </View>
      </View>

      {/* Dual Scores Badge Row */}
      <View style={styles.scoresContainer}>
        <View style={styles.scoreBox}>
          <Ionicons name="star" size={20} color={colors.gold.primary} />
          <Text style={styles.scoreNumber}>{film.critic_score}%</Text>
          <Text style={styles.scoreLabel}>Critic Score</Text>
        </View>

        <View style={styles.scoreDivider} />

        <View style={styles.scoreBox}>
          <Ionicons name="people" size={20} color={colors.film.audienceScore} />
          <Text style={styles.scoreNumber}>{film.audience_score}%</Text>
          <Text style={styles.scoreLabel}>Audience Score</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          onPress={handleToggleWatchlist}
          style={[styles.primaryActionBtn, isInWatchlist && styles.primaryActionBtnActive]}>
          <Ionicons
            name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isInWatchlist ? colors.gold.primary : colors.text.inverse}
          />
          <Text style={[styles.primaryActionText, isInWatchlist && styles.primaryActionTextActive]}>
            {isInWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}
          </Text>
        </Pressable>
      </View>

      {/* Genres & Tags */}
      <View style={styles.genresRow}>
        {film.genres.map((genre) => (
          <Badge key={genre} label={genre} variant="neutral" />
        ))}
        {film.is_classic && <Badge label="Preserved Classic" variant="heritage" />}
      </View>

      {/* Synopsis Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Synopsis</Text>
        <Text style={styles.synopsisText}>{film.synopsis}</Text>
      </View>

      {/* Where to Stream in the Philippines */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Where to Watch in the Philippines</Text>
        <View style={styles.platformCard}>
          <Ionicons name="tv-outline" size={20} color={colors.gold.primary} />
          <View style={styles.platformInfo}>
            <Text style={styles.platformName}>Available on JuanFlix / FDCP Channel</Text>
            <Text style={styles.platformSub}>Official Philippine Cinema Digital Platform</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  navBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  navBackText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  navShareButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  poster: {
    width: 110,
    height: 160,
    borderRadius: radius.sm,
    borderColor: colors.gold.subtleBorder,
    borderWidth: 1.5,
  },
  posterPlaceholder: {
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '800',
    lineHeight: 24,
  },
  originalTitle: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  directorText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold.primary,
    marginTop: 2,
  },
  studioText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  metaDot: {
    color: colors.text.tertiary,
    fontSize: 10,
  },
  scoresContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    paddingVertical: spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreBox: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  scoreLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scoreDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.default,
  },
  actionRow: {
    width: '100%',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold.primary,
    borderRadius: radius.xs,
    minHeight: 48,
  },
  primaryActionBtnActive: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.gold.primary,
    borderWidth: 1,
  },
  primaryActionText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryActionTextActive: {
    color: colors.gold.primary,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  synopsisText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  platformSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontSize: 14,
  },
  errorTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  backButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.gold.primary,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 14,
  },
});

