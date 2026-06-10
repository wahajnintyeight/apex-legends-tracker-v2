import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../src/theme';

type Props = {title: string; trailing?: React.ReactNode};

export default function SectionHeader({title, trailing}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.bar} />
      <Text style={styles.title}>{title}</Text>
      <View style={{flex: 1}} />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
  },
  bar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.h3,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
