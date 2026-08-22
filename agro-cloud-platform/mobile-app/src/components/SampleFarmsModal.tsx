import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Modal, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  Title,
  Paragraph,
  Button,
  Chip,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SAMPLE_FARMS, SampleFarm } from '../data/sampleFarms';
import { FarmerIdentity } from '../services/api';

interface SampleFarmsModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectSampleFarm: (farm: SampleFarm) => void;
  onSelectRealFarm: () => void;
  activeSampleFarmId: string | null;
  realIdentity: FarmerIdentity | null;
}

export default function SampleFarmsModal({
  visible,
  onDismiss,
  onSelectSampleFarm,
  onSelectRealFarm,
  activeSampleFarmId,
  realIdentity,
}: SampleFarmsModalProps) {
  const { t } = useTranslation();
  const [filterCrop, setFilterCrop] = useState<string>('all');

  const filteredFarms = filterCrop === 'all'
    ? SAMPLE_FARMS
    : SAMPLE_FARMS.filter(f => f.crop_type.toLowerCase() === filterCrop.toLowerCase());

  const uniqueCrops = Array.from(new Set(SAMPLE_FARMS.map(f => f.crop_type)));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 6 }}>🧪</Text>
              <Title style={styles.headerTitle}>{t('sampleModal.title')}</Title>
            </View>
            <Text style={styles.headerSubtitle}>
              {t('profile.simulatedExplorerDesc')}
            </Text>
          </View>
          <IconButton icon="close" size={24} onPress={onDismiss} />
        </View>

        <Divider />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Option: Return to Real Farmer Plot */}
          <Card
            style={[
              styles.realFarmCard,
              !activeSampleFarmId ? styles.activeRealCard : null,
            ]}
          >
            <Card.Content>
              <View style={styles.realHeaderRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <View style={styles.realBadge}>
                      <Text style={styles.realBadgeText}>{t('sampleModal.myRealFarmBadge')}</Text>
                    </View>
                    {!activeSampleFarmId && (
                      <View style={styles.activeChip}>
                        <Text style={styles.activeChipText}>{t('sampleModal.activeView')}</Text>
                      </View>
                    )}
                  </View>
                  <Title style={styles.realFarmName}>
                    🏡 {realIdentity?.farm_name || 'My Registered Farm Plot'}
                  </Title>
                  <Text style={styles.realFarmDetails}>
                    👨‍🌾 {realIdentity?.farmer_name || 'You'} • {realIdentity?.crop_type || 'Wheat'} ({realIdentity?.area_acres || 5} Acres) • 📍 {realIdentity?.region || 'Registered Plot'}
                  </Text>
                </View>
              </View>

              {activeSampleFarmId ? (
                <Button
                  mode="contained"
                  icon="check-circle"
                  onPress={() => {
                    onSelectRealFarm();
                    onDismiss();
                  }}
                  style={styles.returnButton}
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  {t('sampleModal.switchBack')}
                </Button>
              ) : (
                <Text style={styles.currentlyViewingText}>
                  {t('sampleModal.currentlyViewingReal')}
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Section Divider & Crop Filters */}
          <View style={styles.sectionHeaderRow}>
            <Title style={styles.sectionTitle}>{t('sampleModal.scenariosTitle')}</Title>
          </View>
          <Text style={styles.sectionDesc}>
            {t('sampleModal.scenariosDesc')}
          </Text>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <Chip
              selected={filterCrop === 'all'}
              onPress={() => setFilterCrop('all')}
              style={[styles.filterChip, filterCrop === 'all' && styles.filterChipActive]}
              textStyle={filterCrop === 'all' ? styles.filterChipTextActive : styles.filterChipText}
            >
              {t('sampleModal.allCrops', { count: 12 })}
            </Chip>
            {uniqueCrops.map(crop => (
              <Chip
                key={crop}
                selected={filterCrop === crop}
                onPress={() => setFilterCrop(crop)}
                style={[styles.filterChip, filterCrop === crop && styles.filterChipActive]}
                textStyle={filterCrop === crop ? styles.filterChipTextActive : styles.filterChipText}
              >
                {crop}
              </Chip>
            ))}
          </ScrollView>

          {/* List of Sample Farms */}
          {filteredFarms.map((farm) => {
            const isSelected = activeSampleFarmId === farm.id;
            return (
              <Card
                key={farm.id}
                style={[
                  styles.sampleCard,
                  isSelected && styles.sampleCardSelected,
                ]}
              >
                <Card.Content>
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.conditionChip,
                            farm.condition_severity === 'critical'
                              ? styles.chipCritical
                              : farm.condition_severity === 'warning'
                              ? styles.chipWarning
                              : styles.chipOptimal,
                          ]}
                        >
                          <Text
                            style={[
                              styles.conditionChipText,
                              farm.condition_severity === 'critical'
                                ? { color: '#B71C1C' }
                                : farm.condition_severity === 'warning'
                                ? { color: '#E65100' }
                                : { color: '#1B5E20' },
                            ]}
                          >
                            {farm.condition_label}
                          </Text>
                        </View>
                        <View style={styles.cropBadge}>
                          <Text style={{ fontSize: 10, color: '#333', fontWeight: 'bold' }}>
                            🌾 {farm.crop_type}
                          </Text>
                        </View>
                      </View>

                      <Title style={styles.farmTitle}>{farm.name}</Title>
                      <Text style={styles.farmMeta}>
                        📍 {farm.region} • 👨‍🌾 {farm.farmer_name} • {farm.area_acres} Acres
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.scenarioDesc}>
                    <Text style={{ fontWeight: 'bold', color: '#1B5E20' }}>{farm.scenario_title}: </Text>
                    {farm.scenario_description}
                  </Text>

                  {/* Telemetry preview mini-badges */}
                  <View style={styles.telemetryPreviewRow}>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>{t('dashboard.moisture')}</Text>
                      <Text style={styles.metricVal}>{farm.telemetry.soil_moisture}%</Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>{t('dashboard.temperature')}</Text>
                      <Text style={styles.metricVal}>{farm.telemetry.temperature_c}°C</Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>{t('sampleModal.npkPpm')}</Text>
                      <Text style={styles.metricVal}>
                        {farm.telemetry.nitrogen_ppm}-{farm.telemetry.phosphorus_ppm}-{farm.telemetry.potassium_ppm}
                      </Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>{t('dashboard.ph')}</Text>
                      <Text style={styles.metricVal}>{farm.telemetry.soil_ph}</Text>
                    </View>
                  </View>

                  <Divider style={{ marginVertical: 10 }} />

                  {/* Action Button */}
                  <Button
                    mode={isSelected ? "contained" : "outlined"}
                    icon={isSelected ? "eye-check" : "arrow-right-bold-circle-outline"}
                    onPress={() => {
                      onSelectSampleFarm(farm);
                      onDismiss();
                    }}
                    style={[styles.exploreBtn, isSelected ? styles.exploreBtnActive : null]}
                    labelStyle={{ fontSize: 13, fontWeight: 'bold' }}
                  >
                    {isSelected ? t('sampleModal.currentlyExploring') : t('sampleModal.exploreFarm')}
                  </Button>
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  realFarmCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
    borderWidth: 1.5,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 2,
  },
  activeRealCard: {
    borderColor: '#2E7D32',
    borderWidth: 2,
  },
  realHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  realBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  realBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  activeChip: {
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  activeChipText: {
    color: '#1B5E20',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  realFarmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 2,
  },
  realFarmDetails: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 2,
  },
  returnButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    marginTop: 12,
  },
  currentlyViewingText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionHeaderRow: {
    marginTop: 4,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 12,
    lineHeight: 16,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D8D0',
  },
  filterChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterChipText: {
    fontSize: 12,
    color: '#444444',
  },
  filterChipTextActive: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8E2',
  },
  sampleCardSelected: {
    borderColor: '#FF8F00',
    borderWidth: 2,
    backgroundColor: '#FFFDE7',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  conditionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  conditionChipText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  chipCritical: {
    backgroundColor: '#FFCDD2',
  },
  chipWarning: {
    backgroundColor: '#FFE082',
  },
  chipOptimal: {
    backgroundColor: '#C8E6C9',
  },
  cropBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  farmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 4,
  },
  farmMeta: {
    fontSize: 11.5,
    color: '#666666',
    marginTop: 2,
  },
  scenarioDesc: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 17,
    marginTop: 8,
    backgroundColor: '#F9FAF9',
    padding: 8,
    borderRadius: 8,
  },
  telemetryPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 6,
  },
  metricPill: {
    flex: 1,
    backgroundColor: '#F1F8E9',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    color: '#558B2F',
    fontWeight: 'bold',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 2,
  },
  exploreBtn: {
    borderColor: '#2E7D32',
    borderRadius: 8,
  },
  exploreBtnActive: {
    backgroundColor: '#FF8F00',
    borderColor: '#FF8F00',
  },
});
