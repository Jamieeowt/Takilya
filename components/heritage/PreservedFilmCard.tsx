import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Film,
  Building,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Archive,
  HelpCircle,
} from 'lucide-react-native';
import { PreservedFilmItem, PreservationStatus } from '@/features/heritage/types';
import { radius, spacing, typography } from '@/lib/theme';

interface PreservedFilmCardProps {
  item: PreservedFilmItem;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function PreservedFilmCard({ item }: PreservedFilmCardProps) {
  const router = useRouter();

  const handlePress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: item.film_id },
    });
  };

  const renderStatusBadge = (status: PreservationStatus) => {
    switch (status) {
      case 'restored':
        // Restored = filled badge
        return (
          <View style={[styles.badgeBase, styles.badgeRestored]}>
            <ShieldCheck size={11} color="#000000" strokeWidth={2.5} />
            <Text style={styles.badgeTextRestored}>RESTORED</Text>
          </View>
        );
      case 'archived':
        // Archived = outlined badge
        return (
          <View style={[styles.badgeBase, styles.badgeArchived]}>
            <Archive size={11} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.badgeTextArchived}>ARCHIVED</Text>
          </View>
        );
      case 'at_risk':
        // At Risk = dashed outline badge
        return (
          <View style={[styles.badgeBase, styles.badgeAtRisk]}>
            <AlertTriangle size={11} color="#D4D4D4" strokeWidth={2} />
            <Text style={styles.badgeTextAtRisk}>AT RISK</Text>
          </View>
        );
      case 'lost':
        // Lost = double outline badge
        return (
          <View style={styles.doubleOuter}>
            <View style={styles.doubleInner}>
              <HelpCircle size={10} color="#8A8A8A" strokeWidth={2} />
              <Text style={styles.badgeTextLost}>LOST ARCHIVE</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View preserved film ${item.film.title}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}>
      {/* Top Section: Poster, Title & Status */}
      <View style={styles.topRow}>
        <View style={styles.posterWrap}>
          <Image
            source={{ uri: item.film.poster_url || undefined }}
            placeholder={DEFAULT_BLURHASH}
            contentFit="cover"
            transition={200}
            style={styles.poster}
          />
        </View>

        <View style={styles.infoCol}>
          <View style={styles.statusRow}>
            {renderStatusBadge(item.status)}
            <ChevronRight size={16} color="#8A8A8A" />
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {item.film.title}
          </Text>

          <Text style={styles.metaText}>
            {item.film.release_year}
            {item.film.director ? ` • Dir. ${item.film.director}` : ''}
          </Text>

          {/* Restoring Body */}
          {item.restoring_body && (
            <View style={styles.detailRow}>
              <Building size={11} color="#8A8A8A" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.restoring_body}
              </Text>
            </View>
          )}

          {/* Restoration Year */}
          {item.restoration_year && (
            <View style={styles.detailRow}>
              <Calendar size={11} color="#8A8A8A" />
              <Text style={styles.detailText}>
                Restored in {item.restoration_year}
              </Text>
            </View>
          )}

          {/* Archive Location */}
          {item.archive_location && (
            <View style={styles.detailRow}>
              <MapPin size={11} color="#8A8A8A" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.archive_location}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Preservation Notes */}
      {item.notes && (
        <View style={styles.notesWrap}>
          <Text style={styles.notesText} numberOfLines={2}>
            {item.notes}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  posterWrap: {
    width: 64,
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: '#141414',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  metaText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  detailText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 11,
    flex: 1,
  },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeRestored: {
    backgroundColor: '#FFFFFF',
  },
  badgeTextRestored: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.6,
  },
  badgeArchived: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeTextArchived: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 0.6,
  },
  badgeAtRisk: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#8A8A8A',
  },
  badgeTextAtRisk: {
    ...typography.caption,
    color: '#D4D4D4',
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 0.6,
  },
  doubleOuter: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#8A8A8A',
    padding: 1,
  },
  doubleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#8A8A8A',
  },
  badgeTextLost: {
    ...typography.caption,
    color: '#8A8A8A',
    fontWeight: '700',
    fontSize: 8,
    letterSpacing: 0.6,
  },
  notesWrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  notesText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    lineHeight: 15,
  },
});

