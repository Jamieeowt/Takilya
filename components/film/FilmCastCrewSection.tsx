import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FilmCastMember } from '@/features/films/types';
import { Avatar } from '@/components/ui/Avatar';
import { radius, typography } from '@/lib/theme';

interface FilmCastCrewSectionProps {
  credits: FilmCastMember[];
  onSelectPerson?: (personId: string) => void;
}

export function FilmCastCrewSection({
  credits,
  onSelectPerson,
}: FilmCastCrewSectionProps) {
  if (!credits || credits.length === 0) return null;

  const handlePressPerson = (personId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onSelectPerson) {
      onSelectPerson(personId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cast & Crew</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {credits.map((item) => {
          const isVerified = item.verification_status === 'verified';
          const roleDisplay = item.character_name
            ? `${item.character_name}`
            : item.role;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.role}${item.character_name ? ` as ${item.character_name}` : ''}`}
              onPress={() => handlePressPerson(item.person_id)}
              style={styles.personCard}>
              <Avatar
                url={item.photo_url}
                name={item.name}
                size={58}
                isVerified={isVerified}
              />

              <Text style={styles.personName} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={styles.personRole} numberOfLines={2}>
                {roleDisplay}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    gap: 12,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    paddingHorizontal: 16,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  personCard: {
    alignItems: 'center',
    width: 86,
    gap: 4,
  },
  personName: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  personRole: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
});

