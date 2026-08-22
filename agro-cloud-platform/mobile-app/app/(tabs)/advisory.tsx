import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, Text, Title, Paragraph, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AgroApiService, IdentityService, FarmerIdentity, RuleBasedAdvisoryResponse, AdvisoryRecord } from '../../src/services/api';
import { SampleFarm } from '../../src/data/sampleFarms';
import { SampleFarmState } from '../../src/services/sampleFarmState';
import SampleFarmBanner from '../../src/components/SampleFarmBanner';
import { Colors, Spacing, BorderRadius, Typography, Shadows, CommonStyles } from '../../src/theme/theme';

export default function AdvisoryScreen() {
  const { t } = useTranslation();
  const [savedIdentity, setSavedIdentity] = useState<FarmerIdentity | null>(null);
  const [activeSampleFarm, setActiveSampleFarm] = useState<SampleFarm | null>(null);
  const [advisoryData, setAdvisoryData] = useState<RuleBasedAdvisoryResponse | null>(null);
  const [records, setRecords] = useState<AdvisoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdvisory();
  }, []);

  const loadAdvisory = async () => {
    setLoading(true);
    try {
      // 1. Check real saved identity
      const identity = await IdentityService.getSavedIdentity();
      setSavedIdentity(identity);

      // 2. Check if a sample farm preview is active
      const currentSample = await SampleFarmState.getActiveSampleFarm();
      if (currentSample) {
        setActiveSampleFarm(currentSample);
        setAdvisoryData({
          farm_id: 999,
          crop_type: currentSample.crop_type,
          latest_telemetry: {
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
          },
          irrigation_advice: currentSample.advisory.irrigation_advice,
          npk_advice: currentSample.advisory.npk_advice,
          ph_advice: `Soil pH is ${currentSample.telemetry.soil_ph} (${currentSample.condition_label})`,
          advisory_records: currentSample.advisory.advisory_records as any
        });
        setRecords(currentSample.advisory.advisory_records as any);
        setLoading(false);
        return;
      }

      // 3. Normal Flow: Load Real Farm Advisory from Backend
      setActiveSampleFarm(null);
      const farmId = identity?.farm_id || 1;
      const res = await AgroApiService.getAdvisories(farmId);
      setAdvisoryData(res.data);
      setRecords(res.data.advisory_records || []);
    } catch (err) {
      console.warn('Advisory loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExitSampleMode = async () => {
    await SampleFarmState.clearSampleFarmMode();
    setActiveSampleFarm(null);
    loadAdvisory();
  };

  const handleMarkAsRead = (id: number) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, is_read: true } : rec))
    );
  };

  const getAdvisoryBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'disease':
        return {
          label: 'DISEASE ALERT',
          bg: Colors.status.critical.bg,
          text: Colors.status.critical.text,
          border: Colors.status.critical.border,
          icon: '🔴',
        };
      case 'irrigation':
        return {
          label: 'IRRIGATION NEEDED',
          bg: Colors.status.info.bg,
          text: Colors.status.info.text,
          border: Colors.status.info.border,
          icon: '💧',
        };
      case 'npk':
        return {
          label: 'NPK NUTRIENT',
          bg: Colors.status.healthy.bg,
          text: Colors.status.healthy.text,
          border: Colors.status.healthy.border,
          icon: '🧪',
        };
      default:
        return {
          label: 'GENERAL ADVISORY',
          bg: Colors.status.warning.bg,
          text: Colors.status.warning.text,
          border: Colors.status.warning.border,
          icon: '📢',
        };
    }
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

      <Card style={[styles.headerCard, activeSampleFarm ? styles.headerCardSample : null]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.headerTitleRow}>
            <Title style={styles.headerTitle}>
              {activeSampleFarm ? '🧪 Simulated Agronomic Prescription' : '🌱 Precision Agronomic Prescription'}
            </Title>
            {activeSampleFarm && (
              <View style={styles.sampleBadge}>
                <Text style={styles.sampleBadgeText}>SAMPLE SCENARIO</Text>
              </View>
            )}
          </View>

          <Paragraph style={styles.subText}>
            Generated by Krishi Setu AI for{' '}
            {activeSampleFarm
              ? `${activeSampleFarm.name} (${activeSampleFarm.crop_type}) — ${activeSampleFarm.scenario_title}`
              : savedIdentity
              ? `${savedIdentity.farm_name} (${savedIdentity.crop_type})`
              : 'Wheat Plot'}
          </Paragraph>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: Spacing.lg }} color={Colors.primary} />
          ) : (
            <View style={{ marginTop: Spacing.sm }}>
              <View style={styles.adviceBoxIrrigation}>
                <Text style={styles.adviceBoxIrrigationTitle}>💧 Irrigation Prescription:</Text>
                <Text style={styles.adviceBoxIrrigationText}>{advisoryData?.irrigation_advice}</Text>
              </View>

              <View style={styles.adviceBoxNpk}>
                <Text style={styles.adviceBoxNpkTitle}>🧪 NPK Nutrient Prescription:</Text>
                <Text style={styles.adviceBoxNpkText}>{advisoryData?.npk_advice}</Text>
              </View>

              {activeSampleFarm?.advisory.action_items && (
                <View style={styles.adviceBoxChecklist}>
                  <Text style={styles.adviceBoxChecklistTitle}>📋 Recommended Action Checklist:</Text>
                  {activeSampleFarm.advisory.action_items.map((item, idx) => (
                    <Text key={idx} style={styles.checklistItem}>
                      • {item}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      <Title style={styles.sectionHeader}>
        {activeSampleFarm ? `📋 Scenario Advisory Logs (${records.length})` : `📋 All Advisory Logs (${records.length})`}
      </Title>

      {records.map((rec) => {
        const badge = getAdvisoryBadge(rec.type);
        return (
          <Card key={rec.id} style={[styles.recordCard, rec.is_read && { opacity: 0.75 }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: Spacing.xs + 2 }}>{badge.icon}</Text>
                  <Text style={{ fontWeight: '700', color: badge.text }}>{badge.label}</Text>
                </View>

                {rec.is_read ? (
                  <View style={styles.readBadge}><Text style={styles.readBadgeText}>✓ Read</Text></View>
                ) : (
                  <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>UNREAD</Text></View>
                )}
              </View>

              <Paragraph style={styles.recordMessage}>{rec.message}</Paragraph>

              <View style={styles.cardFooterRow}>
                <Text style={styles.dateText}>
                  🕒 {new Date(rec.created_at).toLocaleDateString()} {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {!rec.is_read && (
                  <Button
                    mode="text"
                    compact
                    onPress={() => handleMarkAsRead(rec.id)}
                    labelStyle={{ color: Colors.primary, fontSize: 12, fontWeight: '700' }}
                  >
                    Mark as Read ✓
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screenContainer,
  },
  content: {
    ...CommonStyles.screenContent,
  },
  cardContent: {
    padding: Spacing.md + 2,
  },
  headerCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.lg,
  },
  headerCardSample: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  headerTitle: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
    flex: 1,
    minWidth: 140,
  },
  sampleBadge: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  sampleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  subText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xxs,
  },
  sectionHeader: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  adviceBoxIrrigation: {
    backgroundColor: Colors.status.info.bg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.info.border,
    marginBottom: Spacing.sm + 2,
  },
  adviceBoxIrrigationTitle: {
    fontWeight: '700',
    color: Colors.status.info.text,
    marginBottom: Spacing.xs,
    fontSize: 13,
  },
  adviceBoxIrrigationText: {
    color: Colors.status.info.text,
    fontSize: 13,
    lineHeight: 18,
  },
  adviceBoxNpk: {
    backgroundColor: Colors.status.healthy.bg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.healthy.border,
    marginBottom: Spacing.sm + 2,
  },
  adviceBoxNpkTitle: {
    fontWeight: '700',
    color: Colors.status.healthy.text,
    marginBottom: Spacing.xs,
    fontSize: 13,
  },
  adviceBoxNpkText: {
    color: Colors.status.healthy.text,
    fontSize: 13,
    lineHeight: 18,
  },
  adviceBoxChecklist: {
    backgroundColor: '#F3E5F5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CE93D8',
    marginBottom: Spacing.sm,
  },
  adviceBoxChecklistTitle: {
    fontWeight: '700',
    color: '#6A1B9A',
    marginBottom: Spacing.xs,
    fontSize: 13,
  },
  checklistItem: {
    color: '#4A148C',
    fontSize: 12,
    marginTop: 3,
  },
  recordCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  readBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readBadgeText: {
    fontSize: 10,
    color: '#616161',
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: Colors.status.critical.bg,
    borderColor: Colors.status.critical.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unreadBadgeText: {
    fontSize: 10,
    color: Colors.status.critical.text,
    fontWeight: '700',
  },
  recordMessage: {
    ...Typography.body,
    lineHeight: 19,
    marginVertical: Spacing.xs,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
