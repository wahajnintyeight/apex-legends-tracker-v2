import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../src/theme';
import {
  fetchPlayerStats,
  getHeadlineStats,
  getTopLegends,
  Platform,
  PLATFORMS,
  PlayerStats,
} from '../src/api';
import {formatNumber, rankColor, rankLabel} from '../src/format';
import {
  Avatar,
  Card,
  Pill,
  ProgressBar,
  SearchField,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  StatTile,
} from '../components/ui';

export default function PlayerScreen() {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<Platform>('PC');
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    const name = query.trim();
    if (!name) {
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setStats(null);
    try {
      const data = await fetchPlayerStats(name, platform);
      setStats(data);
    } catch (e: any) {
      setError(e?.message ?? 'Player not found');
    } finally {
      setLoading(false);
    }
  }, [query, platform]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Player Search</Text>
        <Text style={styles.subtitle}>Look up lifetime stats, rank, and legends.</Text>
      </View>

      <View style={styles.controls}>
        <SegmentedControl options={PLATFORMS} value={platform} onChange={setPlatform} />
        <SearchField
          value={query}
          onChangeText={setQuery}
          onSubmit={search}
          loading={loading}
          placeholder={platform === 'PC' ? 'Origin / EA account name' : 'Gamertag / PSN ID'}
        />
        {platform === 'PC' && (
          <Text style={styles.hint}>
            PC players: use the Origin/EA account name (even on Steam).
          </Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : stats ? (
          <Results stats={stats} />
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Results -------------------------------------------------------------
function Results({stats}: {stats: PlayerStats}) {
  const g = stats.global;
  const rt = stats.realtime;
  const headline = getHeadlineStats(stats);
  const topLegends = getTopLegends(stats);
  const online = rt?.isOnline === 1;
  const rColor = rankColor(g.rank?.rankName);

  return (
    <View>
      {/* Profile header */}
      <Card>
        <View style={styles.profileRow}>
          <Avatar uri={g.avatar} name={g.name} size={66} ring={rColor} />
          <View style={styles.profileMeta}>
            <Text style={styles.name} numberOfLines={1}>
              {g.name}
            </Text>
            <View style={styles.metaPills}>
              <Pill label={g.platform} color={theme.colors.textMuted} />
              <Pill
                label={online ? 'Online' : rt?.currentStateAsText || 'Offline'}
                color={online ? theme.colors.success : theme.colors.textDim}
                filled={online}
              />
            </View>
          </View>
        </View>

        {/* Level progress */}
        <View style={styles.levelBlock}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>
              Level {formatNumber(g.level)}
              {g.levelPrestige ? `  ·  Prestige ${g.levelPrestige}` : ''}
            </Text>
            <Text style={styles.levelPct}>{g.toNextLevelPercent}%</Text>
          </View>
          <ProgressBar progress={g.toNextLevelPercent} />
        </View>
      </Card>

      {/* Rank cards */}
      <SectionHeader title="Rank" />
      <View style={styles.rankRow}>
        <RankCard title="Battle Royale" rank={g.rank} />
        <RankCard title="Arenas" rank={g.arena} />
      </View>

      {/* Lifetime stats */}
      {headline.length > 0 && (
        <>
          <SectionHeader title="Lifetime" />
          <View style={styles.statGrid}>
            {headline.map(s => (
              <StatTile key={s.label} label={s.label} value={s.value} />
            ))}
          </View>
        </>
      )}

      {/* Selected legend */}
      {stats.legends?.selected && (
        <>
          <SectionHeader title="Selected Legend" />
          <Card padded={false}>
            <View style={styles.legendHero}>
              {stats.legends.selected.ImgAssets?.banner ? (
                <Image
                  source={{uri: stats.legends.selected.ImgAssets.banner}}
                  style={styles.legendBanner}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.legendOverlay}>
                <Text style={styles.legendName}>{stats.legends.selected.LegendName}</Text>
              </View>
            </View>
            <View style={styles.legendStats}>
              {(stats.legends.selected.data || []).slice(0, 3).map(t => (
                <View key={t.key} style={styles.legendStat}>
                  <Text style={styles.legendStatValue}>{formatNumber(t.value)}</Text>
                  <Text style={styles.legendStatLabel} numberOfLines={1}>
                    {t.name}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      )}

      {/* Top legends */}
      {topLegends.length > 0 && (
        <>
          <SectionHeader title="Top Legends" />
          <Card>
            {topLegends.map((l, i) => (
              <View
                key={l.name}
                style={[styles.legendRow, i > 0 && styles.legendRowBorder]}>
                {l.icon ? (
                  <Image source={{uri: l.icon}} style={styles.legendIcon} />
                ) : (
                  <View style={[styles.legendIcon, styles.legendIconFallback]} />
                )}
                <Text style={styles.legendRowName}>{l.name}</Text>
                <Text style={styles.legendRowValue}>
                  {formatNumber(l.stat?.value || 0)}
                </Text>
                <Text style={styles.legendRowStat} numberOfLines={1}>
                  {l.stat?.name}
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <View style={{height: theme.spacing(8)}} />
    </View>
  );
}

function RankCard({title, rank}: {title: string; rank: any}) {
  const color = rankColor(rank?.rankName);
  return (
    <Card style={styles.rankCard}>
      <Text style={styles.rankCardTitle}>{title}</Text>
      <View style={styles.rankMain}>
        {rank?.rankImg ? (
          <Image source={{uri: rank.rankImg}} style={styles.rankImg} resizeMode="contain" />
        ) : null}
        <View style={{flex: 1}}>
          <Text style={[styles.rankName, {color}]} numberOfLines={1}>
            {rankLabel(rank?.rankName, rank?.rankDiv)}
          </Text>
          {rank?.rankScore ? (
            <Text style={styles.rankScore}>{formatNumber(rank.rankScore)} RP</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

// ---- States --------------------------------------------------------------
function LoadingState() {
  return (
    <View>
      <Card>
        <View style={styles.profileRow}>
          <Skeleton width={72} height={72} radius={36} />
          <View style={{flex: 1, gap: 10}}>
            <Skeleton width={'70%'} height={20} />
            <Skeleton width={'45%'} height={14} />
          </View>
        </View>
        <View style={{marginTop: 18, gap: 10}}>
          <Skeleton height={10} radius={5} />
        </View>
      </Card>
      <View style={[styles.rankRow, {marginTop: 18}]}>
        <Skeleton height={96} radius={28} style={{flex: 1}} />
        <Skeleton height={96} radius={28} style={{flex: 1}} />
      </View>
      <View style={[styles.statGrid, {marginTop: 18}]}>
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} height={86} radius={20} style={{flex: 1, minWidth: 88}} />
        ))}
      </View>
    </View>
  );
}

function ErrorState({message}: {message: string}) {
  return (
    <View style={styles.centered}>
      <Ionicons name="person-remove-outline" size={44} color={theme.colors.primary} />
      <Text style={styles.centeredTitle}>No player found</Text>
      <Text style={styles.centeredText}>{message}</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.centered}>
      <Ionicons name="search-outline" size={44} color={theme.colors.textDim} />
      <Text style={styles.centeredTitle}>Search for a player</Text>
      <Text style={styles.centeredText}>
        Pick a platform and enter an account name to view their Apex stats.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: theme.colors.bg},
  header: {paddingHorizontal: theme.spacing(4), paddingVertical: theme.spacing(3)},
  title: {color: theme.colors.text, fontSize: theme.font.h1, fontWeight: '900'},
  subtitle: {color: theme.colors.textMuted, fontSize: theme.font.small, marginTop: 4},
  controls: {paddingHorizontal: theme.spacing(4), gap: theme.spacing(3)},
  hint: {color: theme.colors.textDim, fontSize: theme.font.tiny, paddingHorizontal: 4},
  scroll: {padding: theme.spacing(4), paddingTop: theme.spacing(3)},

  profileRow: {flexDirection: 'row', alignItems: 'center', gap: 14},
  profileMeta: {flex: 1, gap: 8},
  name: {color: theme.colors.text, fontSize: theme.font.h2, fontWeight: '900'},
  metaPills: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  levelBlock: {marginTop: theme.spacing(4), gap: 8},
  levelRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  levelLabel: {color: theme.colors.textMuted, fontSize: theme.font.small, fontWeight: '700'},
  levelPct: {color: theme.colors.text, fontSize: theme.font.small, fontWeight: '800'},

  rankRow: {flexDirection: 'row', gap: theme.spacing(3)},
  rankCard: {flex: 1},
  rankCardTitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  rankMain: {flexDirection: 'row', alignItems: 'center', gap: 10},
  rankImg: {width: 44, height: 44},
  rankName: {fontSize: theme.font.body, fontWeight: '800'},
  rankScore: {color: theme.colors.textMuted, fontSize: theme.font.small, marginTop: 2},

  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(3)},

  legendHero: {height: 130, justifyContent: 'flex-end'},
  legendBanner: {...StyleSheet.absoluteFillObject, width: '100%', height: '100%'},
  legendOverlay: {
    padding: theme.spacing(4),
    backgroundColor: 'rgba(11,14,19,0.45)',
  },
  legendName: {color: '#fff', fontSize: theme.font.h2, fontWeight: '900'},
  legendStats: {flexDirection: 'row', padding: theme.spacing(4), gap: theme.spacing(3)},
  legendStat: {flex: 1},
  legendStatValue: {
    color: theme.colors.text,
    fontSize: theme.font.h3,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  legendStatLabel: {color: theme.colors.textMuted, fontSize: theme.font.tiny, marginTop: 2},

  legendRow: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10},
  legendRowBorder: {borderTopWidth: 1, borderTopColor: theme.colors.border},
  legendIcon: {width: 34, height: 34, borderRadius: 8},
  legendIconFallback: {backgroundColor: theme.colors.surfaceAlt},
  legendRowName: {color: theme.colors.text, fontSize: theme.font.body, fontWeight: '700', width: 96},
  legendRowValue: {
    color: theme.colors.primary,
    fontSize: theme.font.body,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    width: 56,
    textAlign: 'right',
  },
  legendRowStat: {flex: 1, color: theme.colors.textDim, fontSize: theme.font.tiny, textAlign: 'right'},

  centered: {alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: theme.spacing(16)},
  centeredTitle: {color: theme.colors.text, fontSize: theme.font.h3, fontWeight: '800'},
  centeredText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 19,
  },
});
