import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ExternalLink, Film, User, ChevronRight } from 'lucide-react-native';
import { AwardRecognition } from '@/features/awards/types';
import { AwardBadge } from '@/components/ui/AwardBadge';
import { radius, spacing, typography } from '@/lib/theme';

interface AwardRecognitionRowProps {
  recognition: AwardRecognition;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function AwardRecognitionRow({ recognition }: AwardRecognitionRowProps) {
  const router = useRouter();

  const handleRecipientPress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}

    if (recognition.recipient_type === 'film') {
      router.push({
        pathname: '/film/[id]' as any,
        params: { id: recognition.recipient_id },
      });
    } else if (recognition.recipient_type === 'person') {
      router.push({
        pathname: '/person/[id]' as any,
        params: { id: recognition.recipient_id },
      });
    }
  };

  const handleCitationPress = async () => {
    if (!recognition.source_url) return;
    try {
      void Haptics.selectionAsync();
      await Linking.openURL(recognition.source_url);
    } catch {}
  };

  const getStatusLabel = () => {
    switch (recognition.status) {
      case 'won':
        return 'WON';
      case 'nominated':
        return 'NOMINEE';
      case 'official_selection':
        return 'OFFICIAL SELECTION';
      case 'special_mention':
        return 'SPECIAL MENTION';
      default:
        return 'HONOR';
    }
  };

  const thumbUrl =
    recognition.recipient.poster_url ||
    recognition.recipient.photo_url ||
    undefined;

  return (
    <View style={styles.card}>
      {/* Top Meta Row: Year, Category & Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.categoryInfo}>
          <Text style={styles.ceremonyYear}>{recognition.ceremony_year}</Text>
          <Text style={styles.categoryName} numberOfLines={1}>
            {recognition.category_name}
          </Text>
        </View>

        <AwardBadge
          status={recognition.status}
          label={getStatusLabel()}
        />
      </View>

      {/* Recipient Row (Clickable) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${recognition.recipient.name} details`}
        onPress={handleRecipientPress}
        style={({ pressed }) => [
          styles.recipientRow,
          pressed && styles.recipientRowPressed,
        ]}>
        {/* Thumbnail Image */}
        <View style={styles.thumbWrap}>
          {thumbUrl ? (
            <Image
              source={{ uri: thumbUrl }}
              placeholder={DEFAULT_BLURHASH}
              contentFit="cover"
              transition={200}
              style={styles.thumbImage}
            />
          ) : (
            <View style={styles.fallbackThumb}>
              {recognition.recipient_type === 'person' ? (
                <User size={16} color="#8A8A8A" />
              ) : (
                <Film size={16} color="#8A8A8A" />
              )}
            </View>
          )}
        </View>

        {/* Title / Name Details */}
        <View style={styles.recipientTextCol}>
          <Text style={styles.recipientTitle} numberOfLines={1}>
            {recognition.recipient.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.recipientMeta}>
              {recognition.recipient_type === 'person' ? 'Filmmaker / Artist' : 'Film'}
              {recognition.recipient.release_year ? ` • ${recognition.recipient.release_year}` : ''}
              {recognition.recipient.director ? ` • Dir. ${recognition.recipient.director}` : ''}
            </Text>
          </View>
        </View>

        <ChevronRight size={16} color="#8A8A8A" />
      </Pressable>

      {/* Notes / Citation if present */}
      {recognition.notes && (
        <Text style={styles.notesText} numberOfLines={2}>
          {recognition.notes}
        </Text>
      )}

      {/* Source Citation Link */}
      {recognition.source_url && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Verify citation for ${recognition.recipient.name}`}
          onPress={handleCitationPress}
          style={styles.citationLink}>
          <ExternalLink size={12} color="#8A8A8A" />
          <Text style={styles.citationText} numberOfLines={1}>
            Official citation: {recognition.source_url}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  ceremonyYear: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  categoryName: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 1,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: radius.sm,
    padding: spacing.xs,
    gap: spacing.sm,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  recipientRowPressed: {
    backgroundColor: '#1F1F1F',
  },
  thumbWrap: {
    width: 36,
    height: 48,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#2E2E2E',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  fallbackThumb: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientTextCol: {
    flex: 1,
  },
  recipientTitle: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  recipientMeta: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  notesText: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
  },
  citationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    minHeight: 28,
  },
  citationText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
    flex: 1,
    textDecorationLine: 'underline',
  },
});

