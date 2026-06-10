import React from 'react';
import {View, ViewProps, StyleSheet, ViewStyle} from 'react-native';
import {theme} from '../../src/theme';

type Props = ViewProps & {
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
};

// Base surface container used across the app. Single source of truth for the
// card look (radius, border, background) so every panel stays consistent.
export default function Card({padded = true, style, children, ...rest}: Props) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  padded: {padding: theme.spacing(4)},
});
