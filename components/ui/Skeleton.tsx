import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, ViewStyle} from 'react-native';
import {theme} from '../../src/theme';

type Props = {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

// Pulsing placeholder for loading states (modern shimmer-style feedback).
export default function Skeleton({width = '100%', height = 16, radius = 8, style}: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 700, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 0.4, duration: 700, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {width: width as any, height, borderRadius: radius, opacity},
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {backgroundColor: theme.colors.surfaceAlt},
});
