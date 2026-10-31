import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Search, X, Sparkles } from 'lucide-react-native';
import { useFestivals } from '@/features/festivals/useFestivals';
import { Festival } from '@/features/festivals/types';
import { FestivalCard } from '@/components/festivals';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

const FILTER_TAGS = ['All', 'Indie & Contemporary', 'Regional Voices', 'Heritage & Metro'];

export default function FestivalsListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: festivals = [], isLoading, refetch } = useFestivals();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredFestivals = useMemo(() => {
    let result = [...festivals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.location && f.location.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    if (selectedTag === 'Regional Voices') {
      result = result.filter(
        (f) =>
          f.slug.includes('rehiyon') ||
          f.slug.includes('binisaya') ||
          f.slug.includes('mindanao') ||
          (f.location && !f.location.toLowerCase().includes('manila'))
      );
    } else if (selectedTag === 'Indie & Contemporary') {
      result = result.filter(
        (f) =>
          f.slug.includes('cinemalaya') ||
          f.slug.includes('qcinema') ||
          f.slug.includes('cinema-one')
      );
    } else if (selectedTag === 'Heritage & Metro') {
      result = result.filter(
        (f) =>
          f.slug.includes('mmff') ||
          f.slug.includes('pista')
      );
    }

    return result;
  }, [festivals, searchQuery, selectedTag]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Intro Banner */}
      <View style={styles.introBanner}>
        <Sparkles size={18} color="#FFFFFF" />
        <View style={styles.introTextWrap}>
          <Text style={styles.introTitle}>Philippine Film Festivals</Text>
          <Text style={styles.introDesc}>
            Discover premier competitive hubs, regional showcases, and historic annual celebrations across the archipelago.
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={16} color="#8A8A8A" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by festival name, location..."
          placeholderTextColor="#8A8A8A"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear festival search"
            onPress={() => setSearchQuery('')}
            style={styles.clearSearchBtn}>
            <X size={14} color="#8A8A8A" />
          </Pressable>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChipsRow}>
        {FILTER_TAGS.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter by ${tag}`}
              onPress={() => {
                void Haptics.selectionAsync();
                setSelectedTag(tag);
              }}
              style={[
                styles.filterChip,
                isSelected ? styles.filterChipActive : styles.filterChipInactive,
              ]}>
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}>
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.resultsCount}>
        {filteredFestivals.length} {filteredFestivals.length === 1 ? 'Festival' : 'Festivals'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <GlassHeader
        title="Film Festivals"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
        }
      />

      {isLoading && festivals.length === 0 ? (
        <View style={[styles.skeletonContainer, { paddingTop: insets.top + 56 }]}>
          <SkeletonLoader height={80} style={{ width: '100%', marginBottom: 16 }} />
          <SkeletonLoader height={120} style={{ width: '100%', marginBottom: 12 }} />
          <SkeletonLoader height={120} style={{ width: '100%', marginBottom: 12 }} />
          <SkeletonLoader height={120} style={{ width: '100%', marginBottom: 12 }} />
        </View>
      ) : (
        <FlatList
          data={filteredFestivals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardItemWrap}>
              <FestivalCard festival={item} />
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 48, paddingBottom: spacing.xxl * 2 },
          ]}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              title="No Festivals Found"
              description="Try adjusting your search query or category filters to find festivals."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedTag('All');
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
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
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  headerArea: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  introTextWrap: {
    flex: 1,
  },
  introTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  introDesc: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
    color: '#8A8A8A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingLeft: spacing.sm,
    color: '#FFFFFF',
    fontSize: 13,
  },
  clearSearchBtn: {
    padding: 6,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterChipInactive: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  filterChipTextActive: {
    color: '#000000',
  },
  resultsCount: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  cardItemWrap: {
    marginBottom: spacing.sm,
  },
});

