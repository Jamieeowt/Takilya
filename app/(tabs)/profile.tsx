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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LogOut, LogIn, Settings } from 'lucide-react-native';

import { useSession, useAuth } from '@/features/auth';
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
import { radius, spacing, typography } from '@/lib/theme';

const TAB_OPTIONS = ['Diary', 'Watchlist', 'Lists', 'Reviews', 'Discussions'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useSession();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isReorderVisible, setIsReorderVisible] = useState(false);
  const [isCreateListVisible, setIsCreateListVisible] = useState(false);

  // Queries
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useUserProfile(user?.id);

  const {
    data: diary = [],
    isLoading: isDiaryLoading,
    refetch: refetchDiary,
  } = useUserDiary(user?.id);

  const {
    data: watchlist = [],
    isLoading: isWatchlistLoading,
    refetch: refetchWatchlist,
  } = useUserWatchlist(user?.id);

  const {
    data: customLists = [],
    isLoading: isListsLoading,
    refetch: refetchLists,
  } = useUserCustomLists(user?.id);

  const {
    data: reviews = [],
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useUserReviews(user?.id);

  const {
    data: discussions = [],
    isLoading: isDiscussionsLoading,
    refetch: refetchDiscussions,
  } = useUserDiscussions(user?.id);

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

  const handleSignOut = async () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    await signOut();
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

  if (isAuthLoading || (isProfileLoading && !profile)) {
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

  // Fallback safe profile object
  const currentProfile = profile!;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <GlassHeader
        title={currentProfile.display_name}
        right={
          <View style={styles.headerRightRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Settings"
              onPress={() => {
                try {
                  void Haptics.selectionAsync();
                } catch {}
                router.push('/settings' as any);
              }}
              style={styles.headerActionBtn}>
              <Settings size={19} color="#FFFFFF" />
            </Pressable>
          </View>
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
        {/* Unauthenticated Guest Notification Banner */}
        {!isAuthenticated && (
          <View style={styles.guestBanner}>
            <View style={styles.guestTextWrap}>
              <Text style={styles.guestTitle}>Viewing Cinephile Passport</Text>
              <Text style={styles.guestSubtitle}>
                Sign in to sync your personal diary, custom lists, and watchlist.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              onPress={() => router.push('/(auth)/login' as any)}
              style={styles.guestSignInBtn}>
              <Text style={styles.guestSignInText}>Sign In</Text>
            </Pressable>
          </View>
        )}

        {/* 1. Profile Header */}
        <ProfileHeader
          profile={currentProfile}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onEditPress={() => setIsEditProfileVisible(true)}
          isOwnProfile={true}
        />

        {/* 2. Pinned & Favorites Showcase */}
        <TopFavoritesShowcase
          topFilms={currentProfile.top_films}
          onOpenReorder={() => setIsReorderVisible(true)}
        />

        {/* 3. Activity Achievement Badges */}
        <AchievementBadges badges={currentProfile.badges} />

        {/* Recent Activity Feed */}
        <RecentActivityRow
          activity={diary}
          onViewAllPress={() => setActiveTab(0)}
        />

        {/* 4. Sticky Tabbed Sections (Segmented Control) */}
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
              onStartLoggingPress={handleExploreRedirect}
            />
          )}

          {activeTab === 1 && (
            <ProfileWatchlistTab
              watchlist={watchlist}
              onExplorePress={handleExploreRedirect}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
            />
          )}

          {activeTab === 2 && (
            <ProfileListsTab
              lists={customLists}
              onCreateListPress={() => setIsCreateListVisible(true)}
              onSelectList={(list: UserCustomListItem) => {
                // Navigate or view list
              }}
            />
          )}

          {activeTab === 3 && (
            <ProfileReviewsTab
              reviews={reviews}
              onWriteReviewPress={handleExploreRedirect}
            />
          )}

          {activeTab === 4 && (
            <ProfileDiscussionsTab
              discussions={discussions}
              onStartDiscussionPress={handleExploreRedirect}
            />
          )}
        </View>
      </ScrollView>

      {/* Sheets & Modals */}
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
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  guestTextWrap: {
    flex: 1,
  },
  guestTitle: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guestSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  guestSignInBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestSignInText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
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
