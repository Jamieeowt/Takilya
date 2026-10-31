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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Check } from 'lucide-react-native';
import { UserProfile } from '@/features/account/types';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/lib/theme';

interface EditProfileSheetProps {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (payload: { display_name: string; bio: string; avatar_url?: string }) => void;
  isSaving?: boolean;
}

export function EditProfileSheet({
  visible,
  profile,
  onClose,
  onSave,
  isSaving = false,
}: EditProfileSheetProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio);

  const handleSave = () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onSave({
      display_name: displayName.trim() || profile.display_name,
      bio: bio.trim(),
      avatar_url: profile.avatar_url || undefined,
    });
    onClose();
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
          accessibilityLabel="Dismiss edit profile modal"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.sheetContent}>
          {/* Handle */}
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

            <Text style={styles.headerTitle}>Edit Profile</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
              onPress={handleSave}
              style={styles.saveBtn}>
              <Check size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Inputs */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your Name"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              maxLength={50}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Bio</Text>
              <Text style={styles.charCount}>{bio.length}/160</Text>
            </View>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Cinephile bio, favorite directors, or film festival experiences..."
              placeholderTextColor="#8A8A8A"
              style={[styles.input, styles.textArea]}
              multiline
              maxLength={160}
              textAlignVertical="top"
            />
          </View>

          <Button
            label={isSaving ? 'Saving Changes...' : 'Save Profile'}
            variant="primary"
            onPress={handleSave}
            disabled={isSaving}
            style={styles.actionBtn}
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
    paddingBottom: spacing.md,
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
  formGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4D4D4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  charCount: {
    fontSize: 11,
    color: '#8A8A8A',
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
  textArea: {
    height: 96,
  },
  actionBtn: {
    marginTop: spacing.md,
  },
});

