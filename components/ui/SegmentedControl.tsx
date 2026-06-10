import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {theme} from '../../src/theme';

type Option<T extends string> = {key: T; label: string};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (key: T) => void;
};

// Animated-feel pill segmented control. Generic so it works for any option set.
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map(opt => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt.key)}>
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
  },
  segmentActive: {backgroundColor: theme.colors.primary},
  label: {color: theme.colors.textMuted, fontSize: theme.font.small, fontWeight: '700'},
  labelActive: {color: '#fff'},
});
