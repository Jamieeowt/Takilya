import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import {
  Text,
  Button,
  IconButton,
  Chip,
  AwardBadge,
  VerifiedBadge,
  PromotedPill,
  Avatar,
  PosterCard,
  PosterRow,
  PosterGrid,
  RatingStars,
  ScoreRing,
  SegmentedControl,
  SkeletonLoader,
  EmptyState,
  ErrorState,
  Toast,
  GlassHeader,
} from '@/components/ui';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { Heart, Search, Film, Star, Share2 } from 'lucide-react-native';

const SAMPLE_FILMS = [
  {
    id: 'film-1',
    title: 'Himala',
    release_year: 1982,
    poster_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=80',
    critic_score: 98,
    audience_score: 95,
  },
  {
    id: 'film-2',
    title: 'Maynila sa mga Kuko ng Liwanag',
    release_year: 1975,
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80',
    critic_score: 99,
    audience_score: 94,
  },
  {
    id: 'film-3',
    title: 'Leonor Will Never Die',
    release_year: 2022,
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    critic_score: 96,
    audience_score: 89,
  },
];

function DesignSystemShowcase() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [chipSelected, setChipSelected] = useState(false);
  const [starRating, setStarRating] = useState(4.5);
  const [toastVisible, setToastVisible] = useState(false);

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtextColor = isDark ? '#8A8A8A' : '#555555';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: 'Takilya Design System',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle dark and light theme"
              onPress={toggleTheme}
              style={[styles.themeToggleBtn, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
              <Text variant="caption" style={{ color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }}>
                {isDark ? 'LIGHT' : 'DARK'}
              </Text>
            </Pressable>
          ),
        }}
      />

      {/* Header Info */}
      <View style={styles.section}>
        <Text variant="display" color={textColor}>Design System</Text>
        <Text variant="body" color={subtextColor}>
          Strict monochrome: pure black (#000000) and white (#FFFFFF) with gray ramp. Current theme: {theme.toUpperCase()}.
        </Text>
      </View>

      {/* 1. Typography */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>1. Typography</Text>
        <Text variant="display" color={textColor}>Display Header</Text>
        <Text variant="title" color={textColor}>Title Heading</Text>
        <Text variant="body" color={textColor}>Body: The Philippine film industry is celebrating masterworks.</Text>
        <Text variant="caption" color={subtextColor}>Caption: DIR. ISHMAEL BERNAL • 1982</Text>
        <Text variant="mono" color={subtextColor}>mono: 00:03:45 / 01:24:00</Text>
      </View>

      {/* 2. Buttons & IconButtons */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>2. Buttons & Icon Buttons</Text>
        <View style={styles.row}>
          <Button label="Primary Button" variant="primary" onPress={() => setToastVisible(true)} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
        </View>
        <View style={styles.row}>
          <IconButton icon={<Heart size={20} color="#FFFFFF" />} accessibilityLabel="Like" variant="filled" onPress={() => {}} />
          <IconButton icon={<Search size={20} color="#FFFFFF" />} accessibilityLabel="Search" variant="outlined" onPress={() => {}} />
          <IconButton icon={<Share2 size={20} color="#FFFFFF" />} accessibilityLabel="Share" variant="ghost" onPress={() => {}} />
        </View>
      </View>

      {/* 3. Badges, Award Badges & Pills */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>3. Badges & Pills</Text>
        <View style={styles.row}>
          <AwardBadge status="won" label="Won Best Picture" />
          <AwardBadge status="nominated" label="Nominated" />
          <AwardBadge status="official_selection" label="Official Selection" />
          <AwardBadge status="special_mention" label="Special Mention" />
        </View>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="body" color={textColor}>Verified:</Text>
            <VerifiedBadge size={18} />
          </View>
          <PromotedPill label="Promoted" sponsorName="QCinema" />
        </View>
      </View>

      {/* 4. Chips */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>4. Chips</Text>
        <View style={styles.row}>
          <Chip label="Indie" variant="filled" />
          <Chip label="Regional" variant="outlined" />
          <Chip
            label={chipSelected ? 'Selected' : 'Interactive'}
            variant={chipSelected ? 'filled' : 'outlined'}
            selected={chipSelected}
            onPress={() => setChipSelected(!chipSelected)}
          />
        </View>
      </View>

      {/* 5. Avatars */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>5. Avatars</Text>
        <View style={styles.row}>
          <Avatar name="Ishmael Bernal" size={48} isVerified={true} />
          <Avatar name="Lino Brocka" size={48} isVerified={false} />
          <Avatar url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" size={48} isVerified={true} />
        </View>
      </View>

      {/* 6. Ratings & Scores */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>6. Ratings & Score Rings</Text>
        <RatingStars score={starRating} interactive={true} onRate={setStarRating} />
        <View style={styles.row}>
          <ScoreRing score={98} label="Critic" />
          <ScoreRing score={94} label="Audience" />
        </View>
      </View>

      {/* 7. Segmented Control */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>7. Segmented Control</Text>
        <SegmentedControl
          options={['For You', 'Latest', 'Popular']}
          selectedIndex={selectedSegment}
          onChange={setSelectedSegment}
        />
      </View>

      {/* 8. Poster Components */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>8. Poster Card & Rows</Text>
        <PosterRow title="Netflix-style Poster Carousel" films={SAMPLE_FILMS} />
        <Text variant="title" color={textColor}>Letterboxd-style 3-Column Grid</Text>
        <PosterGrid films={SAMPLE_FILMS} />
      </View>

      {/* 9. Skeleton Loaders */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>9. Shimmer Skeleton Loader</Text>
        <SkeletonLoader height={24} width="80%" />
        <SkeletonLoader height={14} width="50%" />
        <SkeletonLoader height={120} width="100%" borderRadius={16} />
      </View>

      {/* 10. Empty & Error States */}
      <View style={styles.section}>
        <Text variant="title" color={textColor}>10. Empty & Error States</Text>
        <EmptyState
          icon={<Film size={28} color="#FFFFFF" />}
          title="No Films Found"
          description="Your watchlist is currently empty."
          actionLabel="Explore Films"
          onAction={() => {}}
        />
      </View>

      {/* Toast Notification */}
      <Toast
        message="Monochrome design system action triggered!"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </ScrollView>
  );
}

export default function DesignScreen() {
  return (
    <ThemeProvider>
      <DesignSystemShowcase />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
});

