import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { ExternalLink, Tv, Clapperboard, Sparkles, CheckCircle2, Film } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FilmWatchOption } from '@/features/films/types';
import { WatchAvailabilityItem, WatchAvailabilityType } from '@/features/availability/types';
import { radius, spacing, typography } from '@/lib/theme';

interface FilmOverviewSectionProps {
  synopsis: string;
  watchOptions?: FilmWatchOption[];
  availabilityItems?: WatchAvailabilityItem[];
}

export function FilmOverviewSection({
  synopsis,
  watchOptions = [],
  availabilityItems,
}: FilmOverviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongSynopsis = synopsis.length > 220;
  const displayedSynopsis =
    isLongSynopsis && !isExpanded
      ? `${synopsis.slice(0, 220)}...`
      : synopsis;

  const handleOpenPlatform = async (url: string, platformName?: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!url || !url.startsWith('http')) {
        Alert.alert('Notice', `No direct streaming URL available for ${platformName || 'this provider'}.`);
        return;
      }
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Notice', `Unable to open link for ${platformName || 'this provider'}.`);
      }
    } catch {
      Alert.alert('Notice', 'Unable to launch external streaming provider.');
    }
  };

  // Harmonize items from availabilityItems or watchOptions
  const displayItems =
    availabilityItems && availabilityItems.length > 0
      ? availabilityItems
      : watchOptions.map((opt) => ({
          id: opt.id,
          film_id: '',
          platform_id: '',
          platform_name: opt.platform_name,
          platform_slug: opt.platform_slug,
          is_local: opt.is_local,
          url: opt.url,
          availability_type:
            opt.availability_type === 'subscription'
              ? ('stream' as WatchAvailabilityType)
              : opt.availability_type === 'theatrical'
              ? ('cinema' as WatchAvailabilityType)
              : (opt.availability_type as WatchAvailabilityType),
          price_php: opt.price_php,
          last_verified: 'Oct 2026',
        }));

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
            <Sparkles size={8} color="#000000" />
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
            <Film size={8} color="#D4D4D4" />
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
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Overview</Text>

      {/* Synopsis text */}
      <View style={styles.synopsisWrap}>
        <Text style={styles.synopsisText}>{displayedSynopsis}</Text>
        {isLongSynopsis && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isExpanded ? 'Show less synopsis' : 'Read more synopsis'}
            onPress={() => setIsExpanded(!isExpanded)}
            hitSlop={8}
            style={styles.expandBtn}>
            <Text style={styles.expandText}>
              {isExpanded ? 'Show less' : 'Read more'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Where to Watch / Availability Section */}
      <View style={styles.watchContainer}>
        <View style={styles.watchHeader}>
          <Tv size={15} color="#FFFFFF" />
          <Text style={styles.watchHeading}>Where to Watch</Text>
        </View>

        {displayItems.length > 0 ? (
          <View style={styles.platformsList}>
            {displayItems.map((opt) => (
              <Pressable
                key={opt.id}
                accessibilityRole="link"
                accessibilityLabel={`Watch on ${opt.platform_name}. Verified ${opt.last_verified || 'recently'}. Opens external link.`}
                onPress={() => handleOpenPlatform(opt.url, opt.platform_name)}
                style={styles.platformBadge}>
                {/* Platform Name and verified freshness */}
                <View style={styles.platformLeft}>
                  <View style={styles.platformNameRow}>
                    <Text style={styles.platformName} numberOfLines={1}>
                      {opt.platform_name}
                    </Text>
                    {opt.is_local && (
                      <View style={styles.localTag}>
                        <Text style={styles.localTagText}>PH</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.verifiedRow}>
                    <CheckCircle2 size={10} color="#8A8A8A" />
                    <Text style={styles.verifiedText}>
                      Verified {opt.last_verified || 'recently'}
                    </Text>
                  </View>
                </View>

                {/* Type Badge and Action */}
                <View style={styles.platformRight}>
                  {renderTypeBadge(opt.availability_type, opt.price_php)}
                  <View style={styles.watchActionBtn}>
                    <Text style={styles.watchActionText}>Watch</Text>
                    <ExternalLink size={11} color="#000000" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyWatchBox}>
            <Clapperboard size={20} color="#8A8A8A" />
            <Text style={styles.emptyWatchText}>
              Currently in festival circuit or Philippine physical archive.
              Add to your watchlist to receive notification when digital streaming becomes available.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  synopsisWrap: {
    gap: 8,
  },
  synopsisText: {
    ...typography.body,
    color: '#D4D4D4',
    fontSize: 14,
    lineHeight: 22,
  },
  expandBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  expandText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  watchContainer: {
    marginTop: 8,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    gap: 12,
  },
  watchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchHeading: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  platformsList: {
    gap: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 52, // >= 44px tap target
  },
  platformLeft: {
    flex: 1,
    paddingRight: 8,
  },
  platformNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  platformName: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  localTag: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  localTagText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
  },
  platformRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  badgeStream: {
    backgroundColor: '#0A0A0A',
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
  watchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    minHeight: 28,
  },
  watchActionText: {
    ...typography.caption,
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyWatchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: radius.sm,
  },
  emptyWatchText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});
