import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Plus, Lock, Film, ChevronRight } from 'lucide-react-native';
import { UserCustomListItem } from '@/features/account/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

interface ProfileListsTabProps {
  lists: UserCustomListItem[];
  onCreateListPress: () => void;
  onSelectList?: (list: UserCustomListItem) => void;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function ProfileListsTab({
  lists,
  onCreateListPress,
  onSelectList,
}: ProfileListsTabProps) {
  if (!lists || lists.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          title="No Lists Created Yet"
          description="Organize your favorite Filipino films into themed collections, share recommendations, and track curated selections."
        />
        <Button
          label="Create a List"
          variant="primary"
          onPress={onCreateListPress}
          icon={<Plus size={16} color="#000000" />}
          style={styles.emptyCta}
        />
      </View>
    );
  }

  const handleListPress = (item: UserCustomListItem) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onSelectList) {
      onSelectList(item);
    }
  };

  return (
    <View style={styles.container}>
      {/* Create List Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.sectionSubtitle}>
          {lists.length} {lists.length === 1 ? 'Curated List' : 'Curated Lists'}
        </Text>
        <Button
          label="New List"
          variant="secondary"
          onPress={onCreateListPress}
          icon={<Plus size={14} color="#FFFFFF" />}
        />
      </View>

      {/* List of Custom Lists */}
      <View style={styles.listsWrap}>
        {lists.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`View custom list ${item.title} with ${item.film_count} films`}
            onPress={() => handleListPress(item)}
            style={styles.listCard}>
            {/* 2x2 Collage Cover */}
            <View style={styles.collageCover}>
              {item.preview_posters && item.preview_posters.length > 0 ? (
                <View style={styles.collageGrid}>
                  {item.preview_posters.slice(0, 4).map((poster, pIdx) => (
                    <View key={pIdx} style={styles.collageItem}>
                      <Image
                        source={{ uri: poster }}
                        placeholder={{ blurhash: DEFAULT_BLURHASH }}
                        contentFit="cover"
                        style={styles.collagePoster}
                      />
                    </View>
                  ))}
                  {/* Fill up to 4 if fewer */}
                  {Array.from({ length: Math.max(0, 4 - item.preview_posters.length) }).map(
                    (_, fillIdx) => (
                      <View key={`fill-${fillIdx}`} style={styles.collageEmptyItem}>
                        <Film size={14} color="#2E2E2E" />
                      </View>
                    )
                  )}
                </View>
              ) : (
                <View style={styles.blankCollage}>
                  <Film size={24} color="#8A8A8A" />
                </View>
              )}
            </View>

            {/* List Details */}
            <View style={styles.cardDetails}>
              <View style={styles.titleRow}>
                <Text style={styles.listTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.is_private && <Lock size={12} color="#8A8A8A" />}
              </View>

              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.footerRow}>
                <View style={styles.filmCountPill}>
                  <Film size={11} color="#FFFFFF" />
                  <Text style={styles.countText}>
                    {item.film_count} {item.film_count === 1 ? 'film' : 'films'}
                  </Text>
                </View>
                <ChevronRight size={16} color="#8A8A8A" />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyCta: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 260,
  },
  listsWrap: {
    gap: spacing.md,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    overflow: 'hidden',
    padding: spacing.sm,
    gap: spacing.md,
  },
  collageCover: {
    width: 90,
    height: 90,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  collageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  collageItem: {
    width: '50%',
    height: '50%',
  },
  collagePoster: {
    width: '100%',
    height: '100%',
  },
  collageEmptyItem: {
    width: '50%',
    height: '50%',
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankCollage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  listTitle: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 18,
  },
  description: {
    ...typography.body,
    fontSize: 11,
    color: '#8A8A8A',
    lineHeight: 15,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  filmCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#141414',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4D4D4',
  },
});

