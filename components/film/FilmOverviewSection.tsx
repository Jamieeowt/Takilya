import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { ExternalLink, Tv, Clapperboard, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FilmWatchOption } from '@/features/films/types';
import { radius, typography } from '@/lib/theme';

interface FilmOverviewSectionProps {
  synopsis: string;
  watchOptions: FilmWatchOption[];
}

export function FilmOverviewSection({
  synopsis,
  watchOptions,
}: FilmOverviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongSynopsis = synopsis.length > 220;
  const displayedSynopsis =
    isLongSynopsis && !isExpanded
      ? `${synopsis.slice(0, 220)}...`
      : synopsis;

  const handleOpenPlatform = (url: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void Linking.openURL(url);
    } catch (err) {
      console.warn('Failed to open watch link:', err);
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

        {watchOptions.length > 0 ? (
          <View style={styles.platformsList}>
            {watchOptions.map((opt) => {
              const typeLabel =
                opt.availability_type === 'subscription'
                  ? 'Stream'
                  : opt.availability_type === 'rent'
                  ? opt.price_php
                    ? `Rent ₱${opt.price_php}`
                    : 'Rent'
                  : opt.availability_type === 'theatrical'
                  ? 'Theaters'
                  : 'Free';

              return (
                <Pressable
                  key={opt.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Watch on ${opt.platform_name} (${typeLabel}). Opens external link.`}
                  onPress={() => handleOpenPlatform(opt.url)}
                  style={styles.platformBadge}>
                  <View style={styles.platformLeft}>
                    <Text style={styles.platformName} numberOfLines={1}>
                      {opt.platform_name}
                    </Text>
                    {opt.is_local && (
                      <View style={styles.localTag}>
                        <Text style={styles.localTagText}>PH</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.platformRight}>
                    <View style={styles.typePill}>
                      <Text style={styles.typeText}>{typeLabel}</Text>
                    </View>
                    <ExternalLink size={14} color="#8A8A8A" />
                  </View>
                </Pressable>
              );
            })}
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
    gap: 14,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  synopsisWrap: {
    gap: 6,
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
    minHeight: 44, // 44px tap target
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  platformName: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  localTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  localTagText: {
    ...typography.mono,
    color: '#D4D4D4',
    fontSize: 9,
    fontWeight: '700',
  },
  platformRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
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
    lineHeight: 18,
    flex: 1,
  },
});

