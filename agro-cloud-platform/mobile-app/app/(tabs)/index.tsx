import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, Button, ActivityIndicator, Banner, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { AgroApiService, IdentityService, FarmerIdentity, Farm, TelemetryReading, AdvisoryRecord } from '../../src/services/api';
import { NotificationService } from '../../src/services/notifications';
import { SampleFarm } from '../../src/data/sampleFarms';
import { SampleFarmState } from '../../src/services/sampleFarmState';
import SampleFarmBanner from '../../src/components/SampleFarmBanner';
import SampleFarmsModal from '../../src/components/SampleFarmsModal';

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
          latitude: 30.7,
          longitude: 76.2
        };
      }
      setSelectedFarm(farm);

      if (farm) {
        const [telRes, advRes] = await Promise.all([
          AgroApiService.getLatestTelemetry(farm.id),
          AgroApiService.getAdvisories(farm.id)
        ]);

        setTelemetry(telRes.data);
        setAdvisories(advRes.data.advisory_records || []);
        setIsOffline(farmsRes.isOffline || telRes.isOffline || advRes.isOffline);

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

      {/* 2. QUICK ACTIONS: SAMPLE EXPLORER & MY ACTIVITY HISTORY */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: '#E8F5E9', borderColor: '#81C784' }]}
          onPress={() => setSampleModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 22 }}>🧪</Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.quickActionTitle}>Sample Explorer</Text>
            <Text style={styles.quickActionDesc}>12 Real Scenarios</Text>
          </View>
          <Chip style={{ backgroundColor: '#C8E6C9', height: 22 }} textStyle={{ fontSize: 9, color: '#1B5E20', fontWeight: 'bold' }}>
            {activeSampleFarm ? "ACTIVE" : "BROWSE"}
          </Chip>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: '#EDE7F6', borderColor: '#B39DDB' }]}
          onPress={() => router.push('/history')}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 22 }}>📜</Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.quickActionTitle, { color: '#4527A0' }]}>My History</Text>
            <Text style={[styles.quickActionDesc, { color: '#5E35B1' }]}>Scans & Timeline</Text>
          </View>
          <Chip style={{ backgroundColor: '#D1C4E9', height: 22 }} textStyle={{ fontSize: 9, color: '#4527A0', fontWeight: 'bold' }}>
            VIEW
          </Chip>
        </TouchableOpacity>
      </View>

      {/* 3. FARM HERO / HEADER CARD */}
      <Card style={[styles.bannerCard, activeSampleFarm ? styles.bannerCardSample : null]}>
        <Card.Content>
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
                    labelStyle={{ color: '#FFF', fontSize: 13, marginVertical: 2, marginHorizontal: 8 }}
                    style={{ borderColor: '#FFF', borderRadius: 8 }}
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
            📍 Crop: {activeSampleFarm ? activeSampleFarm.crop_type : selectedFarm?.crop_type || 'Wheat'} | Area: {activeSampleFarm ? activeSampleFarm.area_acres : selectedFarm?.area_acres || 10} Acres | Region: {activeSampleFarm ? activeSampleFarm.region : identity?.region || 'Registered Plot'}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* 4. SENSOR METRIC GRID */}
      <View style={styles.sectionHeaderRow}>
        <Title style={styles.sectionHeader}>{t('dashboard.title')}</Title>
        {activeSampleFarm && (
          <Chip style={styles.sampleTag} textStyle={{ fontSize: 10, color: '#E65100', fontWeight: 'bold' }}>
            Simulated Sensor Values
          </Chip>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 30 }} size="large" color="#2E7D32" />
      ) : (
        <View style={styles.grid}>
          {/* Soil Moisture */}
          <Card style={styles.gridCard}>
            <Card.Content>
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
            <Card.Content>
              <Text style={styles.cardIcon}>🌡️</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.temperature')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.temperature_c ?? 24.5}°C</Title>
              <Paragraph style={{ fontSize: 11, color: '#666' }}>Hum: {telemetry?.humidity_pct ?? 62}%</Paragraph>
            </Card.Content>
          </Card>

          {/* Nitrogen (N) */}
          <Card style={styles.gridCard}>
            <Card.Content>
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
            <Card.Content>
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

      {/* 5. ADVISORY NOTIFICATIONS */}
      <Title style={styles.sectionHeader}>
        {activeSampleFarm ? '🔔 Scenario Advisory Alerts' : '🔔 Latest Advisory Alerts'}
      </Title>
      {advisories.slice(0, 3).map((adv) => (
        <Card key={adv.id} style={styles.advisoryCard}>
          <Card.Content>
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

      {/* 6. SAMPLE FARMS EXPLORER MODAL */}
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
    backgroundColor: '#F4F7F4',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  offlineBanner: {
    backgroundColor: '#FFF3E0',
    marginBottom: 12,
    borderRadius: 8,
  },
  bannerText: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  quickActionDesc: {
    fontSize: 10.5,
    color: '#388E3C',
    marginTop: 1,
  },
  bannerCard: {
    backgroundColor: '#2E7D32',
    marginBottom: 16,
    borderRadius: 14,
    elevation: 3,
  },
  bannerCardSample: {
    backgroundColor: '#37474F',
    borderWidth: 1.5,
    borderColor: '#FFA000',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#E8F5E9',
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
    marginTop: 4,
    gap: 8,
  },
  farmTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    flex: 1,
    flexShrink: 1,
    minWidth: 120,
    marginRight: 8,
  },
  bannerSubtitle: {
    color: '#E8F5E9',
    marginTop: 6,
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  sampleTag: {
    backgroundColor: '#FFE0B2',
    height: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8EFE8',
  },
  cardIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666666',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginVertical: 4,
  },
  chipGood: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 24,
  },
  chipWarning: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 24,
  },
  chipCritical: {
    backgroundColor: '#FFEBEE',
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 24,
  },
  chipWaterlogged: {
    backgroundColor: '#E1F5FE',
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 24,
  },
  advisoryCard: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E8EFE8',
  },
  refreshButton: {
    backgroundColor: '#2E7D32',
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 10,
  },
  exitSampleBtn: {
    backgroundColor: '#FF8F00',
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 10,
  },
});
