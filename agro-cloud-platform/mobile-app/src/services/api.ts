import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Backend API URL: Using local network IP (192.168.1.12:8000) for Expo Go phone connection & web preview
export const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : 'http://192.168.1.12:8000';

export interface FarmerIdentity {
  farmer_id: number;
  farm_id: number;
  farmer_name: string;
  phone: string;
  farm_name: string;
  crop_type: string;
  area_acres: number;
  region: string;
}

const IDENTITY_STORAGE_KEY = '@agro_farmer_identity';

export const IdentityService = {
  async getSavedIdentity(): Promise<FarmerIdentity | null> {
    try {
      const raw = await AsyncStorage.getItem(IDENTITY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Error reading farmer identity from AsyncStorage:', e);
      return null;
    }
  },

  async saveIdentity(identity: FarmerIdentity): Promise<void> {
    try {
      await AsyncStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
    } catch (e) {
      console.warn('Error saving farmer identity to AsyncStorage:', e);
    }
  },

  async clearIdentity(): Promise<void> {
    try {
      await AsyncStorage.removeItem(IDENTITY_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing farmer identity from AsyncStorage:', e);
    }
  }
};

export interface Farmer {
  id: number;
  name: string;
  phone: string;
  preferred_language: string;
  region: string;
  created_at: string;
}

export interface Farm {
  id: number;
  farmer_id: number;
  name: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  crop_type: string;
}

export interface TelemetryReading {
  id: number;
  farm_id: number;
  timestamp: string;
  soil_moisture: number;
  soil_ph: number;
  temperature_c: number;
  humidity_pct: number;
  nitrogen_ppm: number;
  phosphorus_ppm: number;
  potassium_ppm: number;
}

export interface AdvisoryRecord {
  id: number;
  farm_id: number;
  type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface RuleBasedAdvisoryResponse {
  farm_id: number;
  crop_type: string;
  latest_telemetry: TelemetryReading | null;
  irrigation_advice: string;
  npk_advice: string;
  ph_advice: string;
  advisory_records: AdvisoryRecord[];
}

export interface LeafScanResponse {
  id: number;
  farm_id: number;
  image_url: string;
  uploaded_at: string;
  predicted_disease: string;
  confidence_score: number;
  advisory_text: string;
}

export interface MandiPrice {
  id: number;
  crop_name: string;
  mandi_name: string;
  region: string;
  price_per_quintal: number;
  date: string;
}

export interface TradeListingResponse {
  id: number;
  farmer_id: number;
  crop_type: string;
  quantity_quintals: number;
  harvest_date: string;
  status: string;
  created_at: string;
}

export interface BuyerMatchResponse {
  id: number;
  trade_listing_id: number;
  buyer_name: string;
  mandi_name: string;
  distance_km: number;
  offered_price: number;
  demand_urgency?: string;
  logistics_note: string;
  score?: number;
  explanation?: string;
}

export interface LogisticsRecordResponse {
  id: number;
  trade_listing_id: number;
  buyer_match_id: number;
  pickup_date: string;
  transporter_name: string;
  estimated_transit_hours: number;
  created_at: string;
}

export interface TradeConfirmResponse {
  trade_listing_id: number;
  status: string;
  selected_buyer_name: string;
  mandi_name: string;
  offered_price: number;
  logistics: LogisticsRecordResponse;
}

export interface PriceForecastResult {
  crop_name: string;
  mandi_name: string;
  current_price: number;
  forecast_dates: string[];
  forecast_prices: number[];
  projected_max_price: number;
  best_time_to_sell_recommendation: string;
  source: string;
}

const STORAGE_KEYS = {
  FARMERS: 'AGRO_OFFLINE_FARMERS',
  FARMS: 'AGRO_OFFLINE_FARMS',
  TELEMETRY: 'AGRO_OFFLINE_TELEMETRY',
  ADVISORY: 'AGRO_OFFLINE_ADVISORY',
  MANDI_PRICES: 'AGRO_OFFLINE_MANDI_PRICES',
  PRICE_FORECAST: 'AGRO_OFFLINE_PRICE_FORECAST',
};

// Helper for network calls with abort timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Network timeout (${timeoutMs / 1000}s) connecting to ${url}`);
    }
    throw err;
  }
}

export const AgroApiService = {
  // Create a new farmer record on the real backend
  async createFarmer(data: { name: string; phone: string; preferred_language?: string; region?: string }): Promise<Farmer> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farmers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          preferred_language: data.preferred_language || 'hi',
          region: data.region || 'Punjab'
        })
      }, 10000);

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(`Server returned status ${response.status}: ${errText || response.statusText}`);
    } catch (err: any) {
      console.warn('Backend createFarmer failed:', err?.message || err);
      throw err;
    }
  },

  // Create a new farm record on the real backend
  async createFarm(data: { farmer_id: number; name: string; crop_type: string; area_acres: number; latitude?: number; longitude?: number }): Promise<Farm> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: data.farmer_id,
          name: data.name,
          crop_type: data.crop_type,
          area_acres: data.area_acres,
          latitude: data.latitude || 30.7,
          longitude: data.longitude || 76.2
        })
      }, 10000);

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(`Server returned status ${response.status}: ${errText || response.statusText}`);
    } catch (err: any) {
      console.warn('Backend createFarm failed:', err?.message || err);
      throw err;
    }
  },
  // Get all registered farmers
  async getFarmers(): Promise<{ data: Farmer[]; isOffline: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/farmers/`);
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching farmers, loading offline cache.');
    }
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.FARMERS);
    const data = cached ? JSON.parse(cached) : [
      { id: 1, name: 'Gurpreet Singh', phone: '9876543210', preferred_language: 'en', region: 'Punjab', created_at: '2026-08-01' }
    ];
    return { data, isOffline: true };
  },

  // Get farms for farmer
  async getFarms(farmerId: number = 1): Promise<{ data: Farm[]; isOffline: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/farms/?farmer_id=${farmerId}`);
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem(`${STORAGE_KEYS.FARMS}_${farmerId}`, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching farms, loading offline cache.');
    }
    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.FARMS}_${farmerId}`);
    const data = cached ? JSON.parse(cached) : [
      { id: 1, farmer_id: 1, name: 'Green Acres Wheat Farm', latitude: 30.9, longitude: 75.85, area_acres: 12.5, crop_type: 'Wheat' },
      { id: 2, farmer_id: 1, name: 'Riverside Paddy Field', latitude: 30.92, longitude: 75.88, area_acres: 8.0, crop_type: 'Rice' },
    ];
    return { data, isOffline: true };
  },

  // Get latest telemetry for a farm
  async getLatestTelemetry(farmId: number = 1): Promise<{ data: TelemetryReading | null; isOffline: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/${farmId}/latest`);
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem(`${STORAGE_KEYS.TELEMETRY}_${farmId}`, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching telemetry, loading offline cache.');
    }
    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.TELEMETRY}_${farmId}`);
    const data = cached ? JSON.parse(cached) : {
      id: 1,
      farm_id: farmId,
      timestamp: new Date().toISOString(),
      soil_moisture: 26.5,
      soil_ph: 6.8,
      temperature_c: 24.5,
      humidity_pct: 62.0,
      nitrogen_ppm: 105.0,
      phosphorus_ppm: 22.0,
      potassium_ppm: 120.0
    };
    return { data, isOffline: true };
  },

  // Get advisory records & precision recommendations for a farm
  async getAdvisories(farmId: number = 1): Promise<{ data: RuleBasedAdvisoryResponse; isOffline: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/advisory/${farmId}`);
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem(`${STORAGE_KEYS.ADVISORY}_${farmId}`, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching advisories, loading offline cache.');
    }
    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.ADVISORY}_${farmId}`);
    const data = cached ? JSON.parse(cached) : {
      farm_id: farmId,
      crop_type: 'Wheat',
      latest_telemetry: null,
      irrigation_advice: '[Offline Cache] Irrigation Alert: Soil moisture 26.5%. Recommend 25mm irrigation.',
      npk_advice: '[Offline Cache] NPK Recommendation: Top-dress Urea @ 25 kg/acre',
      ph_advice: 'OPTIMAL pH (pH 6.8)',
      advisory_records: [
        { id: 1, farm_id: farmId, type: 'irrigation', message: 'Soil moisture low (26.5%). Apply irrigation.', created_at: new Date().toISOString(), is_read: false },
        { id: 2, farm_id: farmId, type: 'npk', message: 'Nitrogen levels sub-optimal. Top-dress Urea @ 25 kg/acre.', created_at: new Date().toISOString(), is_read: true }
      ]
    };
    return { data, isOffline: true };
  },

  // Upload leaf scan image to AI Engine via backend
  async uploadLeafScan(farmId: number, fileUri: string, filename: string = 'leaf.jpg'): Promise<LeafScanResponse> {
    const formData = new FormData();
    formData.append('farm_id', String(farmId));

    if (Platform.OS === 'web') {
      const res = await fetch(fileUri);
      const blob = await res.blob();
      formData.append('file', blob, filename);
    } else {
      formData.append('file', {
        uri: fileUri,
        name: filename,
        type: 'image/jpeg'
      } as any);
    }

    const response = await fetch(`${API_BASE_URL}/leaf-scan/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return await response.json();
  },

  // Get mandi prices
  async getMandiPrices(crop?: string, region?: string): Promise<{ data: MandiPrice[]; isOffline: boolean }> {
    try {
      let url = `${API_BASE_URL}/market/prices`;
      const params = new URLSearchParams();
      if (crop) params.append('crop', crop);
      if (region) params.append('region', region);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem(STORAGE_KEYS.MANDI_PRICES, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching Mandi prices, loading offline cache.');
    }

    const cached = await AsyncStorage.getItem(STORAGE_KEYS.MANDI_PRICES);
    const data = cached ? JSON.parse(cached) : [
      { id: 1, crop_name: 'Wheat', mandi_name: 'Khanna Mandi', region: 'Punjab', price_per_quintal: 2380.0, date: '2026-08-20' },
      { id: 2, crop_name: 'Wheat', mandi_name: 'Ludhiana APMC', region: 'Punjab', price_per_quintal: 2360.0, date: '2026-08-20' },
      { id: 3, crop_name: 'Paddy / Rice', mandi_name: 'Karnal Mandi', region: 'Haryana', price_per_quintal: 3950.0, date: '2026-08-20' },
    ];
    return { data, isOffline: true };
  },

  // Create trade listing for harvest sale
  async createTradeListing(farmerId: number, cropType: string, quantityQuintals: number, harvestDate: string): Promise<TradeListingResponse> {
    const response = await fetch(`${API_BASE_URL}/market/trade-listing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: farmerId,
        crop_type: cropType,
        quantity_quintals: quantityQuintals,
        harvest_date: harvestDate
      })
    });

    if (!response.ok) {
      throw new Error(`Trade listing creation failed: ${response.status}`);
    }

    return await response.json();
  },

  // Get ranked buyer matches for trade listing
  async getBuyerMatches(listingId: number): Promise<BuyerMatchResponse[]> {
    const response = await fetch(`${API_BASE_URL}/market/matches/${listingId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch buyer matches: ${response.status}`);
    }
    return await response.json();
  },

  // Confirm trade listing and generate logistics record
  async confirmTradeListing(listingId: number, buyerMatchId: number): Promise<TradeConfirmResponse> {
    const response = await fetch(`${API_BASE_URL}/market/trade-listing/${listingId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyer_match_id: buyerMatchId })
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm trade listing: ${response.status}`);
    }

    return await response.json();
  },

  // Get 14-day price forecast
  async get14DayPriceForecast(crop: string = 'Wheat', mandi: string = 'Khanna Mandi'): Promise<{ data: PriceForecastResult; isOffline: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/market/price-forecast?crop=${encodeURIComponent(crop)}&mandi=${encodeURIComponent(mandi)}`);
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem(STORAGE_KEYS.PRICE_FORECAST, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching price forecast, loading offline cache.');
    }

    const cached = await AsyncStorage.getItem(STORAGE_KEYS.PRICE_FORECAST);
    const data = cached ? JSON.parse(cached) : {
      crop_name: crop,
      mandi_name: mandi,
      current_price: 2350.0,
      forecast_dates: ['2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27'],
      forecast_prices: [2360, 2375, 2390, 2410, 2430, 2450, 2470],
      projected_max_price: 2470.0,
      best_time_to_sell_recommendation: `Optimal selling window for ${crop} at ${mandi}: Sell in 7 days to capture peak price of INR 2,470.00/quintal.`,
      source: 'Agro-Cloud AI Engine (Offline Cache)'
    };
    return { data, isOffline: true };
  }
};
