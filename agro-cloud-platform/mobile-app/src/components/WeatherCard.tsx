import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { WeatherForecastResponse, ForecastDay } from '../services/api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme/theme';

interface WeatherCardProps {
  weather: WeatherForecastResponse | null;
  loading: boolean;
  onRefreshLocation: () => void;
  locationError?: string | null;
  hasPermission?: boolean;
}

// Map OpenWeather icon code to descriptive emoji if image fails
function getWeatherEmoji(icon: string, main: string): string {
  if (main === 'Rain') return '🌧️';
  if (main === 'Thunderstorm') return '⛈️';
  if (main === 'Drizzle') return '🌦️';
  if (main === 'Snow') return '❄️';
  if (main === 'Clouds') return icon.includes('02') || icon.includes('03') ? '⛅' : '☁️';
  if (main === 'Clear') return icon.includes('n') ? '🌙' : '☀️';
  if (main === 'Mist' || main === 'Fog' || main === 'Haze') return '🌫️';
  return '⛅';
}

function formatDateShort(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
      return `${parseInt(parts[2], 10)} ${month}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

export default function WeatherCard({
  weather,
  loading,
  onRefreshLocation,
  locationError,
  hasPermission = true,
}: WeatherCardProps) {
  // If loading and no cached weather yet
  if (loading && !weather) {
    return (
      <Card style={styles.cardContainer}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1E88E5" />
          <Text style={styles.loadingText}>Fetching live weather for your farm GPS coordinates...</Text>
        </Card.Content>
      </Card>
    );
  }

  // Graceful Neutral Placeholder if location permission is denied or no weather data
  if (!weather || locationError) {
    return (
      <Card style={styles.placeholderCard}>
        <Card.Content>
          <View style={styles.placeholderHeader}>
            <View style={styles.placeholderBadgeRow}>
              <Chip
                icon="map-marker"
                style={styles.gpsPlaceholderBadge}
                textStyle={{ color: '#546E7A', fontSize: 10, fontWeight: 'bold' }}
              >
                LIVE WEATHER
              </Chip>
            </View>
            <Text style={styles.placeholderIcon}>🌦️</Text>
            <Title style={styles.placeholderTitle}>Enable Live GPS Weather</Title>
            <Paragraph style={styles.placeholderDesc}>
              {locationError ||
                'Allow Krishi Setu to access your device GPS to fetch real-time temperature, rainfall likelihood, and 5-day crop weather guidance.'}
            </Paragraph>
            <Button
              mode="contained"
              icon="crosshairs-gps"
              onPress={onRefreshLocation}
              loading={loading}
              disabled={loading}
              style={styles.enableLocationBtn}
              buttonColor="#1976D2"
            >
              Detect My GPS Location
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const { current, forecast_5d, guidance_text, guidance_type } = weather;

  // Guidance card color styling
  let guidanceStyle = styles.guidanceFavorable;
  let guidanceIcon = '🌱';
  let guidanceTitle = 'Agronomic Weather Advisory';

  if (guidance_type === 'rain_alert') {
    guidanceStyle = styles.guidanceRain;
    guidanceIcon = '🌧️';
    guidanceTitle = 'Precipitation Alert';
  } else if (guidance_type === 'dry_spell') {
    guidanceStyle = styles.guidanceDry;
    guidanceIcon = '☀️';
    guidanceTitle = 'Dry Spell / Heat Advisory';
  } else if (guidance_type === 'wind_alert') {
    guidanceStyle = styles.guidanceWind;
    guidanceIcon = '💨';
    guidanceTitle = 'High Wind Warning';
  }

  return (
    <Card style={styles.cardContainer}>
      {/* Top Header with Live Badge & Location */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveBadgeText}>LIVE WEATHER</Text>
            <Text style={styles.liveSourceText}>(Real GPS)</Text>
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {weather.city_name || 'Farm Location'}
            {weather.country ? `, ${weather.country}` : ''}
          </Text>
          <Text style={styles.coordText}>
            GPS: {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={onRefreshLocation}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size={16} color="#0D47A1" />
          ) : (
            <Text style={styles.refreshEmoji}>🔄</Text>
          )}
        </TouchableOpacity>
      </View>

      <Card.Content style={styles.cardContent}>
        {/* Current Weather Main Banner */}
        <View style={styles.currentWeatherRow}>
          <View style={styles.tempSection}>
            <Text style={styles.currentTemp}>{Math.round(current.temp)}°C</Text>
            <Text style={styles.weatherDescription}>{current.weather_description}</Text>
            <Text style={styles.feelsLikeText}>
              Feels like {Math.round(current.feels_like)}°C • High {Math.round(current.temp_max)}° / Low{' '}
              {Math.round(current.temp_min)}°
            </Text>
          </View>

          <View style={styles.iconSection}>
            {current.icon ? (
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${current.icon}@2x.png` }}
                style={styles.weatherIconImg}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.bigWeatherEmoji}>
                {getWeatherEmoji(current.icon, current.weather_main)}
              </Text>
            )}
          </View>
        </View>

        {/* Key Metrics Strip (Humidity, Rain, Wind, Clouds) */}
        <View style={styles.metricsStrip}>
          <View style={styles.metricItem}>
            <Text style={styles.metricEmoji}>💧</Text>
            <Text style={styles.metricVal}>{current.humidity}%</Text>
            <Text style={styles.metricLabel}>Humidity</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricEmoji}>🌧️</Text>
            <Text style={styles.metricVal}>
              {current.rain_1h_mm > 0 ? `${current.rain_1h_mm} mm` : '0 mm'}
            </Text>
            <Text style={styles.metricLabel}>Rain (1h)</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricEmoji}>💨</Text>
            <Text style={styles.metricVal}>{Math.round(current.wind_speed * 3.6)} km/h</Text>
            <Text style={styles.metricLabel}>Wind</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricEmoji}>☁️</Text>
            <Text style={styles.metricVal}>{current.clouds_pct}%</Text>
            <Text style={styles.metricLabel}>Cloud Cover</Text>
          </View>
        </View>

        {/* Practical Agronomic Weather Guidance Callout */}
        <View style={[styles.guidanceBox, guidanceStyle]}>
          <View style={styles.guidanceHeaderRow}>
            <Text style={styles.guidanceEmoji}>{guidanceIcon}</Text>
            <Text style={styles.guidanceTitleText}>{guidanceTitle}</Text>
          </View>
          <Text style={styles.guidanceBodyText}>{guidance_text}</Text>
        </View>

        {/* 5-Day Forecast Strip */}
        <Text style={styles.forecastHeader}>📅 5-Day Weather Forecast</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastScroll}
        >
          {forecast_5d.map((day: ForecastDay) => {
            const isRainDay = day.rain_prob_pct >= 30 || day.rain_mm > 0.5;
            return (
              <View
                key={day.date}
                style={[styles.forecastDayCard, isRainDay ? styles.forecastDayCardRain : null]}
              >
                <Text style={styles.forecastDayName}>{day.day_name}</Text>
                <Text style={styles.forecastDateText}>{formatDateShort(day.date)}</Text>

                {day.icon ? (
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${day.icon}.png` }}
                    style={styles.forecastIconImg}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.forecastEmoji}>
                    {getWeatherEmoji(day.icon, day.weather_main)}
                  </Text>
                )}

                <Text style={styles.forecastTempMax}>{Math.round(day.temp_max)}°</Text>
                <Text style={styles.forecastTempMin}>{Math.round(day.temp_min)}°</Text>

                {day.rain_prob_pct > 0 ? (
                  <View style={styles.rainProbBadge}>
                    <Text style={styles.rainProbText}>💧 {day.rain_prob_pct}%</Text>
                  </View>
                ) : (
                  <View style={styles.rainProbPlaceholder} />
                )}
              </View>
            );
          })}
        </ScrollView>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#E3F2FD',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C853',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0D47A1',
    letterSpacing: 0.5,
  },
  liveSourceText: {
    fontSize: 10,
    color: '#1565C0',
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  coordText: {
    fontSize: 10.5,
    color: '#546E7A',
  },
  refreshIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#90CAF9',
    elevation: 1,
  },
  refreshEmoji: {
    fontSize: 14,
  },
  cardContent: {
    padding: 14,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#1E88E5',
    textAlign: 'center',
  },
  currentWeatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tempSection: {
    flex: 1,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0D47A1',
    lineHeight: 36,
  },
  weatherDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginTop: 2,
  },
  feelsLikeText: {
    fontSize: 11.5,
    color: '#546E7A',
    marginTop: 2,
  },
  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIconImg: {
    width: 64,
    height: 64,
  },
  bigWeatherEmoji: {
    fontSize: 42,
  },
  metricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1EBF5',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#CFD8DC',
    alignSelf: 'center',
  },
  metricEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  metricLabel: {
    fontSize: 10,
    color: '#546E7A',
    marginTop: 1,
  },
  guidanceBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  guidanceRain: {
    backgroundColor: '#E3F2FD',
    borderColor: '#90CAF9',
  },
  guidanceDry: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  guidanceWind: {
    backgroundColor: '#EDE7F6',
    borderColor: '#B39DDB',
  },
  guidanceFavorable: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  guidanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  guidanceEmoji: {
    fontSize: 15,
  },
  guidanceTitleText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  guidanceBodyText: {
    fontSize: 12,
    color: '#263238',
    lineHeight: 17,
  },
  forecastHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 8,
  },
  forecastScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  forecastDayCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    width: 72,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  forecastDayCardRain: {
    backgroundColor: '#EBF3FB',
    borderColor: '#90CAF9',
  },
  forecastDayName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  forecastDateText: {
    fontSize: 9.5,
    color: '#546E7A',
    marginBottom: 2,
  },
  forecastIconImg: {
    width: 32,
    height: 32,
  },
  forecastEmoji: {
    fontSize: 20,
    marginVertical: 4,
  },
  forecastTempMax: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  forecastTempMin: {
    fontSize: 10.5,
    color: '#78909C',
  },
  rainProbBadge: {
    backgroundColor: '#E1F5FE',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 4,
  },
  rainProbText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0277BD',
  },
  rainProbPlaceholder: {
    height: 16,
    marginTop: 4,
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#CFD8DC',
    padding: 8,
  },
  placeholderHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  placeholderBadgeRow: {
    marginBottom: 6,
  },
  gpsPlaceholderBadge: {
    backgroundColor: '#ECEFF1',
    height: 22,
  },
  placeholderIcon: {
    fontSize: 36,
    marginVertical: 4,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#37474F',
    textAlign: 'center',
  },
  placeholderDesc: {
    fontSize: 12,
    color: '#607D8B',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 17,
  },
  enableLocationBtn: {
    marginTop: 6,
    borderRadius: 10,
  },
});
