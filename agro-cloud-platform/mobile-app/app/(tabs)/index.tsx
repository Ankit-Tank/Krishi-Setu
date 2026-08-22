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
          actions={[{ label: t('common.retrySync'), onPress: loadDashboardData }]}
        >
          <Text style={styles.bannerText}>{t('dashboard.offlineNotice')}</Text>
        </Banner>
      )}

      {/* 2. FARM HERO / HEADER CARD */}
      <Card style={[styles.bannerCard, activeSampleFarm ? styles.bannerCardSample : null]}>
        <Card.Content style={styles.bannerCardContent}>
          <View style={styles.heroTopRow}>
            <Text style={styles.welcomeText}>
              {activeSampleFarm
                ? t('dashboard.exploringSample')
                : t('dashboard.welcomeFarmer', { name: identity?.farmer_name || t('dashboard.welcome') })}
            </Text>
            {activeSampleFarm && (
              <View style={styles.sampleHeroBadge}>
                <Text style={styles.sampleHeroBadgeText}>{t('dashboard.simulatedData')}</Text>
              </View>
            )}
          </View>

          <View style={styles.farmSelectorRow}>
            <Title style={styles.farmTitle} numberOfLines={2}>
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
                    {t('dashboard.switchFarm')}
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
            {t('dashboard.farmSummary', {
              crop: activeSampleFarm ? activeSampleFarm.crop_type : selectedFarm?.crop_type || 'Wheat',
              area: activeSampleFarm ? activeSampleFarm.area_acres : selectedFarm?.area_acres || 10,
              region: activeSampleFarm ? activeSampleFarm.region : identity?.region || 'Registered Plot',
            })}
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
          <View style={styles.quickActionHeader}>
            <Text style={{ fontSize: 22 }}>🧪</Text>
            <View style={[styles.quickActionBadge, { backgroundColor: '#C8E6C9' }]}>
              <Text style={[styles.quickActionBadgeText, { color: '#1B5E20' }]}>
                {activeSampleFarm ? t('common.active') : t('common.browse')}
              </Text>
            </View>
          </View>
          <Text style={styles.quickActionTitle} numberOfLines={1}>{t('dashboard.sampleExplorer')}</Text>
          <Text style={styles.quickActionDesc} numberOfLines={1}>{t('dashboard.realScenarios')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: '#EDE7F6', borderColor: '#C5CAE9' }]}
          onPress={() => router.push('/history')}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionHeader}>
            <Text style={{ fontSize: 22 }}>📜</Text>
            <View style={[styles.quickActionBadge, { backgroundColor: '#D1C4E9' }]}>
              <Text style={[styles.quickActionBadgeText, { color: '#4527A0' }]}>
                {t('common.view')}
              </Text>
            </View>
          </View>
          <Text style={[styles.quickActionTitle, { color: '#4527A0' }]} numberOfLines={1}>{t('dashboard.myHistory')}</Text>
          <Text style={[styles.quickActionDesc, { color: '#5E35B1' }]} numberOfLines={1}>{t('dashboard.scansTimeline')}</Text>
        </TouchableOpacity>
      </View>

      {/* 6. SIMULATED FIELD SENSORS (DEMO TELEMETRY) */}
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Title style={styles.sectionHeader}>{t('dashboard.simulatedSensors')}</Title>
          <Text style={styles.sectionSubHeader}>{t('dashboard.telemetryStream')}</Text>
        </View>
        {activeSampleFarm && (
          <View style={styles.sampleTag}>
            <Text style={styles.sampleTagText}>{t('dashboard.samplePreset')}</Text>
          </View>
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
              <View
                style={[
                  styles.sensorPill,
                  (telemetry?.soil_moisture ?? 26.5) < 20
                    ? styles.pillCritical
                    : (telemetry?.soil_moisture ?? 26.5) < 30
                    ? styles.pillWarning
                    : (telemetry?.soil_moisture ?? 26.5) > 50
                    ? styles.pillWaterlogged
                    : styles.pillGood,
                ]}
              >
                <Text
                  style={[
                    styles.sensorPillText,
                    (telemetry?.soil_moisture ?? 26.5) < 20
                      ? styles.pillTextCritical
                      : (telemetry?.soil_moisture ?? 26.5) < 30
                      ? styles.pillTextWarning
                      : (telemetry?.soil_moisture ?? 26.5) > 50
                      ? styles.pillTextWaterlogged
                      : styles.pillTextGood,
                  ]}
                >
                  {(telemetry?.soil_moisture ?? 26.5) < 20
                    ? t('dashboard.severeDrought')
                    : (telemetry?.soil_moisture ?? 26.5) < 30
                    ? t('dashboard.irrigateSoon')
                    : (telemetry?.soil_moisture ?? 26.5) > 50
                    ? t('dashboard.waterlogged')
                    : t('dashboard.optimal')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Temperature & Humidity */}
          <Card style={styles.gridCard}>
            <Card.Content style={styles.gridCardContent}>
              <Text style={styles.cardIcon}>🌡️</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.temperature')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.temperature_c ?? 24.5}°C</Title>
              <Paragraph style={{ fontSize: 11, color: '#666' }}>{t('dashboard.humidity')}: {telemetry?.humidity_pct ?? 62}%</Paragraph>
            </Card.Content>
          </Card>

          {/* Nitrogen (N) */}
          <Card style={styles.gridCard}>
            <Card.Content style={styles.gridCardContent}>
              <Text style={styles.cardIcon}>🟢</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.nitrogen')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.nitrogen_ppm ?? 105} ppm</Title>
              <View
                style={[
                  styles.sensorPill,
                  (telemetry?.nitrogen_ppm ?? 105) < 60 ? styles.pillCritical : styles.pillGood,
                ]}
              >
                <Text
                  style={[
                    styles.sensorPillText,
                    (telemetry?.nitrogen_ppm ?? 105) < 60 ? styles.pillTextCritical : styles.pillTextGood,
                  ]}
                >
                  {(telemetry?.nitrogen_ppm ?? 105) < 60 ? t('dashboard.deficient') : t('dashboard.activeNpk')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Soil pH */}
          <Card style={styles.gridCard}>
            <Card.Content style={styles.gridCardContent}>
              <Text style={styles.cardIcon}>🧪</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.ph')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.soil_ph ?? 6.8}</Title>
              <View
                style={[
                  styles.sensorPill,
                  (telemetry?.soil_ph ?? 6.8) < 6.0
                    ? styles.pillWarning
                    : (telemetry?.soil_ph ?? 6.8) > 8.0
                    ? styles.pillWarning
                    : styles.pillGood,
                ]}
              >
                <Text
                  style={[
                    styles.sensorPillText,
                    (telemetry?.soil_ph ?? 6.8) < 6.0
                      ? styles.pillTextWarning
                      : (telemetry?.soil_ph ?? 6.8) > 8.0
                      ? styles.pillTextWarning
                      : styles.pillTextGood,
                  ]}
                >
                  {(telemetry?.soil_ph ?? 6.8) < 6.0
                    ? t('dashboard.acidic')
                    : (telemetry?.soil_ph ?? 6.8) > 8.0
                    ? t('dashboard.alkaline')
                    : t('dashboard.balanced')}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* 7. ADVISORY NOTIFICATIONS */}
      <Title style={styles.sectionHeader}>
        {activeSampleFarm ? t('dashboard.scenarioAlerts') : t('dashboard.latestAlerts')}
      </Title>
      {advisories.slice(0, 3).map((adv) => (
        <Card key={adv.id} style={styles.advisoryCard}>
          <Card.Content style={styles.advisoryCardContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <Text style={{ fontWeight: 'bold', color: adv.type === 'disease' ? '#D32F2F' : '#2E7D32', flex: 1, flexShrink: 1, marginRight: 8 }} numberOfLines={2}>
                {adv.type === 'disease' ? t('dashboard.diseaseAlert') : adv.type === 'irrigation' ? t('dashboard.irrigationAlert') : t('dashboard.npkAdvice')}
              </Text>
              {!adv.is_read && <Chip style={{ backgroundColor: '#FFEBEE' }} textStyle={{ fontSize: 10 }}>{t('common.new')}</Chip>}
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
          {t('dashboard.exitSampleBtn')}
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={loadDashboardData}
          icon="refresh"
          style={styles.refreshButton}
        >
          {t('dashboard.refreshTelemetry')}
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  quickActionBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  quickActionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginTop: 2,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  sampleHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
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
    borderColor: Colors.status.warning.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  sampleTagText: {
    fontSize: 10,
    color: '#E65100',
    fontWeight: 'bold',
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
  sensorPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs + 3,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
    borderWidth: 1,
  },
  sensorPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  pillGood: {
    backgroundColor: Colors.status.healthy.bg,
    borderColor: Colors.status.healthy.border,
  },
  pillTextGood: {
    color: Colors.status.healthy.text,
  },
  pillWarning: {
    backgroundColor: Colors.status.warning.bg,
    borderColor: Colors.status.warning.border,
  },
  pillTextWarning: {
    color: Colors.status.warning.text,
  },
  pillCritical: {
    backgroundColor: Colors.status.critical.bg,
    borderColor: Colors.status.critical.border,
  },
  pillTextCritical: {
    color: Colors.status.critical.text,
  },
  pillWaterlogged: {
    backgroundColor: Colors.status.waterlogged.bg,
    borderColor: Colors.status.waterlogged.border,
  },
  pillTextWaterlogged: {
    color: Colors.status.waterlogged.text,
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

