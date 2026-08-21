import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { SampleFarm } from '../data/sampleFarms';

interface SampleFarmBannerProps {
  sampleFarm: SampleFarm | null;
  onExitSampleMode: () => void;
}

export default function SampleFarmBanner({ sampleFarm, onExitSampleMode }: SampleFarmBannerProps) {
  if (!sampleFarm) return null;

  return (
    <Card style={styles.bannerCard}>
      <Card.Content style={styles.bannerContent}>
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <Chip
              icon="flask-outline"
              style={styles.sampleChip}
              textStyle={styles.sampleChipText}
            >
              SAMPLE DATA
            </Chip>
            <Chip
              style={[
                styles.conditionChip,
                sampleFarm.condition_severity === 'critical'
                  ? styles.chipCritical
                  : sampleFarm.condition_severity === 'warning'
                  ? styles.chipWarning
                  : styles.chipOptimal,
              ]}
              textStyle={styles.conditionChipText}
            >
              {sampleFarm.condition_label}
            </Chip>
          </View>
          <Button
            mode="contained-tonal"
            icon="arrow-left-circle"
            onPress={onExitSampleMode}
            compact
            style={styles.exitButton}
            labelStyle={{ fontSize: 11, fontWeight: 'bold', color: '#1B5E20' }}
          >
            My Real Farm
          </Button>
        </View>

        <Text style={styles.noticeText}>
          ⚠️ <Text style={{ fontWeight: 'bold' }}>Simulated Scenario:</Text> Showing {sampleFarm.name} ({sampleFarm.crop_type}). This is not a real sensor reading from your plot.
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  bannerCard: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFA000',
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
  },
  bannerContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sampleChip: {
    backgroundColor: '#FF6F00',
    height: 26,
  },
  sampleChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  conditionChip: {
    height: 26,
  },
  conditionChipText: {
    fontSize: 10,
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
  exitButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  noticeText: {
    fontSize: 11.5,
    color: '#E65100',
    lineHeight: 16,
  },
});
