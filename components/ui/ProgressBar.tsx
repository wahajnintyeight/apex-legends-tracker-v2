import React from 'react';
import {View, StyleSheet} from 'react-native';
import {theme} from '../../src/theme';

type Props = {
  progress: number; // 0..100
  color?: string;
  height?: number;
};

export default function ProgressBar({progress, color, height = 8}: Props) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <View style={[styles.track, {height, borderRadius: height / 2}]}>
      <View
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color || theme.colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: theme.colors.surfaceAlt,
    overflow: 'hidden',
  },
});
