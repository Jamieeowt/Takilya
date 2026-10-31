import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ExternalLink,
  Tv,
  CheckCircle2,
  Film,
  Sparkles,
} from 'lucide-react-native';
import { WatchAvailabilityItem, WatchAvailabilityType } from '@/features/availability/types';
import { radius, spacing, typography } from '@/lib/theme';

interface WhereToWatchSectionProps {
  items: WatchAvailabilityItem[];
  filmTitle?: string;
}

export function WhereToWatchSection({
  items,
  filmTitle = 'Film',
}: WhereToWatchSectionProps) {
  if (!items || items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Tv size={16} color="#FFFFFF" />
          <Text style={styles.title}>Where to Watch</Text>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No official digital streaming or theatrical releases currently verified for this title. Check local film festival circuits or archive screenings.
          </Text>
        </View>
      </View>
    );
  }

  const handleOpenLink = async (item: WatchAvailabilityItem) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!item.url || !item.url.startsWith('http')) {
        Alert.alert('Notice', `No direct streaming URL available for ${item.platform_name}.`);
        return;
      }
      const canOpen = await Linking.canOpenURL(item.url);
      if (canOpen) {
        await Linking.openURL(item.url);
      } else {
        Alert.alert('Notice', `Unable to open link for ${item.platform_name}.`);
      }
    } catch {
      Alert.alert('Notice', 'Unable to launch external streaming provider.');
    }
  };

  const renderTypeBadge = (type: WatchAvailabilityType, price?: number | null) => {
    switch (type) {
      case 'stream':
      case 'subscription':
        return (
          <View style={[styles.typeBadge, styles.badgeStream]}>
            <Text style={styles.typeTextStream}>STREAM</Text>
          </View>
        );
      case 'free':
        return (
          <View style={[styles.typeBadge, styles.badgeFree]}>
            <Sparkles size={9} color="#000000" />
            <Text style={styles.typeTextFree}>FREE</Text>
          </View>
        );
      case 'rent':
      case 'buy':
        return (
          <View style={[styles.typeBadge, styles.badgeRent]}>
            <Text style={styles.typeTextRent}>
              {price ? `RENT ₱${price}` : 'RENT'}
            </Text>
          </View>
        );
      case 'cinema':
      case 'theatrical':
        return (
          <View style={[styles.typeBadge, styles.badgeCinema]}>
            <Film size={9} color="#D4D4D4" />
            <Text style={styles.typeTextCinema}>CINEMA</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.typeBadge, styles.badgeStream]}>
            <Text style={styles.typeTextStream}>WATCH</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Tv size={16} color="#FFFFFF" />
        <Text style={styles.title}>Where to Watch</Text>
      </View>

      {/* Availability Rows */}
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="link"
            accessibilityLabel={`Watch on ${item.platform_name}. Verified ${item.last_verified || 'recently'}. Opens external site.`}
            onPress={() => handleOpenLink(item)}
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}>
            {/* Left Col: Platform Name & Badges */}
            <View style={styles.leftCol}>
              <View style={styles.platformRow}>
                <Text style={styles.platformName} numberOfLines={1}>
                  {item.platform_name}
                </Text>
                {item.is_local && (
                  <View style={styles.localTag}>
                    <Text style={styles.localTagText}>PH</Text>
                  </View>
                )}
              </View>

              {/* Verified Freshness Signal */}
              <View style={styles.verifiedRow}>
                <CheckCircle2 size={10} color="#8A8A8A" />
                <Text style={styles.verifiedText}>
                  Verified {item.last_verified || 'recently'}
                </Text>
              </View>
            </View>

            {/* Right Col: Type Badge & Action Button */}
            <View style={styles.rightCol}>
              {renderTypeBadge(item.availability_type, item.price_php)}

              <View style={styles.actionPill}>
                <Text style={styles.actionPillText}>Watch</Text>
                <ExternalLink size={12} color="#000000" />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  emptyCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.md,
  },
  emptyText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    lineHeight: 16,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    minHeight: 56,
  },
  rowPressed: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  leftCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  platformName: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  localTag: {
    backgroundColor: '#141414',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  localTagText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  verifiedText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  badgeStream: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  typeTextStream: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  badgeFree: {
    backgroundColor: '#FFFFFF',
  },
  typeTextFree: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  badgeRent: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeTextRent: {
    ...typography.caption,
    color: '#D4D4D4',
    fontWeight: '700',
    fontSize: 9,
  },
  badgeCinema: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  typeTextCinema: {
    ...typography.caption,
    color: '#D4D4D4',
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    minHeight: 32,
  },
  actionPillText: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '800',
    fontSize: 11,
  },
});

