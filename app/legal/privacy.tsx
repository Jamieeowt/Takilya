import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Database, EyeOff, Trash2, Smartphone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { radius, typography, spacing } from '@/lib/theme';

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Lock size={28} color="#FFFFFF" />
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introBody}>
            Takilya is built for film lovers. We respect your digital privacy, enforce granular database security, and never sell or monetize your personal information.
          </Text>
        </View>

        {/* Section 1: Data We Collect */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Database size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>1. Data We Collect</Text>
          </View>
          <Text style={styles.sectionBody}>
            When you register, we store your email address, display name, handle, and avatar. When you use the app, we store your film ratings, diary logs, reviews, comments, and watchlists so your cinema journal stays synchronized across your devices.
          </Text>
        </View>

        {/* Section 2: Zero Sale of Data */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <EyeOff size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>2. Zero Data Selling</Text>
          </View>
          <Text style={styles.sectionBody}>
            We do not sell, rent, or lease your personal data or film viewing preferences to advertising networks, commercial brokers, or third parties. Our platform operates without third-party tracking scripts or behavior-profiling SDKs.
          </Text>
        </View>

        {/* Section 3: Row Level Security & Encryption */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>3. Row Level Security & Storage</Text>
          </View>
          <Text style={styles.sectionBody}>
            All database tables in Takilya enforce PostgreSQL Row Level Security (RLS) policies. Only you can modify your reviews, watchlists, and profile records. Authentication tokens are securely encrypted using your device keychain and SecureStore.
          </Text>
        </View>

        {/* Section 4: Device & Offline Storage */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Smartphone size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>4. Local Offline Caching</Text>
          </View>
          <Text style={styles.sectionBody}>
            For seamless offline playback and low-latency discovery, recent film catalogs and your watchlist entries are cached locally on your device using AsyncStorage. This cached data remains strictly on your device.
          </Text>
        </View>

        {/* Section 5: Deletion & Rights */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>5. Data Retention & Deletion</Text>
          </View>
          <Text style={styles.sectionBody}>
            You have the right to request full deletion of your Takilya account and all associated reviews, ratings, and diary records. Once confirmed, your records are permanently purged from our PostgreSQL database and offline device cache.
          </Text>
        </View>

        {/* Footer timestamp */}
        <Text style={styles.effectiveDate}>
          Effective: October 2026 • Takilya Security & Privacy Team
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
  introCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: radius.card,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  introTitle: {
    ...typography.title,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  introBody: {
    ...typography.body,
    fontSize: 13,
    color: '#D4D4D4',
    textAlign: 'center',
    lineHeight: 20,
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

