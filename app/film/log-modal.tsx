import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Calendar,
  RotateCcw,
  Film,
  Disc,
  Tv,
  AlertTriangle,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/features/auth';
import { useFilmDetail, useLogFilmAndReview } from '@/features/films/useFilm';
import { WatchMedium } from '@/features/films/types';
import { RatingStars } from '@/components/ui/RatingStars';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { radius, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';
const MAX_REVIEW_CHARS = 2000;

export default function LogModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data: film, isLoading } = useFilmDetail(id || '', user?.id);
  const logFilmMutation = useLogFilmAndReview();

  // Form states
  const [rating, setRating] = useState<number>(film?.user_state?.user_rating || 5.0);
  const [reviewTitle, setReviewTitle] = useState(film?.user_state?.user_review?.title || '');
  const [reviewBody, setReviewBody] = useState(film?.user_state?.user_review?.body || '');
  const [hasSpoilers, setHasSpoilers] = useState(film?.user_state?.user_review?.has_spoilers || false);

  const todayStr = new Date().toISOString().split('T')[0];
  const [watchedDate, setWatchedDate] = useState<string>(todayStr);
  const [isWatchedToday, setIsWatchedToday] = useState(true);
  const [isRewatch, setIsRewatch] = useState(false);
  const [medium, setMedium] = useState<WatchMedium>('digital_streaming');

  const handleStepScore = (step: number) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const next = Math.max(0.5, Math.min(5.0, Number((rating + step).toFixed(1))));
    setRating(next);
  };

  const handleSave = () => {
    if (!film || !user) return;
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    logFilmMutation.mutate({
      filmId: film.id,
      userId: user.id,
      rating,
      reviewTitle: reviewTitle.trim() || undefined,
      reviewBody: reviewBody.trim() || undefined,
      hasSpoilers,
      watchedDate: isWatchedToday ? todayStr : watchedDate,
      isRewatch,
      medium,
    });

    router.back();
  };

  if (isLoading || !film) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.skeletonBox}>
          <SkeletonLoader height={48} />
          <SkeletonLoader height={140} />
          <SkeletonLoader height={80} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 12 }]}>
      {/* Header Row */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel logging"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <View style={styles.filmHeaderInfo}>
          <View style={styles.miniPosterWrap}>
            <Image
              source={{ uri: film.poster_url || undefined }}
              placeholder={{ blurhash: DEFAULT_BLURHASH }}
              style={styles.miniPoster}
              contentFit="cover"
            />
          </View>
          <View style={styles.filmHeaderCol}>
            <Text style={styles.filmHeaderTitle} numberOfLines={1}>
              {film.title}
            </Text>
            <Text style={styles.filmHeaderYear}>({film.release_year})</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save review"
          onPress={handleSave}
          disabled={logFilmMutation.isPending}
          hitSlop={8}
          style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>
            {logFilmMutation.isPending ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

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

            <RatingStars
              score={rating}
              size={36}
              interactive={true}
              onRate={(val) => setRating(val)}
            />

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

            <Chip
              label={isWatchedToday ? 'Watched Today' : watchedDate}
              variant="filled"
              selected={isWatchedToday}
              onPress={() => setIsWatchedToday(!isWatchedToday)}
            />
          </View>

          {/* 3. Experience Tags */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Viewing Experience</Text>
            <View style={styles.chipsWrap}>
              <Chip
                label="Rewatch"
                variant="outlined"
                selected={isRewatch}
                icon={<RotateCcw size={13} color={isRewatch ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                onPress={() => setIsRewatch(!isRewatch)}
              />
              <Chip
                label="In Cinema"
                variant="outlined"
                selected={medium === 'in_cinema'}
                icon={<Film size={13} color={medium === 'in_cinema' ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                onPress={() => setMedium('in_cinema')}
              />
              <Chip
                label="Digital / Streaming"
                variant="outlined"
                selected={medium === 'digital_streaming'}
                icon={<Tv size={13} color={medium === 'digital_streaming' ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                onPress={() => setMedium('digital_streaming')}
              />
              <Chip
                label="Physical Media"
                variant="outlined"
                selected={medium === 'physical_media'}
                icon={<Disc size={13} color={medium === 'physical_media' ? '#000000' : '#8A8A8A'} style={styles.chipIcon} />}
                onPress={() => setMedium('physical_media')}
              />
            </View>
          </View>

          {/* 4. Review Title & Thoughts */}
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
              onChangeText={(t) => {
                if (t.length <= MAX_REVIEW_CHARS) setReviewBody(t);
              }}
              placeholder="Add your thoughts or review..."
              placeholderTextColor="#8A8A8A"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.textInput, styles.textArea]}
            />
          </View>

          {/* 5. Spoiler Toggle */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hasSpoilers ? 'Review marked as spoiler' : 'Mark review as spoiler'}
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

          {/* 6. Save CTA Button */}
          <Button
            label={logFilmMutation.isPending ? 'Saving...' : 'Log & Save Review'}
            onPress={handleSave}
            variant="primary"
            disabled={logFilmMutation.isPending}
            style={styles.saveCtaBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  skeletonBox: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.body,
    color: '#8A8A8A',
    fontSize: 14,
  },
  filmHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  miniPosterWrap: {
    width: 24,
    height: 36,
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
  filmHeaderCol: {
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
  saveBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveBtnText: {
    ...typography.caption,
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
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

