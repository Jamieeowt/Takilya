import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Calendar, Film, Users } from 'lucide-react-native';
import { Studio } from '@/features/studios/types';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FollowButton } from '@/components/social/FollowButton';
import { radius, spacing, typography } from '@/lib/theme';

interface StudioCardProps {
  studio: Studio;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function StudioCard({ studio }: StudioCardProps) {
  const router = useRouter();

  const handlePress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/studio/[id]' as any,
      params: { id: studio.id },
    });
  };

  const isVerified = studio.verification_status === 'verified';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View studio ${studio.name}, founded ${studio.founded_year || 'unknown'}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}>
      {/* Studio Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={{ uri: studio.logo_url || undefined }}
          placeholder={DEFAULT_BLURHASH}
          contentFit="cover"
          transition={200}
          style={styles.logo}
        />
      </View>

      {/* Info Container */}
      <View style={styles.infoWrapper}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {studio.name}
          </Text>
          {isVerified && <VerifiedBadge size={14} />}
        </View>

        {studio.founded_year && (
          <View style={styles.foundedRow}>
            <Calendar size={11} color="#8A8A8A" />
            <Text style={styles.foundedText}>Est. {studio.founded_year}</Text>
          </View>
        )}

        {studio.description && (
          <Text style={styles.description} numberOfLines={2}>
            {studio.description}
          </Text>
        )}

        {/* Stats & Action Row */}
        <View style={styles.bottomRow}>
          <View style={styles.statsCol}>
            <View style={styles.metaItem}>
              <Users size={11} color="#8A8A8A" />
              <Text style={styles.metaText}>
                {studio.followers_count.toLocaleString()} followers
              </Text>
            </View>
            {studio.films_count !== undefined && (
              <View style={styles.metaItem}>
                <Film size={11} color="#8A8A8A" />
                <Text style={styles.metaText}>{studio.films_count} films</Text>
              </View>
            )}
          </View>

          <FollowButton
            targetType="studio"
            targetId={studio.id}
            targetName={studio.name}
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
  logoWrapper: {
    width: 68,
    height: 68,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logo: {
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
  foundedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  foundedText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  description: {
    ...typography.bodySmall,
    fontSize: 11,
    lineHeight: 15,
    color: '#8A8A8A',
    marginTop: 4,
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

