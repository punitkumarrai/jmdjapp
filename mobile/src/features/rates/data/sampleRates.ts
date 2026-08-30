// TODO: replace with Supabase live rates

export type MetalType = 'gold_24k' | 'gold_22k' | 'gold_18k' | 'silver';

export interface RateData {
  id: string;
  metal_type: MetalType;
  metal_name: string;
  purity: string;
  rate_per_gram: number;
  previous_rate: number;
  changePercent: number;
  effective_at: string;
  history_7d: number[];
}

export const sampleRates: RateData[] = [
  {
    id: '1',
    metal_type: 'gold_24k',
    metal_name: 'Gold 24K',
    purity: '99.9% Purity',
    rate_per_gram: 7750,
    previous_rate: 7700,
    changePercent: 0.65,
    effective_at: new Date().toISOString(),
    history_7d: [7650, 7680, 7700, 7690, 7710, 7700, 7750],
  },
  {
    id: '2',
    metal_type: 'gold_22k',
    metal_name: 'Gold 22K',
    purity: '91.6% Purity',
    rate_per_gram: 7104,
    previous_rate: 7150,
    changePercent: -0.64,
    effective_at: new Date().toISOString(),
    history_7d: [7050, 7080, 7120, 7100, 7150, 7150, 7104],
  },
  {
    id: '3',
    metal_type: 'gold_18k',
    metal_name: 'Gold 18K',
    purity: '75.0% Purity',
    rate_per_gram: 5812,
    previous_rate: 5812,
    changePercent: 0.00,
    effective_at: new Date().toISOString(),
    history_7d: [5780, 5800, 5812, 5812, 5800, 5812, 5812],
  },
  {
    id: '4',
    metal_type: 'silver',
    metal_name: 'Silver',
    purity: '99.9% Purity',
    rate_per_gram: 92,
    previous_rate: 90,
    changePercent: 2.22,
    effective_at: new Date().toISOString(),
    history_7d: [88, 89, 90, 90, 91, 90, 92],
  },
];
