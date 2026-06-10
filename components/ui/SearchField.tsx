import React from 'react';
import {View, TextInput, Pressable, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../../src/theme';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
};

export default function SearchField({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  loading,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder || 'Search…'}
        placeholderTextColor={theme.colors.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={theme.colors.textDim} />
        </Pressable>
      )}
      <Pressable
        style={[styles.go, loading && styles.goDisabled]}
        onPress={onSubmit}
        disabled={loading}>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingLeft: 16,
    paddingRight: 5,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.font.body,
    paddingVertical: 8,
  },
  go: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goDisabled: {opacity: 0.5},
});
