import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Search, X, Sparkles, Building2 } from 'lucide-react-native';
import { useStudios } from '@/features/studios/useStudios';
import { Studio } from '@/features/studios/types';
import { StudioCard } from '@/components/studios';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

const STUDIO_TYPE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Indie Outfits', value: 'indie' },
  { label: 'Studios & Majors', value: 'major' },
  { label: 'Regional Collectives', value: 'regional' },
];

const ALPHABET = [
  'All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'Z'
];

export default function StudiosListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: studios = [], isLoading, refetch } = useStudios();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredStudios = useMemo(() => {
    let result = [...studios];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // Type filter heuristic
    if (selectedType === 'indie') {
      result = result.filter((s) =>
        s.slug.includes('tba') ||
        s.slug.includes('black-sheep') ||
        s.slug.includes('anima') ||
        s.slug.includes('arkofilms') ||
        (s.description && s.description.toLowerCase().includes('indie'))
      );
    } else if (selectedType === 'regional') {
      result = result.filter((s) =>
        s.slug.includes('sine-olivia') ||
        s.slug.includes('regional') ||
        (s.description && s.description.toLowerCase().includes('regional'))
      );
    } else if (selectedType === 'major') {
      result = result.filter((s) =>
        s.slug.includes('regal') ||
        s.slug.includes('star-cinema') ||
        s.slug.includes('viva')
      );
    }

    // A-Z Alphabet filter
    if (selectedLetter !== 'All') {
      const target = selectedLetter.toUpperCase();
      result = result.filter((s) => {
        const first = s.name.trim().toUpperCase().charAt(0);
        return first === target;
      });
    }

    // Sort alphabetically
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [studios, searchQuery, selectedType, selectedLetter]);

  const handleTypeSelect = (val: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedType(val);
  };

  const handleLetterSelect = (letter: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedLetter(letter);
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Intro Banner */}
      <View style={styles.introBanner}>
        <Sparkles size={18} color="#FFFFFF" />
        <View style={styles.introTextWrap}>
          <Text style={styles.introTitle}>Studios & Production Collectives</Text>
          <Text style={styles.introDesc}>
            Discover production houses, independent film outfits, and regional cinema cooperatives creating Philippine motion pictures.
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color="#8A8A8A" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search studio by name, catalog..."
          placeholderTextColor="#8A8A8A"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear studio search"
            onPress={() => setSearchQuery('')}
            style={styles.clearSearchBtn}>
            <X size={14} color="#8A8A8A" />
          </Pressable>
        )}
      </View>

      {/* Type Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}>
        {STUDIO_TYPE_FILTERS.map((filter) => {
          const isSelected = selectedType === filter.value;
          return (
            <Pressable
              key={filter.value}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${filter.label}`}
              onPress={() => handleTypeSelect(filter.value)}
              style={[
                styles.chip,
                isSelected && styles.chipActive,
              ]}>
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextActive,
                ]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* A-Z Alphabet Filter Rail */}
      <View style={styles.alphabetContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetRow}>
          {ALPHABET.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <Pressable
                key={letter}
                accessibilityRole="button"
                accessibilityLabel={`Alphabet jump ${letter}`}
                onPress={() => handleLetterSelect(letter)}
                style={[
                  styles.letterBtn,
                  isSelected && styles.letterBtnActive,
                ]}>
                <Text
                  style={[
                    styles.letterText,
                    isSelected && styles.letterTextActive,
                  ]}>
                  {letter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Count Indicator */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredStudios.length} {filteredStudios.length === 1 ? 'Production House' : 'Studios & Collectives'}
        </Text>
        {(selectedType !== 'all' || selectedLetter !== 'All' || searchQuery.trim().length > 0) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset all studio filters"
            onPress={() => {
              setSelectedType('all');
              setSelectedLetter('All');
              setSearchQuery('');
            }}
            style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Reset Filters</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <GlassHeader
        title="Studios Database"
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

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader style={styles.skeletonHero} />
          <SkeletonLoader style={styles.skeletonCard} />
          <SkeletonLoader style={styles.skeletonCard} />
          <SkeletonLoader style={styles.skeletonCard} />
        </View>
      ) : (
        <FlatList
          data={filteredStudios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StudioCard studio={item} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              title="No Studios Found"
              description={
                searchQuery || selectedType !== 'all' || selectedLetter !== 'All'
                  ? 'Try modifying your search query or filter settings.'
                  : 'Film studios and production outfits will appear here.'
              }
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
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
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  introTextWrap: {
    flex: 1,
  },
  introTitle: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 2,
  },
  introDesc: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    lineHeight: 16,
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#0A0A0A',
    minHeight: 36,
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#8A8A8A',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#000000',
  },
  alphabetContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  alphabetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  letterBtn: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  letterText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  letterTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: spacing.xs,
  },
  countText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  skeletonContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeletonHero: {
    height: 90,
    borderRadius: radius.md,
  },
  skeletonCard: {
    height: 120,
    borderRadius: radius.md,
  },
});

