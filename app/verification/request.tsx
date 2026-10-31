import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react-native';

import { useAuth } from '@/features/auth';
import { useTheme, radius, spacing, typography } from '@/lib/theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import {
  useSubmitVerificationRequest,
  useUserVerificationStatus,
} from '@/features/verification';
import { VerificationTargetType } from '@/features/verification/types';

export default function VerificationRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const { tokens, isDark } = useTheme();

  const [targetType, setTargetType] = useState<VerificationTargetType>('studio');
  const [entityName, setEntityName] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Status of any active/past requests submitted by this user
  const { data: userStatus, isLoading: isLoadingStatus } = useUserVerificationStatus(user?.id);
  const submitMutation = useSubmitVerificationRequest();

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Sign In Required', 'Please sign in to submit a verification request.');
      return;
    }

    const trimmedName = entityName.trim();
    const trimmedProof = proofUrl.trim();

    if (!trimmedName) {
      Alert.alert('Missing Field', 'Please enter your studio, festival, or entity name.');
      return;
    }

    if (!trimmedProof) {
      Alert.alert(
        'Missing Proof',
        'Please provide an official website URL, verified social profile link, or FDCP / SEC registration number.'
      );
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await submitMutation.mutateAsync({
        user_id: user.id,
        target_type: targetType,
        entity_name: trimmedName,
        proof_url: trimmedProof,
        notes: notes.trim() || undefined,
      });

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Request Submitted',
        'Your verification request has been queued for admin review. You will be notified once reviewed.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Submission Error', err?.message || 'Failed to submit verification request.');
    }
  };

  const renderStatusCard = () => {
    if (!userStatus) return null;

    const isPending = userStatus.status === 'pending';
    const isApproved = userStatus.status === 'approved';
    const isRejected = userStatus.status === 'rejected';

    return (
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: tokens.background.secondary,
            borderColor: tokens.border.hairline,
          },
        ]}>
        <View style={styles.statusHeaderRow}>
          <View style={styles.statusTitleGroup}>
            {isPending && <Clock size={20} color={tokens.text.primary} />}
            {isApproved && <CheckCircle2 size={20} color={tokens.text.primary} />}
            {isRejected && <AlertCircle size={20} color={tokens.text.primary} />}
            <Text style={[styles.statusTitle, { color: tokens.text.primary }]}>
              {isPending && 'Verification Pending Review'}
              {isApproved && 'Account Verified Official'}
              {isRejected && 'Verification Request Not Approved'}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              isApproved
                ? styles.statusPillFilled
                : isRejected
                ? styles.statusPillDouble
                : styles.statusPillOutlined,
            ]}>
            <Text
              style={[
                styles.statusPillText,
                { color: isApproved ? '#000000' : tokens.text.primary },
              ]}>
              {userStatus.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={[styles.statusSubtitle, { color: tokens.text.secondary }]}>
          {isPending &&
            `Submitted for "${userStatus.entity_name}" (${userStatus.target_type}). Our team verifies credentials against FDCP registries and company channels within 24-48 hours.`}
          {isApproved &&
            `You are officially verified as "${userStatus.entity_name}". You now have access to official clip posting and verified badges across the app.`}
          {isRejected &&
            `Your submission for "${userStatus.entity_name}" was rejected. Please review your credentials and submit updated documentation below.`}
        </Text>

        {userStatus.reviewed_at && (
          <Text style={[styles.statusDate, { color: tokens.text.tertiary }]}>
            Reviewed on {new Date(userStatus.reviewed_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: tokens.background.primary }]}>
      <GlassHeader
        title="Official Verification"
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 54, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Banner Info */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor: tokens.background.secondary,
              borderColor: tokens.border.hairline,
            },
          ]}>
          <View style={styles.bannerIconWrapper}>
            <ShieldCheck size={28} color={tokens.text.primary} strokeWidth={2} />
          </View>
          <View style={styles.bannerTextWrapper}>
            <Text style={[styles.bannerTitle, { color: tokens.text.primary }]}>
              Verified Official Accounts
            </Text>
            <Text style={[styles.bannerDesc, { color: tokens.text.secondary }]}>
              Studios, Film Festivals, and Filmmakers/Actors can request official status to post verified
              trailers, official clips, and behind-the-scenes footage to the Takilya feed.
            </Text>
          </View>
        </View>

        {/* Existing Status if any */}
        {renderStatusCard()}

        {/* Form Container */}
        {(!userStatus || userStatus.status === 'rejected') && (
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: tokens.background.secondary,
                borderColor: tokens.border.hairline,
              },
            ]}>
            <Text style={[styles.sectionHeading, { color: tokens.text.primary }]}>
              Submit Verification Credentials
            </Text>

            {/* Target Type Selector */}
            <Text style={[styles.inputLabel, { color: tokens.text.secondary }]}>
              SELECT ENTITY TYPE
            </Text>
            <View style={styles.typeSelectorRow}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: targetType === 'studio' }}
                accessibilityLabel="Studio or Production House"
                onPress={() => setTargetType('studio')}
                style={[
                  styles.typeOptionBtn,
                  targetType === 'studio'
                    ? styles.typeOptionBtnActive
                    : { borderColor: tokens.border.hairline },
                ]}>
                <Building2
                  size={18}
                  color={targetType === 'studio' ? '#000000' : tokens.text.primary}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    {
                      color: targetType === 'studio' ? '#000000' : tokens.text.primary,
                      fontFamily:
                        targetType === 'studio'
                          ? typography.titleSmall.fontFamily
                          : typography.body.fontFamily,
                    },
                  ]}>
                  Studio
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: targetType === 'festival' }}
                accessibilityLabel="Film Festival"
                onPress={() => setTargetType('festival')}
                style={[
                  styles.typeOptionBtn,
                  targetType === 'festival'
                    ? styles.typeOptionBtnActive
                    : { borderColor: tokens.border.hairline },
                ]}>
                <Calendar
                  size={18}
                  color={targetType === 'festival' ? '#000000' : tokens.text.primary}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    {
                      color: targetType === 'festival' ? '#000000' : tokens.text.primary,
                      fontFamily:
                        targetType === 'festival'
                          ? typography.titleSmall.fontFamily
                          : typography.body.fontFamily,
                    },
                  ]}>
                  Festival
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: targetType === 'person' }}
                accessibilityLabel="Director, Writer, or Actor"
                onPress={() => setTargetType('person')}
                style={[
                  styles.typeOptionBtn,
                  targetType === 'person'
                    ? styles.typeOptionBtnActive
                    : { borderColor: tokens.border.hairline },
                ]}>
                <User
                  size={18}
                  color={targetType === 'person' ? '#000000' : tokens.text.primary}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    {
                      color: targetType === 'person' ? '#000000' : tokens.text.primary,
                      fontFamily:
                        targetType === 'person'
                          ? typography.titleSmall.fontFamily
                          : typography.body.fontFamily,
                    },
                  ]}>
                  Person
                </Text>
              </Pressable>
            </View>

            {/* Entity Name Input */}
            <Text style={[styles.inputLabel, { color: tokens.text.secondary }]}>
              OFFICIAL ENTITY NAME
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: tokens.text.primary,
                  borderColor: tokens.border.hairline,
                  backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                },
              ]}
              placeholder={
                targetType === 'studio'
                  ? 'e.g., Black Sheep, TBA Studios'
                  : targetType === 'festival'
                  ? 'e.g., Cinemalaya Foundation, QCinema'
                  : 'e.g., Lav Diaz, Dolly de Leon'
              }
              placeholderTextColor={tokens.text.tertiary}
              value={entityName}
              onChangeText={setEntityName}
              autoCapitalize="words"
            />

            {/* Proof Input */}
            <Text style={[styles.inputLabel, { color: tokens.text.secondary }]}>
              PROOF OF OFFICIAL OWNERSHIP / AFFILIATION
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: tokens.text.primary,
                  borderColor: tokens.border.hairline,
                  backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                },
              ]}
              placeholder="Official website link, verified social URL, or FDCP / SEC #..."
              placeholderTextColor={tokens.text.tertiary}
              value={proofUrl}
              onChangeText={setProofUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={[styles.hintText, { color: tokens.text.tertiary }]}>
              Accepted: Official domain email, company website, verified YouTube/Instagram link, or FDCP
              accreditation ID.
            </Text>

            {/* Additional Notes */}
            <Text style={[styles.inputLabel, { color: tokens.text.secondary }]}>
              ADDITIONAL NOTES (OPTIONAL)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: tokens.text.primary,
                  borderColor: tokens.border.hairline,
                  backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                },
              ]}
              placeholder="Any details on upcoming film releases, festival lineups, or production company credentials..."
              placeholderTextColor={tokens.text.tertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Submit Verification Request"
              disabled={submitMutation.isPending}
              onPress={handleSubmit}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: '#FFFFFF',
                  opacity: submitMutation.isPending ? 0.6 : 1,
                },
              ]}>
              {submitMutation.isPending ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <>
                  <FileCheck size={18} color="#000000" />
                  <Text style={styles.submitBtnText}>Submit Verification Request</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  bannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextWrapper: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontFamily: typography.titleMedium.fontFamily,
    fontSize: typography.titleMedium.fontSize,
    fontWeight: '700',
  },
  bannerDesc: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 18,
  },
  statusCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  statusTitle: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusPillFilled: {
    backgroundColor: '#FFFFFF',
  },
  statusPillOutlined: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  statusPillDouble: {
    borderWidth: 2,
    borderColor: '#8A8A8A',
  },
  statusPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 18,
  },
  statusDate: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize - 1,
    marginTop: 4,
  },
  formCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
  },
  sectionHeading: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeOptionBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  typeOptionBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  typeOptionText: {
    fontSize: 13,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  hintText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize - 1,
    lineHeight: 16,
    marginTop: -4,
  },
  textArea: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.md,
    fontSize: 14,
  },
  submitBtn: {
    minHeight: 48,
    borderRadius: radius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  submitBtnText: {
    color: '#000000',
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
});

