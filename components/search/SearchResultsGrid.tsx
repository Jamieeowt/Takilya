import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Building2, Calendar, Users, Film } from 'lucide-react-native';

import {
  SearchFilmItem,
  SearchPersonItem,
  SearchStudioItem,
  SearchFestivalItem,
  SearchScreeningItem,
} from '@/features/search/types';
import { PosterCard } from '@/components/ui/PosterCard';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { radius, typography } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 10;
const PADDING = 16;
// 3 Columns: (Screen width - 2 * padding - 2 * gap) / 3
const POSTER_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - COLUMN_GAP * 2) / 3);

interface SearchResultsGridProps {
  films: SearchFilmItem[];
  people: SearchPersonItem[];
  studios?: SearchStudioItem[];
  festivals?: SearchFestivalItem[];
  screenings?: SearchScreeningItem[];
  onEndReached?: () => void;
}

export function SearchResultsGrid({
  films,
  people,
  studios = [],
  festivals = [],
  screenings = [],
  onEndReached,
}: SearchResultsGridProps) {
  const router = useRouter();

  // Tab selections: Films, Filmmakers, Studios, Festivals, Screenings
  const segments: string[] = [`Films (${films.length})`];
  if (people.length > 0) segments.push(`People (${people.length})`);
  if (studios.length > 0) segments.push(`Studios (${studios.length})`);
  if (festivals.length > 0) segments.push(`Festivals (${festivals.length})`);
  if (screenings.length > 0) segments.push(`Screenings (${screenings.length})`);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const activeTab = segments[selectedTabIndex] || segments[0];

  const handleOpenFilm = (id: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id },
    });
  };

  const handleOpenPerson = (id: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/person/[id]' as any,
      params: { id },
    });
  };

  const handleOpenStudio = (id: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/studio/[id]' as any,
      params: { id },
    });
  };

  const handleOpenFestival = (id: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/festival/[id]' as any,
      params: { id },
    });
  };

  return (
    <View style={styles.container}>
      {/* Category Segmented Tabs if multiple entity types match */}
      {segments.length > 1 && (
        <View style={styles.tabsWrapper}>
          <SegmentedControl
            options={segments}
            selectedIndex={selectedTabIndex}
            onChange={setSelectedTabIndex}
          />
        </View>
      )}

      {/* 1. Films 3-Column Poster Grid */}
      {activeTab.startsWith('Films') && (
        <FlatList
          data={films}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <PosterCard
              film={{
                id: item.id,
                title: item.title,
                release_year: item.release_year,
                poster_url: item.poster_url,
                director: item.director,
                critic_score: item.critic_score,
                audience_score: item.audience_score,
              }}
              width={POSTER_WIDTH}
            />
          )}
        />
      )}

      {/* 2. People (Directors & Actors) List */}
      {activeTab.startsWith('People') && (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View filmmaker ${item.name}`}
              onPress={() => handleOpenPerson(item.id)}
              style={styles.entityRow}>
              <Avatar
                url={item.photo_url}
                name={item.name}
                size={48}
                isVerified={item.is_verified}
              />
              <View style={styles.entityInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.entityName}>{item.name}</Text>
                  {item.is_verified && <VerifiedBadge size={14} />}
                </View>
                <Text style={styles.entitySubtitle}>{item.role_type}</Text>
                {item.film_credits_summary && (
                  <Text style={styles.entityMeta} numberOfLines={1}>
                    {item.film_credits_summary}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
        />
      )}

      {/* 3. Studios List */}
      {activeTab.startsWith('Studios') && (
        <FlatList
          data={studios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View studio ${item.name}`}
              onPress={() => handleOpenStudio(item.id)}
              style={styles.entityRow}>
              <View style={styles.iconCircle}>
                <Building2 size={22} color="#FFFFFF" />
              </View>
              <View style={styles.entityInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.entityName}>{item.name}</Text>
                  {item.is_verified && <VerifiedBadge size={14} />}
                </View>
                <Text style={styles.entitySubtitle}>
                  Studio • Est. {item.founded_year || '2014'}
                </Text>
                <Text style={styles.entityMeta}>
                  {item.followers_count?.toLocaleString() || '1,200'} followers
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* 4. Festivals List */}
      {activeTab.startsWith('Festivals') && (
        <FlatList
          data={festivals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View festival ${item.name}`}
              onPress={() => handleOpenFestival(item.id)}
              style={styles.entityRow}>
              <View style={styles.iconCircle}>
                <Calendar size={22} color="#FFFFFF" />
              </View>
              <View style={styles.entityInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.entityName}>{item.name}</Text>
                  {item.is_verified && <VerifiedBadge size={14} />}
                </View>
                <Text style={styles.entitySubtitle}>
                  {item.location || 'Philippines'} • Est. {item.founded_year || '2005'}
                </Text>
                <Text style={styles.entityMeta}>
                  {item.followers_count?.toLocaleString() || '8,500'} followers
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* 5. Screenings List */}
      {activeTab.startsWith('Screenings') && (
        <FlatList
          data={screenings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Screening for ${item.film_title}`}
              onPress={() => handleOpenFilm(item.film_id)}
              style={styles.screeningRow}>
              <View style={styles.screeningInfoCol}>
                <Text style={styles.screeningTitle}>{item.film_title}</Text>
                <Text style={styles.screeningVenue}>{item.venue_name}</Text>
                <Text style={styles.screeningCity}>{item.city} • {item.showtime}</Text>
              </View>
              <View style={styles.screeningStatusBadge}>
                <Text style={styles.statusBadgeText}>
                  {item.ticket_status === 'now_showing' ? 'NOW SHOWING' : 'TICKETS'}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 40,
    gap: 14,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    justifyContent: 'flex-start',
  },

  // Generic Entity Row (People, Studios, Festivals)
  entityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    minHeight: 64,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entityName: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  entitySubtitle: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
  entityMeta: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 11,
    marginTop: 2,
  },

  // Screening row styles
  screeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    gap: 12,
  },
  screeningInfoCol: {
    flex: 1,
    gap: 2,
  },
  screeningTitle: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  screeningVenue: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
  },
  screeningCity: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  screeningStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  statusBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
