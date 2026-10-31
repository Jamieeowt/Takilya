import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search, X, Users, Film, Building2, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useFollowing, useFollowers } from '@/features/social/useFollow';
import { FollowEntity, FollowFilterType, FollowTargetType } from '@/features/social/types';
import { FollowEntityCard } from './FollowEntityCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

export interface FollowListScreenProps {
  userId: string;
  mode: 'following' | 'followers';
  userName?: string;
}

const FOLLOWING_FILTERS: { label: string; value: FollowFilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Festivals', value: 'festival' },
  { label: 'Studios', value: 'studio' },
  { label: 'People', value: 'person' },
  { label: 'Users', value: 'user' },
];

const FOLLOWER_FILTERS: { label: string; value: FollowFilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Users', value: 'user' },
];

export function FollowListScreen({ userId, mode, userName }: FollowListScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<FollowFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const targetTypeParam = activeFilter === 'all' ? undefined : (activeFilter as FollowTargetType);

  const {
    data: followingData = [],
    isLoading: isFollowingLoading,
    refetch: refetchFollowing,
    isRefetching: isFollowingRefetching,
  } = useFollowing(mode === 'following' ? userId : undefined, targetTypeParam);

  const {
    data: followersData = [],
    isLoading: isFollowersLoading,
    refetch: refetchFollowers,
    isRefetching: isFollowersRefetching,
  } = useFollowers(mode === 'followers' ? userId : undefined, targetTypeParam);

  const rawList = mode === 'following' ? followingData : followersData;
  const isLoading = mode === 'following' ? isFollowingLoading : isFollowersLoading;
  const isRefetching = mode === 'following' ? isFollowingRefetching : isFollowersRefetching;

  const handleRefresh = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (mode === 'following') {
      await refetchFollowing();
    } else {
      await refetchFollowers();
    }
  };

  // Filter by local search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rawList;
    const q = searchQuery.toLowerCase().trim();
    return rawList.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.handle?.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q)
    );
  }, [rawList, searchQuery]);

  const filterTabs = mode === 'following' ? FOLLOWING_FILTERS : FOLLOWER_FILTERS;

  const handleFilterChange = (filter: FollowFilterType) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setActiveFilter(filter);
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return `No matches found for "${searchQuery}".`;
    }
    if (mode === 'followers') {
      return 'No followers yet. Rate films and write reviews to build your community!';
    }
    switch (activeFilter) {
      case 'festival':
        return 'Not following any festivals yet. Follow Cinemalaya, QCinema, Cinema One, or MMFF to see festival trailers.';
      case 'studio':
        return 'Not following any studios yet. Follow Anima Studios, Black Sheep, or Sine Olivia for new clips.';
      case 'person':
        return 'Not following any filmmakers or actors yet. Follow Ishmael Bernal, Dolly de Leon, or Martika Escobar.';
      case 'user':
        return 'Not following any cinephiles yet. Follow critics like Jessica Zafra and Richard Bolisay.';
      default:
        return 'Not following anyone yet. Explore Philippine festivals, studios, and filmmakers to build your custom feed.';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {mode === 'following' ? 'Following' : 'Followers'}
          </Text>
          {userName && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              @{userName}
            </Text>
          )}
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchInputContainer}>
          <Search size={16} color="#8A8A8A" />
          <TextInput
            accessibilityLabel={`Search ${mode}`}
            placeholder={`Search ${mode === 'following' ? 'following' : 'followers'}...`}
            placeholderTextColor="#8A8A8A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search input"
              onPress={() => setSearchQuery('')}
              hitSlop={8}>
              <X size={16} color="#8A8A8A" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Segmented Filter Pills */}
      <View style={styles.filterPillsRow}>
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.value;
          return (
            <Pressable
              key={tab.value}
              accessibilityRole="tab"
              accessibilityLabel={`Filter by ${tab.label}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleFilterChange(tab.value)}
              style={[
                styles.filterPill,
                isSelected ? styles.filterPillActive : styles.filterPillInactive,
              ]}>
              <Text
                style={[
                  styles.filterPillText,
                  isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Main Content List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <View key={key} style={styles.skeletonRow}>
              <SkeletonLoader width={48} height={48} borderRadius={radius.full} />
              <View style={styles.skeletonInfo}>
                <SkeletonLoader width="60%" height={16} />
                <SkeletonLoader width="40%" height={12} style={{ marginTop: 6 }} />
              </View>
              <SkeletonLoader width={80} height={32} borderRadius={radius.full} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => `${item.target_type}-${item.id}`}
          renderItem={({ item }) => <FollowEntityCard entity={item} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={searchQuery ? 'No Results' : `No ${mode === 'following' ? 'Following' : 'Followers'}`}
              description={getEmptyMessage()}
              icon={<Users size={36} color="#8A8A8A" />}
              actionLabel={mode === 'following' ? 'Explore Philippine Cinema' : undefined}
              onAction={
                mode === 'following'
                  ? () => router.push('/(tabs)/search' as any)
                  : undefined
              }
              style={styles.emptyContainer}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 1,
  },
  headerRightSpacer: {
    width: 44,
  },
  searchBarWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#000000',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 38,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    paddingVertical: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
  },
  filterPillInactive: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterPillText: {
    fontSize: 12,
  },
  filterPillTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  filterPillTextInactive: {
    color: '#8A8A8A',
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.md,
  },
  skeletonInfo: {
    flex: 1,
  },
  emptyContainer: {
    paddingTop: 80,
  },
});
