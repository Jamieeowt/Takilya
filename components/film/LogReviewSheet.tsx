import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import {
  X,
  Star,
  Calendar,
  RotateCcw,
  Film,
  Disc,
  Tv,
  AlertTriangle,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { LogFilmPayload, WatchMedium } from '@/features/films/types';
import { RatingStars } from '@/components/ui/RatingStars';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { radius, typography } from '@/lib/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const MAX_REVIEW_CHARS = 2000;

interface LogReviewSheetProps {
  visible: boolean;
  onClose: () => void;
  filmId: string;
  filmTitle: string;
  releaseYear: number;
  posterUrl?: string | null;
  initialRating?: number | null;
  initialReviewTitle?: string | null;
  initialReviewBody?: string | null;
  initialHasSpoilers?: boolean;
  onSave: (payload: {
    rating: number;
    reviewTitle?: string;
    reviewBody?: string;
    hasSpoilers?: boolean;
    watchedDate?: string;
    isRewatch?: boolean;
    medium?: WatchMedium;
  }) => void;
  isSubmitting?: boolean;
}

export function LogReviewSheet({
  visible,
  onClose,
  filmId,
  filmTitle,
  releaseYear,
  posterUrl,
  initialRating,
  initialReviewTitle,
  initialReviewBody,
  initialHasSpoilers = false,
  onSave,
  isSubmitting = false,
}: LogReviewSheetProps) {
  // Form States
  const [rating, setRating] = useState<number>(initialRating || 5.0);
  const [reviewTitle, setReviewTitle] = useState(initialReviewTitle || '');
  const [reviewBody, setReviewBody] = useState(initialReviewBody || '');
  const [hasSpoilers, setHasSpoilers] = useState(initialHasSpoilers);

  // Date and Medium States
  const todayStr = new Date().toISOString().split('T')[0];
  const [watchedDate, setWatchedDate] = useState<string>(todayStr);
  const [isWatchedToday, setIsWatchedToday] = useState(true);
  const [isRewatch, setIsRewatch] = useState(false);
  const [medium, setMedium] = useState<WatchMedium>('digital_streaming');

  useEffect(() => {
    if (visible) {
      setRating(initialRating || 5.0);
      setReviewTitle(initialReviewTitle || '');
      setReviewBody(initialReviewBody || '');
      setHasSpoilers(initialHasSpoilers);
      setWatchedDate(todayStr);
      setIsWatchedToday(true);
      setIsRewatch(false);
      setMedium('digital_streaming');
    }
  }, [visible, initialRating, initialReviewTitle, initialReviewBody, initialHasSpoilers, todayStr]);

  const handleStepScore = (step: number) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const next = Math.max(0.5, Math.min(5.0, Number((rating + step).toFixed(1))));
    setRating(next);
  };

  const handleToggleWatchedToday = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const next = !isWatchedToday;
    setIsWatchedToday(next);
    if (next) {
      setWatchedDate(todayStr);
    }
  };

  const handleToggleRewatch = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsRewatch(!isRewatch);
  };

  const handleSelectMedium = (m: WatchMedium) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setMedium(m);
  };

  const handleSave = () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onSave({
      rating,
      reviewTitle: reviewTitle.trim() || undefined,
      reviewBody: reviewBody.trim() || undefined,
      hasSpoilers,
      watchedDate: isWatchedToday ? todayStr : watchedDate,
      isRewatch,
      medium,
    });
    onClose();
  };

  const formatWatchedDisplay = () => {
    if (isWatchedToday) return 'Today';
    try {
      const d = new Date(watchedDate);
      return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return watchedDate;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss log modal"
          style={styles.backdropTouch}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Drag Handle Bar */}
          <View style={styles.handleBarWrap}>
            <View style={styles.handleBar} />
          </View>

          {/* Header Row: Thumbnail, Title, Cancel, Save */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel logging"
              onPress={onClose}
              hitSlop={8}
              style={styles.headerCancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            {/* Film Context in Center */}
            <View style={styles.filmHeaderContext}>
              <View style={styles.miniPosterWrap}>
                <Image
                  source={{ uri: posterUrl || undefined }}
                  placeholder={{ blurhash: DEFAULT_BLURHASH }}
                  style={styles.miniPoster}
                  contentFit="cover"
                />
              </View>
              <View style={styles.filmHeaderInfo}>
                <Text style={styles.filmHeaderTitle} numberOfLines={1}>
                  {filmTitle}
                </Text>
                <Text style={styles.filmHeaderYear}>({releaseYear})</Text>
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save review and rating"
              onPress={handleSave}
              disabled={isSubmitting}
              hitSlop={8}
              style={styles.headerSaveBtn}>
              <Text style={styles.saveText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>

          {/* Form Scroll Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              {/* 1. Rating & Stepper Box */}
              <View style={styles.ratingCard}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreNumber}>{rating.toFixed(1)}</Text>
                  <Text style={styles.scoreMax}>/ 5.0</Text>
                </View>

                {/* Stars Interactive Component */}
                <RatingStars
                  score={rating}
                  size={36}
                  interactive={true}
                  onRate={(val) => setRating(val)}
                />

                {/* Half-Step Precision Stepper Buttons */}
                <View style={styles.stepperRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease rating by half star"
                    onPress={() => handleStepScore(-0.5)}
                    hitSlop={6}
                    style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>- 0.5</Text>
                  </Pressable>
                  <Text style={styles.stepperLabel}>Half-Star Precision</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase rating by half star"
                    onPress={() => handleStepScore(0.5)}
                    hitSlop={6}
                    style={styles.stepBtn}>
                    <Text style={styles.stepBtnText}>+ 0.5</Text>
                  </Pressable>
                </View>
              </View>

              {/* 2. Date Watched Row */}
              <View style={styles.sectionRow}>
                <View style={styles.sectionTitleRow}>
                  <Calendar size={14} color="#8A8A8A" />
                  <Text style={styles.sectionLabel}>Date Watched</Text>
                </View>

                <View style={styles.datePillsWrap}>
                  <Chip
                    label={`Watched ${formatWatchedDisplay()}`}
                    variant="filled"
                    selected={isWatchedToday}
                    onPress={handleToggleWatchedToday}
                  />
                </View>
              </View>

              {/* 3. Tags & Viewing Medium (Cinema, Streaming, Physical, Rewatch) */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>Viewing Experience</Text>
                <View style={styles.chipsWrap}>
                  {/* Rewatch Pill */}
                  <Chip
                    label="Rewatch"
                    variant="outlined"
                    selected={isRewatch}
                    icon={<RotateCcw size={13} color={isRewatch ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                    onPress={handleToggleRewatch}
                  />

                  {/* Medium: In Cinema */}
                  <Chip
                    label="In Cinema"
                    variant="outlined"
                    selected={medium === 'in_cinema'}
                    icon={<Film size={13} color={medium === 'in_cinema' ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                    onPress={() => handleSelectMedium('in_cinema')}
                  />

                  {/* Medium: Digital / Streaming */}
                  <Chip
                    label="Digital / Streaming"
                    variant="outlined"
                    selected={medium === 'digital_streaming'}
                    icon={<Tv size={13} color={medium === 'digital_streaming' ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                    onPress={() => handleSelectMedium('digital_streaming')}
                  />

                  {/* Medium: Physical Media */}
                  <Chip
                    label="Physical Media"
                    variant="outlined"
                    selected={medium === 'physical_media'}
                    icon={<Disc size={13} color={medium === 'physical_media' ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                    onPress={() => handleSelectMedium('physical_media')}
                  />
                </View>
              </View>

              {/* 4. Review Title & Text Area */}
              <View style={styles.reviewInputBlock}>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.sectionLabel}>Review & Thoughts (Optional)</Text>
                  <Text style={styles.charCountText}>
                    {reviewBody.length} / {MAX_REVIEW_CHARS}
                  </Text>
                </View>

                <TextInput
                  value={reviewTitle}
                  onChangeText={setReviewTitle}
                  placeholder="Headline or summary (e.g. Masterwork of Philippine Cinema)"
                  placeholderTextColor="#8A8A8A"
                  maxLength={120}
                  style={styles.titleInput}
                />

                <TextInput
                  value={reviewBody}
                  onChangeText={(text) => {
                    if (text.length <= MAX_REVIEW_CHARS) {
                      setReviewBody(text);
                    }
                  }}
                  placeholder="Add your thoughts or review..."
                  placeholderTextColor="#8A8A8A"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[styles.textInput, styles.textArea]}
                />
              </View>

              {/* 5. Spoilers Toggle Pill */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={hasSpoilers ? 'Review marked as spoiler' : 'Mark review as containing spoilers'}
                onPress={() => setHasSpoilers(!hasSpoilers)}
                style={[styles.spoilerToggleRow, hasSpoilers && styles.spoilerToggleRowActive]}>
                <View style={styles.spoilerLeft}>
                  <AlertTriangle size={15} color={hasSpoilers ? '#FFFFFF' : '#8A8A8A'} />
                  <View>
                    <Text style={[styles.spoilerTitle, hasSpoilers && styles.spoilerTitleActive]}>
                      Contains Spoilers
                    </Text>
                    <Text style={styles.spoilerSub}>
                      Masks review text behind a tap-to-reveal shield in the feed
                    </Text>
                  </View>
                </View>

                <View style={[styles.checkbox, hasSpoilers && styles.checkboxActive]}>
                  {hasSpoilers && <Check size={12} color="#000000" strokeWidth={3} />}
                </View>
              </Pressable>

              {/* 6. Primary Save CTA Button */}
              <Button
                label={isSubmitting ? 'Saving...' : 'Log & Save Review'}
                onPress={handleSave}
                variant="primary"
                disabled={isSubmitting}
                style={styles.saveCtaBtn}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: radius.cardLarge,
    borderTopRightRadius: radius.cardLarge,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    maxHeight: Math.min(680, SCREEN_HEIGHT * 0.88),
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  handleBarWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCancelBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cancelText: {
    ...typography.body,
    color: '#8A8A8A',
    fontSize: 14,
  },
  filmHeaderContext: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  miniPosterWrap: {
    width: 24,
    height: 36, // 2:3 ratio
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  miniPoster: {
    width: '100%',
    height: '100%',
  },
  filmHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 160,
  },
  filmHeaderTitle: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  filmHeaderYear: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
  headerSaveBtn: {
    minWidth: 54,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  saveText: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
  keyboardContainer: {
    flexShrink: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  ratingCard: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#141414',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreNumber: {
    ...typography.display,
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  scoreMax: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  datePillsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionBlock: {
    gap: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipIcon: {
    marginRight: 4,
  },
  reviewInputBlock: {
    gap: 8,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCountText: {
    ...typography.mono,
    color: '#8A8A8A',
    fontSize: 11,
  },
  titleInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  textInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  textArea: {
    minHeight: 90,
  },
  spoilerToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  spoilerToggleRowActive: {
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  spoilerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  spoilerTitle: {
    ...typography.body,
    color: '#8A8A8A',
    fontWeight: '600',
    fontSize: 13,
  },
  spoilerTitleActive: {
    color: '#FFFFFF',
  },
  spoilerSub: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  saveCtaBtn: {
    marginTop: 6,
  },
});

