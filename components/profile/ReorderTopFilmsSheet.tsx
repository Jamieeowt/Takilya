import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { X, ChevronUp, ChevronDown, Check } from 'lucide-react-native';
import { TopFilmItem } from '@/features/account/types';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/lib/theme';

interface ReorderTopFilmsSheetProps {
  visible: boolean;
  topFilms: TopFilmItem[];
  onClose: () => void;
  onSave: (reordered: { filmId: string; position: number }[]) => void;
}

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

export function ReorderTopFilmsSheet({
  visible,
  topFilms,
  onClose,
  onSave,
}: ReorderTopFilmsSheetProps) {
  const [items, setItems] = useState<TopFilmItem[]>(topFilms);

  useEffect(() => {
    setItems(topFilms);
  }, [topFilms]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updated = [...items];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updated = [...items];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
  };

  const handleSave = () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    const payload = items.map((film, idx) => ({
      filmId: film.id,
      position: idx + 1,
    }));
    onSave(payload);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss reorder modal"
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

            <Text style={styles.headerTitle}>Reorder Favorites</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save reorder"
              onPress={handleSave}
              style={styles.headerBtn}>
              <Check size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Use arrows to arrange your personal top 4 Philippine films in order of preference.
          </Text>

          <View style={styles.list}>
            {items.map((film, index) => {
              const position = index + 1;
              return (
                <View key={film.id || index} style={styles.rowItem}>
                  <View style={styles.positionBadge}>
                    <Text style={styles.positionText}>{position}</Text>
                  </View>

                  <View style={styles.posterWrapper}>
                    <Image
                      source={{ uri: film.poster_url || undefined }}
                      placeholder={{ blurhash: DEFAULT_BLURHASH }}
                      contentFit="cover"
                      style={styles.poster}
                    />
                  </View>

                  <View style={styles.infoCol}>
                    <Text style={styles.filmTitle} numberOfLines={1}>
                      {film.title}
                    </Text>
                    <Text style={styles.filmYear}>{film.year}</Text>
                  </View>

                  {/* Reorder Buttons */}
                  <View style={styles.arrowsCol}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${film.title} up`}
                      disabled={index === 0}
                      onPress={() => moveUp(index)}
                      style={[styles.arrowBtn, index === 0 && styles.arrowDisabled]}>
                      <ChevronUp
                        size={18}
                        color={index === 0 ? '#2E2E2E' : '#FFFFFF'}
                      />
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${film.title} down`}
                      disabled={index === items.length - 1}
                      onPress={() => moveDown(index)}
                      style={[
                        styles.arrowBtn,
                        index === items.length - 1 && styles.arrowDisabled,
                      ]}>
                      <ChevronDown
                        size={18}
                        color={index === items.length - 1 ? '#2E2E2E' : '#FFFFFF'}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          <Button
            label="Save Order"
            variant="primary"
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </View>
      </View>
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
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  positionBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  posterWrapper: {
    width: 40,
    height: 60,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
  },
  filmTitle: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filmYear: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  arrowsCol: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    backgroundColor: '#0A0A0A',
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
});

