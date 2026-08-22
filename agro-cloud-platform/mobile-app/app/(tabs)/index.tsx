import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, Button, ActivityIndicator, Banner, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  AgroApiService,
  IdentityService,
  FarmerIdentity,
  Farm,
  TelemetryReading,
  AdvisoryRecord,
  WeatherForecastResponse,
  SmartSummaryResponse,
} from '../../src/services/api';
import { LocationService } from '../../src/services/location';
import { NotificationService } from '../../src/services/notifications';
import { SampleFarm } from '../../src/data/sampleFarms';
import { SampleFarmState } from '../../src/services/sampleFarmState';
import SampleFarmBanner from '../../src/components/SampleFarmBanner';
import SampleFarmsModal from '../../src/components/SampleFarmsModal';
import WeatherCard from '../../src/components/WeatherCard';
import SmartSummaryCard from '../../src/components/SmartSummaryCard';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/theme/theme';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [identity, setIdentity] = useState<FarmerIdentity | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [activeSampleFarm, setActiveSampleFarm] = useState<SampleFarm | null>(null);
  const [sampleModalVisible, setSampleModalVisible] = useState(false);

  const [telemetry, setTelemetry] = useState<TelemetryReading | null>(null);
  const [advisories, setAdvisories] = useState<AdvisoryRecord[]>([]);
  const [weather, setWeather] = useState<WeatherForecastResponse | null>(null);
  const [smartSummary, setSmartSummary] = useState<SmartSummaryResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Check Saved Per-Device Identity (Farmer's Real Data)
      const savedIdentity = await IdentityService.getSavedIdentity();
      if (!savedIdentity) {
        router.replace('/onboarding');
        return;
      }
      setIdentity(savedIdentity);

      // 2. Check if a Sample Farm Preview is currently active
      const currentSample = await SampleFarmState.getActiveSampleFarm();
      if (currentSample) {
        setActiveSampleFarm(currentSample);
        setTelemetry({
          id: 999,
          farm_id: 999,
          soil_moisture: currentSample.telemetry.soil_moisture,
          temperature_c: currentSample.telemetry.temperature_c,
          humidity_pct: currentSample.telemetry.humidity_pct,
          nitrogen_ppm: currentSample.telemetry.nitrogen_ppm,
          phosphorus_ppm: currentSample.telemetry.phosphorus_ppm,
          potassium_ppm: currentSample.telemetry.potassium_ppm,
          soil_ph: currentSample.telemetry.soil_ph,
          timestamp: new Date().toISOString()
        });
        setAdvisories(currentSample.advisory.advisory_records as any);
        setIsOffline(false);
        
        // Synthesize smart summary for sample scenario
        const isDrought = currentSample.telemetry.soil_moisture < 25.0;
        const diseaseAdv = currentSample.advisory.advisory_records?.find(r => r.type === 'disease');
        const hasDisease = currentSample.condition_tag === 'disease_risk' || !!diseaseAdv;
        const diseaseName = diseaseAdv ? diseaseAdv.message.split('.')[0] : (hasDisease ? 'Foliar Blight Risk' : 'Healthy Foliage');
        setSmartSummary({
          farm_id: 999,
          farmer_id: 999,
          farm_name: currentSample.name,
          crop_type: currentSample.crop_type,
          headline: hasDisease || isDrought ? '⚠️ Urgent Field & Market Action Recommended' : '✅ Crop Health & Market Alignment on Track',
          summary_text: `${hasDisease ? `Your ${currentSample.crop_type.toLowerCase()} shows ${diseaseName.toLowerCase()} — treat within 48 hours.` : `Your ${currentSample.crop_type.toLowerCase()} shows healthy foliage.`} ${isDrought ? `Soil moisture is low (${currentSample.telemetry.soil_moisture}%), irrigate today.` : `Soil moisture is optimal (${currentSample.telemetry.soil_moisture}%).`} Once harvested, Khanna Mandi currently offers the top price of ₹2,380/qtl 12km away.`,
          urgency_level: hasDisease || isDrought ? 'HIGH' : 'NORMAL',
          disease: {
            has_scan: true,
            status: hasDisease ? 'DISEASED' : 'HEALTHY',
            predicted_disease: diseaseName,
            confidence_score: 0.94,
            treatment_window: hasDisease ? 'within 48 hours' : null,
            action_text: hasDisease ? `Apply treatment for ${diseaseName}.` : 'Canopy is healthy.',
          },
          soil_irrigation: {
            moisture_pct: currentSample.telemetry.soil_moisture,
            moisture_status: isDrought ? 'LOW' : 'OPTIMAL',
            npk_status: currentSample.telemetry.nitrogen_ppm < 100 ? 'DEFICIENT' : 'BALANCED',
            action_text: isDrought ? 'Irrigate today to prevent stress.' : 'Moisture is balanced.',
          },
          market: {
            mandi_name: 'Khanna Mandi',
            region: currentSample.region,
            best_price_per_quintal: 2380.0,
            distance_km: 12.0,
            demand_urgency: 'high',
            action_text: 'Top regional rate at Khanna Mandi.',
          },
          generated_at: new Date().toISOString(),
        });

        // Fetch weather for sample farm coordinates
        try {
          const sampleWeatherRes = await AgroApiService.getFarmWeather(1);
          setWeather(sampleWeatherRes.data);
        } catch (we) {
          console.warn('Sample weather fetch error:', we);
        }

        setLoading(false);
        return;
      }

      // 3. Normal Flow: Load Farmer's Real Onboarded Farm
      setActiveSampleFarm(null);
      const farmsRes = await AgroApiService.getFarms(savedIdentity.farmer_id);
      setFarms(farmsRes.data);

      let farm = farmsRes.data.find(f => f.id === savedIdentity.farm_id) || (farmsRes.data.length > 0 ? farmsRes.data[0] : null);
      if (!farm && savedIdentity.farm_id) {
        farm = {
          id: savedIdentity.farm_id,
          farmer_id: savedIdentity.farmer_id,
          name: savedIdentity.farm_name,
          area_acres: savedIdentity.area_acres,
          crop_type: savedIdentity.crop_type,
          latitude: 30.9010,
          longitude: 75.8573
        };
      }
      setSelectedFarm(farm);

      if (farm) {
        const [telRes, advRes, weatherRes, summaryRes] = await Promise.all([
          AgroApiService.getLatestTelemetry(farm.id),
          AgroApiService.getAdvisories(farm.id),
          AgroApiService.getFarmWeather(farm.id).catch(() => ({ data: null, isOffline: true })),
          AgroApiService.getSmartSummary(farm.id).catch(() => ({ data: null, isOffline: true }))
        ]);

        setTelemetry(telRes.data);
        setAdvisories(advRes.data.advisory_records || []);
        if (weatherRes && weatherRes.data) {
          setWeather(weatherRes.data);
        }
        if (summaryRes && summaryRes.data) {
          setSmartSummary(summaryRes.data);
        }
        setIsOffline(farmsRes.isOffline || telRes.isOffline || advRes.isOffline || summaryRes.isOffline);

        if (advRes.data.advisory_records && advRes.data.advisory_records.length > 0) {
          const topAdv = advRes.data.advisory_records[0];
          if (topAdv.type === 'disease' || topAdv.type === 'irrigation') {
            NotificationService.scheduleAdvisoryNotification(
              `High Priority ${topAdv.type.toUpperCase()} Advisory`,
              topAdv.message
            );
          }
        }
      }
    } catch (err) {
      console.warn('Dashboard data loading error:', err);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSmartSummary = async () => {
    if (!selectedFarm) return;
    setSummaryLoading(true);
    try {
      const res = await AgroApiService.getSmartSummary(selectedFarm.id);
      if (res && res.data) {
        setSmartSummary(res.data);
      }
    } catch (err) {
      console.warn('Error refreshing smart summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRefreshLocationAndWeather = async () => {
    if (!selectedFarm) return;
    setWeatherLoading(true);
    try {
      const loc = await LocationService.getCurrentLocation();
      if (loc.permissionGranted && loc.latitude && loc.longitude) {
        // Sync GPS coordinates to farm in backend
        await AgroApiService.updateFarmLocation(selectedFarm.id, loc.latitude, loc.longitude);
        setLocationError(null);
      } else if (loc.error) {
        setLocationError(loc.error);
      }
      // Re-fetch weather
      const wRes = await AgroApiService.getFarmWeather(selectedFarm.id);
      if (wRes && wRes.data) {
        setWeather(wRes.data);
      }
    } catch (e: any) {
      console.warn('Error refreshing live weather:', e);
      setLocationError(e?.message || 'Could not refresh weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSelectSampleFarm = async (sampleFarm: SampleFarm) => {
    await SampleFarmState.setActiveSampleFarmId(sampleFarm.id);
    setActiveSampleFarm(sampleFarm);
    setTelemetry({
      id: 999,
      farm_id: 999,
      soil_moisture: sampleFarm.telemetry.soil_moisture,
      temperature_c: sampleFarm.telemetry.temperature_c,
      humidity_pct: sampleFarm.telemetry.humidity_pct,
      nitrogen_ppm: sampleFarm.telemetry.nitrogen_ppm,
      phosphorus_ppm: sampleFarm.telemetry.phosphorus_ppm,
      potassium_ppm: sampleFarm.telemetry.potassium_ppm,
      soil_ph: sampleFarm.telemetry.soil_ph,
      timestamp: new Date().toISOString()
    });
    setAdvisories(sampleFarm.advisory.advisory_records as any);
  };

  const handleExitSampleMode = async () => {
    await SampleFarmState.clearSampleFarmMode();
    setActiveSampleFarm(null);
    loadDashboardData();
  };

  const handleSelectRealFarm = async (farm: Farm) => {
    await handleExitSampleMode();
    setSelectedFarm(farm);
    setMenuVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. SAMPLE DATA WARNING BANNER IF IN EXPLORE MODE */}
      {activeSampleFarm && (
        <SampleFarmBanner
          sampleFarm={activeSampleFarm}
          onExitSampleMode={handleExitSampleMode}
        />
      )}

      {/* Offline Banner for Real Data */}
      {!activeSampleFarm && isOffline && (
        <Banner
          visible={true}
          icon="wifi-off"
          style={styles.offlineBanner}
          actions={[{ label: 'Retry Sync', onPress: loadDashboardData }]}
        >
          <Text style={styles.bannerText}>⚡ Offline Mode — Showing last synced data</Text>
        </Banner>
      )}

      {/* 2. FARM HERO / HEADER CARD */}
      <Card style={[styles.bannerCard, activeSampleFarm ? styles.bannerCardSample : null]}>
        <Card.Content style={styles.bannerCardContent}>
          <View style={styles.heroTopRow}>
            <Text style={styles.welcomeText}>
              {activeSampleFarm ? '🧪 EXPLORING SAMPLE PROFILE' : `Welcome, ${identity?.farmer_name || 'Farmer'} 👋`}
            </Text>
            {activeSampleFarm && (
              <Chip style={styles.sampleHeroBadge} textStyle={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
                SIMULATED DATA
              </Chip>
            )}
          </View>

          <View style={styles.farmSelectorRow}>
            <Title style={styles.farmTitle} numberOfLines={1} ellipsizeMode="tail">
              {activeSampleFarm
                ? `🌾 ${activeSampleFarm.name}`
                : `🚜 ${selectedFarm ? selectedFarm.name : 'My Farm Plot'}`}
            </Title>

            {!activeSampleFarm && farms.length > 1 && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    labelStyle={{ color: '#FFF', fontSize: 12, marginVertical: 2, marginHorizontal: 8 }}
                    style={{ borderColor: 'rgba(255,255,255,0.7)', borderRadius: 8 }}
                    compact
                  >
                    Switch Farm ▾
                  </Button>
                }
              >
                {farms.map((f) => (
                  <Menu.Item
                    key={f.id}
                    onPress={() => handleSelectRealFarm(f)}
                    title={`${f.name} (${f.crop_type})`}
                  />
                ))}
              </Menu>
            )}
          </View>

          <Paragraph style={styles.bannerSubtitle}>
            📍 Crop: {activeSampleFarm ? activeSampleFarm.crop_type : selectedFarm?.crop_type || 'Wheat'} • Area: {activeSampleFarm ? activeSampleFarm.area_acres : selectedFarm?.area_acres || 10} Acres • Region: {activeSampleFarm ? activeSampleFarm.region : identity?.region || 'Registered Plot'}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* 3. AI SMART SUMMARY (HERO FOCAL POINT CARD) */}
      <SmartSummaryCard
        summary={smartSummary}
        loading={summaryLoading || (loading && !smartSummary)}
        onRefresh={handleRefreshSmartSummary}
      />

      {/* 4. REAL LIVE WEATHER & 5-DAY FORECAST (REAL GPS) */}
      <WeatherCard
        weather={weather}
        loading={weatherLoading || (loading && !weather)}
        onRefreshLocation={handleRefreshLocationAndWeather}
        locationError={locationError}
        hasPermission={!locationError}
      />

      {/* 5. QUICK ACTIONS: SAMPLE EXPLORER & MY ACTIVITY HISTORY */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}
          onPress={() => setSampleModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 20 }}>🧪</Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.quickActionTitle}>Sample Explorer</Text>
            <Text style={styles.quickActionDesc}>12 Real Scenarios</Text>
          </View>
          <Chip style={{ backgroundColor: '#C8E6C9', height: 22 }} textStyle={{ fontSize: 9, color: '#1B5E20', fontWeight: 'bold' }}>
            {activeSampleFarm ? "ACTIVE" : "BROWSE"}
          </Chip>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: '#EDE7F6', borderColor: '#C5CAE9' }]}
          onPress={() => router.push('/history')}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 20 }}>📜</Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.quickActionTitle, { color: '#4527A0' }]}>My History</Text>
            <Text style={[styles.quickActionDesc, { color: '#5E35B1' }]}>Scans & Timeline</Text>
          </View>
          <Chip style={{ backgroundColor: '#D1C4E9', height: 22 }} textStyle={{ fontSize: 9, color: '#4527A0', fontWeight: 'bold' }}>
            VIEW
          </Chip>
        </TouchableOpacity>
      </View>

      {/* 6. SIMULATED FIELD SENSORS (DEMO TELEMETRY) */}
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Title style={styles.sectionHeader}>🧪 Simulated Field Sensors (Demo)</Title>
          <Text style={styles.sectionSubHeader}>Hardware IoT node telemetry stream</Text>
        </View>
        {activeSampleFarm && (
          <Chip style={styles.sampleTag} textStyle={{ fontSize: 10, color: '#E65100', fontWeight: 'bold' }}>
            Sample Preset
          </Chip>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 30 }} size="large" color="#2E7D32" />
      ) : (
        <View style={styles.grid}>
          {/* Soil Moisture */}
          <Card style={styles.gridCard}>
            <Card.Content style={styles.gridCardContent}>
              <Text style={styles.cardIcon}>💧</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.moisture')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.soil_moisture ?? 26.5}%</Title>
              <Chip
                icon="water"
                style={
                  (telemetry?.soil_moisture ?? 26.5) < 20
                    ? styles.chipCritical
                    : (telemetry?.soil_moisture ?? 26.5) < 30
                    ? styles.chipWarning
                    : (telemetry?.soil_moisture ?? 26.5) > 50
                    ? styles.chipWaterlogged
                    : styles.chipGood
                }
                textStyle={{ fontSize: 10 }}
              >
                {(telemetry?.soil_moisture ?? 26.5) < 20
                  ? 'Severe Drought'
                  : (telemetry?.soil_moisture ?? 26.5) < 30
                  ? 'Irrigate Soon'
                  : (telemetry?.soil_moisture ?? 26.5) > 50
                  ? 'Waterlogged'
                  : 'Optimal'}
              </Chip>
            </Card.Content>
          </Card>

          {/* Temperature & Humidity */}
          <Card style={styles.gridCard}>
            <Card.Content style={styles.gridCardContent}>
              <Text style={styles.cardIcon}>🌡️</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.temperature')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.temperature_c ?? 24.5}°C</Title>
              <Paragraph style={{ fontSize: 11, color: '#666' }}>Hum: {telemetry?.humidity_pct ?? 62}%</Paragraph>
            </Card.Content>
          </Card>

          {/* Nitrogen (N) */}
          <Card style={styles.gridCard}>
            <Card.Content style={styles.gridCardContent}>
              <Text style={styles.cardIcon}>🟢</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.nitrogen')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.nitrogen_ppm ?? 105} ppm</Title>
              <Chip
                style={(telemetry?.nitrogen_ppm ?? 105) < 60 ? styles.chipCritical : styles.chipGood}
                textStyle={{ fontSize: 10 }}
              >
                {(telemetry?.nitrogen_ppm ?? 105) < 60 ? 'Deficient' : 'Active NPK'}
              </Chip>
            </Card.Content>
          </Card>

          {/* Soil pH */}
          <Card style={styles.gridCard}>
            <Card.Content style={styles.gridCardContent}>
              <Text style={styles.cardIcon}>🧪</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.ph')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.soil_ph ?? 6.8}</Title>
              <Chip
                style={
                  (telemetry?.soil_ph ?? 6.8) < 6.0
                    ? styles.chipWarning
                    : (telemetry?.soil_ph ?? 6.8) > 8.0
                    ? styles.chipWarning
                    : styles.chipGood
                }
                textStyle={{ fontSize: 10 }}
              >
                {(telemetry?.soil_ph ?? 6.8) < 6.0
                  ? 'Acidic'
                  : (telemetry?.soil_ph ?? 6.8) > 8.0
                  ? 'Alkaline'
                  : 'Balanced'}
              </Chip>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* 7. ADVISORY NOTIFICATIONS */}
      <Title style={styles.sectionHeader}>
        {activeSampleFarm ? '🔔 Scenario Advisory Alerts' : '🔔 Latest Advisory Alerts'}
      </Title>
      {advisories.slice(0, 3).map((adv) => (
        <Card key={adv.id} style={styles.advisoryCard}>
          <Card.Content style={styles.advisoryCardContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <Text style={{ fontWeight: 'bold', color: adv.type === 'disease' ? '#D32F2F' : '#2E7D32', flex: 1, flexShrink: 1, marginRight: 8 }} numberOfLines={1} ellipsizeMode="tail">
                {adv.type === 'disease' ? '🔴 Disease Alert' : adv.type === 'irrigation' ? '💧 Irrigation Advisory' : '🟢 NPK Advice'}
              </Text>
              {!adv.is_read && <Chip style={{ backgroundColor: '#FFEBEE' }} textStyle={{ fontSize: 10 }}>NEW</Chip>}
            </View>
            <Paragraph style={{ marginTop: 6, color: '#333', fontSize: 13, lineHeight: 18 }}>{adv.message}</Paragraph>
          </Card.Content>
        </Card>
      ))}

      {/* Quick Action Refresh or Exit Sample Mode */}
      {activeSampleFarm ? (
        <Button
          mode="contained"
          onPress={handleExitSampleMode}
          icon="arrow-left-circle"
          style={styles.exitSampleBtn}
        >
          Exit Sample Mode & Return to My Real Farm
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={loadDashboardData}
          icon="refresh"
          style={styles.refreshButton}
        >
          Refresh Field Telemetry
        </Button>
      )}

      {/* 8. SAMPLE FARMS EXPLORER MODAL */}
      <SampleFarmsModal
        visible={sampleModalVisible}
        onDismiss={() => setSampleModalVisible(false)}
        onSelectSampleFarm={handleSelectSampleFarm}
        onSelectRealFarm={handleExitSampleMode}
        activeSampleFarmId={activeSampleFarm?.id || null}
        realIdentity={identity}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxxl + 8,
  },
  offlineBanner: {
    backgroundColor: Colors.status.warning.bg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  bannerText: {
    color: Colors.status.warning.text,
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  quickActionDesc: {
    fontSize: 10.5,
    color: Colors.primary,
    marginTop: 1,
  },
  bannerCard: {
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Shadows.floating,
  },
  bannerCardContent: {
    padding: Spacing.md,
  },
  bannerCardSample: {
    backgroundColor: '#37474F',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: Colors.primaryTint,
    fontSize: 13,
  },
  sampleHeroBadge: {
    backgroundColor: '#FF6F00',
    height: 22,
  },
  farmSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  farmTitle: {
    color: Colors.textInverse,
    fontSize: 19,
    fontWeight: '700',
    flex: 1,
    flexShrink: 1,
    minWidth: 120,
    marginRight: Spacing.sm,
  },
  bannerSubtitle: {
    color: Colors.primaryTint,
    marginTop: Spacing.xs + 2,
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 2,
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    ...Typography.sectionHeader,
  },
  sectionSubHeader: {
    ...Typography.bodySmall,
    marginTop: 1,
  },
  sampleTag: {
    backgroundColor: Colors.status.warning.bg,
    height: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  gridCard: {
    width: '48%',
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  gridCardContent: {
    padding: Spacing.md,
  },
  cardIcon: {
    fontSize: 22,
    marginBottom: Spacing.xxs,
  },
  cardLabel: {
    ...Typography.bodySmall,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },
  chipGood: {
    backgroundColor: Colors.status.healthy.bg,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    height: 24,
  },
  chipWarning: {
    backgroundColor: Colors.status.warning.bg,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    height: 24,
  },
  chipCritical: {
    backgroundColor: Colors.status.critical.bg,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    height: 24,
  },
  chipWaterlogged: {
    backgroundColor: Colors.status.waterlogged.bg,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    height: 24,
  },
  advisoryCard: {
    marginBottom: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  advisoryCardContent: {
    padding: Spacing.md,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.md,
  },
  exitSampleBtn: {
    backgroundColor: Colors.accentDark,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.md,
  },
});

