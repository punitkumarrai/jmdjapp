import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/theme/tokens';
import { sampleRates } from '@/features/rates/data/sampleRates';
import { 
  estimatePrice, 
  rupeesToPaise, 
  gramsToMg, 
  formatCurrency 
} from '@/lib/money';

export default function CalculatorScreen() {
  const [selectedMetal, setSelectedMetal] = useState(sampleRates[0].metal_type);
  const [weightText, setWeightText] = useState('10');
  const [making, setMaking] = useState<number>(10);
  const [isMakingModalVisible, setMakingModalVisible] = useState(false);

  const makingOptions = Array.from({ length: 26 }, (_, i) => i);

  const calculation = useMemo(() => {
    const rateData = sampleRates.find(r => r.metal_type === selectedMetal) || sampleRates[0];
    const weightNum = parseFloat(weightText);
    
    // Handle empty gracefully
    if (isNaN(weightNum) || weightNum === 0) {
      return { result: null, error: null };
    }

    try {
      const ratePaise = rupeesToPaise(rateData.rate_per_gram);
      const weightMg = gramsToMg(weightNum);
      const makingPercent = BigInt(making);
      
      const result = estimatePrice({
        ratePaisePerGram: ratePaise,
        weightMg,
        makingPercent
      });
      
      return { result, error: null };
    } catch (e: any) {
      return { result: null, error: e.message };
    }
  }, [selectedMetal, weightText, making]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Tabs.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.logoMark}>JMDJ</Text>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Estimate Calculator</Text>

        {/* Metal Selector */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Select Metal</Text>
          <View style={styles.chipRow}>
            {sampleRates.map(rate => (
              <Pressable 
                key={rate.metal_type}
                style={[styles.chip, selectedMetal === rate.metal_type && styles.chipActive]}
                onPress={() => setSelectedMetal(rate.metal_type)}
              >
                <Text style={[styles.chipText, selectedMetal === rate.metal_type && styles.chipTextActive]}>
                  {rate.metal_name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Weight Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Weight (Grams)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weightText}
              onChangeText={text => {
                const filtered = text.replace(/[^0-9.]/g, '');
                const parts = filtered.split('.');
                if (parts.length > 2) return; // Only one decimal point
                if (parts[1] && parts[1].length > 3) return; // Up to 3 decimal places
                setWeightText(filtered);
              }}
              placeholder="0.000"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={styles.inputSuffix}>g</Text>
          </View>
        </View>

        {/* Making Charge Selector */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Making Charge (%)</Text>
          <Pressable 
            style={styles.selectorButton}
            onPress={() => setMakingModalVisible(true)}
          >
            <Text style={styles.selectorButtonText}>{making}%</Text>
            <Feather name="chevron-down" size={20} color={theme.colors.textDark} />
          </Pressable>
        </View>

        {/* Breakdown Card */}
        <View style={styles.breakdownCard}>
          {calculation.error ? (
            <Text style={styles.errorText}>Invalid input: {calculation.error}</Text>
          ) : !calculation.result ? (
            <Text style={styles.emptyText}>Enter a valid weight to see the estimate.</Text>
          ) : (
            <>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Metal value</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(calculation.result.metalValuePaise)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Making ({making}%)</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(calculation.result.makingPaise)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>GST (3%)</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(calculation.result.gstPaise)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Estimate</Text>
                <Text style={styles.totalValue}>{formatCurrency(calculation.result.displayRupees * 100n)}</Text>
              </View>
            </>
          )}
        </View>
        
        <Text style={styles.disclaimer}>
          This is an estimate. Final making charges are set in-store.
        </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Making Charge Modal */}
      <Modal visible={isMakingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Making Charge</Text>
              <Pressable onPress={() => setMakingModalVisible(false)} style={styles.modalClose}>
                <Feather name="x" size={24} color={theme.colors.textDark} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {makingOptions.map(opt => (
                <Pressable 
                  key={opt} 
                  style={styles.modalOption}
                  onPress={() => {
                    setMaking(opt);
                    setMakingModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, making === opt && styles.modalOptionTextActive]}>
                    {opt}%
                  </Text>
                  {making === opt && <Feather name="check" size={20} color={theme.colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoMark: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // padding for scrolling
  },
  pageTitle: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xl,
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
  },
  chipTextActive: {
    color: theme.colors.surface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
  },
  inputSuffix: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  selectorButtonText: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
  },
  breakdownCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  breakdownLabel: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  breakdownValue: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.primaryDark,
  },
  totalValue: {
    fontFamily: theme.typography.family.sansBold,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.primaryDark,
    fontVariant: ['tabular-nums'],
  },
  emptyText: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.typography.family.sansMedium,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  disclaimer: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    height: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontFamily: theme.typography.family.serif,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.textDark,
  },
  modalClose: {
    padding: 4,
  },
  modalScroll: {
    padding: theme.spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOptionText: {
    fontFamily: theme.typography.family.sans,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textDark,
  },
  modalOptionTextActive: {
    fontFamily: theme.typography.family.sansBold,
    color: theme.colors.primary,
  },
});
