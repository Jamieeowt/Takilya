import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface TakilyaLogoProps {
  /** Size in pixels for the mark SVG (width and height). Defaults to 40. */
  size?: number;
  /** Fill color for the SVG ticket mark and wordmark text. Defaults to #FFFFFF. */
  color?: string;
  /** Whether to show the 'takilya' wordmark text. Defaults to false. */
  showWordmark?: boolean;
  /** Whether to show the 'Philippine cinema, one swipe at a time.' tagline. Defaults to false. */
  tagline?: boolean;
  /** Layout orientation when wordmark or tagline is shown. Defaults to 'vertical'. */
  layout?: 'vertical' | 'horizontal';
  /** Optional container style override. */
  style?: StyleProp<ViewStyle>;
}

const TICKET_PATH =
  'M44 14H76A10 10 0 0 1 86 24V53A7 7 0 0 0 86 67V96A10 10 0 0 1 76 106H44A10 10 0 0 1 34 96V67A7 7 0 0 0 34 53V24A10 10 0 0 1 44 14ZM52 50Q52 46 55.46 48.02L72.54 57.98Q76 60 72.54 62.02L55.46 71.98Q52 74 52 70Z';

export function TakilyaLogo({
  size = 40,
  color = '#FFFFFF',
  showWordmark = false,
  tagline = false,
  layout = 'vertical',
  style,
}: TakilyaLogoProps) {
  // Compute proportional typography sizes
  const wordmarkFontSize = Math.max(Math.round(size * 0.72), 22);
  const taglineFontSize = Math.max(Math.round(size * 0.22), 12);

  const isHorizontal = layout === 'horizontal';

  return (
    <View
      style={[
        styles.container,
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
        style,
      ]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Takilya logo: vertical cinema ticket with integrated play mark">
      <Svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill={color}
        accessibilityElementsHidden={true}
        importantForAccessibility="no">
        <Path d={TICKET_PATH} fill={color} fillRule="evenodd" />
      </Svg>

      {(showWordmark || tagline) && (
        <View
          style={[
            styles.textBlock,
            isHorizontal ? styles.horizontalTextBlock : styles.verticalTextBlock,
          ]}>
          {showWordmark && (
            <Text
              style={[
                styles.wordmark,
                {
                  fontSize: wordmarkFontSize,
                  color,
                  letterSpacing: -wordmarkFontSize * 0.045,
                },
              ]}>
              takilya
            </Text>
          )}
          {tagline && (
            <Text
              style={[
                styles.tagline,
                {
                  fontSize: taglineFontSize,
                },
              ]}>
              Philippine cinema, one swipe at a time.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  horizontalContainer: {
    flexDirection: 'row',
    gap: 14,
  },
  textBlock: {
    justifyContent: 'center',
  },
  verticalTextBlock: {
    alignItems: 'center',
    gap: 6,
  },
  horizontalTextBlock: {
    alignItems: 'flex-start',
    gap: 2,
  },
  wordmark: {
    fontFamily: Platform.select({
      ios: 'Inter-ExtraBold',
      android: 'Inter_800ExtraBold',
      default: 'System',
    }),
    fontWeight: '800',
    includeFontPadding: false,
  },
  tagline: {
    fontFamily: Platform.select({
      ios: 'Inter-Medium',
      android: 'Inter_500Medium',
      default: 'System',
    }),
    fontWeight: '500',
    color: '#A3A3A3',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
});

export default TakilyaLogo;

