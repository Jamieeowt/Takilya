import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Film,
  Building2,
  Calendar,
  User as UserIcon,
} from 'lucide-react-native';
import { FollowEntity } from '@/features/social/types';
import { FollowButton } from './FollowButton';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { radius, spacing, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export interface FollowEntityCardProps {
  entity: FollowEntity;
  onPress?: () => void;
}

export function FollowEntityCard({ entity, onPress }: FollowEntityCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (entity.target_type === 'user') {
      router.push(`/user/${entity.id}/followers` as any);
    } else {
      // Navigate to search filtered by entity name
      router.push({
        pathname: '/(tabs)/search' as any,
        params: { q: entity.name },
      });
    }
  };

  const renderIconFallback = () => {
    switch (entity.target_type) {
      case 'festival':
        return <Calendar size={20} color="#8A8A8A" />;
      case 'studio':
        return <Building2 size={20} color="#8A8A8A" />;
      case 'person':
        return <Film size={20} color="#8A8A8A" />;
      default:
        return <UserIcon size={20} color="#8A8A8A" />;
    }
  };

  const getTargetTypeBadge = () => {
    switch (entity.target_type) {
      case 'festival':
        return 'FESTIVAL';
      case 'studio':
        return 'STUDIO';
      case 'person':
        return 'PERSON';
      case 'user':
        return entity.role === 'critic' ? 'CRITIC' : null;
      default:
        return null;
    }
  };

  const badgeText = getTargetTypeBadge();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${entity.name}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}>
      {/* Avatar / Logo / Photo */}
      <View style={styles.avatarWrap}>
        {entity.avatar_url ? (
          <Image
            source={{ uri: entity.avatar_url }}
            placeholder={{ blurhash: DEFAULT_BLURHASH }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.avatarFallback}>{renderIconFallback()}</View>
        )}
      </View>

      {/* Info Column */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {entity.name}
          </Text>
          {entity.is_verified && <VerifiedBadge size={14} />}
          {badgeText && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{badgeText}</Text>
            </View>
          )}
        </View>

        {entity.handle ? (
          <Text style={styles.handleText} numberOfLines={1}>
            @{entity.handle}
          </Text>
        ) : null}

        {entity.subtitle ? (
          <Text style={styles.subtitleText} numberOfLines={1}>
            {entity.subtitle}
          </Text>
        ) : null}
      </View>

      {/* Reusable Follow Button */}
      <View style={styles.actionCol}>
        <FollowButton
          targetType={entity.target_type}
          targetId={entity.id}
          targetName={entity.name}
          initialIsFollowing={entity.is_following}
          size="sm"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 68,
  },
  cardPressed: {
    backgroundColor: '#0A0A0A',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#8A8A8A',
  },
  handleText: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 1,
  },
  subtitleText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  actionCol: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

