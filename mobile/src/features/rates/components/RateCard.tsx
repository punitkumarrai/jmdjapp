import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '@/theme/tokens';
import { formatCurrency } from '@/lib/money';
import { RateData } from '../data/sampleRates';

interface RateCardProps {
  data: RateData;
}

export function RateCard({ data }: RateCardProps) {
  const isUp = data.rate_per_gram > data.previous_rate;
  const isDown = data.rate_per_gram < data.previous_rate;
  const isNeutral = !isUp && !isDown;

  const movementColor = isUp ? theme.colors.success : isDown ? theme.colors.danger : theme.colors.textSecondary;
  const movementIcon = isUp ? '↑' : isDown ? '↓' : '-';
  const movementValue = Math.abs(data.rate_per_gram - data.previous_rate);

  // Simple min-max for trend indicator height
  const minRate = Math.min(...data.history_7d);
  const maxRate = Math.max(...data.history_7d);
  const range = maxRate - minRate || 1; // avoid div by 0

  const isSilver = data.metal_type === 'silver';

  return (
    <Link href={{ pathname: '/rate/[metal]', params: { metal: data.metal_type } } as any} asChild>
      <Pressable>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.metalName}>{data.metal_name}</Text>
              <Text style={styles.purityText}>{data.purity}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.rateText}>
                {formatCurrency(data.rate_per_gram)}
                <Text style={styles.rateUnit}>/g</Text>
              </Text>
              <Text style={styles.secondaryPrice}>
                {formatCurrency(isSilver ? data.rate_per_gram * 1000 : data.rate_per_gram * 10)}
                <Text style={styles.secondaryUnit}> {isSilver ? '/ 1kg' : '/ 10g'}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.movementContainer}>
              <Text style={[styles.movementText, { color: movementColor }]}>
                {movementIcon} {formatCurrency(movementValue)} ({Math.abs(data.changePercent).toFixed(2)}%)
              </Text>
            </View>

            <View style={styles.historyContainer}>
              {data.history_7d.map((val, idx) => {
                // Calculate relative height (20% to 100%)
                const heightPercent = 20 + ((val - minRate) / range) * 80;
                return (
                  <View key={idx} style={styles.historyBarContainer}>
                    <View 
                      style={[
                        styles.historyBar, 
                        { 
                          height: `${heightPercent}%`,
                          backgroundColor: idx === data.history_7d.length - 1 ? theme.colors.primary : theme.colors.secondary
                        }
                      ]} 
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  metalName: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.primary,
  } as TextStyle,
  purityText: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.label,
    color: theme.colors.textSecondary,
    marginTop: 2,
  } as TextStyle,
  priceContainer: {
    alignItems: 'flex-end',
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
  secondaryPrice: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.label,
    color: theme.colors.textSecondary,
    marginTop: -4,
  } as TextStyle,
  secondaryUnit: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  } as TextStyle,
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  } as ViewStyle,
  movementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  movementText: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.label,
  } as TextStyle,
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    gap: 4,
  } as ViewStyle,
  historyBarContainer: {
    height: '100%',
    width: 8,
    justifyContent: 'flex-end',
  } as ViewStyle,
  historyBar: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  } as ViewStyle,
});
