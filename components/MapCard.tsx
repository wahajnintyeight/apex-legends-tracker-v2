import React from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../src/theme';
import {ModeRotation} from '../src/api';
import Countdown from './Countdown';

type Props = {
  modeKey: string;
  label: string;
  rotation: ModeRotation;
  alertOn: boolean;
  onToggleAlert: (map: string) => void;
};

export default function MapCard({label, rotation, alertOn, onToggleAlert}: Props) {
  const {current, next} = rotation;
  if (!current) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          source={{uri: current.asset}}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(11,14,19,0.55)', theme.colors.surface]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.badgeRow}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{label}</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <Pressable
          style={[styles.bell, alertOn && styles.bellOn]}
          onPress={() => onToggleAlert(current.map)}
          hitSlop={10}>
          <Ionicons
            name={alertOn ? 'notifications' : 'notifications-outline'}
            size={20}
            color={alertOn ? theme.colors.bg : theme.colors.text}
          />
        </Pressable>

        <View style={styles.titleBlock}>
          {current.eventName ? (
            <Text style={styles.eventName}>{current.eventName}</Text>
          ) : null}
          <Text style={styles.mapName}>{current.map}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.timerRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.timerLabel}>Time left</Text>
          <Countdown endTs={current.end} style={styles.timer} />
        </View>

        {next ? (
          <View style={styles.nextRow}>
            <Image source={{uri: next.asset}} style={styles.nextThumb} resizeMode="cover" />
            <View style={{flex: 1}}>
              <Text style={styles.nextLabel}>UP NEXT</Text>
              <Text style={styles.nextMap}>{next.map}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.textDim} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing(4),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageWrap: {height: 180, justifyContent: 'flex-end'},
  image: {...StyleSheet.absoluteFillObject, width: '100%', height: '100%'},
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeBadge: {
    backgroundColor: 'rgba(11,14,19,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
  },
  modeBadgeText: {
    color: theme.colors.text,
    fontSize: theme.font.tiny,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    gap: 5,
  },
  liveDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff'},
  liveText: {color: '#fff', fontSize: theme.font.tiny, fontWeight: '800', letterSpacing: 1},
  bell: {
    position: 'absolute',
    top: 52,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(11,14,19,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bellOn: {backgroundColor: theme.colors.accent, borderColor: theme.colors.accent},
  titleBlock: {padding: theme.spacing(4)},
  eventName: {
    color: theme.colors.accent,
    fontSize: theme.font.small,
    fontWeight: '700',
    marginBottom: 2,
  },
  mapName: {color: theme.colors.text, fontSize: theme.font.h2, fontWeight: '800'},
  body: {padding: theme.spacing(4), paddingTop: theme.spacing(3)},
  timerRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  timerLabel: {color: theme.colors.textMuted, fontSize: theme.font.small, flex: 1},
  timer: {
    color: theme.colors.primary,
    fontSize: theme.font.h3,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(4),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  nextThumb: {width: 56, height: 40, borderRadius: theme.radius.sm},
  nextLabel: {
    color: theme.colors.textDim,
    fontSize: theme.font.tiny,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  nextMap: {color: theme.colors.text, fontSize: theme.font.body, fontWeight: '600'},
});
