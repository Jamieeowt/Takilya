import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Play, X, Video, Volume2, VolumeX, Flag, AlertCircle } from 'lucide-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as Haptics from 'expo-haptics';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FilmTrailerItem } from '@/features/films/types';
import { extractYouTubeId } from '@/lib/youtube';
import { ReportModal } from '@/components/moderation';
import { radius, typography, spacing } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FilmMediaSectionProps {
  trailers: FilmTrailerItem[];
}

export function FilmMediaSection({ trailers }: FilmMediaSectionProps) {
  const [activeVideo, setActiveVideo] = useState<FilmTrailerItem | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [hasPlayerError, setHasPlayerError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const cleanVideoId = React.useMemo(
    () => extractYouTubeId(activeVideo?.youtube_id || (activeVideo as any)?.youtube_video_id),
    [activeVideo?.youtube_id, (activeVideo as any)?.youtube_video_id]
  );

  React.useEffect(() => {
    setHasPlayerError(false);
    setIsReady(false);
  }, [activeVideo?.id, cleanVideoId]);

  if (!trailers || trailers.length === 0) return null;

  const handleOpenVideo = (item: FilmTrailerItem) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsMuted(true);
    setActiveVideo(item);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Trailers & Clips</Text>
        <View style={styles.verifiedCountRow}>
          <VerifiedBadge size={14} />
          <Text style={styles.verifiedCountText}>Official Media</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}>
        {trailers.map((item) => {
          const thumbUrl = `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`;
          const durationStr = formatDuration(item.duration_seconds);

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Play ${item.type}: ${item.title}`}
              onPress={() => handleOpenVideo(item)}
              style={styles.videoCard}>
              {/* Thumbnail with overlay */}
              <View style={styles.thumbnailWrapper}>
                <Image
                  source={{ uri: thumbUrl }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                  transition={200}
                />

                {/* Dark scrim */}
                <View style={styles.thumbScrim} />

                {/* Play Button Overlay */}
                <View style={styles.playButtonCircle}>
                  <Play size={18} color="#000000" fill="#000000" />
                </View>

                {/* Top Type Pill */}
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>

                {/* Duration */}
                {durationStr && (
                  <View style={styles.durationPill}>
                    <Text style={styles.durationText}>{durationStr}</Text>
                  </View>
                )}
              </View>

              {/* Title & Metadata */}
              <View style={styles.cardInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.verifiedRow}>
                  <VerifiedBadge size={12} />
                  <Text style={styles.verifiedText}>Official</Text>
                  {item.view_count > 0 && (
                    <>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.viewCountText}>
                        {item.view_count.toLocaleString()} views
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Video Modal Player (strict YouTube embed) */}
      <Modal
        visible={Boolean(activeVideo)}
        animationType="fade"
        transparent
        onRequestClose={handleCloseVideo}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleCol}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {activeVideo?.title}
                </Text>
                <View style={styles.modalBadgeRow}>
                  <VerifiedBadge size={12} />
                  <Text style={styles.modalSubtext}>Verified Official Clip</Text>
                </View>
              </View>

              <View style={styles.modalHeaderActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Report trailer"
                  accessibilityHint="Flags this trailer for moderation review"
                  onPress={() => {
                    try {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setIsReporting(true);
                  }}
                  style={styles.modalReportBtn}>
                  <Flag size={16} color="#8A8A8A" />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close trailer player"
                  onPress={handleCloseVideo}
                  hitSlop={8}
                  style={styles.closeBtn}>
                  <X size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            {/* Video Player */}
            {activeVideo && (
              <View style={styles.playerWrapper}>
                {hasPlayerError || !cleanVideoId ? (
                  <View style={styles.errorCard}>
                    <AlertCircle size={32} color="#FFFFFF" />
                    <Text style={styles.errorTitle}>Video unavailable</Text>
                    <Text style={styles.errorSub}>The official trailer could not be loaded.</Text>
                    <View style={styles.errorActionRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Retry loading video"
                        onPress={() => {
                          setHasPlayerError(false);
                          setIsReady(false);
                        }}
                        style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </Pressable>
                      {cleanVideoId ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Open trailer on YouTube"
                          onPress={() => void Linking.openURL(`https://www.youtube.com/watch?v=${cleanVideoId}`)}
                          style={styles.openYouTubeBtn}>
                          <Text style={styles.openYouTubeText}>YouTube</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ) : (
                  <YoutubePlayer
                    height={(SCREEN_WIDTH - 32) * (9 / 16)}
                    width={SCREEN_WIDTH - 32}
                    videoId={cleanVideoId}
                    play={true}
                    mute={isMuted}
                    webViewStyle={{ backgroundColor: '#000000', opacity: 0.99 }}
                    initialPlayerParams={{
                      preventFullScreen: true,
                      controls: true,
                      modestbranding: true,
                      rel: false,
                      autoplay: true,
                      iv_load_policy: 3,
                    }}
                    webViewProps={{
                      androidLayerType: 'hardware',
                      mediaPlaybackRequiresUserAction: false,
                      allowsInlineMediaPlayback: true,
                      source: {
                        baseUrl: 'https://takilya.app',
                      },
                    }}
                    onReady={() => {
                      setIsReady(true);
                      setHasPlayerError(false);
                    }}
                    onError={(error: string) => {
                      console.warn(`[YouTube Player Error for ${cleanVideoId}]:`, error);
                      // Only set error if it is an actual unrecoverable embed code (100, 101, 150)
                      if (
                        error === '100' ||
                        error === '101' ||
                        error === '150' ||
                        error === 'video_not_found' ||
                        error === 'embed_not_allowed'
                      ) {
                        setHasPlayerError(true);
                      }
                    }}
                  />
                )}
              </View>
            )}

            {/* Bottom Controls / Mute Toggle */}
            <View style={styles.modalFooter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                onPress={() => setIsMuted(!isMuted)}
                style={styles.muteToggleBtn}>
                {isMuted ? (
                  <>
                    <VolumeX size={16} color="#FFFFFF" />
                    <Text style={styles.muteBtnText}>Tap to Unmute</Text>
                  </>
                ) : (
                  <>
                    <Volume2 size={16} color="#FFFFFF" />
                    <Text style={styles.muteBtnText}>Audio On</Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.ytDisclaimer}>YouTube Official Embed</Text>
            </View>
          </View>

          {/* Moderation Report Modal */}
          <ReportModal
            visible={isReporting}
            targetType="trailer"
            targetId={activeVideo?.id || ''}
            targetTitle={activeVideo?.title}
            onClose={() => setIsReporting(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  verifiedCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedCountText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 12,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  videoCard: {
    width: 220,
    gap: 8,
  },
  thumbnailWrapper: {
    width: 220,
    height: 124, // 16:9 aspect ratio
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButtonCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  typeBadgeText: {
    ...typography.mono,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  durationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  durationText: {
    ...typography.mono,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardInfo: {
    gap: 4,
  },
  videoTitle: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  dot: {
    color: '#2E2E2E',
    fontSize: 10,
  },
  viewCountText: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderRadius: radius.cardLarge,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: 16,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleCol: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  modalTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalSubtext: {
    ...typography.caption,
    color: '#8A8A8A',
    fontSize: 11,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalReportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerWrapper: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  muteToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  muteBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  ytDisclaimer: {
    ...typography.mono,
    color: '#8A8A8A',
    fontSize: 10,
  },
  errorCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: radius.md,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
  },
  errorTitle: {
    ...typography.title,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 4,
  },
  errorSub: {
    ...typography.caption,
    color: '#8A8A8A',
    textAlign: 'center',
    fontSize: 12,
  },
  errorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    minHeight: 40,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 12,
  },
  openYouTubeBtn: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openYouTubeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

