import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Flag, X, CheckCircle2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useOptionalAuth } from '@/features/auth';
import { useSubmitReport } from '@/features/moderation/useReport';
import { ReportTargetType, REPORT_REASONS } from '@/features/moderation/types';
import { radius, typography, spacing } from '@/lib/theme';

interface ReportModalProps {
  visible: boolean;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  onClose: () => void;
}

export function ReportModal({
  visible,
  targetType,
  targetId,
  targetTitle,
  onClose,
}: ReportModalProps) {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const submitReportMutation = useSubmitReport();

  const handleClose = () => {
    setIsSuccess(false);
    setDetails('');
    setSelectedReason(REPORT_REASONS[0]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('You must be signed in to submit a report.');
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    submitReportMutation.mutate(
      {
        reporterId: user.id,
        targetType,
        targetId,
        reason: selectedReason,
        details: details.trim() || undefined,
      },
      {
        onSuccess: () => {
          try {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          setIsSuccess(true);
        },
      }
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable
          style={styles.dismissArea}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss report dialog"
        />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Flag size={18} color="#FFFFFF" />
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.title}>Report Content</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {targetTitle
                    ? `${targetType.toUpperCase()}: ${targetTitle}`
                    : `Reporting ${targetType}`}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close report dialog">
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {isSuccess ? (
            <View style={styles.successState}>
              <CheckCircle2 size={44} color="#FFFFFF" />
              <Text style={styles.successTitle}>Report Received</Text>
              <Text style={styles.successBody}>
                Thank you for keeping Takilya a safe and community-driven space for Philippine cinema. Our moderation team will review this promptly.
              </Text>
              <Pressable
                onPress={handleClose}
                style={styles.doneBtn}
                accessibilityRole="button"
                accessibilityLabel="Close report confirmation">
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              <Text style={styles.sectionHeading}>Select a Reason</Text>

              <View style={styles.reasonList}>
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={reason}
                      onPress={() => {
                        try {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch {}
                        setSelectedReason(reason);
                      }}
                      style={[
                        styles.reasonItem,
                        isSelected && styles.reasonItemSelected,
                      ]}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}>
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                      <Text
                        style={[
                          styles.reasonText,
                          isSelected && styles.reasonTextSelected,
                        ]}>
                        {reason}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionHeading}>Additional Details (Optional)</Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Provide additional context or timestamp if applicable..."
                placeholderTextColor="#8A8A8A"
                multiline
                numberOfLines={3}
                style={styles.textInput}
                maxLength={300}
                accessibilityLabel="Additional report details"
              />

              {submitReportMutation.isError && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={16} color="#FFFFFF" />
                  <Text style={styles.errorText}>
                    {submitReportMutation.error.message ||
                      'Could not submit report. Please try again.'}
                  </Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <Pressable
                  onPress={handleClose}
                  style={styles.cancelBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel reporting">
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit}
                  disabled={submitReportMutation.isPending}
                  style={[
                    styles.submitBtn,
                    submitReportMutation.isPending && styles.submitBtnDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Submit report to moderation">
                  {submitReportMutation.isPending ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Report</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  title: {
    ...typography.title,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionHeading: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#D4D4D4',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonList: {
    gap: 8,
    marginBottom: 18,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#141414',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  reasonItemSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#1F1F1F',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#8A8A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#FFFFFF',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  reasonText: {
    ...typography.body,
    fontSize: 14,
    color: '#D4D4D4',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.sm,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#8A8A8A',
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitBtn: {
    flex: 1.6,
    minHeight: 48,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  successState: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  successTitle: {
    ...typography.title,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  successBody: {
    ...typography.body,
    fontSize: 14,
    color: '#D4D4D4',
    textAlign: 'center',
    lineHeight: 20,
  },
  doneBtn: {
    marginTop: 16,
    minWidth: 140,
    minHeight: 44,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  doneBtnText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
});

