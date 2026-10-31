import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Calendar, Sparkles, ChevronRight, Trophy, Film } from 'lucide-react-native';
import { MMFFSeasonData } from '@/features/awards/types';
import { radius, spacing, typography } from '@/lib/theme';

interface MMFFSeasonWidgetProps {
  seasonData: MMFFSeasonData;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const ENTRY_WIDTH = 130;

export function MMFFSeasonWidget({ seasonData }: MMFFSeasonWidgetProps) {
  const router = useRouter();

  if (!seasonData) return null;

  const handleFestivalPress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    if (seasonData.festival_id) {
      router.push({
        pathname: '/festival/[id]' as any,
        params: { id: seasonData.festival_id },
      });
    } else {
      router.push('/festivals' as any);
    }
  };

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
      {/* Outer Banner Box */}
      <View style={styles.bannerBox}>
        {/* Top Seasonal Header */}
        <View style={styles.topRow}>
          <View style={styles.seasonTag}>
            <Sparkles size={11} color="#000000" />
            <Text style={styles.seasonTagText}>SEASONAL SHOWCASE</Text>
          </View>

          <View style={styles.datePill}>
            <Calendar size={11} color="#FFFFFF" />
            <Text style={styles.dateText}>{seasonData.season_dates}</Text>
          </View>
        </View>

        {/* Title & Theme */}
        <View style={styles.titleWrap}>
          <Text style={styles.headline}>
            Metro Manila Film Festival
          </Text>
          <Text style={styles.editionText}>
            {seasonData.edition_number}th Edition • {seasonData.theme_title}
          </Text>
        </View>

        {/* Landmark Entries Carousel */}
        <Text style={styles.railLabel}>HISTORIC & RECENT MMFF BEST PICTURE TITLES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.entriesRail}>
          {seasonData.landmark_entries.map((entry) => (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityLabel={`View MMFF entry ${entry.title}`}
              onPress={() => handleFilmPress(entry.id)}
              style={({ pressed }) => [
                styles.entryCard,
                pressed && styles.entryCardPressed,
              ]}>
              <View style={styles.posterWrap}>
                <Image
                  source={{ uri: entry.poster_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.poster}
                />
                {entry.is_best_picture && (
                  <View style={styles.bpBadge}>
                    <Trophy size={9} color="#000000" strokeWidth={3} />
                    <Text style={styles.bpText}>BEST PICTURE</Text>
                  </View>
                )}
              </View>

              <Text style={styles.entryTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              <Text style={styles.entryYear}>
                {entry.release_year} {entry.director ? `• Dir. ${entry.director}` : ''}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Action Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explore full MMFF edition archives"
          onPress={handleFestivalPress}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && styles.actionBtnPressed,
          ]}>
          <Text style={styles.actionBtnText}>Explore MMFF Editions & Selections</Text>
          <ChevronRight size={14} color="#000000" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bannerBox: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  seasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  seasonTagText: {
    ...typography.caption,
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#141414',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  titleWrap: {
    marginBottom: spacing.md,
  },
  headline: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  editionText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    marginTop: 2,
  },
  railLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8A8A',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  entriesRail: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  entryCard: {
    width: ENTRY_WIDTH,
  },
  entryCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  posterWrap: {
    width: '100%',
    height: Math.floor(ENTRY_WIDTH * 1.45),
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    marginBottom: 4,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  bpBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  bpText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  entryTitle: {
    ...typography.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  entryYear: {
    ...typography.caption,
    fontSize: 10,
    color: '#8A8A8A',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.md,
    minHeight: 44,
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionBtnText: {
    ...typography.caption,
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
});

