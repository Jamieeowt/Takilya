import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  X,
  Plus,
  Lock,
  Search,
  ChevronUp,
  ChevronDown,
  Trash2,
} from 'lucide-react-native';

import { useSearchFilmsForList } from '@/features/social/useActivity';
import { CuratedListDraft } from '@/features/social/types';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/lib/theme';

const DEFAULT_BLURHASH = 'L5H2EC=PM+yV0g-mq.wG9c010J}Z';

interface CustomListCreatorModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (draft: CuratedListDraft) => void;
  isCreating?: boolean;
}

export function CustomListCreatorModal({
  visible,
  onClose,
  onCreate,
  isCreating = false,
}: CustomListCreatorModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilms, setSelectedFilms] = useState<CuratedListDraft['films']>([]);

  const { data: searchResults = [] } = useSearchFilmsForList(searchQuery);

  const handleAddFilm = (film: CuratedListDraft['films'][0]) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (!selectedFilms.some((f) => f.id === film.id)) {
      setSelectedFilms((prev) => [...prev, film]);
    }
    setSearchQuery('');
  };

  const handleRemoveFilm = (filmId: string) => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedFilms((prev) => prev.filter((f) => f.id !== filmId));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updated = [...selectedFilms];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSelectedFilms(updated);
  };

  const moveDown = (index: number) => {
    if (index === selectedFilms.length - 1) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const updated = [...selectedFilms];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSelectedFilms(updated);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      is_private: isPrivate,
      films: selectedFilms,
    });

    setTitle('');
    setDescription('');
    setIsPrivate(false);
    setSelectedFilms([]);
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
          accessibilityLabel="Dismiss modal"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.sheetContent}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={onClose}
              style={styles.headerBtn}>
              <X size={20} color="#8A8A8A" />
            </Pressable>

            <Text style={styles.headerTitle}>Create Curated List</Text>

            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>List Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Essential 80s Pinoy Cinema, QCinema Highlights"
                placeholderTextColor="#8A8A8A"
                style={styles.input}
                maxLength={80}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Provide notes or thematic context for this collection..."
                placeholderTextColor="#8A8A8A"
                style={[styles.input, styles.textArea]}
                multiline
                maxLength={250}
                textAlignVertical="top"
              />
            </View>

            {/* Privacy Switch */}
            <View style={styles.privacyRow}>
              <View style={styles.privacyInfo}>
                <View style={styles.lockRow}>
                  <Lock size={14} color="#FFFFFF" />
                  <Text style={styles.privacyTitle}>Keep list private</Text>
                </View>
                <Text style={styles.privacyDesc}>
                  Only you will see this collection on your profile
                </Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#2E2E2E', true: '#FFFFFF' }}
                thumbColor={isPrivate ? '#000000' : '#8A8A8A'}
              />
            </View>

            {/* Film Search / Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Add Films to List</Text>
              <View style={styles.searchBar}>
                <Search size={16} color="#8A8A8A" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search Filipino films by title..."
                  placeholderTextColor="#8A8A8A"
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={16} color="#8A8A8A" />
                  </Pressable>
                )}
              </View>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <View style={styles.searchResultsBox}>
                  {searchResults.map((film) => {
                    const isAlreadyAdded = selectedFilms.some((f) => f.id === film.id);
                    return (
                      <Pressable
                        key={film.id}
                        disabled={isAlreadyAdded}
                        onPress={() => handleAddFilm(film)}
                        style={[
                          styles.searchResultItem,
                          isAlreadyAdded && styles.searchResultItemDisabled,
                        ]}>
                        <View style={styles.resultPosterWrapper}>
                          <Image
                            source={{ uri: film.poster_url || undefined }}
                            placeholder={{ blurhash: DEFAULT_BLURHASH }}
                            contentFit="cover"
                            style={styles.resultPoster}
                          />
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultTitle} numberOfLines={1}>
                            {film.title}
                          </Text>
                          <Text style={styles.resultYear}>{film.release_year}</Text>
                        </View>
                        <View style={styles.addPill}>
                          <Plus size={12} color={isAlreadyAdded ? '#8A8A8A' : '#FFFFFF'} />
                          <Text
                            style={[
                              styles.addPillText,
                              isAlreadyAdded && styles.addPillTextDisabled,
                            ]}>
                            {isAlreadyAdded ? 'Added' : 'Add'}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Selected Films (Reorderable) */}
            <View style={styles.formGroup}>
              <View style={styles.selectedHeaderRow}>
                <Text style={styles.label}>Curated Films ({selectedFilms.length})</Text>
                {selectedFilms.length > 1 && (
                  <Text style={styles.reorderHint}>Use arrows to reorder</Text>
                )}
              </View>

              {selectedFilms.length === 0 ? (
                <View style={styles.emptySelectedBox}>
                  <Text style={styles.emptySelectedText}>
                    Search above and add Philippine titles to your list.
                  </Text>
                </View>
              ) : (
                <View style={styles.selectedList}>
                  {selectedFilms.map((film, index) => (
                    <View key={film.id} style={styles.selectedItem}>
                      <View style={styles.positionBadge}>
                        <Text style={styles.positionText}>{index + 1}</Text>
                      </View>

                      <View style={styles.selectedPosterWrapper}>
                        <Image
                          source={{ uri: film.poster_url || undefined }}
                          placeholder={{ blurhash: DEFAULT_BLURHASH }}
                          contentFit="cover"
                          style={styles.selectedPoster}
                        />
                      </View>

                      <View style={styles.selectedFilmInfo}>
                        <Text style={styles.selectedFilmTitle} numberOfLines={1}>
                          {film.title}
                        </Text>
                        <Text style={styles.selectedFilmYear}>{film.release_year}</Text>
                      </View>

                      {/* Reorder Arrows */}
                      <View style={styles.reorderArrows}>
                        <Pressable
                          disabled={index === 0}
                          onPress={() => moveUp(index)}
                          style={[
                            styles.arrowBtn,
                            index === 0 && styles.arrowDisabled,
                          ]}>
                          <ChevronUp
                            size={16}
                            color={index === 0 ? '#2E2E2E' : '#FFFFFF'}
                          />
                        </Pressable>

                        <Pressable
                          disabled={index === selectedFilms.length - 1}
                          onPress={() => moveDown(index)}
                          style={[
                            styles.arrowBtn,
                            index === selectedFilms.length - 1 && styles.arrowDisabled,
                          ]}>
                          <ChevronDown
                            size={16}
                            color={index === selectedFilms.length - 1 ? '#2E2E2E' : '#FFFFFF'}
                          />
                        </Pressable>
                      </View>

                      {/* Remove Button */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${film.title} from list`}
                        onPress={() => handleRemoveFilm(film.id)}
                        style={styles.deleteBtn}>
                        <Trash2 size={16} color="#8A8A8A" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Save CTA */}
            <Button
              label={isCreating ? 'Creating List...' : 'Publish Curated List'}
              variant="primary"
              onPress={handleCreate}
              disabled={!title.trim() || isCreating}
              icon={<Plus size={16} color="#000000" />}
              style={styles.publishBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    maxHeight: '92%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#2E2E2E',
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    ...typography.title,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
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
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  privacyInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privacyDesc: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: 13,
  },
  searchResultsBox: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.sm,
    marginTop: 6,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: spacing.sm,
  },
  searchResultItemDisabled: {
    opacity: 0.5,
  },
  resultPosterWrapper: {
    width: 30,
    height: 45,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  resultPoster: {
    width: '100%',
    height: '100%',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultYear: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  addPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addPillTextDisabled: {
    color: '#8A8A8A',
  },
  selectedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reorderHint: {
    fontSize: 10,
    color: '#8A8A8A',
  },
  emptySelectedBox: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.sm,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptySelectedText: {
    fontSize: 12,
    color: '#8A8A8A',
    textAlign: 'center',
  },
  selectedList: {
    gap: spacing.xs,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.sm,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  positionBadge: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedPosterWrapper: {
    width: 32,
    height: 48,
    borderRadius: radius.xs,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  selectedPoster: {
    width: '100%',
    height: '100%',
  },
  selectedFilmInfo: {
    flex: 1,
  },
  selectedFilmTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedFilmYear: {
    fontSize: 10,
    color: '#8A8A8A',
  },
  reorderArrows: {
    flexDirection: 'row',
    gap: 2,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: radius.xs,
  },
  arrowDisabled: {
    backgroundColor: '#0A0A0A',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtn: {
    marginTop: spacing.md,
  },
});

