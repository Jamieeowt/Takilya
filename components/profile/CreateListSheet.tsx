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
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Plus, Lock } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/lib/theme';

interface CreateListSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string; isPrivate: boolean }) => void;
  isCreating?: boolean;
}

export function CreateListSheet({
  visible,
  onClose,
  onCreate,
  isCreating = false,
}: CreateListSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onCreate({
      title: title.trim(),
      description: description.trim(),
      isPrivate,
    });
    setTitle('');
    setDescription('');
    setIsPrivate(false);
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
          accessibilityLabel="Dismiss create list modal"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.sheetContent}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={onClose}
              style={styles.headerBtn}>
              <X size={20} color="#8A8A8A" />
            </Pressable>

            <Text style={styles.headerTitle}>New Film List</Text>

            <View style={{ width: 44 }} />
          </View>

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>List Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Essential 80s Pinoy Cinema, QCinema Darlings"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              maxLength={80}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add context or criteria for this collection..."
              placeholderTextColor="#8A8A8A"
              style={[styles.input, styles.textArea]}
              multiline
              maxLength={250}
              textAlignVertical="top"
            />
          </View>

          {/* Private Toggle */}
          <View style={styles.privacyRow}>
            <View style={styles.privacyInfo}>
              <View style={styles.lockTitleRow}>
                <Lock size={14} color="#FFFFFF" />
                <Text style={styles.privacyTitle}>Make list private</Text>
              </View>
              <Text style={styles.privacySubtitle}>
                Only you will be able to view this list on your profile
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#2E2E2E', true: '#FFFFFF' }}
              thumbColor={isPrivate ? '#000000' : '#8A8A8A'}
            />
          </View>

          <Button
            label={isCreating ? 'Creating List...' : 'Create List'}
            variant="primary"
            onPress={handleCreate}
            disabled={!title.trim() || isCreating}
            icon={<Plus size={16} color="#000000" />}
            style={styles.createBtn}
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
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4D4D4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
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
    height: 80,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  privacyInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  lockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privacySubtitle: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  createBtn: {
    marginTop: spacing.xs,
  },
});

