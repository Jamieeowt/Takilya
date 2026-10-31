import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Award, Trophy, Star, ChevronRight } from 'lucide-react-native';
import { FestivalSelection } from '@/features/festivals/types';
import { radius, spacing, typography } from '@/lib/theme';

interface FestivalSelectionCardProps {
  selection: FestivalSelection;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function FestivalSelectionCard({ selection }: FestivalSelectionCardProps) {
  const router = useRouter();
  const film = selection.film;

  const handlePress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: film.id },
    });
  };

  const renderStatusBadge = () => {
    switch (selection.status) {
      case 'won':
        return (
          <View style={[styles.badgeBase, styles.badgeWon]}>
            <Trophy size={11} color="#000000" strokeWidth={2.5} />
            <Text style={styles.badgeWonText}>
              {selection.award_name ? selection.award_name.toUpperCase() : 'AWARD WINNER'}
            </Text>
          </View>
        );
      case 'nominated':
        return (
          <View style={[styles.badgeBase, styles.badgeNominated]}>
            <Award size={11} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.badgeNominatedText}>
              {selection.award_name ? selection.award_name.toUpperCase() : 'NOMINATED'}
            </Text>
          </View>
        );
      case 'special_mention':
        return (
          <View style={[styles.badgeBase, styles.badgeSpecial]}>
            <Star size={11} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.badgeSpecialText}>
              {selection.award_name ? selection.award_name.toUpperCase() : 'SPECIAL MENTION'}
            </Text>
          </View>
        );
      case 'official_selection':
      default:
        return (
          <View style={[styles.badgeBase, styles.badgeOfficial]}>
            <Text style={styles.badgeOfficialText}>OFFICIAL SELECTION</Text>
          </View>
        );
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View film ${film.title} (${film.release_year}), status: ${selection.status}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}>
      {/* Poster */}
      <View style={styles.posterWrapper}>
        <Image
          source={{ uri: film.poster_url || undefined }}
          placeholder={DEFAULT_BLURHASH}
          contentFit="cover"
          transition={200}
          style={styles.posterImage}
        />
      </View>

      {/* Info */}
      <View style={styles.infoCol}>
        {/* Status Badge */}
        <View style={styles.statusRow}>
          {renderStatusBadge()}
        </View>

        {/* Film Title */}
        <Text style={styles.title} numberOfLines={2}>
          {film.title}
        </Text>

        {/* Meta / Director & Year */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {film.release_year}
            {film.director ? ` • Dir. ${film.director}` : ''}
          </Text>
        </View>

        {/* Section Pill */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionText} numberOfLines={1}>
            {selection.section}
          </Text>
        </View>
      </View>

      <View style={styles.arrowCol}>
        <ChevronRight size={18} color="#8A8A8A" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  cardPressed: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  posterWrapper: {
    width: 64,
    height: 94,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  // Won: filled badge
  badgeWon: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeWonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  // Nominated: outlined badge
  badgeNominated: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeNominatedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Special Mention: double outline badge
  badgeSpecial: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeSpecialText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Official Selection: dashed outline badge
  badgeOfficial: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#8A8A8A',
  },
  badgeOfficialText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D4D4D4',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
  },
  sectionWrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#141414',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 2,
  },
  sectionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  arrowCol: {
    paddingRight: 6,
  },
});

