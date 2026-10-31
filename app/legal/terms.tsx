import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldCheck, Film, AlertTriangle, Video, Award } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography, spacing } from '@/lib/theme';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={styles.backBtn}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Terms & Community Rules</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}>
        {/* Intro Banner */}
        <View style={styles.banner}>
          <ShieldCheck size={28} color="#FFFFFF" />
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>The Takilya Standard</Text>
            <Text style={styles.bannerSub}>
              Takilya is an organic, community-driven platform created to celebrate, archive, and discuss Philippine cinema.
            </Text>
          </View>
        </View>

        {/* Section 1: Philippine Cinema Focus */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Film size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>1. Philippine Films Exclusively</Text>
          </View>
          <Text style={styles.sectionBody}>
            Takilya indexes and celebrates Philippine cinema exclusively—including mainstream studio releases, independent productions, regional indigenous films, and restored heritage classics. Non-Philippine releases and episodic television series are strictly out of scope.
          </Text>
        </View>

        {/* Section 2: Strict Anti-Piracy Policy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Video size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>2. Anti-Piracy & YouTube Embeds</Text>
          </View>
          <Text style={styles.sectionBody}>
            Takilya never hosts or stores raw video files. All video playback utilizes official YouTube embeds from verified studios, festivals, and channels. Posting links to camrips, torrents, unauthorized cloud drives, or illegal streams is strictly prohibited and results in immediate account suspension.
          </Text>
        </View>

        {/* Section 3: Spoiler Mask Requirement */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>3. Respectful Discussion & Spoilers</Text>
          </View>
          <Text style={styles.sectionBody}>
            Film is meant to be experienced fresh. If your review or comment contains critical narrative reveals, twists, or endings, you must toggle the "Contains Spoilers" checkbox. Community members may report untagged spoilers, which will be masked or removed by moderators.
          </Text>
        </View>

        {/* Section 4: Verified Accounts & Integrity */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>4. Verified Accounts & Integrity</Text>
          </View>
          <Text style={styles.sectionBody}>
            Studios, festivals, and filmmakers may apply for official verified accounts with FDCP certification or corporate credentials. Official clips posted by verified entities must represent legitimate creative work. Dual scores (audience and critic) are maintained with strict algorithmic separation to preserve rating integrity.
          </Text>
        </View>

        {/* Section 5: Promoted Content Disclosures */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>5. Promoted Content Disclosures</Text>
          </View>
          <Text style={styles.sectionBody}>
            Promoted trailer slots are strictly capped at a 1-in-10 feed ratio and never appear at the initial feed position. Sponsored items are always clearly marked with an outlined "Promoted" tag and sponsor name. Promoted status never impacts user ratings, critic scores, or search rankings.
          </Text>
        </View>

        {/* Footer timestamp */}
        <Text style={styles.effectiveDate}>
          Effective: October 2026 • Takilya Community Safety Team
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.title,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: radius.card,
    padding: 16,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSub: {
    ...typography.caption,
    fontSize: 12,
    color: '#D4D4D4',
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.card,
    padding: 18,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionBody: {
    ...typography.body,
    fontSize: 13,
    color: '#8A8A8A',
    lineHeight: 20,
  },
  effectiveDate: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: 12,
  },
});

