import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MapPin, Calendar, Users } from 'lucide-react-native';
import { Festival } from '@/features/festivals/types';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FollowButton } from '@/components/social/FollowButton';
import { radius, spacing, typography } from '@/lib/theme';

interface FestivalCardProps {
  festival: Festival;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function FestivalCard({ festival }: FestivalCardProps) {
  const router = useRouter();

  const handlePress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/festival/[id]' as any,
      params: { id: festival.id },
    });
  };

  const isVerified = festival.verification_status === 'verified';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View festival ${festival.name}, established ${festival.founded_year || 'unknown'}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}>
      {/* Banner / Poster Thumbnail */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: festival.logo_url || festival.banner_url || undefined }}
          placeholder={DEFAULT_BLURHASH}
          contentFit="cover"
          transition={200}
          style={styles.logoImage}
        />
      </View>

      {/* Info Container */}
      <View style={styles.infoWrap}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>
            {festival.name}
          </Text>
          {isVerified && <VerifiedBadge size={14} style={styles.verifiedBadge} />}
        </View>

        {festival.description && (
          <Text style={styles.description} numberOfLines={2}>
            {festival.description}
          </Text>
        )}

        {/* Metadata Details */}
        <View style={styles.metaRow}>
          {festival.location && (
            <View style={styles.metaItem}>
              <MapPin size={11} color="#8A8A8A" />
              <Text style={styles.metaText} numberOfLines={1}>
                {festival.location}
              </Text>
            </View>
          )}

          {festival.founded_year && (
            <View style={styles.metaItem}>
              <Calendar size={11} color="#8A8A8A" />
              <Text style={styles.metaText}>Est. {festival.founded_year}</Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <Users size={11} color="#8A8A8A" />
            <Text style={styles.metaText}>
              {festival.followers_count.toLocaleString()} followers
            </Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <FollowButton
            targetType="festival"
            targetId={festival.id}
            targetName={festival.name}
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
    minHeight: 120,
  },
  cardPressed: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  imageWrap: {
    width: 80,
    height: 104,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  infoWrap: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  name: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 19,
    flex: 1,
  },
  verifiedBadge: {
    marginTop: 2,
  },
  description: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
    color: '#8A8A8A',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  followBtn: {
    minWidth: 100,
  },
});

