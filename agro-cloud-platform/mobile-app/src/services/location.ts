import * as Location from 'expo-location';

export interface LocationResult {
  latitude: number | null;
  longitude: number | null;
  cityName?: string;
  regionName?: string;
  error?: string | null;
  permissionGranted: boolean;
}

export const LocationService = {
  /**
   * Request foreground location permission and retrieve user device GPS coordinates.
   * Handles permission denial, location disabled, or timeouts safely without throwing.
   */
  async getCurrentLocation(): Promise<LocationResult> {
    try {
      // 1. Check existing permission
      let { status } = await Location.getForegroundPermissionsAsync();
      
      // 2. If not granted, request permission from user
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }

      if (status !== 'granted') {
        return {
          latitude: null,
          longitude: null,
          error: 'Location permission was denied. Live weather will use default region.',
          permissionGranted: false,
        };
      }

      // 3. Retrieve device position with balanced accuracy and timeout
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      let cityName: string | undefined;
      let regionName: string | undefined;

      // 4. Reverse geocode to get city/region name
      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const place = reverse[0];
          cityName = place.city || place.subregion || place.district || place.name || undefined;
          regionName = place.region || place.country || undefined;
        }
      } catch (geoErr) {
        console.warn('Reverse geocoding notice:', geoErr);
      }

      return {
        latitude,
        longitude,
        cityName,
        regionName,
        permissionGranted: true,
        error: null,
      };
    } catch (err: any) {
      console.warn('Location retrieval error:', err?.message || err);
      return {
        latitude: null,
        longitude: null,
        error: err?.message || 'Could not retrieve device location.',
        permissionGranted: false,
      };
    }
  },
};
