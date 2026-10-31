import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { radius, typography } from '@/lib/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  style,
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss bottom sheet"
          style={styles.backdropTouch}
          onPress={onClose}
        />

        <View style={[styles.sheet, style]}>
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close sheet"
                onPress={onClose}
                hitSlop={8}
                style={styles.closeBtn}>
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: radius.cardLarge,
    borderTopRightRadius: radius.cardLarge,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8A8A8A',
    alignSelf: 'center',
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingVertical: 8,
  },
});

