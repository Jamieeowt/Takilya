import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  ExternalLink,
  Building2,
  Calendar,
  User,
  Clock,
  Filter,
} from 'lucide-react-native';

import { useRole, useAuth } from '@/features/auth';
import { useTheme, radius, spacing, typography } from '@/lib/theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useVerificationRequests,
  useApproveVerification,
  useRejectVerification,
} from '@/features/verification';
import {
  VerificationRequest,
  VerificationRequestStatus,
} from '@/features/verification/types';

export default function AdminVerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { tokens, isDark } = useTheme();

  const [filterStatus, setFilterStatus] = useState<VerificationRequestStatus | 'all'>('pending');

  const {
    data: requests = [],
    isLoading,
    isRefetching,
    refetch,
  } = useVerificationRequests(filterStatus);

  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();

  const handleApprove = (request: VerificationRequest) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    Alert.alert(
      'Approve Verification',
      `Grant official verified status to "${request.entity_name}" (${request.target_type.toUpperCase()})?\n\nThis will promote @${
        request.user_username || request.applicant?.username || 'user'
      } to "verified_official" and assign verified badges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Verify',
          style: 'default',
          onPress: async () => {
            try {
              await approveMutation.mutateAsync({
                requestId: request.id,
                adminId: user?.id || 'admin',
              });
              try {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch {}
              Alert.alert('Approved', `"${request.entity_name}" is now verified official.`);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to approve verification.');
            }
          },
        },
      ]
    );
  };

  const handleReject = (request: VerificationRequest) => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert(
      'Deny Verification',
      `Reject verification request for "${request.entity_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny Request',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectMutation.mutateAsync({
                requestId: request.id,
                adminId: user?.id || 'admin',
                notes: 'Credentials did not match official registry documentation.',
              });
              try {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch {}
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to reject verification.');
            }
          },
        },
      ]
    );
  };

  const handleOpenProof = async (proofUrl: string) => {
    try {
      if (proofUrl.startsWith('http://') || proofUrl.startsWith('https://')) {
        const canOpen = await Linking.canOpenURL(proofUrl);
        if (canOpen) {
          await Linking.openURL(proofUrl);
          return;
        }
      }
      Alert.alert('Proof Details', proofUrl);
    } catch {
      Alert.alert('Proof Details', proofUrl);
    }
  };

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
            You must be logged into an account with the "admin" role to view and process official verification
            requests.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to previous screen"
            onPress={() => router.back()}
            style={[styles.returnBtn, { borderColor: tokens.border.hairline }]}>
            <Text style={[styles.returnBtnText, { color: tokens.text.primary }]}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderFilterTab = (status: VerificationRequestStatus | 'all', label: string) => {
    const isActive = filterStatus === status;
    return (
      <Pressable
        key={status}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={`Filter by ${label}`}
        onPress={() => {
          try {
            void Haptics.selectionAsync();
          } catch {}
          setFilterStatus(status);
        }}
        style={[
          styles.tabBtn,
          isActive
            ? styles.tabBtnActive
            : { borderColor: tokens.border.hairline, backgroundColor: tokens.background.secondary },
        ]}>
        <Text
          style={[
            styles.tabBtnText,
            {
              color: isActive ? '#000000' : tokens.text.secondary,
              fontFamily: isActive
                ? typography.caption.fontFamily
                : typography.bodySmall.fontFamily,
              fontWeight: isActive ? '700' : '400',
            },
          ]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const renderRequestItem = ({ item }: { item: VerificationRequest }) => {
    const isPending = item.status === 'pending';
    const isApproved = item.status === 'approved';
    const isRejected = item.status === 'rejected';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: tokens.background.secondary,
            borderColor: tokens.border.hairline,
          },
        ]}>
        {/* Top Entity Bar */}
        <View style={styles.cardHeader}>
          <View style={styles.entityTitleRow}>
            {item.target_type === 'studio' && (
              <Building2 size={16} color={tokens.text.primary} />
            )}
            {item.target_type === 'festival' && (
              <Calendar size={16} color={tokens.text.primary} />
            )}
            {item.target_type === 'person' && (
              <User size={16} color={tokens.text.primary} />
            )}
            <Text style={[styles.entityName, { color: tokens.text.primary }]} numberOfLines={1}>
              {item.entity_name}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isApproved
                ? styles.statusPillApproved
                : isRejected
                ? styles.statusPillRejected
                : styles.statusPillPending,
            ]}>
            <Text
              style={[
                styles.statusPillText,
                { color: isApproved ? '#000000' : tokens.text.primary },
              ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Applicant details */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: tokens.text.secondary }]}>
            Submitted by @{item.user_username || item.applicant?.username || 'user'} •{' '}
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Proof Field */}
        <View
          style={[
            styles.proofBox,
            {
              backgroundColor: isDark ? '#000000' : '#F5F5F5',
              borderColor: tokens.border.hairline,
            },
          ]}>
          <View style={styles.proofHeader}>
            <Text style={[styles.proofLabel, { color: tokens.text.tertiary }]}>
              DOCUMENTATION / PROOF
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open proof document"
              onPress={() => handleOpenProof(item.proof_url)}
              style={styles.openProofBtn}>
              <ExternalLink size={14} color={tokens.text.primary} />
              <Text style={[styles.openProofText, { color: tokens.text.primary }]}>View</Text>
            </Pressable>
          </View>
          <Text style={[styles.proofUrl, { color: tokens.text.primary }]} numberOfLines={2}>
            {item.proof_url}
          </Text>
        </View>

        {/* Notes if provided */}
        {item.notes && (
          <Text style={[styles.notesText, { color: tokens.text.secondary }]}>
            "{item.notes}"
          </Text>
        )}

        {/* Actions for Pending requests */}
        {isPending && (
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Reject verification for ${item.entity_name}`}
              disabled={rejectMutation.isPending || approveMutation.isPending}
              onPress={() => handleReject(item)}
              style={[styles.actionBtn, styles.actionRejectBtn, { borderColor: tokens.border.hairline }]}>
              <X size={16} color={tokens.text.primary} />
              <Text style={[styles.actionRejectText, { color: tokens.text.primary }]}>Deny</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Approve verification for ${item.entity_name}`}
              disabled={rejectMutation.isPending || approveMutation.isPending}
              onPress={() => handleApprove(item)}
              style={[styles.actionBtn, styles.actionApproveBtn]}>
              <Check size={16} color="#000000" strokeWidth={2.5} />
              <Text style={styles.actionApproveText}>Approve</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background.primary }]}>
      <GlassHeader
        title="Admin Verification"
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

      <View style={[styles.filterBar, { paddingTop: insets.top + 48 }]}>
        {renderFilterTab('pending', 'Pending')}
        {renderFilterTab('approved', 'Approved')}
        {renderFilterTab('rejected', 'Rejected')}
        {renderFilterTab('all', 'All')}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.text.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor={tokens.text.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Requests"
              description={
                filterStatus === 'pending'
                  ? 'There are no pending verification requests waiting for review.'
                  : `No verification requests found with status "${filterStatus}".`
              }
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
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabBtnText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  entityName: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusPillApproved: {
    backgroundColor: '#FFFFFF',
  },
  statusPillRejected: {
    borderWidth: 2,
    borderColor: '#8A8A8A',
  },
  statusPillPending: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  statusPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaRow: {
    marginTop: -2,
  },
  metaText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
  },
  proofBox: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proofLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  openProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
  },
  openProofText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  proofUrl: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
  },
  notesText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionRejectBtn: {
    borderWidth: 1,
  },
  actionRejectText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  actionApproveBtn: {
    backgroundColor: '#FFFFFF',
  },
  actionApproveText: {
    color: '#000000',
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    fontWeight: '700',
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
});

