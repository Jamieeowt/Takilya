import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Star, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { RatingStars } from '@/components/ui/RatingStars';
import { Button } from '@/components/ui/Button';
import { radius, typography } from '@/lib/theme';

interface FilmRateModalProps {
  visible: boolean;
  onClose: () => void;
  filmTitle: string;
  initialScore?: number | null;
  initialReviewTitle?: string | null;
  initialReviewBody?: string | null;
  initialHasSpoilers?: boolean;
  onSubmit: (data: {
    score: number;
    title: string;
    body: string;
    hasSpoilers: boolean;
  }) => void;
  onRemoveRating?: () => void;
  isSubmitting?: boolean;
}

export function FilmRateModal({
  visible,
  onClose,
  filmTitle,
  initialScore,
  initialReviewTitle,
  initialReviewBody,
  initialHasSpoilers = false,
  onSubmit,
  onRemoveRating,
  isSubmitting = false,
}: FilmRateModalProps) {
  const [score, setScore] = useState<number>(initialScore || 5.0);
  const [reviewTitle, setReviewTitle] = useState(initialReviewTitle || '');
  const [reviewBody, setReviewBody] = useState(initialReviewBody || '');
  const [hasSpoilers, setHasSpoilers] = useState(initialHasSpoilers);

  useEffect(() => {
    if (visible) {
      setScore(initialScore || 5.0);
      setReviewTitle(initialReviewTitle || '');
      setReviewBody(initialReviewBody || '');
      setHasSpoilers(initialHasSpoilers);
    }
  }, [visible, initialScore, initialReviewTitle, initialReviewBody, initialHasSpoilers]);

  const handleSubmit = () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onSubmit({
      score,
      title: reviewTitle,
      body: reviewBody,
      hasSpoilers,
    });
    onClose();
  };

  const handleStepScore = (step: number) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const next = Math.max(0.5, Math.min(5.0, Number((score + step).toFixed(1))));
    setScore(next);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`Rate ${filmTitle}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Interactive Stars Rating Row */}
          <View style={styles.ratingBox}>
            <Text style={styles.ratingNumber}>{score.toFixed(1)}</Text>
            <RatingStars
              score={score}
              size={32}
              interactive={true}
              onRate={(val) => setScore(val)}
            />

            {/* Quick Half-Step Adjust Buttons */}
            <View style={styles.stepperRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease rating by half star"
                onPress={() => handleStepScore(-0.5)}
                style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>- 0.5</Text>
              </Pressable>
              <Text style={styles.stepperLabel}>Half-Star Precision</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase rating by half star"
                onPress={() => handleStepScore(0.5)}
                style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+ 0.5</Text>
              </Pressable>
            </View>
          </View>

          {/* Optional Review Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Review Title (Optional)</Text>
            <TextInput
              value={reviewTitle}
              onChangeText={setReviewTitle}
              placeholder="e.g. Masterwork of Philippine Cinema"
              placeholderTextColor="#8A8A8A"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Review Thoughts (Optional)</Text>
            <TextInput
              value={reviewBody}
              onChangeText={setReviewBody}
              placeholder="Share your thoughts on the direction, performances, and themes..."
              placeholderTextColor="#8A8A8A"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.textInput, styles.textArea]}
            />
          </View>

          {/* Spoilers Toggle */}
          <View style={styles.spoilersRow}>
            <View style={styles.spoilersTextCol}>
              <Text style={styles.spoilersTitle}>Contains Spoilers</Text>
              <Text style={styles.spoilersSubtext}>
                Masks review behind a spoiler tag in the community feed
              </Text>
            </View>
            <Switch
              value={hasSpoilers}
              onValueChange={setHasSpoilers}
              trackColor={{ false: '#2E2E2E', true: '#FFFFFF' }}
              thumbColor={hasSpoilers ? '#000000' : '#8A8A8A'}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsCol}>
            <Button
              label={isSubmitting ? 'Saving...' : 'Save Rating & Review'}
              onPress={handleSubmit}
              variant="primary"
              disabled={isSubmitting}
            />

            {initialScore && onRemoveRating && (
              <Button
                label="Remove Rating"
                onPress={() => {
                  onRemoveRating();
                  onClose();
                }}
                variant="ghost"
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 520,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  ratingBox: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
  },
  ratingNumber: {
    ...typography.display,
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  stepBtn: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  stepBtnText: {
    ...typography.mono,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepperLabel: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...typography.caption,
    color: '#D4D4D4',
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    minHeight: 90,
  },
  spoilersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  spoilersTextCol: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  spoilersTitle: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  spoilersSubtext: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  actionsCol: {
    gap: 8,
    marginTop: 8,
  },
});

