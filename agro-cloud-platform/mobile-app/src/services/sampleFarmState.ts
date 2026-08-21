import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAMPLE_FARMS, SampleFarm, getSampleFarmById } from '../data/sampleFarms';

const ACTIVE_SAMPLE_FARM_KEY = '@krishi_active_sample_farm_id';

export const SampleFarmState = {
  async getActiveSampleFarmId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_SAMPLE_FARM_KEY);
    } catch {
      return null;
    }
  },

  async setActiveSampleFarmId(id: string | null): Promise<void> {
    try {
      if (id) {
        await AsyncStorage.setItem(ACTIVE_SAMPLE_FARM_KEY, id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_SAMPLE_FARM_KEY);
      }
    } catch (e) {
      console.warn('Error saving active sample farm:', e);
    }
  },

  async getActiveSampleFarm(): Promise<SampleFarm | null> {
    const id = await this.getActiveSampleFarmId();
    if (!id) return null;
    return getSampleFarmById(id) || null;
  },

  async clearSampleFarmMode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_SAMPLE_FARM_KEY);
    } catch (e) {
      console.warn('Error clearing sample farm mode:', e);
    }
  }
};
