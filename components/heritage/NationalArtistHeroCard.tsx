import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Award, ChevronRight } from 'lucide-react-native';
import { NationalArtistItem } from '@/features/heritage/types';
import { radius, spacing, typography } from '@/lib/theme';

interface NationalArtistHeroCardProps {
  item: NationalArtistItem;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function NationalArtistHeroCard({ item }: NationalArtistHeroCardProps) {
  const router = useRouter();

  const handlePress = () => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/person/[id]' as any,
      params: { id: item.person_id },
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View National Artist ${item.person.name}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}>
      {/* Top Row: Portrait, Details & Conferred Year */}
      <View style={styles.topRow}>
        <View style={styles.photoWrap}>
          <Image
            source={{ uri: item.person.photo_url || undefined }}
            placeholder={DEFAULT_BLURHASH}
            contentFit="cover"
            transition={200}
            style={styles.photo}
          />
          <View style={styles.naBadge}>
            <Award size={10} color="#000000" strokeWidth={2.5} />
          </View>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.person.name}
            </Text>
            <ChevronRight size={16} color="#8A8A8A" />
          </View>

          <View style={styles.conferredPill}>
            <Text style={styles.conferredText}>
              CONFERRED {item.year_conferred} • {item.category.toUpperCase()}
            </Text>
          </View>

          {item.person.birth_year && (
            <Text style={styles.birthText}>
              b. {item.person.birth_year} {item.person.role_type ? `• ${item.person.role_type.toUpperCase()}` : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Official Citation */}
      {item.citation && (
        <View style={styles.citationWrap}>
          <Text style={styles.citationText}>
            &ldquo;{item.citation}&rdquo;
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Explore Filmography & Honors</Text>
        <ChevronRight size={12} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  naBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
  },
  conferredPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#141414',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 3,
  },
  conferredText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#D4D4D4',
    letterSpacing: 0.5,
  },
  birthText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 3,
  },
  citationWrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: '#FFFFFF',
  },
  citationText: {
    ...typography.caption,
    fontSize: 12,
    color: '#D4D4D4',
    lineHeight: 17,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});

