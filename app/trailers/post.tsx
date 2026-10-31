import React, { useState, useMemo } from 'react';
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
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Film,
  Video,
  Check,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Building2,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react-native';

import { useRole, useAuth } from '@/features/auth';
import { useTheme, radius, spacing, typography } from '@/lib/theme';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { extractYouTubeId, getYouTubeThumbnailUrl } from '@/lib/youtube';
import { useFilmsForSelector, usePostOfficialClip } from '@/features/trailers';
import { TrailerPostedByType } from '@/features/trailers/types';

type ClipTypeChoice = 'official' | 'teaser' | 'clip' | 'bts';

export default function PostOfficialClipScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isVerifiedOfficial, isAdmin } = useRole();
  const { tokens, isDark } = useTheme();

  // Form states
  const [selectedFilmId, setSelectedFilmId] = useState<string>('');
  const [filmSearchQuery, setFilmSearchQuery] = useState<string>('');
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [clipTitle, setClipTitle] = useState<string>('');
  const [clipType, setClipType] = useState<ClipTypeChoice>('official');
  const [postedByType, setPostedByType] = useState<TrailerPostedByType>('studio');

  // Queries & Mutations
  const { data: films = [], isLoading: isLoadingFilms } = useFilmsForSelector();
  const postClipMutation = usePostOfficialClip();

  // Real-time YouTube validation
  const extractedVideoId = useMemo(() => {
    return extractYouTubeId(youtubeInput);
  }, [youtubeInput]);

  const isValidYoutubeId = extractedVideoId.length === 11;
  const previewThumbnailUrl = isValidYoutubeId ? getYouTubeThumbnailUrl(extractedVideoId) : null;

  // Filtered films for searchable picker
  const filteredFilms = useMemo(() => {
    if (!filmSearchQuery.trim()) return films.slice(0, 8);
    const q = filmSearchQuery.toLowerCase();
    return films.filter((f) => f.title.toLowerCase().includes(q)).slice(0, 10);
  }, [films, filmSearchQuery]);

  const selectedFilm = useMemo(() => {
    return films.find((f) => f.id === selectedFilmId);
  }, [films, selectedFilmId]);

  const handleSelectFilm = (filmId: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    setSelectedFilmId(filmId);
  };

  const handleSubmit = async () => {
    if (!selectedFilmId) {
      Alert.alert('Select Film', 'Please select an associated Philippine film for this clip.');
      return;
    }

    if (!isValidYoutubeId) {
      Alert.alert(
        'Invalid YouTube Link',
        'Please enter a valid YouTube video URL or 11-character video ID.'
      );
      return;
    }

    const trimmedTitle = clipTitle.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing Title', 'Please enter a title or caption for the trailer/clip.');
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await postClipMutation.mutateAsync({
        film_id: selectedFilmId,
        youtube_url: youtubeInput,
        title: trimmedTitle,
        type: clipType,
        posted_by_type: postedByType,
        posted_by_id: user?.id || 'admin',
      });

      try {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      Alert.alert(
        'Official Clip Published',
        `"${trimmedTitle}" has been added to the Takilya feed and film catalog with official verification.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (err: any) {
      try {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      Alert.alert('Posting Error', err?.message || 'Failed to post official clip.');
    }
  };

  // Guard: Verified Official or Admin only
  if (!isVerifiedOfficial && !isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: tokens.background.primary }]}>
        <GlassHeader
          title="Official Clip Posting"
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
          <ShieldCheck size={48} color={tokens.text.secondary} />
          <Text style={[styles.deniedTitle, { color: tokens.text.primary }]}>
            Verified Official Accounts Only
          </Text>
          <Text style={[styles.deniedDesc, { color: tokens.text.secondary }]}>
            Only verified studios, film festivals, filmmakers, or administrators can post official clips
            and trailers to maintain verified catalog integrity.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Request official verification"
            onPress={() => router.replace('/verification/request' as any)}
            style={[styles.verifyNowBtn, { backgroundColor: '#FFFFFF' }]}>
            <Text style={styles.verifyNowBtnText}>Request Verification</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: tokens.background.primary }]}>
      <GlassHeader
        title="Post Official Clip"
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
          { paddingTop: insets.top + 54, paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Verification banner */}
        <View
          style={[
            styles.bannerRow,
            {
              backgroundColor: tokens.background.secondary,
              borderColor: tokens.border.hairline,
            },
          ]}>
          <ShieldCheck size={20} color={tokens.text.primary} />
          <Text style={[styles.bannerText, { color: tokens.text.secondary }]}>
            Posting as verified account: @{profile?.username || 'official'}{' '}
            {isAdmin ? '(Admin)' : '(Verified Official)'}
          </Text>
        </View>

        {/* 1. Associated Film Picker */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: tokens.background.secondary,
              borderColor: tokens.border.hairline,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: tokens.text.primary }]}>
            1. Associated Film
          </Text>
          <Text style={[styles.sectionSubtitle, { color: tokens.text.secondary }]}>
            Choose the Philippine film featured in this clip or trailer.
          </Text>

          {selectedFilm ? (
            <View
              style={[
                styles.selectedFilmCard,
                {
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderColor: tokens.border.hairline,
                },
              ]}>
              <View style={styles.selectedFilmInfo}>
                <Film size={18} color={tokens.text.primary} />
                <View>
                  <Text style={[styles.selectedFilmTitle, { color: tokens.text.primary }]}>
                    {selectedFilm.title}
                  </Text>
                  <Text style={[styles.selectedFilmYear, { color: tokens.text.secondary }]}>
                    Released in {selectedFilm.year}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change selected film"
                onPress={() => setSelectedFilmId('')}
                style={styles.changeFilmBtn}>
                <Text style={[styles.changeFilmText, { color: tokens.text.primary }]}>Change</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.filmPickerWrapper}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: tokens.text.primary,
                    borderColor: tokens.border.hairline,
                    backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
                  },
                ]}
                placeholder="Search film by title..."
                placeholderTextColor={tokens.text.tertiary}
                value={filmSearchQuery}
                onChangeText={setFilmSearchQuery}
              />

              {isLoadingFilms ? (
                <ActivityIndicator size="small" color={tokens.text.primary} style={{ marginVertical: 12 }} />
              ) : (
                <View style={styles.filmsList}>
                  {filteredFilms.map((film) => (
                    <Pressable
                      key={film.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select film ${film.title}`}
                      onPress={() => handleSelectFilm(film.id)}
                      style={[
                        styles.filmOptionRow,
                        { borderColor: tokens.border.hairline },
                      ]}>
                      <Film size={16} color={tokens.text.secondary} />
                      <Text style={[styles.filmOptionTitle, { color: tokens.text.primary }]} numberOfLines={1}>
                        {film.title}
                      </Text>
                      <Text style={[styles.filmOptionYear, { color: tokens.text.tertiary }]}>
                        ({film.year})
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* 2. YouTube Video URL & Live Preview */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: tokens.background.secondary,
              borderColor: tokens.border.hairline,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: tokens.text.primary }]}>
            2. YouTube Video Link
          </Text>
          <Text style={[styles.sectionSubtitle, { color: tokens.text.secondary }]}>
            AGENTS.md rule: YouTube embeds only. Never upload raw video files.
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                color: tokens.text.primary,
                borderColor: isValidYoutubeId ? tokens.text.primary : tokens.border.hairline,
                backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
              },
            ]}
            placeholder="e.g. https://youtu.be/... or 11-char ID"
            placeholderTextColor={tokens.text.tertiary}
            value={youtubeInput}
            onChangeText={setYoutubeInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {youtubeInput.trim().length > 0 && (
            <View style={styles.validationRow}>
              {isValidYoutubeId ? (
                <View style={styles.validStatus}>
                  <CheckCircle2 size={16} color={tokens.text.primary} />
                  <Text style={[styles.validText, { color: tokens.text.primary }]}>
                    Valid YouTube ID: {extractedVideoId}
                  </Text>
                </View>
              ) : (
                <View style={styles.invalidStatus}>
                  <AlertCircle size={16} color={tokens.text.secondary} />
                  <Text style={[styles.invalidText, { color: tokens.text.secondary }]}>
                    Invalid YouTube link. Must resolve to an 11-character video ID.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* YouTube Thumbnail Preview */}
          {isValidYoutubeId && previewThumbnailUrl && (
            <View
              style={[
                styles.thumbnailPreviewContainer,
                { borderColor: tokens.border.hairline },
              ]}>
              <Image
                source={{ uri: previewThumbnailUrl }}
                style={styles.thumbnailPreviewImage}
                contentFit="cover"
              />
              <View style={styles.thumbnailOverlay}>
                <Video size={20} color="#FFFFFF" />
                <Text style={styles.thumbnailOverlayText}>Embed Preview Ready</Text>
              </View>
            </View>
          )}
        </View>

        {/* 3. Clip Type Selector */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: tokens.background.secondary,
              borderColor: tokens.border.hairline,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: tokens.text.primary }]}>
            3. Clip Category
          </Text>

          <View style={styles.clipTypeRow}>
            {(
              [
                { type: 'official', label: 'Official Trailer' },
                { type: 'teaser', label: 'Teaser' },
                { type: 'clip', label: 'Official Clip' },
                { type: 'bts', label: 'Behind the Scenes' },
              ] as const
            ).map((choice) => {
              const isActive = clipType === choice.type;
              return (
                <Pressable
                  key={choice.type}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={choice.label}
                  onPress={() => {
                    try {
                      void Haptics.selectionAsync();
                    } catch {}
                    setClipType(choice.type);
                  }}
                  style={[
                    styles.typeChip,
                    isActive
                      ? styles.typeChipActive
                      : { borderColor: tokens.border.hairline },
                  ]}>
                  <Text
                    style={[
                      styles.typeChipText,
                      {
                        color: isActive ? '#000000' : tokens.text.secondary,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}>
                    {choice.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. Entity Type & Title */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: tokens.background.secondary,
              borderColor: tokens.border.hairline,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: tokens.text.primary }]}>
            4. Clip Details & Caption
          </Text>

          <Text style={[styles.fieldLabel, { color: tokens.text.secondary }]}>
            POSTED ON BEHALF OF
          </Text>
          <View style={styles.entityRow}>
            {(
              [
                { type: 'studio', label: 'Studio' },
                { type: 'festival', label: 'Festival' },
                { type: 'person', label: 'Filmmaker/Cast' },
                ...(isAdmin ? [{ type: 'admin', label: 'Admin Curation' }] : []),
              ] as const
            ).map((entity) => {
              const isSelected = postedByType === entity.type;
              return (
                <Pressable
                  key={entity.type}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => setPostedByType(entity.type as TrailerPostedByType)}
                  style={[
                    styles.entityChip,
                    isSelected
                      ? styles.entityChipActive
                      : { borderColor: tokens.border.hairline },
                  ]}>
                  <Text
                    style={[
                      styles.entityChipText,
                      { color: isSelected ? '#000000' : tokens.text.secondary },
                    ]}>
                    {entity.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { color: tokens.text.secondary, marginTop: 12 }]}>
            CLIP TITLE / CAPTION
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
            placeholder="e.g. Official Main Trailer, Sneak Peek, Exclusive Clip"
            placeholderTextColor={tokens.text.tertiary}
            value={clipTitle}
            onChangeText={setClipTitle}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Publish Official Clip"
          disabled={postClipMutation.isPending}
          onPress={handleSubmit}
          style={[
            styles.publishBtn,
            {
              backgroundColor: '#FFFFFF',
              opacity: postClipMutation.isPending ? 0.6 : 1,
            },
          ]}>
          {postClipMutation.isPending ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <>
              <UploadCloud size={20} color="#000000" />
              <Text style={styles.publishBtnText}>Publish Official Clip</Text>
            </>
          )}
        </Pressable>
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
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  bannerText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    flex: 1,
  },
  sectionCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 18,
    marginBottom: 4,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  filmPickerWrapper: {
    gap: spacing.xs,
  },
  filmsList: {
    gap: 6,
    marginTop: 6,
  },
  filmOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    minHeight: 44,
  },
  filmOptionTitle: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  filmOptionYear: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
  },
  selectedFilmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  selectedFilmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  selectedFilmTitle: {
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
  selectedFilmYear: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
  },
  changeFilmBtn: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  changeFilmText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  validationRow: {
    marginTop: 2,
  },
  validStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  invalidStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invalidText: {
    fontFamily: typography.bodySmall.fontFamily,
    fontSize: typography.bodySmall.fontSize,
  },
  thumbnailPreviewContainer: {
    width: '100%',
    height: 180,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: spacing.xs,
    position: 'relative',
  },
  thumbnailPreviewImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbnailOverlayText: {
    color: '#FFFFFF',
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  clipTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  typeChipText: {
    fontSize: 13,
  },
  fieldLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  entityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  entityChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  entityChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  publishBtn: {
    minHeight: 50,
    borderRadius: radius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  publishBtnText: {
    color: '#000000',
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
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
  verifyNowBtn: {
    minHeight: 44,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  verifyNowBtnText: {
    color: '#000000',
    fontFamily: typography.titleSmall.fontFamily,
    fontSize: typography.titleSmall.fontSize,
    fontWeight: '700',
  },
});

