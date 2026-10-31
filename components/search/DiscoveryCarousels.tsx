import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Ticket, Award, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { DiscoveryCuratedSections, SearchScreeningItem } from '@/features/search/types';
import { PosterCard } from '@/components/ui/PosterCard';
import { radius, typography } from '@/lib/theme';

interface DiscoveryCarouselsProps {
  sections: DiscoveryCuratedSections;
}

export function DiscoveryCarousels({ sections }: DiscoveryCarouselsProps) {
  const router = useRouter();

  const handleOpenFilm = (filmId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  const handleOpenTicket = (screening: SearchScreeningItem) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (screening.ticket_url) {
        void Linking.openURL(screening.ticket_url);
      } else {
        router.push({
          pathname: '/film/[id]' as any,
          params: { id: screening.film_id },
        });
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      {/* 1. Trending in Filipino Cinema */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleIconRow}>
            <Flame size={18} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Trending in Filipino Cinema</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}>
          {sections.trendingFilms.map((film) => (
            <PosterCard
              key={film.id}
              film={{
                id: film.id,
                title: film.title,
                release_year: film.release_year,
                poster_url: film.poster_url,
                director: film.director,
                critic_score: film.critic_score,
                audience_score: film.audience_score,
              }}
              width={140}
            />
          ))}
        </ScrollView>
      </View>

      {/* 2. Award Winners & Festival Darlings */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleIconRow}>
            <Award size={18} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Award Winners & Festival Darlings</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}>
          {sections.awardWinners.map((film) => (
            <View key={film.id} style={styles.awardCardContainer}>
              <PosterCard
                film={{
                  id: film.id,
                  title: film.title,
                  release_year: film.release_year,
                  poster_url: film.poster_url,
                  director: film.director,
                  critic_score: film.critic_score,
                  audience_score: film.audience_score,
                }}
                width={140}
              />
              {film.screening_info && (
                <View style={styles.awardPill}>
                  <Text style={styles.awardPillText} numberOfLines={1}>
                    {film.screening_info}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 3. Now Showing / Cinema Screenings (Philippine Theaters & Microcinemas) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleIconRow}>
            <Ticket size={18} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Now Showing & Screenings</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}>
          {sections.nowShowing.map((scr) => (
            <Pressable
              key={scr.id}
              accessibilityRole="button"
              accessibilityLabel={`Screening for ${scr.film_title} at ${scr.venue_name}`}
              onPress={() => handleOpenTicket(scr)}
              style={styles.screeningCard}>
              {/* Left poster */}
              <View style={styles.screeningPoster}>
                <Image
                  source={{ uri: scr.poster_url || undefined }}
                  style={styles.screeningPosterImg}
                  contentFit="cover"
                  transition={200}
                />
              </View>

              {/* Right details */}
              <View style={styles.screeningDetails}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>
                    {scr.ticket_status === 'now_showing' ? 'NOW SHOWING' : 'ADVANCE TICKETS'}
                  </Text>
                </View>

                <Text style={styles.screeningTitle} numberOfLines={1}>
                  {scr.film_title}
                </Text>

                <View style={styles.venueRow}>
                  <MapPin size={12} color="#8A8A8A" />
                  <Text style={styles.venueText} numberOfLines={1}>
                    {scr.venue_name}
                  </Text>
                </View>

                <View style={styles.timeRow}>
                  <Calendar size={12} color="#8A8A8A" />
                  <Text style={styles.timeText} numberOfLines={1}>
                    {scr.showtime}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingVertical: 12,
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  awardCardContainer: {
    width: 140,
    gap: 6,
  },
  awardPill: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  awardPillText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Screenings card styles
  screeningCard: {
    width: 250,
    height: 110,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 8,
    gap: 10,
  },
  screeningPoster: {
    width: 66,
    height: '100%',
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#141414',
  },
  screeningPosterImg: {
    width: '100%',
    height: '100%',
  },
  screeningDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusText: {
    ...typography.mono,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  screeningTitle: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    flex: 1,
  },
});

