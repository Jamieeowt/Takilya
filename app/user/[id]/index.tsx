import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Settings } from 'lucide-react-native';

import { useSession } from '@/features/auth';
import {
  useUserProfile,
  useUserDiary,
  useUserWatchlist,
  useUserCustomLists,
  useUserReviews,
  useUserDiscussions,
  useUpdateProfile,
  useUpdateTopFilms,
  useRemoveFromWatchlist,
  useCreateCustomList,
} from '@/features/account/useAccount';
import { UserCustomListItem } from '@/features/account/types';

import {
  ProfileHeader,
  TopFavoritesShowcase,
  AchievementBadges,
  RecentActivityRow,
  ProfileDiaryTab,
  ProfileWatchlistTab,
  ProfileListsTab,
  ProfileReviewsTab,
  ProfileDiscussionsTab,
  EditProfileSheet,
  ReorderTopFilmsSheet,
  CreateListSheet,
} from '@/components/profile';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { radius, spacing } from '@/lib/theme';

const TAB_OPTIONS = ['Diary', 'Watchlist', 'Lists', 'Reviews', 'Discussions'];

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();

  const isOwnProfile = Boolean(user?.id && user.id === id);

  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state (for own profile)
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isReorderVisible, setIsReorderVisible] = useState(false);
  const [isCreateListVisible, setIsCreateListVisible] = useState(false);

  // Queries
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useUserProfile(id);

  const {
    data: diary = [],
    isLoading: isDiaryLoading,
    refetch: refetchDiary,
  } = useUserDiary(id);

  const {
    data: watchlist = [],
    isLoading: isWatchlistLoading,
    refetch: refetchWatchlist,
  } = useUserWatchlist(id);

  const {
    data: customLists = [],
    isLoading: isListsLoading,
    refetch: refetchLists,
  } = useUserCustomLists(id);

  const {
    data: reviews = [],
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useUserReviews(id);

  const {
    data: discussions = [],
    isLoading: isDiscussionsLoading,
    refetch: refetchDiscussions,
  } = useUserDiscussions(id);

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const updateTopFilmsMutation = useUpdateTopFilms();
  const removeFromWatchlistMutation = useRemoveFromWatchlist();
  const createCustomListMutation = useCreateCustomList();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchDiary(),
        refetchWatchlist(),
        refetchLists(),
        refetchReviews(),
        refetchDiscussions(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveProfile = (payload: {
    display_name: string;
    username: string;
    bio: string;
    avatar_url?: string;
  }) => {
    if (user?.id) {
      updateProfileMutation.mutate({
        userId: user.id,
        payload,
      });
    }
  };

  const handleSaveTopFilms = (reordered: { filmId: string; position: number }[]) => {
    if (user?.id) {
      updateTopFilmsMutation.mutate({
        userId: user.id,
        films: reordered,
      });
    }
  };

  const handleRemoveFromWatchlist = (filmId: string) => {
    if (user?.id) {
      removeFromWatchlistMutation.mutate({
        userId: user.id,
        filmId,
      });
    }
  };

  const handleCreateList = (data: { title: string; description: string; isPrivate: boolean }) => {
    if (user?.id) {
      createCustomListMutation.mutate({
        userId: user.id,
        title: data.title,
        description: data.description,
        isPrivate: data.isPrivate,
      });
    }
  };

  const handleExploreRedirect = () => {
    router.push('/(tabs)/search' as any);
  };

  if (isProfileLoading && !profile) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <View style={styles.skeletonWrapper}>
          <SkeletonLoader height={80} style={{ borderRadius: radius.full, width: 80 }} />
          <SkeletonLoader height={24} style={{ width: '60%', marginTop: 16 }} />
          <SkeletonLoader height={14} style={{ width: '40%', marginTop: 8 }} />
          <SkeletonLoader height={50} style={{ width: '100%', marginTop: 24 }} />
          <SkeletonLoader height={160} style={{ width: '100%', marginTop: 24 }} />
        </View>
      </View>
    );
  }

  const currentProfile = profile!;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <GlassHeader
        title={currentProfile.display_name}
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.headerActionBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
        }
        right={
          isOwnProfile ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={() => {
                try {
                  void Haptics.selectionAsync();
                } catch {}
                router.push('/settings' as any);
              }}
              style={styles.headerActionBtn}>
              <Settings size={19} color="#FFFFFF" />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
          />
        }>
        {/* 1. Profile Header */}
        <ProfileHeader
          profile={currentProfile}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onEditPress={() => setIsEditProfileVisible(true)}
          isOwnProfile={isOwnProfile}
        />

        {/* 2. Pinned & Favorites Showcase */}
        <TopFavoritesShowcase
          topFilms={currentProfile.top_films}
          onOpenReorder={isOwnProfile ? () => setIsReorderVisible(true) : undefined}
        />

        {/* 3. Activity Achievement Badges */}
        <AchievementBadges badges={currentProfile.badges} />

        {/* Recent Activity Feed */}
        <RecentActivityRow
          activity={diary}
          onViewAllPress={() => setActiveTab(0)}
        />

        {/* 4. Sticky Tabbed Sections */}
        <View style={styles.tabsSection}>
          <SegmentedControl
            options={TAB_OPTIONS}
            selectedIndex={activeTab}
            onChange={setActiveTab}
            style={styles.segmentedControl}
            scrollable
          />
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentArea}>
          {activeTab === 0 && (
            <ProfileDiaryTab
              diary={diary}
              onStartLoggingPress={isOwnProfile ? handleExploreRedirect : undefined}
            />
          )}

          {activeTab === 1 && (
            <ProfileWatchlistTab
              watchlist={watchlist}
              onExplorePress={isOwnProfile ? handleExploreRedirect : undefined}
              onRemoveFromWatchlist={isOwnProfile ? handleRemoveFromWatchlist : undefined}
            />
          )}

          {activeTab === 2 && (
            <ProfileListsTab
              lists={customLists}
              onCreateListPress={isOwnProfile ? () => setIsCreateListVisible(true) : undefined}
              onSelectList={(list: UserCustomListItem) => {
                // Future list detail navigation
              }}
            />
          )}

          {activeTab === 3 && (
            <ProfileReviewsTab
              reviews={reviews}
              onWriteReviewPress={isOwnProfile ? handleExploreRedirect : undefined}
            />
          )}

          {activeTab === 4 && (
            <ProfileDiscussionsTab
              discussions={discussions}
              onStartDiscussionPress={isOwnProfile ? handleExploreRedirect : undefined}
            />
          )}
        </View>
      </ScrollView>

      {/* Sheets & Modals (Only for own profile) */}
      {isOwnProfile && (
        <>
          <EditProfileSheet
            visible={isEditProfileVisible}
            profile={currentProfile}
            onClose={() => setIsEditProfileVisible(false)}
            onSave={handleSaveProfile}
            isSaving={updateProfileMutation.isPending}
          />

          <ReorderTopFilmsSheet
            visible={isReorderVisible}
            topFilms={currentProfile.top_films}
            onClose={() => setIsReorderVisible(false)}
            onSave={handleSaveTopFilms}
          />

          <CreateListSheet
            visible={isCreateListVisible}
            onClose={() => setIsCreateListVisible(false)}
            onCreate={handleCreateList}
            isCreating={createCustomListMutation.isPending}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonWrapper: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#000000',
  },
  segmentedControl: {
    width: '100%',
  },
  tabContentArea: {
    minHeight: 300,
  },
});

