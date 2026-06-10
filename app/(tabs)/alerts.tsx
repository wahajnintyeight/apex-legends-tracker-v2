import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { fetchMapRotation, getAllMapNames, MapRotation } from '../../src/api';
import { getAlerts, toggleAlert } from '../../src/storage';
import { registerForNotifications } from '../../src/notifications';

// Best-effort image lookup from current rotation assets
function buildAssetMap(rotation: MapRotation | null): Record<string, string> {
  const map: Record<string, string> = {};
  if (!rotation) return map;
  for (const mode of Object.values(rotation)) {
    for (const slot of [mode?.current, mode?.next]) {
      if (slot?.map && slot?.asset) map[slot.map] = slot.asset;
    }
  }
  return map;
}

export default function AlertsScreen() {
  const [maps, setMaps] = useState<string[]>([]);
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [subscribed, setSubscribed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [permGranted, setPermGranted] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rotation, alerts] = await Promise.all([fetchMapRotation(), getAlerts()]);
      setMaps(getAllMapNames(rotation));
      setAssets(buildAssetMap(rotation));
      setSubscribed(alerts.map((a) => a.map));
    } catch {
      // ignore — keep prior state
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onToggle = async (map: string) => {
    const granted = await registerForNotifications();
    setPermGranted(granted);
    const updated = await toggleAlert(map);
    setSubscribed(updated.map((a) => a.map));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Map Alerts</Text>
        <Text style={styles.subtitle}>
          Get a notification the moment a map enters rotation.
        </Text>
      </View>

      {!permGranted && (
        <View style={styles.warn}>
          <Ionicons name="warning-outline" size={18} color={theme.colors.accent} />
          <Text style={styles.warnText}>
            Notifications are disabled. Enable them in system settings to receive alerts.
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.countPill}>
            <Ionicons name="notifications" size={14} color={theme.colors.accent} />
            <Text style={styles.countText}>
              {subscribed.length} active {subscribed.length === 1 ? 'alert' : 'alerts'}
            </Text>
          </View>

          {maps.map((map) => {
            const on = subscribed.includes(map);
            return (
              <Pressable key={map} style={styles.row} onPress={() => onToggle(map)}>
                {assets[map] ? (
                  <Image source={{ uri: assets[map] }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbFallback]}>
                    <Ionicons name="map-outline" size={20} color={theme.colors.textDim} />
                  </View>
                )}
                <Text style={styles.mapName}>{map}</Text>
                <Switch
                  value={on}
                  onValueChange={() => onToggle(map)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.text}
                />
              </Pressable>
            );
          })}

          <View style={styles.info}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.textDim} />
            <Text style={styles.infoText}>
              The app checks rotation in the background roughly every 15 minutes and instantly
              while open. You'll be notified once per rotation window per map.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingHorizontal: theme.spacing(4), paddingVertical: theme.spacing(3) },
  title: { color: theme.colors.text, fontSize: theme.font.h1, fontWeight: '900' },
  subtitle: { color: theme.colors.textMuted, fontSize: theme.font.small, marginTop: 4 },
  warn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginHorizontal: theme.spacing(4),
    padding: theme.spacing(3),
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  warnText: { color: theme.colors.text, fontSize: theme.font.small, flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: theme.spacing(4), paddingTop: theme.spacing(2) },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: theme.spacing(4),
  },
  countText: { color: theme.colors.accent, fontSize: theme.font.small, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumb: { width: 64, height: 44, borderRadius: theme.radius.sm },
  thumbFallback: {
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapName: { flex: 1, color: theme.colors.text, fontSize: theme.font.body, fontWeight: '600' },
  info: {
    flexDirection: 'row',
    gap: 8,
    marginTop: theme.spacing(4),
    paddingHorizontal: theme.spacing(2),
  },
  infoText: { color: theme.colors.textDim, fontSize: theme.font.small, flex: 1, lineHeight: 18 },
});
