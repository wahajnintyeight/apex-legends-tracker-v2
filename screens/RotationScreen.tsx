import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../src/theme';
import {fetchMapRotation, MapRotation, MODE_LABELS, MODE_ORDER} from '../src/api';
import {getAlerts, toggleAlert} from '../src/storage';
import {checkRotationAndNotify} from '../src/notifications';
import MapCard from '../components/MapCard';

export default function RotationScreen() {
  const [rotation, setRotation] = useState<MapRotation | null>(null);
  const [subscribed, setSubscribed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [data, alerts] = await Promise.all([fetchMapRotation(), getAlerts()]);
      setRotation(data);
      setSubscribed(alerts.map(a => a.map));
      // Foreground check so alerts fire even while the app is open
      checkRotationAndNotify().catch(() => {});
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load rotation');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      getAlerts().then(a => setSubscribed(a.map(x => x.map)));
    }, []),
  );

  const onToggle = async (map: string) => {
    const updated = await toggleAlert(map);
    setSubscribed(updated.map(a => a.map));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Ionicons name="location" size={18} color={theme.colors.bg} />
          </View>
          <View>
            <Text style={styles.title}>APEX MAPS</Text>
            <Text style={styles.subtitle}>Live rotation tracker</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading rotation…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={theme.colors.primary} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={theme.colors.primary}
            />
          }>
          {MODE_ORDER.map(mode => {
            const r = (rotation as any)?.[mode];
            if (!r?.current) {
              return null;
            }
            return (
              <MapCard
                key={mode}
                modeKey={mode}
                label={MODE_LABELS[mode]}
                rotation={r}
                alertOn={subscribed.includes(r.current.map)}
                onToggleAlert={onToggle}
              />
            );
          })}
          <Text style={styles.footer}>
            Tap the bell on any map to get notified when it's live.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: theme.colors.bg},
  header: {paddingHorizontal: theme.spacing(4), paddingVertical: theme.spacing(3)},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.h2,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {color: theme.colors.textMuted, fontSize: theme.font.small},
  scroll: {padding: theme.spacing(4), paddingTop: theme.spacing(2)},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
  loadingText: {color: theme.colors.textMuted},
  errorText: {color: theme.colors.textMuted, textAlign: 'center', paddingHorizontal: 40},
  footer: {
    color: theme.colors.textDim,
    fontSize: theme.font.small,
    textAlign: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(6),
  },
});
