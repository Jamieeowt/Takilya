import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { TakilyaLogo } from '@/components/brand/TakilyaLogo';
import { haptics } from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 3 decorative tilted columns of cards
const COLUMN_CARDS = [
  // Col 1
  [
    { id: '1-1', type: 'dark', hasPlay: false },
    { id: '1-2', type: 'light', hasPlay: true },
    { id: '1-3', type: 'darker', hasPlay: false },
    { id: '1-4', type: 'gray', hasPlay: false },
  ],
  // Col 2
  [
    { id: '2-1', type: 'light', hasPlay: false },
    { id: '2-2', type: 'darker', hasPlay: true },
    { id: '2-3', type: 'dark', hasPlay: false },
    { id: '2-4', type: 'light', hasPlay: false },
  ],
  // Col 3
  [
    { id: '3-1', type: 'darker', hasPlay: false },
    { id: '3-2', type: 'gray', hasPlay: false },
    { id: '3-3', type: 'light', hasPlay: true },
    { id: '3-4', type: 'dark', hasPlay: false },
  ],
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCreateAccount = () => {
    haptics.light();
    router.push('/(auth)/signup' as any);
  };

  const handleSignIn = () => {
    haptics.light();
    router.push('/(auth)/login' as any);
  };

  const handleOpenTerms = () => {
    haptics.selection();
    router.push('/legal/terms' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Tilted Poster Grid Backdrop */}
      <View style={styles.backdropContainer} pointerEvents="none" aria-hidden={true}>
        <View style={styles.tiltedGrid}>
          {COLUMN_CARDS.map((col, colIdx) => (
            <View
              key={`col-${colIdx}`}
              style={[
                styles.column,
                colIdx === 1 && styles.colOffsetMiddle,
                colIdx === 2 && styles.colOffsetRight,
              ]}>
              {col.map((card) => (
                <View
                  key={card.id}
                  style={[
                    styles.card,
                    card.type === 'dark' && styles.cardDark,
                    card.type === 'light' && styles.cardLight,
                    card.type === 'darker' && styles.cardDarker,
                    card.type === 'gray' && styles.cardGray,
                  ]}>
                  {card.hasPlay && (
                    <View style={styles.playIconWrapper}>
                      <Svg width={36} height={36} viewBox="0 0 36 36">
                        <Circle
                          cx={18}
                          cy={18}
                          r={17}
                          fill="none"
                          stroke={card.type === 'light' ? '#000000' : '#FFFFFF'}
                          strokeWidth={1.5}
                        />
                        <Path
                          d="M15 12.5L24 18L15 23.5Z"
                          fill={card.type === 'light' ? '#000000' : '#FFFFFF'}
                        />
                      </Svg>
                    </View>
                  )}
                  {/* Bottom mock preview bars */}
                  <View
                    style={[
                      styles.mockBarShort,
                      card.type === 'light' || card.type === 'gray'
                        ? styles.mockBarDarkShort
                        : styles.mockBarLightShort,
                    ]}
                  />
                  <View
                    style={[
                      styles.mockBarLong,
                      card.type === 'light' || card.type === 'gray'
                        ? styles.mockBarDarkLong
                        : styles.mockBarLightLong,
                    ]}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Gradient Scrim Overlay */}
        <View style={styles.scrimOverlay}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="welcomeScrim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                <Stop offset="0.82" stopColor="#000000" stopOpacity="1" />
                <Stop offset="1" stopColor="#000000" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#welcomeScrim)" />
          </Svg>
        </View>
      </View>

      {/* Main Content */}
      <View
        style={[
          styles.contentContainer,
          {
            paddingBottom: Math.max(insets.bottom + 20, 36),
          },
        ]}>
        {/* 40x40 Cinema Ticket Mark */}
        <View style={styles.logoRow}>
          <TakilyaLogo size={40} color="#FFFFFF" />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Every Filipino film, one swipe away.</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Watch trailers, rate and discuss Philippine cinema. Create a free account to start watching.
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionsBlock}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create account"
            onPress={handleCreateAccount}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.primaryButtonText}>Create account</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.secondaryButtonText}>Sign in</Text>
          </Pressable>
        </View>

        {/* Legal Disclaimer */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Terms and Content Policy"
          hitSlop={8}
          onPress={handleOpenTerms}>
          <Text style={styles.disclaimerText}>
            By continuing you agree to the{' '}
            <Text style={styles.disclaimerLink}>Terms and Content Policy</Text>.
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
  },
  backdropContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 540,
    overflow: 'hidden',
  },
  tiltedGrid: {
    position: 'absolute',
    left: 12,
    top: -80,
    width: Math.max(SCREEN_WIDTH, 372),
    flexDirection: 'row',
    gap: 12,
    transform: [{ rotate: '-9deg' }],
  },
  column: {
    flexDirection: 'column',
    gap: 12,
  },
  colOffsetMiddle: {
    marginTop: -56,
  },
  colOffsetRight: {
    marginTop: 28,
  },
  card: {
    width: 112,
    height: 168,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  cardDark: {
    backgroundColor: '#262626',
  },
  cardLight: {
    backgroundColor: '#D6D6D6',
  },
  cardDarker: {
    backgroundColor: '#121212',
  },
  cardGray: {
    backgroundColor: '#8A8A8A',
  },
  playIconWrapper: {
    position: 'absolute',
    top: 56,
    left: 38,
  },
  mockBarShort: {
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: 6,
  },
  mockBarLong: {
    width: 68,
    height: 6,
    borderRadius: 3,
  },
  mockBarLightShort: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mockBarLightLong: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  mockBarDarkShort: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  mockBarDarkLong: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrimOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
  },
  contentContainer: {
    paddingHorizontal: 28,
    gap: 20,
    zIndex: 10,
  },
  logoRow: {
    alignSelf: 'flex-start',
  },
  headline: {
    fontFamily: Platform.select({
      ios: 'Inter-ExtraBold',
      android: 'Inter_800ExtraBold',
      default: 'System',
    }),
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.8,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: '#A3A3A3',
  },
  actionsBlock: {
    gap: 12,
    marginTop: 4,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter_700Bold',
      default: 'System',
    }),
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  secondaryButton: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#5C5C5C',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter_600SemiBold',
      default: 'System',
    }),
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disclaimerText: {
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter_400Regular',
      default: 'System',
    }),
    fontSize: 12,
    lineHeight: 18,
    color: '#8A8A8A',
    textAlign: 'center',
  },
  disclaimerLink: {
    color: '#D4D4D4',
    textDecorationLine: 'underline',
  },
});

