import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { Check, Search } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Text } from '@/components/common/Text';
import { BottomSheet } from '@/components/ui/BottomSheet';

export interface SelectOptionItem {
  id: number;
  label: string;
  sublabel?: string;
}

export interface SelectOptionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: SelectOptionItem[];
  selectedId?: number;
  onSelect: (item: SelectOptionItem) => void;
}

export const SelectOptionBottomSheet: React.FC<SelectOptionBottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  items,
  selectedId,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  const handleSelect = (item: SelectOptionItem) => {
    onSelect(item);
    onClose();
    setSearchQuery('');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View style={styles.container}>
        {items.length > 5 && (
          <View style={styles.searchRow}>
            <Search size={16} color={colors.textSubtle} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={colors.textSubtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No options found</Text>
            </View>
          ) : (
            filteredItems.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.itemRow, isSelected && styles.selectedItemRow]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.itemTextContainer}>
                    <Text style={[styles.itemLabel, isSelected && styles.selectedItemLabel]}>
                      {item.label}
                    </Text>
                    {item.sublabel ? (
                      <Text style={styles.itemSublabel}>{item.sublabel}</Text>
                    ) : null}
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check size={16} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 380,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textMain,
    fontSize: 14,
    height: '100%',
  },
  scrollList: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedItemRow: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceRaised,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
  },
  selectedItemLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  itemSublabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
