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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Search,
  X,
  Trophy,
  Filter,
  Globe,
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import {
  useAwardBodies,
  useAwardRecognitions,
  useAwardWinningFilms,
  useMostNominatedUnwon,
} from '@/features/awards/useAwards';
import { AwardStatus } from '@/features/films/types';
import { AwardRecognition } from '@/features/awards/types';
import {
  AwardRecognitionRow,
  AwardWinningFilmsCarousel,
  UnsungNomineesCard,
} from '@/components/awards';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

const SCOPES = [
  { label: 'All Honors', value: 'all' as const },
  { label: 'Philippine Guilds', value: 'local' as const },
  { label: 'Global Festivals', value: 'international' as const },
];

const STATUS_FILTERS: { label: string; value: AwardStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Won', value: 'won' },
  { label: 'Nominated', value: 'nominated' },
  { label: 'Official Selection', value: 'official_selection' },
  { label: 'Special Mention', value: 'special_mention' },
];

const YEARS = ['All', '2024', '2023', '2022', '2020', '2019', '2018', '2016', '1983', '1978', '1976'];

export default function AwardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ bodyId?: string }>();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<'all' | 'local' | 'international'>('all');
  const [selectedBodyId, setSelectedBodyId] = useState<string>(params.bodyId || 'all');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<AwardStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const {
    data: awardBodies = [],
    isLoading: isBodiesLoading,
    refetch: refetchBodies,
  } = useAwardBodies(selectedScope);

  const {
    data: recognitions = [],
    isLoading: isRecognitionsLoading,
    refetch: refetchRecognitions,
  } = useAwardRecognitions({
    award_body_id: selectedBodyId !== 'all' ? selectedBodyId : undefined,
    scope: selectedScope,
    year: selectedYear !== 'All' ? parseInt(selectedYear, 10) : undefined,
    status: selectedStatus,
    search: searchQuery,
  });

  const {
    data: winningFilms = [],
    refetch: refetchWinningFilms,
  } = useAwardWinningFilms();

  const {
    data: unsungNominees = [],
    refetch: refetchUnsungNominees,
  } = useMostNominatedUnwon();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchBodies(),
        refetchRecognitions(),
        refetchWinningFilms(),
        refetchUnsungNominees(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Group recognitions by Award Body -> Category
  interface GroupedSection {
    awardBodyId: string;
    awardBodyName: string;
    scope: string;
    categories: {
      categoryName: string;
      items: AwardRecognition[];
    }[];
  }

  const groupedSections: GroupedSection[] = useMemo(() => {
    const bodyMap = new Map<string, GroupedSection>();

    recognitions.forEach((rec) => {
      let bodySection = bodyMap.get(rec.award_body_id);
      if (!bodySection) {
        bodySection = {
          awardBodyId: rec.award_body_id,
          awardBodyName: rec.award_body_name,
          scope: rec.award_body_scope,
          categories: [],
        };
        bodyMap.set(rec.award_body_id, bodySection);
      }

      let catObj = bodySection.categories.find(
        (c) => c.categoryName === rec.category_name
      );
      if (!catObj) {
        catObj = {
          categoryName: rec.category_name,
          items: [],
        };
        bodySection.categories.push(catObj);
      }

      catObj.items.push(rec);
    });

    return Array.from(bodyMap.values());
  }, [recognitions]);

  const handleScopeSelect = (scope: 'all' | 'local' | 'international') => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedScope(scope);
    setSelectedBodyId('all');
  };

  const handleBodySelect = (bodyId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedBodyId(bodyId);
  };

  const handleStatusSelect = (st: AwardStatus | 'all') => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedStatus(st);
  };

  const handleYearSelect = (yr: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedYear(yr);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedScope !== 'all' ||
    selectedBodyId !== 'all' ||
    selectedYear !== 'All' ||
    selectedStatus !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedScope('all');
    setSelectedBodyId('all');
    setSelectedYear('All');
    setSelectedStatus('all');
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Intro Banner */}
      <View style={styles.introBanner}>
        <Trophy size={18} color="#FFFFFF" strokeWidth={2.5} />
        <View style={styles.introTextWrap}>
          <Text style={styles.introTitle}>Philippine & Global Cinema Awards</Text>
          <Text style={styles.introDesc}>
            Comprehensive archival records across FAMAS, Gawad Urian, Cannes, Venice, Sundance, FAP, and premier guild honors.
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color="#8A8A8A" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by film, artist, category, or note..."
          placeholderTextColor="#8A8A8A"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setSearchQuery('')}
            style={styles.clearSearchBtn}>
            <X size={14} color="#8A8A8A" />
          </Pressable>
        )}
      </View>

      {/* Scope Segmented Bar */}
      <View style={styles.scopeBar}>
        {SCOPES.map((sc) => {
          const isSelected = selectedScope === sc.value;
          return (
            <Pressable
              key={sc.value}
              accessibilityRole="button"
              accessibilityLabel={`Select scope ${sc.label}`}
              onPress={() => handleScopeSelect(sc.value)}
              style={[
                styles.scopeBtn,
                isSelected && styles.scopeBtnActive,
              ]}>
              <Text
                style={[
                  styles.scopeBtnText,
                  isSelected && styles.scopeBtnTextActive,
                ]}>
                {sc.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Award Bodies Horizontal Chips */}
      <View style={styles.chipsSection}>
        <Text style={styles.chipsLabel}>AWARD BODY</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="All award bodies"
            onPress={() => handleBodySelect('all')}
            style={[
              styles.chip,
              selectedBodyId === 'all' && styles.chipActive,
            ]}>
            <Text
              style={[
                styles.chipText,
                selectedBodyId === 'all' && styles.chipTextActive,
              ]}>
              All Bodies
            </Text>
          </Pressable>

          {awardBodies.map((body) => {
            const isSelected = selectedBodyId === body.id;
            return (
              <Pressable
                key={body.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${body.name}`}
                onPress={() => handleBodySelect(body.id)}
                style={[
                  styles.chip,
                  isSelected && styles.chipActive,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}>
                  {body.acronym || body.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Ceremony Year Selector */}
      <View style={styles.chipsSection}>
        <Text style={styles.chipsLabel}>CEREMONY YEAR</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {YEARS.map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <Pressable
                key={yr}
                accessibilityRole="button"
                accessibilityLabel={`Ceremony year ${yr}`}
                onPress={() => handleYearSelect(yr)}
                style={[
                  styles.chip,
                  isSelected && styles.chipActive,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}>
                  {yr}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.chipsSection}>
        <Text style={styles.chipsLabel}>STATUS (FILLED, OUTLINED & CITATION)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {STATUS_FILTERS.map((st) => {
            const isSelected = selectedStatus === st.value;
            return (
              <Pressable
                key={st.value}
                accessibilityRole="button"
                accessibilityLabel={`Status filter ${st.label}`}
                onPress={() => handleStatusSelect(st.value)}
                style={[
                  styles.chip,
                  isSelected && styles.chipActive,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}>
                  {st.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Filter Counter Row */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          {recognitions.length} {recognitions.length === 1 ? 'Recognition Found' : 'Recognitions Found'}
        </Text>
        {hasActiveFilters && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset all award filters"
            onPress={handleResetFilters}
            style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Reset All</Text>
          </Pressable>
        )}
      </View>

      {/* Showcase Showcase 1: Award-Winning Films Carousel (shown when no specific search is active) */}
      {!searchQuery && selectedBodyId === 'all' && (
        <AwardWinningFilmsCarousel films={winningFilms} />
      )}

      {/* Showcase 2: Analytics Card: Most Nominated but Never Won */}
      {!searchQuery && selectedBodyId === 'all' && selectedStatus === 'all' && (
        <UnsungNomineesCard nominees={unsungNominees} />
      )}

      {/* Section Divider Heading */}
      <View style={styles.laurelHeadingRow}>
        <Text style={styles.laurelHeading}>ARCHIVED HONORS & NOMINATIONS</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <GlassHeader
        title="Awards & Recognition"
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

      {isRecognitionsLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader style={styles.skeletonHero} />
          <SkeletonLoader style={styles.skeletonRow} />
          <SkeletonLoader style={styles.skeletonRow} />
          <SkeletonLoader style={styles.skeletonRow} />
        </View>
      ) : (
        <FlatList
          data={groupedSections}
          keyExtractor={(item) => item.awardBodyId}
          ListHeaderComponent={renderHeader}
          renderItem={({ item: bodyGroup }) => (
            <View style={styles.bodyGroupContainer}>
              {/* Award Body Header */}
              <View style={styles.bodyGroupHeader}>
                <View style={styles.bodyGroupNameRow}>
                  <Trophy size={14} color="#FFFFFF" />
                  <Text style={styles.bodyGroupTitle}>
                    {bodyGroup.awardBodyName}
                  </Text>
                </View>
                <View style={styles.scopeMiniBadge}>
                  <Text style={styles.scopeMiniText}>
                    {bodyGroup.scope.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Categories & Recognition Rows */}
              {bodyGroup.categories.map((category) => (
                <View key={category.categoryName} style={styles.categoryBlock}>
                  <Text style={styles.categoryHeader}>
                    {category.categoryName.toUpperCase()}
                  </Text>

                  {category.items.map((recognition) => (
                    <AwardRecognitionRow
                      key={recognition.id}
                      recognition={recognition}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Accolades Found"
              description={
                hasActiveFilters
                  ? 'No honors match your active award body, year, scope, or status filters. Try clearing some selections.'
                  : 'Archived honors will appear here.'
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
    fontWeight: '700',
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
  scopeBar: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    minHeight: 36,
  },
  scopeBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  scopeBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#8A8A8A',
    fontSize: 11,
  },
  scopeBtnTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  chipsSection: {
    marginBottom: spacing.sm,
  },
  chipsLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8A8A',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#0A0A0A',
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#8A8A8A',
    fontSize: 11,
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  counterText: {
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
  laurelHeadingRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  laurelHeading: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#8A8A8A',
    letterSpacing: 1.2,
  },
  bodyGroupContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  bodyGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: spacing.sm,
  },
  bodyGroupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  bodyGroupTitle: {
    ...typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    flexShrink: 1,
  },
  scopeMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scopeMiniText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  categoryBlock: {
    marginBottom: spacing.sm,
  },
  categoryHeader: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeletonHero: {
    height: 100,
    borderRadius: radius.md,
  },
  skeletonRow: {
    height: 90,
    borderRadius: radius.md,
  },
});

