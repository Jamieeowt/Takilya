import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Play, X, Eye } from 'lucide-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { FestivalClip } from '@/features/festivals/types';
import { getYouTubeThumbnailUrl, extractYouTubeId } from '@/lib/youtube';
import { radius, spacing, typography } from '@/lib/theme';

interface FestivalClipsRailProps {
  clips: FestivalClip[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CLIP_CARD_WIDTH = Math.floor(SCREEN_WIDTH * 0.65);
const CLIP_CARD_HEIGHT = Math.floor(CLIP_CARD_WIDTH * (9 / 16));

export function FestivalClipsRail({ clips }: FestivalClipsRailProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  if (!clips || clips.length === 0) {
    return null;
  }

  const handleOpenVideo = (clip: FestivalClip) => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    const cleanId = extractYouTubeId(clip.youtube_id);
    if (cleanId) {
      setActiveVideoId(cleanId);
    }
  };

  const handleCloseModal = () => {
    setActiveVideoId(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>OFFICIAL FESTIVAL CLIPS & TRAILERS</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {clips.map((clip) => {
          const thumbUrl = getYouTubeThumbnailUrl(clip.youtube_id, 'hqdefault');

          return (
            <Pressable
              key={clip.id}
              accessibilityRole="button"
              accessibilityLabel={`Watch clip: ${clip.title}`}
              onPress={() => handleOpenVideo(clip)}
              style={({ pressed }) => [
                styles.clipCard,
                pressed && styles.clipCardPressed,
              ]}>
              {/* Thumbnail Container */}
              <View
                style={[
                  styles.thumbWrapper,
                  { width: CLIP_CARD_WIDTH, height: CLIP_CARD_HEIGHT },
                ]}>
                <Image
                  source={{ uri: thumbUrl }}
                  contentFit="cover"
                  transition={200}
                  style={styles.thumbImage}
                />
                <View style={styles.playButtonOverlay}>
                  <View style={styles.playCircle}>
                    <Play size={16} color="#000000" fill="#000000" />
                  </View>
                </View>

                {clip.type && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {clip.type.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Title & Engagement */}
              <Text style={styles.clipTitle} numberOfLines={2}>
                {clip.title}
              </Text>

              {clip.view_count !== undefined && (
                <View style={styles.metaRow}>
                  <Eye size={12} color="#8A8A8A" />
                  <Text style={styles.metaText}>
                    {clip.view_count.toLocaleString()} views
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Video Playback Modal */}
      <Modal
        visible={Boolean(activeVideoId)}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close video player"
            onPress={handleCloseModal}
            style={styles.modalBackdrop}
          />

          <View style={styles.playerContainer}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerHeaderTitle}>Official Festival Clip</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={handleCloseModal}
                style={styles.closeBtn}>
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {activeVideoId && (
              <YoutubePlayer
                height={Math.round(SCREEN_WIDTH * (9 / 16))}
                play={true}
                videoId={activeVideoId}
                webViewStyle={{ opacity: 0.99 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  scrollList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  clipCard: {
    width: CLIP_CARD_WIDTH,
  },
  clipCardPressed: {
    opacity: 0.85,
  },
  thumbWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  clipTitle: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 6,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  playerHeaderTitle: {
    ...typography.title,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

