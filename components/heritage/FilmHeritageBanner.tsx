import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Landmark, ShieldCheck, Archive, AlertTriangle, HelpCircle } from 'lucide-react-native';
import { FilmPreservationDetail, PreservationStatus } from '@/features/heritage/types';
import { radius, spacing, typography } from '@/lib/theme';

interface FilmHeritageBannerProps {
  preservation?: FilmPreservationDetail | null;
  isClassic?: boolean;
}

export function FilmHeritageBanner({
  preservation,
  isClassic,
}: FilmHeritageBannerProps) {
  if (!preservation && !isClassic) {
    return null;
  }

  const status: PreservationStatus = preservation?.status || 'archived';

  const renderStatusBadge = () => {
    switch (status) {
      case 'restored':
        return (
          <View style={[styles.badgeBase, styles.badgeRestored]}>
            <ShieldCheck size={11} color="#000000" strokeWidth={2.5} />
            <Text style={styles.badgeTextRestored}>RESTORED MASTERWORK</Text>
          </View>
        );
      case 'archived':
        return (
          <View style={[styles.badgeBase, styles.badgeArchived]}>
            <Archive size={11} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.badgeTextArchived}>PRESERVED IN NATIONAL ARCHIVE</Text>
          </View>
        );
      case 'at_risk':
        return (
          <View style={[styles.badgeBase, styles.badgeAtRisk]}>
            <AlertTriangle size={11} color="#D4D4D4" strokeWidth={2} />
            <Text style={styles.badgeTextAtRisk}>PRESERVATION AT RISK</Text>
          </View>
        );
      case 'lost':
        return (
          <View style={styles.doubleOuter}>
            <View style={styles.doubleInner}>
              <HelpCircle size={10} color="#8A8A8A" strokeWidth={2} />
              <Text style={styles.badgeTextLost}>LOST CINEMATIC HERITAGE</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Landmark size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.headerLabel}>PHILIPPINE FILM HERITAGE RECORD</Text>
        <View style={styles.statusWrap}>{renderStatusBadge()}</View>
      </View>

      {/* Main Info */}
      <View style={styles.contentWrap}>
        {preservation?.restoring_body ? (
          <Text style={styles.restoringBodyText}>
            Restored by {preservation.restoring_body}
            {preservation.restoration_year ? ` (${preservation.restoration_year})` : ''}
          </Text>
        ) : (
          <Text style={styles.restoringBodyText}>
            Recognized Philippine Golden Age Classic
          </Text>
        )}

        {preservation?.archive_location && (
          <Text style={styles.locationText}>
            Archive Repository: {preservation.archive_location}
          </Text>
        )}

        {preservation?.notes && (
          <Text style={styles.notesText} numberOfLines={3}>
            {preservation.notes}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#8A8A8A',
    letterSpacing: 0.8,
    flex: 1,
  },
  statusWrap: {
    alignSelf: 'flex-start',
  },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
    letterSpacing: 0.5,
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
    fontSize: 8,
    letterSpacing: 0.5,
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
    fontSize: 8,
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
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#8A8A8A',
  },
  badgeTextLost: {
    ...typography.caption,
    color: '#8A8A8A',
    fontWeight: '700',
    fontSize: 8,
  },
  contentWrap: {
    marginTop: 4,
  },
  restoringBodyText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationText: {
    ...typography.caption,
    fontSize: 11,
    color: '#D4D4D4',
    marginTop: 2,
  },
  notesText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    lineHeight: 16,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});

