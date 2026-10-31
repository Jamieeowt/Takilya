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
import {
  ArrowLeft,
  Search,
  X,
  Landmark,
  Award,
  Archive,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react-native';
import {
  useNationalArtists,
  usePreservedFilms,
} from '@/features/heritage/useHeritage';
import { PreservationStatus } from '@/features/heritage/types';
import {
  HeritageCurationNotice,
  NationalArtistHeroCard,
  PreservedFilmCard,
} from '@/components/heritage';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { radius, spacing, typography } from '@/lib/theme';

type HeritageTab = 'preserved' | 'artists';

const STATUS_FILTERS: { label: string; value: PreservationStatus | 'all' }[] = [
  { label: 'All Archives', value: 'all' },
  { label: 'Restored', value: 'restored' },
  { label: 'Archived Elements', value: 'archived' },
  { label: 'At Risk', value: 'at_risk' },
  { label: 'Lost Classics', value: 'lost' },
];

export default function HeritageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<HeritageTab>('preserved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PreservationStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const {
    data: nationalArtists = [],
    isLoading: isArtistsLoading,
    refetch: refetchArtists,
  } = useNationalArtists();

  const {
    data: preservedFilms = [],
    isLoading: isFilmsLoading,
    refetch: refetchFilms,
  } = usePreservedFilms(selectedStatus);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchArtists(), refetchFilms()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTabChange = (tab: HeritageTab) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setActiveTab(tab);
  };

  const handleStatusSelect = (st: PreservationStatus | 'all') => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedStatus(st);
  };

  // Filtered lists
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return nationalArtists;
    const q = searchQuery.toLowerCase().trim();
    return nationalArtists.filter(
      (na) =>
        na.person.name.toLowerCase().includes(q) ||
        na.category.toLowerCase().includes(q) ||
        (na.citation && na.citation.toLowerCase().includes(q)) ||
        (na.person.bio && na.person.bio.toLowerCase().includes(q))
    );
  }, [nationalArtists, searchQuery]);

  const filteredFilms = useMemo(() => {
    if (!searchQuery.trim()) return preservedFilms;
    const q = searchQuery.toLowerCase().trim();
    return preservedFilms.filter(
      (pf) =>
        pf.film.title.toLowerCase().includes(q) ||
        (pf.film.director && pf.film.director.toLowerCase().includes(q)) ||
        (pf.restoring_body && pf.restoring_body.toLowerCase().includes(q)) ||
        (pf.archive_location && pf.archive_location.toLowerCase().includes(q)) ||
        (pf.notes && pf.notes.toLowerCase().includes(q))
    );
  }, [preservedFilms, searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* 1. Official Curation Notice */}
      <HeritageCurationNotice />

      {/* 2. Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color="#8A8A8A" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            activeTab === 'preserved'
              ? 'Search by title, director, archive, restoring body...'
              : 'Search by artist name, category, or citation...'
          }
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

      {/* 3. Section Segmented Tabs (Preserved Films vs National Artists) */}
      <View style={styles.tabBar}>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Preserved Films tab"
          onPress={() => handleTabChange('preserved')}
          style={[styles.tabBtn, activeTab === 'preserved' && styles.tabBtnActive]}>
          <Archive
            size={13}
            color={activeTab === 'preserved' ? '#000000' : '#8A8A8A'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'preserved' && styles.tabBtnTextActive,
            ]}>
            Preserved Films ({preservedFilms.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="National Artists tab"
          onPress={() => handleTabChange('artists')}
          style={[styles.tabBtn, activeTab === 'artists' && styles.tabBtnActive]}>
          <Award
            size={13}
            color={activeTab === 'artists' ? '#000000' : '#8A8A8A'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'artists' && styles.tabBtnTextActive,
            ]}>
            National Artists ({nationalArtists.length})
          </Text>
        </Pressable>
      </View>

      {/* 4. Preservation Status Filter Chips (only in Preserved tab) */}
      {activeTab === 'preserved' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusChipsRow}>
          {STATUS_FILTERS.map((st) => {
            const isSelected = selectedStatus === st.value;
            return (
              <Pressable
                key={st.value}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${st.label}`}
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
      )}

      {/* Section Counter Row */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          {activeTab === 'preserved'
            ? `${filteredFilms.length} ${filteredFilms.length === 1 ? 'Preservation Record' : 'Preservation Records'}`
            : `${filteredArtists.length} ${filteredArtists.length === 1 ? 'National Artist' : 'National Artists'}`}
        </Text>
        {(searchQuery.trim().length > 0 || (activeTab === 'preserved' && selectedStatus !== 'all')) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
            onPress={() => {
              setSearchQuery('');
              setSelectedStatus('all');
            }}
            style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Reset Filter</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const isLoading =
    (activeTab === 'preserved' && isFilmsLoading) ||
    (activeTab === 'artists' && isArtistsLoading);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <GlassHeader
        title="Philippine Film Heritage"
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

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader style={styles.skeletonNotice} />
          <SkeletonLoader style={styles.skeletonCard} />
          <SkeletonLoader style={styles.skeletonCard} />
        </View>
      ) : activeTab === 'preserved' ? (
        <FlatList
          data={filteredFilms}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <PreservedFilmCard item={item} />}
          ListEmptyComponent={
            <EmptyState
              title="No Preserved Records Found"
              description={
                searchQuery || selectedStatus !== 'all'
                  ? 'Try modifying your search keywords or preservation status filter.'
                  : 'Preservation records will appear here.'
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
      ) : (
        <FlatList
          data={filteredArtists}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <NationalArtistHeroCard item={item} />}
          ListEmptyComponent={
            <EmptyState
              title="No National Artists Found"
              description={
                searchQuery
                  ? 'No National Artists matched your search terms.'
                  : 'National Artists will appear here.'
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.full,
    minHeight: 36,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#8A8A8A',
    fontSize: 11,
  },
  tabBtnTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
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
    marginBottom: spacing.sm,
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeletonNotice: {
    height: 70,
    borderRadius: radius.md,
  },
  skeletonCard: {
    height: 120,
    borderRadius: radius.md,
  },
});

