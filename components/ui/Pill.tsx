import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../src/theme';

type Props = {
  label: string;
  color?: string;
  filled?: boolean;
  icon?: React.ReactNode;
};

// Small status/label pill. `filled` uses the accent as background.
export default function Pill({label, color = theme.colors.primary, filled, icon}: Props) {
  return (
    <View
      style={[
        styles.pill,
        filled
          ? {backgroundColor: color, borderColor: color}
          : {borderColor: color, backgroundColor: 'transparent'},
      ]}>
      {icon}
      <Text style={[styles.text, {color: filled ? '#fff' : color}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {fontSize: theme.font.tiny, fontWeight: '800', letterSpacing: 0.4},
});
