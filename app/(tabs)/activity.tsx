import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';

import { useSession } from '@/features/auth';
import {
  useCommunityActivity,
  useToggleLikeReview,
  useCreateCuratedList,
} from '@/features/social/useActivity';
import { ActivityItem, CuratedListDraft } from '@/features/social/types';
import {
  ActivityCard,
  ReviewDetailModal,
  CustomListCreatorModal,
} from '@/components/social';

import { GlassHeader } from '@/components/ui/GlassHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { radius, spacing } from '@/lib/theme';

const FILTER_OPTIONS = ['All Feed', 'Reviews', 'Following'];

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useSession();

  const [filterIndex, setFilterIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateListModalVisible, setIsCreateListModalVisible] = useState(false);

  const filterType = filterIndex === 1 ? 'reviews' : filterIndex === 2 ? 'following' : 'all';

  const {
    data: activities = [],
    isLoading,
    refetch,
    isRefetching,
  } = useCommunityActivity(user?.id, filterType);

  const toggleLikeMutation = useToggleLikeReview();
  const createListMutation = useCreateCuratedList();

  const handleLike = (item: ActivityItem) => {
    if (!user) return;
    const reviewId = item.review?.id || item.id;
    toggleLikeMutation.mutate({
      userId: user.id,
      reviewId,
      currentlyLiked: item.is_liked,
      activityId: item.id,
    });
  };

  const handleOpenReview = (item: ActivityItem) => {
    setSelectedActivity(item);
    setIsDetailModalVisible(true);
  };

  const handleShare = async (item: ActivityItem) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: `${item.user.name}'s activity on Takilya`,
        message: `${item.user.name} ${item.type} on Takilya: ${item.film?.title || item.list?.title || 'Philippine Cinema'}`,
      });
    } catch {}
  };

  const handleNavigateFilm = (filmId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/film/[id]' as any,
      params: { id: filmId },
    });
  };

  const handleCreateList = (draft: CuratedListDraft) => {
    if (!user) return;
    createListMutation.mutate({
      userId: user.id,
      draft,
    });
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <SegmentedControl
        options={FILTER_OPTIONS}
        selectedIndex={filterIndex}
        onChange={setFilterIndex}
        style={styles.segmentedControl}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Glass Header */}
      <GlassHeader
        title="Community Activity"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create custom list"
            onPress={() => {
              try {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setIsCreateListModalVisible(true);
            }}
            style={styles.newListHeaderBtn}>
            <Plus size={18} color="#FFFFFF" />
          </Pressable>
        }
      />

      {/* Main Activity Stream */}
      {isLoading ? (
        <View style={[styles.loadingBox, { paddingTop: insets.top + 60 }]}>
          <SkeletonLoader height={140} style={styles.skeletonCard} />
          <SkeletonLoader height={140} style={styles.skeletonCard} />
          <SkeletonLoader height={140} style={styles.skeletonCard} />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.feedContent,
            { paddingTop: insets.top + 52 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor="#FFFFFF"
            />
          }
          renderItem={({ item }) => (
            <ActivityCard
              item={item}
              onLikePress={() => handleLike(item)}
              onCommentPress={() => handleOpenReview(item)}
              onFilmPress={handleNavigateFilm}
              onSharePress={() => handleShare(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <EmptyState
                title="No Activity Yet"
                description={
                  filterIndex === 2
                    ? 'Follow cinephiles, critics, and film lovers to see their logged watches and reviews here.'
                    : 'Be the first to rate, review, or curate a Philippine film collection.'
                }
              />
              <Button
                label="Explore Films"
                variant="primary"
                onPress={() => router.push('/(tabs)/search' as any)}
                style={styles.emptyBtn}
              />
            </View>
          }
        />
      )}

      {/* Review Details & Comment Thread Modal */}
      <ReviewDetailModal
        visible={isDetailModalVisible}
        activityItem={selectedActivity}
        currentUserId={user?.id}
        onClose={() => setIsDetailModalVisible(false)}
        onLikePress={() => {
          if (selectedActivity) {
            handleLike(selectedActivity);
            setSelectedActivity((prev) =>
              prev
                ? {
                    ...prev,
                    is_liked: !prev.is_liked,
                    likes_count: prev.is_liked
                      ? Math.max(0, prev.likes_count - 1)
                      : prev.likes_count + 1,
                  }
                : null
            );
          }
        }}
      />

      {/* Curated List Creator Modal */}
      <CustomListCreatorModal
        visible={isCreateListModalVisible}
        onClose={() => setIsCreateListModalVisible(false)}
        onCreate={handleCreateList}
        isCreating={createListMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  newListHeaderBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  skeletonCard: {
    borderRadius: radius.card,
  },
  feedContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 80,
  },
  listHeader: {
    paddingVertical: spacing.md,
  },
  segmentedControl: {
    width: '100%',
  },
  emptyWrap: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyBtn: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 240,
  },
});

