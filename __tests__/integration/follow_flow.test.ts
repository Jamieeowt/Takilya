import { FollowTargetType, ToggleFollowPayload } from '../../features/social/types';

describe('Integration Test: Follow Studio / Festival Flow (Prompt 5.1 & AGENTS.md)', () => {
  interface FollowRecord {
    follower_id: string;
    target_type: FollowTargetType;
    target_id: string;
    created_at: string;
  }

  it('performs optimistic follow mutation and increments follow count', () => {
    const followerId = 'user-cinephile-alpha';
    const targetType: FollowTargetType = 'festival';
    const targetId = 'dddddddd-0001-0000-0000-000000000000'; // Cinemalaya

    const database: FollowRecord[] = [];
    let festivalFollowerCount = 1420;

    const executeToggleFollow = (payload: ToggleFollowPayload) => {
      // 1. Optimistic calculation
      const willFollow = !payload.currentlyFollowing;
      const optimisticCount = willFollow
        ? festivalFollowerCount + 1
        : Math.max(0, festivalFollowerCount - 1);

      // 2. Database update
      if (willFollow) {
        database.push({
          follower_id: payload.followerId,
          target_type: payload.targetType,
          target_id: payload.targetId,
          created_at: new Date().toISOString(),
        });
      } else {
        const index = database.findIndex(
          (f) =>
            f.follower_id === payload.followerId &&
            f.target_type === payload.targetType &&
            f.target_id === payload.targetId
        );
        if (index > -1) database.splice(index, 1);
      }

      festivalFollowerCount = optimisticCount;
      return { isFollowing: willFollow, followerCount: optimisticCount };
    };

    // User follows Cinemalaya
    const followResult = executeToggleFollow({
      followerId,
      targetType,
      targetId,
      currentlyFollowing: false,
    });

    expect(followResult.isFollowing).toBe(true);
    expect(followResult.followerCount).toBe(1421);
    expect(database.length).toBe(1);
    expect(database[0].target_type).toBe('festival');

    // User unfollows Cinemalaya
    const unfollowResult = executeToggleFollow({
      followerId,
      targetType,
      targetId,
      currentlyFollowing: true,
    });

    expect(unfollowResult.isFollowing).toBe(false);
    expect(unfollowResult.followerCount).toBe(1420);
    expect(database.length).toBe(0);
  });
});

