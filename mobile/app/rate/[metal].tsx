import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/theme/tokens';
import { sampleRates } from '@/features/rates/data/sampleRates';
import { formatCurrency } from '@/lib/money';

export default function RateDetailScreen() {
  const { metal } = useLocalSearchParams<{ metal: string }>();
  const router = useRouter();

  const data = sampleRates.find((r) => r.metal_type === metal);

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.colors.textDark} />
          </Pressable>
          <Text style={styles.headerTitle}>Rate not found</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const isSilver = data.metal_type === 'silver';
  const secondaryAmount = isSilver ? data.rate_per_gram * 1000 : data.rate_per_gram * 10;
  const secondaryUnit = isSilver ? '/ 1kg' : '/ 10g';

  const isUp = data.rate_per_gram > data.previous_rate;
  const isDown = data.rate_per_gram < data.previous_rate;
  const movementColor = isUp ? theme.colors.success : isDown ? theme.colors.danger : theme.colors.textSecondary;
  const movementIcon = isUp ? '↑' : isDown ? '↓' : '-';
  const movementValue = Math.abs(data.rate_per_gram - data.previous_rate);

  const minRate = Math.min(...data.history_7d);
  const maxRate = Math.max(...data.history_7d);
  
  const axisMin = Math.floor((minRate - 20) / 50) * 50;
  const axisMax = Math.ceil((maxRate + 20) / 50) * 50;
  const axisRange = axisMax - axisMin || 1;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => axisMin + pct * axisRange);

  const [selectedIndex, setSelectedIndex] = React.useState<number>(6);

  const msPerDay = 24 * 60 * 60 * 1000;
  const now = new Date();

  const historyList = data.history_7d.map((val, idx) => {
    const d = new Date(now.getTime() - (6 - idx) * msPerDay);
    const prev = idx > 0 ? data.history_7d[idx - 1] : null;
    let delta = 0;
    if (prev !== null) {
      delta = val - prev;
    }
    return {
      val,
      idx,
      date: d,
      delta,
      hasPrev: prev !== null,
    };
  });
  
  const historyListReversed = [...historyList].reverse();

  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (date: Date) => {
    const dayName = shortDays[date.getDay()];
    const dateNum = String(date.getDate()).padStart(2, '0');
    const monthName = shortMonths[date.getMonth()];
    return `${dayName} ${dateNum} ${monthName}`;
  };

  const getDeltaText = (delta: number) => {
    if (delta > 0) return `+${formatCurrency(delta)}`;
    if (delta < 0) return `-${formatCurrency(Math.abs(delta))}`;
    return formatCurrency(0);
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return theme.colors.success;
    if (delta < 0) return theme.colors.danger;
    return theme.colors.textSecondary;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* We use Stack.Screen to remove the default header if any, though root stack already has headerShown: false */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.textDark} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{data.metal_name}</Text>
          <Text style={styles.headerSubtitle}>{data.purity}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Current Rate Block */}
        <View style={styles.currentRateSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.rateText}>
              {formatCurrency(data.rate_per_gram)}
              <Text style={styles.rateUnit}>/g</Text>
            </Text>
            <Text style={styles.todayLabel}>
              Today · {formatDate(historyList[6].date)}
            </Text>
            <Text style={styles.secondaryPrice}>
              {formatCurrency(secondaryAmount)} <Text style={styles.secondaryUnit}>{secondaryUnit}</Text>
            </Text>
          </View>
          
          <View style={styles.movementBadge}>
            <Text style={[styles.movementText, { color: movementColor }]}>
              {movementIcon} {formatCurrency(movementValue)} ({Math.abs(data.changePercent).toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Large Chart */}
        <View style={styles.chartSection}>
          <View style={styles.chartWrapper}>
            {/* Reference lines */}
            <View style={styles.gridLinesContainer}>
              {gridLines.map((val, idx) => (
                <View key={idx} style={[styles.referenceLine, { bottom: `${((val - axisMin) / axisRange) * 100}%` }]}>
                  <View style={styles.dashedLine} />
                  <Text style={styles.referenceLabel}>{formatCurrency(Math.round(val))}</Text>
                </View>
              ))}
            </View>

            <View style={styles.largeHistoryContainer}>
              {data.history_7d.map((val, idx) => {
                const heightPercent = ((val - axisMin) / axisRange) * 100;
                const isSelected = selectedIndex === idx;
                const isToday = idx === 6;
                const barColor = isSelected || isToday ? theme.colors.primary : theme.colors.secondary;
                
                return (
                  <Pressable 
                    key={idx} 
                    style={styles.barColumn}
                    onPress={() => setSelectedIndex(idx)}
                  >
                    <View style={styles.barTrack}>
                      <View 
                        style={[
                          styles.largeHistoryBar, 
                          { 
                            height: `${Math.max(2, heightPercent)}%`, // guarantee tiny minimum height
                            backgroundColor: barColor
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>
                      {shortDays[historyList[idx].date.getDay()]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          
          {(() => {
            const selectedItem = historyList[selectedIndex];
            const todayVal = historyList[6].val;
            const isToday = selectedIndex === 6;
            
            let vsTodayText = 'Today';
            let vsTodayColor = theme.colors.textSecondary;
            
            if (!isToday) {
              const vsTodayDelta = selectedItem.val - todayVal;
              const vsTodayPercent = Math.abs((vsTodayDelta / todayVal) * 100).toFixed(2);
              const sign = vsTodayDelta > 0 ? '+' : vsTodayDelta < 0 ? '-' : '';
              
              vsTodayColor = vsTodayDelta > 0 ? theme.colors.success : vsTodayDelta < 0 ? theme.colors.danger : theme.colors.textSecondary;
              vsTodayText = `vs today: ${sign}${formatCurrency(Math.abs(vsTodayDelta))} (${sign}${vsTodayPercent}%)`;
            }

            return (
              <View style={styles.chartReadout}>
                <Text style={styles.readoutDate}>{formatDate(selectedItem.date)}</Text>
                <Text style={styles.readoutPrice}>{formatCurrency(selectedItem.val)}/g</Text>
                <Text style={[styles.readoutDelta, { color: vsTodayColor }]}>
                  {vsTodayText}
                </Text>
              </View>
            );
          })()}
        </View>

        {/* List */}
        <Text style={styles.listTitle}>Last 7 days</Text>
        <View style={styles.listContainer}>
          {historyListReversed.map((item, index) => (
            <View 
              key={item.idx} 
              style={[
                styles.listRow, 
                index === historyListReversed.length - 1 && styles.listRowLast
              ]}
            >
              <Text style={styles.listDate}>{formatDate(item.date)}</Text>
              <Text style={styles.listVal}>{formatCurrency(item.val)}<Text style={styles.listValUnit}>/g</Text></Text>
              <Text style={[styles.listDelta, { color: getDeltaColor(item.delta) }]}>
                {item.hasPrev ? getDeltaText(item.delta) : '-'}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Rates are indicative and exclude GST and making charges.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bgWarm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  currentRateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  priceContainer: {
  } as ViewStyle,
  rateText: {
    fontFamily: theme.typography.family.sansBold,
    fontSize: theme.typography.sizes.display,
    color: theme.colors.primaryDark,
    fontVariant: ['tabular-nums'],
  } as TextStyle,
  rateUnit: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.family.sans,
  } as TextStyle,
  todayLabel: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: -4,
    marginBottom: 4,
  } as TextStyle,
  secondaryPrice: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  } as TextStyle,
  secondaryUnit: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.label,
    color: theme.colors.textSecondary,
  } as TextStyle,
  movementBadge: {
    paddingTop: theme.spacing.sm,
  } as ViewStyle,
  movementText: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
  } as TextStyle,
  chartSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  largeHistoryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    paddingRight: 50, // Clear space for reference labels on right
  } as ViewStyle,
  barColumn: {
    height: '100%',
    width: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  } as ViewStyle,
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 6,
  } as ViewStyle,
  largeHistoryBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  } as ViewStyle,
  barLabel: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: 10,
    color: theme.colors.textSecondary,
    height: 14,
  } as TextStyle,
  chartWrapper: {
    position: 'relative',
    height: 160,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  gridLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20, // Match the label height + gap to align bottom grid line with bottom of bars
  } as ViewStyle,
  referenceLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: -1,
  } as ViewStyle,
  referenceLabel: {
    fontFamily: theme.typography.family.sans,
    fontSize: 10,
    color: theme.colors.textSecondary,
    width: 45,
    textAlign: 'right',
    marginLeft: 5,
  } as TextStyle,
  dashedLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    borderStyle: 'dashed',
  } as ViewStyle,
  chartReadout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  } as ViewStyle,
  readoutDate: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
  } as TextStyle,
  readoutPrice: {
    fontFamily: theme.typography.family.sansBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
    fontVariant: ['tabular-nums'],
  } as TextStyle,
  readoutDelta: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  } as TextStyle,
  listTitle: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  listRowLast: {
    borderBottomWidth: 0,
  } as ViewStyle,
  listDate: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
    flex: 1,
  } as TextStyle,
  listVal: {
    fontFamily: theme.typography.family.sansBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'center',
  } as TextStyle,
  listValUnit: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.label,
    color: theme.colors.textSecondary,
  } as TextStyle,
  listDelta: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'right',
  } as TextStyle,
  disclaimer: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
});
