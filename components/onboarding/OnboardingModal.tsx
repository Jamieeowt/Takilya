import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Film,
  Sparkles,
  Star,
  MessageSquare,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography, spacing } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_STORAGE_KEY = '@takilya_has_completed_onboarding';

interface OnboardingSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  primaryIcon: React.ReactNode;
  secondaryIcon: React.ReactNode;
  highlights: string[];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'discover',
    badge: 'VERTICAL CINEMA FEED',
    title: 'Discover Philippine Cinema',
    description:
      'Immerse yourself in full-screen trailers and official clips. Indie, regional, and mainstream Filipino films get equal organic visibility.',
    primaryIcon: <Film size={48} color="#FFFFFF" />,
    secondaryIcon: <Sparkles size={24} color="#D4D4D4" />,
    highlights: [
      'Edge-to-edge vertical video trailers',
      'Regional dialects & indie showcases',
      'No algorithmic bias or pay-to-win',
    ],
  },
  {
    id: 'rate_discuss',
    badge: 'DUAL SCORES & SPOILER SAFE',
    title: 'Rate & Discuss Deeply',
    description:
      'View distinct audience and accredited critic scores side-by-side. Read and share reviews protected by tap-to-reveal spoiler masks.',
    primaryIcon: <Star size={48} color="#FFFFFF" />,
    secondaryIcon: <ShieldCheck size={24} color="#D4D4D4" />,
    highlights: [
      'Split audience & verified critic ratings',
      'Built-in spoiler blur on sensitive reviews',
      'Dedicated per-film discussion threads',
    ],
  },
  {
    id: 'follow_support',
    badge: 'DIRECT ECOSYSTEM',
    title: 'Follow & Support Creators',
    description:
      'Directly follow Cinemalaya, QCinema, independent production studios, and National Artists. Discover verified official media all in one place.',
    primaryIcon: <Award size={48} color="#FFFFFF" />,
    secondaryIcon: <Users size={24} color="#D4D4D4" />,
    highlights: [
      'Verified festival & studio profiles',
      'Film heritage & restored classic archives',
      'Legitimate Where-to-Watch directories',
    ],
  },
];

interface OnboardingModalProps {
  forceVisible?: boolean;
  onDismiss?: () => void;
}

export function OnboardingModal({ forceVisible, onDismiss }: OnboardingModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    async function checkStatus() {
      if (forceVisible) {
        setIsVisible(true);
        return;
      }
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!completed) {
          setIsVisible(true);
        }
      } catch {
        // If storage check fails, don't block user
      }
    }
    void checkStatus();
  }, [forceVisible]);

  const handleFinish = async () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {}
    setIsVisible(false);
    onDismiss?.();
  };

  const handleNext = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      void handleFinish();
    }
  };

  const onViewableItemsChanged = useRef(
    (info: { viewableItems: Array<{ index?: number | null }> }) => {
      if (
        info.viewableItems.length > 0 &&
        info.viewableItems[0].index !== null &&
        info.viewableItems[0].index !== undefined
      ) {
        setActiveIndex(info.viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Text style={styles.brandTitle}>TAKILYA</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding and enter app"
            onPress={handleFinish}
            style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Carousel Content */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          style={styles.carouselList}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              {/* Visual Icon Illustration */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircleOuter}>
                  <View style={styles.iconCircleInner}>
                    {item.primaryIcon}
                  </View>
                </View>
                <View style={styles.badgeSecondary}>
                  {item.secondaryIcon}
                </View>
              </View>

              {/* Text Info */}
              <View style={styles.contentWrap}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>

                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideDescription}>{item.description}</Text>

                {/* Highlights List */}
                <View style={styles.highlightsContainer}>
                  {item.highlights.map((point: string) => (
                    <View key={point} style={styles.highlightRow}>
                      <CheckCircle2 size={16} color="#FFFFFF" />
                      <Text style={styles.highlightText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        />

        {/* Bottom Navigation & Indicator */}
        <View style={styles.bottomBar}>
          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isActive && styles.dotActive,
                  ]}
                />
              );
            })}
          </View>

          {/* Action Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              activeIndex === SLIDES.length - 1
                ? 'Get Started with Takilya'
                : 'Next onboarding slide'
            }
            onPress={handleNext}
            style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={18} color="#000000" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: Platform.OS === 'ios' ? 42 : 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 48,
  },
  brandTitle: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  skipButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  skipText: {
    ...typography.body,
    fontSize: 14,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  carouselList: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOuter: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSecondary: {
    position: 'absolute',
    bottom: 2,
    right: -2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    alignItems: 'center',
    width: '100%',
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 14,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#D4D4D4',
    letterSpacing: 1,
  },
  slideTitle: {
    ...typography.title,
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  slideDescription: {
    ...typography.body,
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  highlightsContainer: {
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.card,
    padding: 16,
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightText: {
    ...typography.body,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
    gap: 20,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E2E2E',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
});

