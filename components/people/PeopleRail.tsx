import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Award } from 'lucide-react-native';
import { Person } from '@/features/people/types';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FollowButton } from '@/components/social/FollowButton';
import { radius, spacing, typography } from '@/lib/theme';

interface PeopleRailProps {
  people: Person[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const PERSON_CARD_WIDTH = 150;

export function PeopleRail({
  people,
  title = 'Directors & Actors',
  subtitle = 'Pioneering Philippine auteurs, national artists, and screen performers',
}: PeopleRailProps) {
  const router = useRouter();

  if (!people || people.length === 0) return null;

  const handleViewAll = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push('/people' as any);
  };

  const handleCardPress = (personId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/person/[id]' as any,
      params: { id: personId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all directors and actors"
          onPress={handleViewAll}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#8A8A8A" />
        </Pressable>
      </View>

      {/* Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}>
        {people.map((person) => {
          const isVerified = person.verification_status === 'verified';
          const isNationalArtist = Boolean(person.national_artist);

          return (
            <Pressable
              key={person.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${person.name}`}
              onPress={() => handleCardPress(person.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}>
              {/* Photo */}
              <View style={styles.photoWrapper}>
                <Image
                  source={{ uri: person.photo_url || undefined }}
                  placeholder={DEFAULT_BLURHASH}
                  contentFit="cover"
                  transition={200}
                  style={styles.photo}
                />
                {isNationalArtist && (
                  <View style={styles.naBadge}>
                    <Award size={10} color="#000000" strokeWidth={3} />
                  </View>
                )}
              </View>

              {/* Name & Role */}
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {person.name}
                </Text>
                {isVerified && <VerifiedBadge size={12} />}
              </View>

              <Text style={styles.roleText} numberOfLines={1}>
                {person.role_type === 'director' ? 'Director' : 'Actor'}
                {person.birth_year ? ` • b. ${person.birth_year}` : ''}
              </Text>

              {/* Inline Follow Button */}
              <View style={styles.followBtnWrap}>
                <FollowButton
                  targetType="person"
                  targetId={person.id}
                  targetName={person.name}
                  size="sm"
                  style={styles.followBtn}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  viewAllText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  railContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: PERSON_CARD_WIDTH,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  cardPressed: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  photoWrapper: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: spacing.xs,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  naBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    marginTop: 2,
  },
  name: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  roleText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: 2,
  },
  followBtnWrap: {
    width: '100%',
    marginTop: 8,
  },
  followBtn: {
    width: '100%',
  },
});

