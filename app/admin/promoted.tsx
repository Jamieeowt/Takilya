/**
 * Takilya - Admin Promoted Trailer Slots & Analytics Screen
 *
 * CRITICAL ARCHITECTURAL POLICY / AGENTS.md RULE:
 * -----------------------------------------------------------------------------
 * Takilya enforces a strict platform ceiling: at most 1 promoted slot per 10 organic
 * feed items (and NEVER at position 1). Promoted items never affect ranking algorithms,
 * audience scores, or critic ratings.
 *
 * This strict 1-per-10 cap exists specifically to preserve organic discoverability
 * for independent, regional, and heritage Philippine films, ensuring commercial
 * campaigns cannot displace grassroots cinematic culture.
 * -----------------------------------------------------------------------------
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Plus,
  ShieldAlert,
  Sparkles,
  Eye,
  MousePointerClick,
  Percent,
  Calendar,
  Film,
  Video,
  X,
  Check,
  Building2,
  Info,
} from 'lucide-react-native';

import { useRole, useAuth } from '@/features/auth';
import { useTheme, radius, spacing, typography } from '@/lib/theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  usePromotedSlots,
  usePromotedAnalytics,
  useCreatePromotedSlot,
  useTogglePromotedSlot,
  useFilmTrailersForSlot,
} from '@/features/promoted';
import { useFilmsForSelector } from '@/features/trailers';
import { PromotedSlot } from '@/features/promoted/types';

export default function AdminPromotedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useRole();
  const { tokens, isDark } = useTheme();

  // Filter state
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [formFilmId, setFormFilmId] = useState('');
  const [formTrailerId, setFormTrailerId] = useState('');
  const [formSponsorName, setFormSponsorName] = useState('');
  const [campaignDays, setCampaignDays] = useState('30');

  // Queries & Mutations
  const {
    data: slots = [],
    isLoading: isLoadingSlots,
    refetch: refetchSlots,
  } = usePromotedSlots(true);

  const { data: analytics } = usePromotedAnalytics();
  const { data: selectableFilms = [] } = useFilmsForSelector();
  const { data: filmTrailers = [] } = useFilmTrailersForSlot(formFilmId);

  const createSlotMutation = useCreatePromotedSlot();
  const toggleSlotMutation = useTogglePromotedSlot();

  // Guard: Admin only
  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: tokens.background.primary }]}>
        <GlassHeader
          title="Access Restricted"
          left={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={styles.headerBtn}>
              <ArrowLeft size={20} color={tokens.text.primary} />
            </Pressable>
          }
        />
        <View style={styles.deniedContainer}>
          <ShieldAlert size={48} color={tokens.text.secondary} />
          <Text style={[styles.deniedTitle, { color: tokens.text.primary }]}>
            Administrator Portal Only
          </Text>
          <Text style={[styles.deniedDesc, { color: tokens.text.secondary }]}>
            Only verified administrators can access the Promoted Trailer Slots and monetization analytics.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={[styles.returnBtn, { borderColor: tokens.border.hairline }]}>
            <Text style={[styles.returnBtnText, { color: tokens.text.primary }]}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Filtered slots list
  const filteredSlots = useMemo(() => {
    if (filterTab === 'active') return slots.filter((s) => s.is_active);
    if (filterTab === 'inactive') return slots.filter((s) => !s.is_active);
    return slots;
  }, [slots, filterTab]);

  const handleToggleActive = async (slot: PromotedSlot) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    try {
      await toggleSlotMutation.mutateAsync({
        slotId: slot.id,
        isActive: !slot.is_active,
      });
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Failed to toggle slot status.');
    }
  };

  const handleCreateSlot = async () => {
    if (!formFilmId) {
      Alert.alert('Missing Field', 'Please select an associated film.');
      return;
    }
    if (!formTrailerId) {
      Alert.alert('Missing Field', 'Please select an official trailer/clip.');
      return;
    }
    if (!formSponsorName.trim()) {
      Alert.alert('Missing Field', 'Please enter a sponsor or campaign name.');
      return;
    }

    const durationDays = parseInt(campaignDays, 10) || 30;
    const now = new Date();
    const ends = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await createSlotMutation.mutateAsync({
        film_id: formFilmId,
        trailer_id: formTrailerId,
        sponsor_name: formSponsorName.trim(),
        starts_at: now.toISOString(),
        ends_at: ends.toISOString(),
        is_active: true,
      });

      try {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      setIsCreateModalOpen(false);
      setFormFilmId('');
      setFormTrailerId('');
      setFormSponsorName('');
      Alert.alert('Promoted Slot Created', 'New campaign slot is now active.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create promoted slot.');
    }
  };

  const renderSlotCard = ({ item }: { item: PromotedSlot }) => {
    const isCampaignActive = item.is_active && new Date(item.ends_at) > new Date();

    return (
      <View
        style={[
          styles.slotCard,
          {
            backgroundColor: tokens.background.secondary,
            borderColor: tokens.border.hairline,
          },
        ]}>
        {/* Card Header: Sponsor & Toggle */}
        <View style={styles.cardHeader}>
          <View style={styles.sponsorHeaderGroup}>
            <View
              style={[
                styles.promotedTag,
                { borderColor: tokens.text.primary },
              ]}>
              <Text style={[styles.promotedTagText, { color: tokens.text.primary }]}>
                PROMOTED
              </Text>
            </View>
            <Text style={[styles.sponsorName, { color: tokens.text.primary }]} numberOfLines={1}>
              {item.sponsor_name}
            </Text>
          </View>

          <View style={styles.switchWrapper}>
            <Text style={[styles.switchLabel, { color: tokens.text.secondary }]}>
              {isCampaignActive ? 'Active' : 'Paused'}
            </Text>
            <Switch
              value={item.is_active}
              onValueChange={() => handleToggleActive(item)}
              trackColor={{ false: '#2E2E2E', true: '#FFFFFF' }}
              thumbColor={item.is_active ? '#000000' : '#8A8A8A'}
            />
          </View>
        </View>

        {/* Film & Trailer Info */}
        <View style={styles.slotDetails}>
          <Text style={[styles.filmTitle, { color: tokens.text.primary }]}>
            {item.film_title || 'Philippine Feature Film'}
          </Text>
          <Text style={[styles.trailerTitle, { color: tokens.text.secondary }]}>
            Clip: {item.trailer_title || 'Official Trailer'}
          </Text>
          <View style={styles.scheduleRow}>
            <Calendar size={13} color={tokens.text.tertiary} />
            <Text style={[styles.scheduleText, { color: tokens.text.tertiary }]}>
              {new Date(item.starts_at).toLocaleDateString()} — {new Date(item.ends_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Analytics Grid */}
        <View
          style={[
            styles.metricsRow,
            {
              backgroundColor: isDark ? '#000000' : '#F5F5F5',
              borderColor: tokens.border.hairline,
            },
          ]}>
          <View style={styles.metricItem}>
            <View style={styles.metricLabelRow}>
              <Eye size={12} color={tokens.text.secondary} />
              <Text style={[styles.metricLabel, { color: tokens.text.secondary }]}>
                IMPRESSIONS (3s)
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: tokens.text.primary }]}>
              {(item.impressions_count || 0).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: tokens.border.hairline }]} />

          <View style={styles.metricItem}>
            <View style={styles.metricLabelRow}>
              <MousePointerClick size={12} color={tokens.text.secondary} />
              <Text style={[styles.metricLabel, { color: tokens.text.secondary }]}>
                ACTIONS / TAPS
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: tokens.text.primary }]}>
              {(item.taps_count || 0).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: tokens.border.hairline }]} />

          <View style={styles.metricItem}>
            <View style={styles.metricLabelRow}>
              <Percent size={12} color={tokens.text.secondary} />
              <Text style={[styles.metricLabel, { color: tokens.text.secondary }]}>
                CTR
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: tokens.text.primary }]}>
              {item.ctr ? `${item.ctr}%` : '0.00%'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background.primary }]}>
      <GlassHeader
        title="Promoted Slots"
        left={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.headerBtn}>
            <ArrowLeft size={20} color={tokens.text.primary} />
          </Pressable>
        }
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create promoted slot"
            onPress={() => {
              try {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setIsCreateModalOpen(true);
            }}
            style={[styles.createSlotBtn, { backgroundColor: '#FFFFFF' }]}>
            <Plus size={16} color="#000000" />
            <Text style={styles.createSlotBtnText}>New Slot</Text>
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 54, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Architectural Cap Notice */}
        <View
          style={[
            styles.policyBanner,
            {
              backgroundColor: tokens.background.secondary,
              borderColor: tokens.border.hairline,
            },
          ]}>
          <Info size={18} color={tokens.text.primary} style={{ marginTop: 2 }} />
          <View style={styles.policyTextWrapper}>
            <Text style={[styles.policyTitle, { color: tokens.text.primary }]}>
              Strict 1-per-10 Cap Policy Active
            </Text>
            <Text style={[styles.policyDesc, { color: tokens.text.secondary }]}>
              Per AGENTS.md rules, promoted slots are injected at a strict maximum ratio of 1 per 10
              organic feed items, and never at position 1. This restriction protects equal organic
              visibility for Philippine indie, regional, and heritage cinema.
            </Text>
          </View>
        </View>

        {/* Global Overview Analytics Cards */}
        <View style={styles.overviewRow}>
          <View
            style={[
              styles.overviewCard,
              {
                backgroundColor: tokens.background.secondary,
                borderColor: tokens.border.hairline,
              },
            ]}>
            <Text style={[styles.overviewCardLabel, { color: tokens.text.secondary }]}>
              ACTIVE SLOTS
            </Text>
            <Text style={[styles.overviewCardValue, { color: tokens.text.primary }]}>
              {analytics?.activeSlots ?? 0}
            </Text>
          </View>

          <View
            style={[
              styles.overviewCard,
              {
                backgroundColor: tokens.background.secondary,
                borderColor: tokens.border.hairline,
              },
            ]}>
            <Text style={[styles.overviewCardLabel, { color: tokens.text.secondary }]}>
              TOTAL IMPRESSIONS
            </Text>
            <Text style={[styles.overviewCardValue, { color: tokens.text.primary }]}>
              {(analytics?.totalImpressions ?? 0).toLocaleString()}
            </Text>
          </View>

          <View
            style={[
              styles.overviewCard,
              {
                backgroundColor: tokens.background.secondary,
                borderColor: tokens.border.hairline,
              },
            ]}>
            <Text style={[styles.overviewCardLabel, { color: tokens.text.secondary }]}>
              AVG CTR
            </Text>
            <Text style={[styles.overviewCardValue, { color: tokens.text.primary }]}>
              {analytics?.averageCtr ?? 0}%
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(
            [
              { key: 'all', label: 'All Slots' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Paused' },
            ] as const
          ).map((tab) => {
            const isActive = filterTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => {
                  try {
                    void Haptics.selectionAsync();
                  } catch {}
                  setFilterTab(tab.key);
                }}
                style={[
                  styles.tabChip,
                  isActive
                    ? styles.tabChipActive
                    : { borderColor: tokens.border.hairline, backgroundColor: tokens.background.secondary },
                ]}>
                <Text
                  style={[
                    styles.tabChipText,
                    {
                      color: isActive ? '#000000' : tokens.text.secondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Slots List */}
        {isLoadingSlots ? (
          <ActivityIndicator size="large" color={tokens.text.primary} style={{ marginTop: 32 }} />
        ) : filteredSlots.length === 0 ? (
          <EmptyState
            title="No Promoted Slots"
            description="No promoted slots match this filter. Create a new slot to sponsor a Philippine trailer."
          />
        ) : (
          <View style={styles.slotsListContainer}>
            {filteredSlots.map((slot) => (
              <React.Fragment key={slot.id}>{renderSlotCard({ item: slot })}</React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Slot Modal */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCreateModalOpen(false)}>
        <View style={[styles.modalContainer, { backgroundColor: tokens.background.primary }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: tokens.border.hairline, backgroundColor: tokens.background.secondary },
            ]}>
            <Text style={[styles.modalTitle, { color: tokens.text.primary }]}>
              Create Promoted Slot
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close creation modal"
              onPress={() => setIsCreateModalOpen(false)}
              style={styles.headerBtn}>
              <X size={20} color={tokens.text.primary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}>
            {/* 1. Sponsor / Advertiser */}
            <Text style={[styles.fieldHeading, { color: tokens.text.secondary }]}>
              SPONSOR / ADVERTISER NAME
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: tokens.text.primary,
                  borderColor: tokens.border.hairline,
                  backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                },
              ]}
              placeholder="e.g. Cinemalaya Foundation, TBA Studios, JuanFlix"
              placeholderTextColor={tokens.text.tertiary}
              value={formSponsorName}
              onChangeText={setFormSponsorName}
            />

            {/* 2. Select Film */}
            <Text style={[styles.fieldHeading, { color: tokens.text.secondary, marginTop: 16 }]}>
              SELECT FILM
            </Text>
            <View style={styles.filmChipsScroll}>
              {selectableFilms.slice(0, 10).map((f) => {
                const isSelected = formFilmId === f.id;
                return (
                  <Pressable
                    key={f.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setFormFilmId(f.id);
                      setFormTrailerId('');
                    }}
                    style={[
                      styles.choicePill,
                      isSelected
                        ? styles.choicePillActive
                        : { borderColor: tokens.border.hairline },
                    ]}>
                    <Film size={14} color={isSelected ? '#000000' : tokens.text.primary} />
                    <Text
                      style={[
                        styles.choicePillText,
                        { color: isSelected ? '#000000' : tokens.text.primary },
                      ]}>
                      {f.title} ({f.year})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 3. Select Trailer */}
            {formFilmId ? (
              <>
                <Text style={[styles.fieldHeading, { color: tokens.text.secondary, marginTop: 16 }]}>
                  SELECT TRAILER / CLIP
                </Text>
                <View style={styles.trailerOptionsCol}>
                  {filmTrailers.map((t) => {
                    const isSelected = formTrailerId === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => setFormTrailerId(t.id)}
                        style={[
                          styles.trailerOptionCard,
                          isSelected
                            ? styles.trailerOptionCardActive
                            : { borderColor: tokens.border.hairline },
                        ]}>
                        <Video size={16} color={isSelected ? '#000000' : tokens.text.primary} />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.trailerOptionTitle,
                              { color: isSelected ? '#000000' : tokens.text.primary },
                            ]}
                            numberOfLines={1}>
                            {t.title}
                          </Text>
                          <Text
                            style={[
                              styles.trailerOptionMeta,
                              { color: isSelected ? '#2E2E2E' : tokens.text.secondary },
                            ]}>
                            ID: {t.youtube_id}
                          </Text>
                        </View>
                        {isSelected && <Check size={18} color="#000000" strokeWidth={2.5} />}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {/* 4. Campaign Duration */}
            <Text style={[styles.fieldHeading, { color: tokens.text.secondary, marginTop: 16 }]}>
              CAMPAIGN DURATION (DAYS)
            </Text>
            <View style={styles.daysRow}>
              {['7', '14', '30', '60'].map((d) => {
                const isSelected = campaignDays === d;
                return (
                  <Pressable
                    key={d}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => setCampaignDays(d)}
                    style={[
                      styles.dayChip,
                      isSelected ? styles.dayChipActive : { borderColor: tokens.border.hairline },
                    ]}>
                    <Text
                      style={[
                        styles.dayChipText,
                        { color: isSelected ? '#000000' : tokens.text.secondary },
                      ]}>
                      {d} Days
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Submit Action */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Launch campaign slot"
              disabled={createSlotMutation.isPending}
              onPress={handleCreateSlot}
              style={[styles.modalSubmitBtn, { backgroundColor: '#FFFFFF' }]}>
              {createSlotMutation.isPending ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Launch Promoted Slot</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    minHeight: 34,
  },
  createSlotBtnText: {
    color: '#000000',
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  policyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  policyTextWrapper: {
    flex: 1,
    gap: 4,
  },
  policyTitle: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
  policyDesc: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 18,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overviewCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 4,
  },
  overviewCardLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  overviewCardValue: {
    fontFamily: typography.titleLarge.fontFamily,
    fontSize: 18,
    fontWeight: '800',
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabChipText: {
    fontSize: 12,
  },
  slotsListContainer: {
    gap: spacing.md,
  },
  slotCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sponsorHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  promotedTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  promotedTagText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sponsorName: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
    flex: 1,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
  },
  slotDetails: {
    gap: 4,
  },
  filmTitle: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
  trailerTitle: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  scheduleText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  deniedTitle: {
    fontFamily: typography.titleMedium.fontFamily,
    fontSize: typography.titleMedium.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  deniedDesc: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    lineHeight: 20,
  },
  returnBtn: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  returnBtnText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  fieldHeading: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  modalInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  filmChipsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 36,
  },
  choicePillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  choicePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trailerOptionsCol: {
    gap: spacing.sm,
  },
  trailerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    minHeight: 48,
  },
  trailerOptionCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  trailerOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  trailerOptionMeta: {
    fontSize: 11,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    minHeight: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  modalSubmitBtnText: {
    color: '#000000',
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
});

