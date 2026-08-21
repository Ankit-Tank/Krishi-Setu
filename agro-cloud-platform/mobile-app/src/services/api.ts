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
  irrigation_source?: 'borewell' | 'canal' | 'rainfed' | 'other' | string;
  experience_years?: number;
  preferred_season?: 'Kharif' | 'Rabi' | 'both' | string;
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
  experience_years?: number;
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
  irrigation_source?: string;
  preferred_season?: string;
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

export interface HistoryItem {
  id: string;
  item_type: 'leaf_scan' | 'advisory' | string;
  farm_id: number;
  farm_name: string;
  crop_type: string;
  timestamp: string;
  title: string;
  message: string;
  image_url?: string;
  predicted_disease?: string;
  confidence_score?: number;
  advisory_text?: string;
  advisory_type?: string;
  is_read?: boolean;
}

export interface FarmerHistoryResponse {
  farmer_id: number;
  farmer_name: string;
  total_items: number;
  leaf_scans_count: number;
  advisories_count: number;
  timeline: HistoryItem[];
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg?: number;
  weather_main: string;
  weather_description: string;
  icon: string;
  rain_1h_mm: number;
  clouds_pct: number;
}

export interface ForecastDay {
  date: string;
  day_name: string;
  temp_min: number;
  temp_max: number;
  temp_day: number;
  humidity: number;
  rain_prob_pct: number;
  rain_mm: number;
  weather_main: string;
  weather_description: string;
  icon: string;
}

export interface WeatherForecastResponse {
  farm_id: number;
  farm_name: string;
  city_name: string;
  country: string;
  latitude: number;
  longitude: number;
  is_live: boolean;
  current: CurrentWeather;
  forecast_5d: ForecastDay[];
  guidance_text: string;
  guidance_type: 'rain_alert' | 'dry_spell' | 'wind_alert' | 'favorable' | string;
  fetched_at: string;
}

export interface DiseasePillar {
  has_scan: boolean;
  status: 'HEALTHY' | 'DISEASED' | 'NO_SCAN' | string;
  predicted_disease?: string | null;
  confidence_score?: number | null;
  treatment_window?: string | null;
  action_text: string;
  scan_date?: string | null;
}

export interface SoilPillar {
  moisture_pct?: number | null;
  moisture_status: 'LOW' | 'OPTIMAL' | 'HIGH' | 'OFFLINE' | string;
  npk_status: 'BALANCED' | 'DEFICIENT' | 'OFFLINE' | string;
  action_text: string;
}

export interface MarketPillar {
  mandi_name: string;
  region: string;
  best_price_per_quintal: number;
  distance_km: number;
  demand_urgency: 'high' | 'medium' | 'normal' | string;
  action_text: string;
}

export interface SmartSummaryResponse {
  farm_id: number;
  farmer_id: number;
  farm_name: string;
  crop_type: string;
  headline: string;
  summary_text: string;
  urgency_level: 'HIGH' | 'MEDIUM' | 'NORMAL' | string;
  disease: DiseasePillar;
  soil_irrigation: SoilPillar;
  market: MarketPillar;
  generated_at: string;
}

const STORAGE_KEYS = {
  FARMERS: 'AGRO_OFFLINE_FARMERS',
  FARMS: 'AGRO_OFFLINE_FARMS',
  TELEMETRY: 'AGRO_OFFLINE_TELEMETRY',
  ADVISORY: 'AGRO_OFFLINE_ADVISORY',
  MANDI_PRICES: 'AGRO_OFFLINE_MANDI_PRICES',
  PRICE_FORECAST: 'AGRO_OFFLINE_PRICE_FORECAST',
  HISTORY: 'KRISHI_OFFLINE_HISTORY',
  WEATHER: 'KRISHI_OFFLINE_WEATHER',
  SMART_SUMMARY: 'KRISHI_OFFLINE_SMART_SUMMARY',
};

// Friendly user error message formatter
export function formatFriendlyErrorMessage(err: any): string {
  if (!err) return "Couldn't connect - check your WiFi and try again.";
  const msg = err.message || String(err);
  const isNetwork =
    msg.includes('Network') ||
    msg.includes('timeout') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Aborted') ||
    msg.includes('AbortError') ||
    msg.includes('Network request failed') ||
    msg.includes('refused') ||
    msg.includes('Load failed');

  if (isNetwork) {
    return "Couldn't connect - check your WiFi and try again.";
  }
  return msg || "Something went wrong. Please check your connection and try again.";
}

// Helper for network calls with abort timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 8000): Promise<Response> {
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
    if (err.name === 'AbortError' || err.message?.includes('aborted')) {
      throw new Error("Couldn't connect - request timed out. Please check your WiFi and try again.");
    }
    throw new Error(formatFriendlyErrorMessage(err));
  }
}

export const AgroApiService = {
  // Create a new farmer record on the real backend
  async createFarmer(data: {
    name: string;
    phone: string;
    preferred_language?: string;
    region?: string;
    experience_years?: number;
  }): Promise<Farmer> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farmers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          preferred_language: data.preferred_language || 'en',
          region: data.region || 'Punjab',
          experience_years: data.experience_years ?? 0,
        })
      }, 8000);

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(errText || `Server returned status ${response.status}`);
    } catch (err: any) {
      console.warn('Backend createFarmer failed:', err?.message || err);
      throw new Error(formatFriendlyErrorMessage(err));
    }
  },

  // Create a new farm record on the real backend
  async createFarm(data: {
    farmer_id: number;
    name: string;
    crop_type: string;
    area_acres: number;
    latitude?: number;
    longitude?: number;
    irrigation_source?: string;
    preferred_season?: string;
  }): Promise<Farm> {
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
          longitude: data.longitude || 76.2,
          irrigation_source: data.irrigation_source || 'borewell',
          preferred_season: data.preferred_season || 'both',
        })
      }, 8000);

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(errText || `Server returned status ${response.status}`);
    } catch (err: any) {
      console.warn('Backend createFarm failed:', err?.message || err);
      throw new Error(formatFriendlyErrorMessage(err));
    }
  },

  // Update existing farmer record
  async updateFarmer(farmerId: number, data: {
    name?: string;
    phone?: string;
    preferred_language?: string;
    region?: string;
    experience_years?: number;
  }): Promise<Farmer> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farmers/${farmerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, 8000);

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(errText || `Server returned status ${response.status}`);
    } catch (err: any) {
      console.warn('Backend updateFarmer failed:', err?.message || err);
      throw new Error(formatFriendlyErrorMessage(err));
    }
  },

  // Update existing farm record
  async updateFarm(farmId: number, data: {
    name?: string;
    crop_type?: string;
    area_acres?: number;
    latitude?: number;
    longitude?: number;
    irrigation_source?: string;
    preferred_season?: string;
  }): Promise<Farm> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farms/${farmId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, 8000);

      if (response.ok) {
        return await response.json();
      }
      const errText = await response.text().catch(() => '');
      throw new Error(errText || `Server returned status ${response.status}`);
    } catch (err: any) {
      console.warn('Backend updateFarm failed:', err?.message || err);
      throw new Error(formatFriendlyErrorMessage(err));
    }
  },

  // Update farm GPS coordinates specifically
  async updateFarmLocation(farmId: number, latitude: number, longitude: number): Promise<Farm> {
    return await this.updateFarm(farmId, { latitude, longitude });
  },

  // Get all registered farmers
  async getFarmers(): Promise<{ data: Farmer[]; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farmers/`, {}, 6000);
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
      { id: 1, name: 'Gurpreet Singh', phone: '9876543210', preferred_language: 'en', region: 'Punjab', experience_years: 10, created_at: '2026-08-01' }
    ];
    return { data, isOffline: true };
  },

  // Get farms for farmer
  async getFarms(farmerId: number = 1): Promise<{ data: Farm[]; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farms/?farmer_id=${farmerId}`, {}, 6000);
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
      { id: 1, farmer_id: 1, name: 'Green Acres Wheat Farm', latitude: 30.9, longitude: 75.85, area_acres: 12.5, crop_type: 'Wheat', irrigation_source: 'borewell', preferred_season: 'both' },
      { id: 2, farmer_id: 1, name: 'Riverside Paddy Field', latitude: 30.92, longitude: 75.88, area_acres: 8.0, crop_type: 'Rice', irrigation_source: 'canal', preferred_season: 'Kharif' },
    ];
    return { data, isOffline: true };
  },

  // Get latest telemetry for a farm
  async getLatestTelemetry(farmId: number = 1): Promise<{ data: TelemetryReading | null; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/telemetry/${farmId}/latest`, {}, 6000);
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
      const response = await fetchWithTimeout(`${API_BASE_URL}/advisory/${farmId}`, {}, 6000);
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

    const response = await fetchWithTimeout(`${API_BASE_URL}/leaf-scan/upload`, {
      method: 'POST',
      body: formData
    }, 15000);

    if (!response.ok) {
      throw new Error(`Upload diagnosis failed (status ${response.status})`);
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

      const response = await fetchWithTimeout(url, {}, 6000);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/market/trade-listing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: farmerId,
        crop_type: cropType,
        quantity_quintals: quantityQuintals,
        harvest_date: harvestDate
      })
    }, 8000);

    if (!response.ok) {
      throw new Error(`Trade listing creation failed (status ${response.status})`);
    }

    return await response.json();
  },

  // Get ranked buyer matches for trade listing
  async getBuyerMatches(listingId: number): Promise<BuyerMatchResponse[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/market/matches/${listingId}`, {}, 8000);
    if (!response.ok) {
      throw new Error(`Failed to fetch buyer matches (status ${response.status})`);
    }
    return await response.json();
  },

  // Confirm trade listing and generate logistics record
  async confirmTradeListing(listingId: number, buyerMatchId: number): Promise<TradeConfirmResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/market/trade-listing/${listingId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyer_match_id: buyerMatchId })
    }, 8000);

    if (!response.ok) {
      throw new Error(`Failed to confirm trade listing (status ${response.status})`);
    }

    return await response.json();
  },

  // Get 14-day price forecast
  async get14DayPriceForecast(crop: string = 'Wheat', mandi: string = 'Khanna Mandi'): Promise<{ data: PriceForecastResult; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/market/price-forecast?crop=${encodeURIComponent(crop)}&mandi=${encodeURIComponent(mandi)}`, {}, 6000);
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
      source: 'Krishi Setu AI Engine (Offline Cache)'
    };
    return { data, isOffline: true };
  },

  // Get combined farmer history (leaf scans + advisories)
  async getFarmerHistory(farmerId: number = 1): Promise<{ data: FarmerHistoryResponse; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/farmer/${farmerId}/history`, {}, 7000);
      if (response.ok) {
        const data: FarmerHistoryResponse = await response.json();
        await AsyncStorage.setItem(`${STORAGE_KEYS.HISTORY}_${farmerId}`, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching farmer history, loading offline cache.');
    }

    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.HISTORY}_${farmerId}`);
    const data: FarmerHistoryResponse = cached ? JSON.parse(cached) : {
      farmer_id: farmerId,
      farmer_name: 'Registered Farmer',
      total_items: 0,
      leaf_scans_count: 0,
      advisories_count: 0,
      timeline: []
    };
    return { data, isOffline: true };
  },

  // Get real live weather & 5-day forecast for farm GPS location
  async getFarmWeather(farmId: number = 1): Promise<{ data: WeatherForecastResponse; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/weather/${farmId}`, {}, 8000);
      if (response.ok) {
        const data: WeatherForecastResponse = await response.json();
        await AsyncStorage.setItem(`${STORAGE_KEYS.WEATHER}_${farmId}`, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching live weather, loading offline cache.');
    }

    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.WEATHER}_${farmId}`);
    if (cached) {
      return { data: JSON.parse(cached), isOffline: true };
    }

    // Default offline fallback weather representation
    const fallback: WeatherForecastResponse = {
      farm_id: farmId,
      farm_name: 'Farm Plot',
      city_name: 'Local Region',
      country: 'IN',
      latitude: 30.9,
      longitude: 75.85,
      is_live: false,
      current: {
        temp: 28.0,
        feels_like: 30.5,
        temp_min: 24.0,
        temp_max: 33.0,
        humidity: 68,
        pressure: 1010,
        wind_speed: 3.2,
        weather_main: 'Clouds',
        weather_description: 'Partly Cloudy',
        icon: '03d',
        rain_1h_mm: 0.0,
        clouds_pct: 40,
      },
      forecast_5d: [
        { date: '2026-08-22', day_name: 'Today', temp_min: 24.0, temp_max: 33.0, temp_day: 29.0, humidity: 65, rain_prob_pct: 20, rain_mm: 0.0, weather_main: 'Clouds', weather_description: 'Partly Cloudy', icon: '03d' },
        { date: '2026-08-23', day_name: 'Tomorrow', temp_min: 25.0, temp_max: 34.0, temp_day: 30.0, humidity: 62, rain_prob_pct: 15, rain_mm: 0.0, weather_main: 'Clear', weather_description: 'Clear Sky', icon: '01d' },
        { date: '2026-08-24', day_name: 'Mon', temp_min: 25.5, temp_max: 35.0, temp_day: 31.0, humidity: 58, rain_prob_pct: 10, rain_mm: 0.0, weather_main: 'Clear', weather_description: 'Sunny', icon: '01d' },
        { date: '2026-08-25', day_name: 'Tue', temp_min: 26.0, temp_max: 36.0, temp_day: 32.0, humidity: 55, rain_prob_pct: 35, rain_mm: 1.5, weather_main: 'Rain', weather_description: 'Scattered Showers', icon: '10d' },
        { date: '2026-08-26', day_name: 'Wed', temp_min: 25.0, temp_max: 33.0, temp_day: 28.5, humidity: 72, rain_prob_pct: 60, rain_mm: 5.0, weather_main: 'Rain', weather_description: 'Moderate Rain', icon: '10d' },
      ],
      guidance_text: '⛅ Favorable weather conditions — optimal window for routine field operations and monitoring.',
      guidance_type: 'favorable',
      fetched_at: new Date().toISOString(),
    };
    return { data: fallback, isOffline: true };
  },

  // Get live weather by direct coordinates
  async getWeatherByCoords(lat: number, lon: number, farmName: string = 'My Location'): Promise<{ data: WeatherForecastResponse; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&farm_name=${encodeURIComponent(farmName)}`, {}, 8000);
      if (response.ok) {
        const data: WeatherForecastResponse = await response.json();
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching coordinate weather.');
    }
    return await this.getFarmWeather(1);
  },

  // Get all-in-one AI Smart Summary synthesizing Disease + Soil/Irrigation + Mandi Match
  async getSmartSummary(farmId: number = 1): Promise<{ data: SmartSummaryResponse; isOffline: boolean }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/advisory/${farmId}/smart-summary`, {}, 7000);
      if (response.ok) {
        const data: SmartSummaryResponse = await response.json();
        await AsyncStorage.setItem(`${STORAGE_KEYS.SMART_SUMMARY}_${farmId}`, JSON.stringify(data));
        return { data, isOffline: false };
      }
    } catch (e) {
      console.warn('Network error fetching smart summary, loading offline cache.');
    }

    const cached = await AsyncStorage.getItem(`${STORAGE_KEYS.SMART_SUMMARY}_${farmId}`);
    if (cached) {
      return { data: JSON.parse(cached), isOffline: true };
    }

    // Default fallback smart summary
    const fallback: SmartSummaryResponse = {
      farm_id: farmId,
      farmer_id: 1,
      farm_name: 'Farm Plot',
      crop_type: 'Wheat',
      headline: '🌱 AI Field & Market Recommendation',
      summary_text: 'Your wheat has no recent disease scan on record. Soil moisture is low (24.4%), irrigate today. Once harvested, Khanna Mandi currently offers the best price of ₹2,380/qtl 12km away.',
      urgency_level: 'HIGH',
      disease: {
        has_scan: false,
        status: 'NO_SCAN',
        predicted_disease: null,
        confidence_score: null,
        treatment_window: null,
        action_text: 'Take a photo to diagnose crop health.',
        scan_date: null,
      },
      soil_irrigation: {
        moisture_pct: 24.4,
        moisture_status: 'LOW',
        npk_status: 'BALANCED',
        action_text: 'Soil moisture is low (24.4%). Schedule irrigation today.',
      },
      market: {
        mandi_name: 'Khanna Mandi',
        region: 'Punjab',
        best_price_per_quintal: 2380.0,
        distance_km: 12.0,
        demand_urgency: 'high',
        action_text: 'Top price of ₹2,380/qtl available at Khanna Mandi.',
      },
      generated_at: new Date().toISOString(),
    };
    return { data: fallback, isOffline: true };
  }
};
