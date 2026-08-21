import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SmartSummaryResponse } from '../services/api';

interface SmartSummaryCardProps {
  summary: SmartSummaryResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function SmartSummaryCard({
  summary,
  loading,
  onRefresh,
}: SmartSummaryCardProps) {
  const router = useRouter();

  if (loading && !summary) {
    return (
      <Card style={styles.cardContainer}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#A5D6A7" />
          <Text style={styles.loadingText}>Generating AI Smart Summary from disease, soil & mandi data...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (!summary) return null;

  const isUrgent = summary.urgency_level === 'HIGH';

  return (
    <Card style={[styles.cardContainer, isUrgent ? styles.cardContainerUrgent : null]}>
      <Card.Content style={styles.cardContent}>
        {/* Top Header Row with AI Badge & Urgency Pill */}
        <View style={styles.topHeaderRow}>
          <View style={styles.badgeRow}>
            <Text style={styles.sparkleIcon}>🧠</Text>
            <Text style={styles.badgeTitle}>AI SMART SUMMARY</Text>
            <View style={styles.livePulse} />
          </View>

          <View style={styles.headerActions}>
            <Chip
              style={[
                styles.urgencyChip,
                isUrgent ? styles.urgencyChipHigh : styles.urgencyChipNormal,
              ]}
              textStyle={{
                color: isUrgent ? '#FFD54F' : '#E8F5E9',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {isUrgent ? 'ACTION REQUIRED' : 'ON TRACK'}
            </Chip>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={onRefresh}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size={12} color="#A5D6A7" />
              ) : (
                <Text style={styles.refreshEmoji}>🔄</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Core Synthesized Recommendation Box */}
        <View style={styles.recommendationBox}>
          <Text style={styles.headlineText}>{summary.headline}</Text>
          <Text style={styles.summaryBodyText}>{summary.summary_text}</Text>
        </View>

        {/* 3 Pillar Summary Strip */}
        <View style={styles.pillarsContainer}>
          {/* Pillar 1: Disease */}
          <TouchableOpacity
            style={[
              styles.pillarItem,
              summary.disease.status === 'DISEASED'
                ? styles.pillarItemWarning
                : styles.pillarItemNormal,
            ]}
            onPress={() => router.push('/disease')}
            activeOpacity={0.8}
          >
            <View style={styles.pillarIconRow}>
              <Text style={styles.pillarIcon}>🍃</Text>
              <Text style={styles.pillarLabel}>Disease</Text>
            </View>
            <Text
              style={[
                styles.pillarValue,
                summary.disease.status === 'DISEASED'
                  ? styles.pillarValueWarning
                  : styles.pillarValueNormal,
              ]}
              numberOfLines={1}
            >
              {summary.disease.status === 'DISEASED'
                ? (summary.disease.predicted_disease || 'Infected')
                : summary.disease.status === 'HEALTHY'
                ? 'Healthy Foliage'
                : 'No Scan Yet'}
            </Text>
          </TouchableOpacity>

          {/* Pillar 2: Soil Moisture */}
          <TouchableOpacity
            style={[
              styles.pillarItem,
              summary.soil_irrigation.moisture_status === 'LOW'
                ? styles.pillarItemWarning
                : styles.pillarItemNormal,
            ]}
            onPress={() => router.push('/advisory')}
            activeOpacity={0.8}
          >
            <View style={styles.pillarIconRow}>
              <Text style={styles.pillarIcon}>💧</Text>
              <Text style={styles.pillarLabel}>Irrigation</Text>
            </View>
            <Text
              style={[
                styles.pillarValue,
                summary.soil_irrigation.moisture_status === 'LOW'
                  ? styles.pillarValueWarning
                  : styles.pillarValueNormal,
              ]}
              numberOfLines={1}
            >
              {summary.soil_irrigation.moisture_status === 'LOW'
                ? `Low (${summary.soil_irrigation.moisture_pct ?? 24}%)`
                : summary.soil_irrigation.moisture_status === 'HIGH'
                ? 'High (Pause)'
                : `Optimal (${summary.soil_irrigation.moisture_pct ?? 30}%)`}
            </Text>
          </TouchableOpacity>

          {/* Pillar 3: Mandi Match */}
          <TouchableOpacity
            style={styles.pillarItem}
            onPress={() => router.push('/mandi')}
            activeOpacity={0.8}
          >
            <View style={styles.pillarIconRow}>
              <Text style={styles.pillarIcon}>🏛️</Text>
              <Text style={styles.pillarLabel}>Best Mandi</Text>
            </View>
            <Text style={styles.pillarValueMarket} numberOfLines={1}>
              ₹{Math.round(summary.market.best_price_per_quintal)}/q • {summary.market.distance_km}km
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            mode="contained-tonal"
            icon="camera"
            onPress={() => router.push('/disease')}
            style={styles.actionBtn}
            buttonColor="#2E7D32"
            textColor="#FFFFFF"
            compact
            labelStyle={{ fontSize: 11, marginVertical: 3 }}
          >
            Scan Leaf
          </Button>

          <Button
            mode="contained-tonal"
            icon="water"
            onPress={() => router.push('/advisory')}
            style={styles.actionBtn}
            buttonColor="#1976D2"
            textColor="#FFFFFF"
            compact
            labelStyle={{ fontSize: 11, marginVertical: 3 }}
          >
            Soil Plan
          </Button>

          <Button
            mode="contained-tonal"
            icon="storefront"
            onPress={() => router.push('/mandi')}
            style={styles.actionBtn}
            buttonColor="#F57C00"
            textColor="#FFFFFF"
            compact
            labelStyle={{ fontSize: 11, marginVertical: 3 }}
          >
            Mandi Deals
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0F381E',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#43A047',
    overflow: 'hidden',
  },
  cardContainerUrgent: {
    backgroundColor: '#1B2E1C',
    borderColor: '#FFA000',
  },
  cardContent: {
    padding: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#A5D6A7',
    textAlign: 'center',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparkleIcon: {
    fontSize: 15,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A5D6A7',
    letterSpacing: 0.8,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyChip: {
    height: 22,
  },
  urgencyChipHigh: {
    backgroundColor: '#E65100',
  },
  urgencyChipNormal: {
    backgroundColor: '#2E7D32',
  },
  refreshBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshEmoji: {
    fontSize: 11,
  },
  recommendationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(165, 214, 167, 0.25)',
    marginBottom: 12,
  },
  headlineText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF9C4',
    marginBottom: 4,
  },
  summaryBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pillarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  pillarItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillarItemWarning: {
    backgroundColor: 'rgba(255, 112, 67, 0.15)',
    borderColor: '#FF7043',
  },
  pillarItemNormal: {
    borderColor: 'rgba(165, 214, 167, 0.3)',
  },
  pillarIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  pillarIcon: {
    fontSize: 12,
  },
  pillarLabel: {
    fontSize: 10,
    color: '#C8E6C9',
    fontWeight: '600',
  },
  pillarValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  pillarValueWarning: {
    color: '#FFCC80',
  },
  pillarValueNormal: {
    color: '#FFFFFF',
  },
  pillarValueMarket: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFE082',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
  },
});
