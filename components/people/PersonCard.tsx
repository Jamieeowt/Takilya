import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Film, Award, Users } from 'lucide-react-native';
import { Person } from '@/features/people/types';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FollowButton } from '@/components/social/FollowButton';
import { radius, spacing, typography } from '@/lib/theme';

interface PersonCardProps {
  person: Person;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function PersonCard({ person }: PersonCardProps) {
  const router = useRouter();

  const handlePress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/person/[id]' as any,
      params: { id: person.id },
    });
  };

  const isVerified = person.verification_status === 'verified';
  const isNationalArtist = Boolean(person.national_artist);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'director':
        return 'Director';
      case 'actor':
        return 'Actor';
      case 'writer':
        return 'Screenwriter';
      case 'cinematographer':
        return 'Cinematographer';
      case 'producer':
        return 'Producer';
      default:
        return 'Filmmaker';
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${person.name}, ${getRoleLabel(person.role_type)}`}
      onPress={handlePress}
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
      </View>

      {/* Info Container */}
      <View style={styles.infoWrapper}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name}
          </Text>
          {isVerified && <VerifiedBadge size={14} />}
        </View>

        {/* National Artist Badge */}
        {isNationalArtist && (
          <View style={styles.naBadge}>
            <Award size={10} color="#000000" strokeWidth={2.5} />
            <Text style={styles.naBadgeText}>
              NATIONAL ARTIST ({person.national_artist?.year_conferred})
            </Text>
          </View>
        )}

        {/* Role & Bio */}
        <Text style={styles.roleText}>
          {getRoleLabel(person.role_type)}
          {person.birth_year ? ` • b. ${person.birth_year}` : ''}
        </Text>

        {person.bio && (
          <Text style={styles.bioText} numberOfLines={2}>
            {person.bio}
          </Text>
        )}

        {/* Stats & Follow Button */}
        <View style={styles.bottomRow}>
          <View style={styles.statsCol}>
            <View style={styles.metaItem}>
              <Users size={11} color="#8A8A8A" />
              <Text style={styles.metaText}>
                {person.followers_count.toLocaleString()} followers
              </Text>
            </View>
            {person.films_count !== undefined && (
              <View style={styles.metaItem}>
                <Film size={11} color="#8A8A8A" />
                <Text style={styles.metaText}>{person.films_count} films</Text>
              </View>
            )}
          </View>

          <FollowButton
            targetType="person"
            targetId={person.id}
            targetName={person.name}
            size="sm"
            style={styles.followBtn}
          />
        </View>
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
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 110,
  },
  cardPressed: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  photoWrapper: {
    width: 72,
    height: 96,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  naBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginTop: 3,
    marginBottom: 2,
  },
  naBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.4,
  },
  roleText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#D4D4D4',
    marginTop: 2,
  },
  bioText: {
    ...typography.bodySmall,
    fontSize: 11,
    lineHeight: 15,
    color: '#8A8A8A',
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statsCol: {
    gap: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  followBtn: {
    minWidth: 90,
  },
});

