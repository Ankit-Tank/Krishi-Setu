import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, Button, ActivityIndicator, Banner, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AgroApiService, Farm, TelemetryReading, AdvisoryRecord } from '../../src/services/api';
import { NotificationService } from '../../src/services/notifications';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
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
    
    // Fetch Farms
    const farmsRes = await AgroApiService.getFarms(1);
    setFarms(farmsRes.data);
    const farm = farmsRes.data.length > 0 ? farmsRes.data[0] : null;
    setSelectedFarm(farm);

    if (farm) {
      // Fetch Telemetry & Advisories
      const [telRes, advRes] = await Promise.all([
        AgroApiService.getLatestTelemetry(farm.id),
        AgroApiService.getAdvisories(farm.id)
      ]);

      setTelemetry(telRes.data);
      setAdvisories(advRes.data.advisory_records || []);
      setIsOffline(farmsRes.isOffline || telRes.isOffline || advRes.isOffline);

      // Trigger notification if urgent advisory exists
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
    setLoading(false);
  };

  const handleSelectFarm = async (farm: Farm) => {
    setSelectedFarm(farm);
    setMenuVisible(false);
    setLoading(true);
    const [telRes, advRes] = await Promise.all([
      AgroApiService.getLatestTelemetry(farm.id),
      AgroApiService.getAdvisories(farm.id)
    ]);
    setTelemetry(telRes.data);
    setAdvisories(advRes.data.advisory_records || []);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Offline Banner */}
      {isOffline && (
        <Banner
          visible={true}
          icon="wifi-off"
          style={styles.offlineBanner}
          actions={[{ label: 'Retry Sync', onPress: loadDashboardData }]}
        >
          <Text style={styles.bannerText}>⚡ Offline Mode — Showing last synced data</Text>
        </Banner>
      )}

      {/* Farm Selector Header */}
      <Card style={styles.bannerCard}>
        <Card.Content>
          <Text style={styles.welcomeText}>{t('dashboard.welcome')}</Text>
          <View style={styles.farmSelectorRow}>
            <Title style={styles.farmTitle} numberOfLines={1} ellipsizeMode="tail">
              🚜 {selectedFarm ? selectedFarm.name : 'Select Farm'}
            </Title>
            {farms.length > 1 && (
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
                    onPress={() => handleSelectFarm(f)}
                    title={`${f.name} (${f.crop_type})`}
                  />
                ))}
              </Menu>
            )}
          </View>
          <Paragraph style={styles.bannerSubtitle}>
            📍 Crop: {selectedFarm?.crop_type || 'Wheat'} | Area: {selectedFarm?.area_acres || 10} Acres
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Sensor Metric Grid */}
      <Title style={styles.sectionHeader}>{t('dashboard.title')}</Title>

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
              <Chip icon="water" style={(telemetry?.soil_moisture ?? 26.5) < 30 ? styles.chipWarning : styles.chipGood}>
                {(telemetry?.soil_moisture ?? 26.5) < 30 ? 'Irrigate Soon' : 'Optimal'}
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
              <Chip style={styles.chipGood}>Active NPK</Chip>
            </Card.Content>
          </Card>

          {/* Soil pH */}
          <Card style={styles.gridCard}>
            <Card.Content>
              <Text style={styles.cardIcon}>🧪</Text>
              <Paragraph style={styles.cardLabel}>{t('dashboard.ph')}</Paragraph>
              <Title style={styles.cardValue}>{telemetry?.soil_ph ?? 6.8}</Title>
              <Chip style={styles.chipGood}>Balanced</Chip>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Latest 3 Advisory Notifications */}
      <Title style={styles.sectionHeader}>🔔 Latest Advisory Alerts</Title>
      {advisories.slice(0, 3).map((adv) => (
        <Card key={adv.id} style={styles.advisoryCard}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <Text style={{ fontWeight: 'bold', color: adv.type === 'disease' ? '#D32F2F' : '#2E7D32', flex: 1, flexShrink: 1, marginRight: 8 }} numberOfLines={1} ellipsizeMode="tail">
                {adv.type === 'disease' ? '🔴 Disease Alert' : adv.type === 'irrigation' ? '💧 Irrigation Advisory' : '🟢 NPK Advice'}
              </Text>
              {!adv.is_read && <Chip style={{ backgroundColor: '#FFEBEE' }}>NEW</Chip>}
            </View>
            <Paragraph style={{ marginTop: 6, color: '#333' }}>{adv.message}</Paragraph>
          </Card.Content>
        </Card>
      ))}

      {/* Quick Action Refresh */}
      <Button mode="contained" onPress={loadDashboardData} icon="refresh" style={styles.refreshButton}>
        Refresh Field Telemetry
      </Button>
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
  bannerCard: {
    backgroundColor: '#2E7D32',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  welcomeText: {
    color: '#E8F5E9',
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    flexShrink: 1,
    minWidth: 120,
    marginRight: 8,
  },
  bannerSubtitle: {
    color: '#E8F5E9',
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
    marginTop: 8,
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
    borderRadius: 10,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 4,
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
  },
  chipWarning: {
    backgroundColor: '#FFEBEE',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  advisoryCard: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
  },
  refreshButton: {
    backgroundColor: '#2E7D32',
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 8,
  },
});
