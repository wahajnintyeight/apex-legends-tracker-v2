import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../src/theme';
import {formatNumber} from '../../src/format';

type Props = {
  label: string;
  value: number | string;
  accent?: string;
};

// Compact metric tile (value + label). Numbers are auto-compacted.
export default function StatTile({label, value, accent}: Props) {
  const display = typeof value === 'number' ? formatNumber(value) : value;
  return (
    <View style={styles.tile}>
      <Text style={[styles.value, accent ? {color: accent} : null]} numberOfLines={1}>
        {display}
      </Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 88,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(4),
    paddingHorizontal: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  value: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.font.tiny,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
