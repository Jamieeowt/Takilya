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
import { Play, X, Eye, Film } from 'lucide-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeThumbnailUrl, extractYouTubeId } from '@/lib/youtube';
import { radius, spacing, typography } from '@/lib/theme';

export interface ClipItem {
  id: string;
  youtube_id: string;
  title: string;
  type: string;
  view_count?: number;
  film_id?: string;
  film_title?: string;
}

interface OfficialClipsRailProps {
  title?: string;
  clips: ClipItem[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CLIP_CARD_WIDTH = Math.floor(SCREEN_WIDTH * 0.65);
const CLIP_CARD_HEIGHT = Math.floor(CLIP_CARD_WIDTH * (9 / 16));

export function OfficialClipsRail({
  title = 'OFFICIAL CLIPS & TRAILERS',
  clips,
}: OfficialClipsRailProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  if (!clips || clips.length === 0) {
    return null;
  }

  const handleOpenVideo = (clip: ClipItem) => {
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
      <Text style={styles.sectionTitle}>{title}</Text>

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

              {/* Title & Film Reference */}
              <Text style={styles.clipTitle} numberOfLines={2}>
                {clip.title}
              </Text>

              {clip.film_title && (
                <View style={styles.filmRow}>
                  <Film size={11} color="#8A8A8A" />
                  <Text style={styles.filmText} numberOfLines={1}>
                    {clip.film_title}
                  </Text>
                </View>
              )}

              {/* View Count */}
              {clip.view_count !== undefined && (
                <View style={styles.viewsRow}>
                  <Eye size={12} color="#8A8A8A" />
                  <Text style={styles.viewsText}>
                    {clip.view_count.toLocaleString()} views
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Video Modal Player */}
      <Modal
        visible={Boolean(activeVideoId)}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close clip modal"
            onPress={handleCloseModal}
            style={styles.modalCloseArea}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close player"
                onPress={handleCloseModal}
                style={styles.closeBtn}>
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {activeVideoId && (
              <View style={styles.playerContainer}>
                <YoutubePlayer
                  height={Math.floor((SCREEN_WIDTH - 32) * (9 / 16))}
                  width={SCREEN_WIDTH - 32}
                  play
                  videoId={activeVideoId}
                  webViewStyle={styles.webView}
                  initialPlayerParams={{
                    preventFullScreen: false,
                    controls: true,
                    modestbranding: true,
                  }}
                />
              </View>
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
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#8A8A8A',
    letterSpacing: 1.2,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  scrollList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  clipCard: {
    width: CLIP_CARD_WIDTH,
  },
  clipCardPressed: {
    opacity: 0.8,
  },
  thumbWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
    marginBottom: spacing.xs,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  typeBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  clipTitle: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  filmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  filmText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  viewsText: {
    ...typography.caption,
    fontSize: 10,
    color: '#8A8A8A',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - 32,
    backgroundColor: '#0A0A0A',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  webView: {
    opacity: 0.99,
  },
});

