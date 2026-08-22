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
            <View style={styles.sampleBadge}>
              <Text style={styles.sampleBadgeText}>🧪 SAMPLE DATA</Text>
            </View>
            <View
              style={[
                styles.conditionBadge,
                sampleFarm.condition_severity === 'critical'
                  ? styles.badgeCritical
                  : sampleFarm.condition_severity === 'warning'
                  ? styles.badgeWarning
                  : styles.badgeOptimal,
              ]}
            >
              <Text
                style={[
                  styles.conditionBadgeText,
                  sampleFarm.condition_severity === 'critical'
                    ? styles.badgeTextCritical
                    : sampleFarm.condition_severity === 'warning'
                    ? styles.badgeTextWarning
                    : styles.badgeTextOptimal,
                ]}
              >
                {sampleFarm.condition_label}
              </Text>
            </View>
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
  sampleBadge: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  sampleBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  conditionBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeCritical: {
    backgroundColor: '#FFCDD2',
    borderColor: '#E57373',
  },
  badgeTextCritical: {
    color: '#B71C1C',
  },
  badgeWarning: {
    backgroundColor: '#FFE082',
    borderColor: '#FFD54F',
  },
  badgeTextWarning: {
    color: '#E65100',
  },
  badgeOptimal: {
    backgroundColor: '#C8E6C9',
    borderColor: '#A5D6A7',
  },
  badgeTextOptimal: {
    color: '#1B5E20',
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
