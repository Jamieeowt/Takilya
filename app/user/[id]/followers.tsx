import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FollowListScreen } from '@/components/social';

export default function FollowersRoute() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();

  return (
    <FollowListScreen
      userId={id || ''}
      mode="followers"
      userName={name}
    />
  );
}

