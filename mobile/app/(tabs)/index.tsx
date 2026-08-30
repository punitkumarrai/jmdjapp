import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { theme } from '@/theme/tokens';
import { RateCard } from '@/features/rates/components/RateCard';
import { sampleRates } from '@/features/rates/data/sampleRates';

export default function RatesScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate network delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const timeString = new Date(sampleRates[0].effective_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Tabs.Screen options={{ headerShown: false }} />
      
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>JMDJ</Text>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Today's Bullion Rates</Text>
          <View style={styles.liveIndicatorContainer}>
            <View style={styles.greenDot} />
            <Text style={styles.liveText}>
              Live Rate · {timeString} IST
            </Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {sampleRates.map(rate => (
            <RateCard key={rate.id} data={rate} />
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
    backgroundColor: theme.colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  wordmark: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgWarm,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h1,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  liveText: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  cardsContainer: {
    paddingBottom: theme.spacing.sm,
  },
  disclaimer: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBottom: theme.spacing.xl,
  },
});
