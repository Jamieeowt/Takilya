import React, { useState, useEffect } from 'react';
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
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { X, Check, Camera } from 'lucide-react-native';
import { UserProfile } from '@/features/account/types';
import { uploadAvatarImage } from '@/features/account/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/lib/theme';

interface EditProfileSheetProps {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (payload: {
    display_name: string;
    username: string;
    bio: string;
    avatar_url?: string;
  }) => void;
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
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (visible) {
      setDisplayName(profile.display_name);
      setUsername(profile.username);
      setBio(profile.bio);
      setSelectedImageUri(null);
      setSelectedImageBase64(null);
      setIsUploadingImage(false);
    }
  }, [visible, profile]);

  const handlePickImage = async () => {
    try {
      void Haptics.selectionAsync();

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo Permission Needed',
          'Takilya needs access to your photo library to set your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImageUri(asset.uri);
        setSelectedImageBase64(asset.base64 || null);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const handleSave = async () => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      Alert.alert('Invalid Username', 'Please enter a valid handle.');
      return;
    }

    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    let uploadedUrl = profile.avatar_url || undefined;

    if (selectedImageUri) {
      try {
        setIsUploadingImage(true);
        uploadedUrl = await uploadAvatarImage(
          profile.id,
          selectedImageUri,
          selectedImageBase64
        );
      } catch (err: any) {
        console.warn('Avatar upload failed, falling back to local/existing:', err);
        // If storage bucket is unreachable or in mock mode, use image uri directly
        uploadedUrl = selectedImageUri;
      } finally {
        setIsUploadingImage(false);
      }
    }

    onSave({
      display_name: displayName.trim() || profile.display_name,
      username: cleanUsername,
      bio: bio.trim(),
      avatar_url: uploadedUrl,
    });
    onClose();
  };

  const isBusy = isSaving || isUploadingImage;

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
              disabled={isBusy}
              style={styles.saveBtn}>
              {isBusy ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Check size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          {/* Avatar Photo Picker */}
          <View style={styles.avatarSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile avatar"
              onPress={handlePickImage}
              style={styles.avatarTouchable}>
              <Avatar
                url={selectedImageUri || profile.avatar_url}
                name={displayName || profile.display_name}
                size={84}
              />
              <View style={styles.cameraIconBadge}>
                <Camera size={14} color="#000000" />
              </View>
            </Pressable>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your Name"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              maxLength={50}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username / Handle</Text>
            <View style={styles.usernameInputWrap}>
              <Text style={styles.atPrefix}>@</Text>
              <TextInput
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                placeholderTextColor="#8A8A8A"
                style={[styles.input, styles.usernameInput]}
                maxLength={30}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
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
            label={isBusy ? 'Saving Changes...' : 'Save Profile'}
            variant="primary"
            onPress={handleSave}
            disabled={isBusy}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarTouchable: {
    position: 'relative',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  changePhotoText: {
    ...typography.caption,
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 6,
  },
  formGroup: {
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
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
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  usernameInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.sm,
    paddingLeft: spacing.md,
  },
  atPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  usernameInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 4,
  },
  textArea: {
    height: 80,
  },
  actionBtn: {
    marginTop: spacing.md,
  },
});
