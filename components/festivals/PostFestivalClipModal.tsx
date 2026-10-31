import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { X, Check, Video, Film, Sparkles } from 'lucide-react-native';
import { usePostFestivalClip } from '@/features/festivals/useFestivals';
import { extractYouTubeId, getYouTubeThumbnailUrl } from '@/lib/youtube';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/lib/theme';

interface PostFestivalClipModalProps {
  visible: boolean;
  festivalId: string;
  festivalName: string;
  onClose: () => void;
  defaultFilmId?: string;
}

export function PostFestivalClipModal({
  visible,
  festivalId,
  festivalName,
  onClose,
  defaultFilmId = 'cccccccc-0006-0000-0000-000000000000',
}: PostFestivalClipModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [filmId, setFilmId] = useState(defaultFilmId);
  const [clipType, setClipType] = useState<'official' | 'clip' | 'teaser'>('official');

  const postMutation = usePostFestivalClip();

  const extractedId = extractYouTubeId(youtubeUrl);
  const isValidYouTubeId = extractedId.length === 11;
  const previewThumbnail = isValidYouTubeId
    ? getYouTubeThumbnailUrl(extractedId, 'hqdefault')
    : null;

  const handleSubmit = async () => {
    if (!isValidYouTubeId) {
      Alert.alert(
        'Invalid YouTube URL',
        'Please enter a valid YouTube video link or 11-character video ID.'
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the official clip.');
      return;
    }

    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await postMutation.mutateAsync({
        festivalId,
        payload: {
          film_id: filmId,
          youtube_url_or_id: extractedId,
          title: title.trim(),
          type: clipType,
        },
      });

      Alert.alert(
        'Clip Published',
        `The official clip for "${title}" has been published by ${festivalName}. It is now discoverable in the vertical feed and festival archives.`
      );

      setYoutubeUrl('');
      setTitle('');
      onClose();
    } catch (err: any) {
      console.warn('Post clip error:', err);
      Alert.alert('Publish Error', err?.message || 'Failed to publish official clip.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.sheetContent}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={onClose}
              style={styles.closeBtn}>
              <X size={20} color="#8A8A8A" />
            </Pressable>

            <Text style={styles.headerTitle}>Post Official Clip</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Submit clip"
              onPress={handleSubmit}
              disabled={postMutation.isPending}
              style={styles.saveBtn}>
              {postMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Check size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          {/* Verified Official Notice */}
          <View style={styles.noticeBanner}>
            <Sparkles size={14} color="#FFFFFF" />
            <Text style={styles.noticeText}>
              Posting as verified official account: <Text style={styles.boldText}>{festivalName}</Text>
            </Text>
          </View>

          {/* YouTube Link Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>YouTube Video Link or ID</Text>
            <TextInput
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              placeholder="e.g. https://youtu.be/7lMwbA9bUVo or 7lMwbA9bUVo"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Live Video Preview if valid ID */}
          {previewThumbnail && (
            <View style={styles.previewBox}>
              <Image
                source={{ uri: previewThumbnail }}
                contentFit="cover"
                style={styles.previewImage}
              />
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>Ready to embed: {extractedId}</Text>
              </View>
            </View>
          )}

          {/* Title Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Clip Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Official Festival Selection Trailer"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              maxLength={120}
            />
          </View>

          {/* Clip Type Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Clip Type</Text>
            <View style={styles.typeSelectorRow}>
              {(['official', 'clip', 'teaser'] as const).map((type) => {
                const isSelected = clipType === type;
                return (
                  <Pressable
                    key={type}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`Type ${type}`}
                    onPress={() => setClipType(type)}
                    style={[
                      styles.typeChip,
                      isSelected ? styles.typeChipSelected : styles.typeChipUnselected,
                    ]}>
                    <Text
                      style={[
                        styles.typeChipText,
                        isSelected && styles.typeChipTextSelected,
                      ]}>
                      {type.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Submit CTA */}
          <Button
            label={postMutation.isPending ? 'Publishing...' : 'Publish Official Clip'}
            variant="primary"
            onPress={handleSubmit}
            disabled={postMutation.isPending}
            icon={<Video size={16} color="#000000" />}
            style={styles.submitBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContent: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: radius.cardLarge,
    borderTopRightRadius: radius.cardLarge,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#2E2E2E',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    fontSize: 12,
    color: '#D4D4D4',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4D4D4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  previewBox: {
    height: 120,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: '#141414',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
  },
  typeChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  typeChipUnselected: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  typeChipTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

