import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FollowListScreen } from '@/components/social';

export default function FollowingRoute() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();

  return (
    <FollowListScreen
      userId={id || ''}
      mode="following"
      userName={name}
    />
  );
}

