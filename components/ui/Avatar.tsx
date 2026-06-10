import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {theme} from '../../src/theme';

type Props = {
  uri?: string;
  name: string;
  size?: number;
  ring?: string;
};

// Player avatar with a colored ring + initials fallback.
export default function Avatar({uri, name, size = 64, ring}: Props) {
  const radius = size / 2;
  const initials = name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.ring,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
          borderColor: ring || theme.colors.primary,
        },
      ]}>
      {uri ? (
        <Image source={{uri}} style={{width: size, height: size, borderRadius: radius}} />
      ) : (
        <View
          style={[
            styles.fallback,
            {width: size, height: size, borderRadius: radius},
          ]}>
          <Text style={[styles.initials, {fontSize: size * 0.36}]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {color: theme.colors.text, fontWeight: '800'},
});
