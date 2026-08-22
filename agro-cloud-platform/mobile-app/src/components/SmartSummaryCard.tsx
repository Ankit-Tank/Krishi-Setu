import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SmartSummaryResponse } from '../services/api';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme/theme';

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
            <View
              style={[
                styles.urgencyPill,
                isUrgent ? styles.urgencyPillHigh : styles.urgencyPillNormal,
              ]}
            >
              <Text
                style={[
                  styles.urgencyPillText,
                  { color: isUrgent ? '#FFD54F' : '#E8F5E9' },
                ]}
              >
                {isUrgent ? 'ACTION REQUIRED' : 'ON TRACK'}
              </Text>
            </View>

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
              numberOfLines={2}
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
              numberOfLines={2}
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
            <Text style={styles.pillarValueMarket} numberOfLines={2}>
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
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadows.floating,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    overflow: 'hidden',
  },
  cardContainerUrgent: {
    backgroundColor: '#1B2E1C',
    borderColor: Colors.accent,
  },
  cardContent: {
    padding: Spacing.md,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.xs,
    fontSize: 12,
    color: Colors.primaryTint,
    textAlign: 'center',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sparkleIcon: {
    fontSize: 15,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryTint,
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
    gap: Spacing.xs + 2,
  },
  urgencyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgencyPillHigh: {
    backgroundColor: Colors.status.critical.main,
  },
  urgencyPillNormal: {
    backgroundColor: Colors.primary,
  },
  urgencyPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  refreshBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshEmoji: {
    fontSize: 12,
  },
  recommendationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: 'rgba(165, 214, 167, 0.25)',
    marginBottom: Spacing.sm + 2,
  },
  headlineText: {
    fontSize: 13,
    fontWeight: '800',
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
    gap: Spacing.xs,
    marginBottom: Spacing.sm + 2,
  },
  pillarItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
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
    color: Colors.primaryTint,
    fontWeight: '600',
  },
  pillarValue: {
    fontSize: 10.5,
    fontWeight: '800',
    lineHeight: 13.5,
    minHeight: 27,
  },
  pillarValueWarning: {
    color: '#FFCC80',
  },
  pillarValueNormal: {
    color: '#FFFFFF',
  },
  pillarValueMarket: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFE082',
    lineHeight: 13.5,
    minHeight: 27,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    borderRadius: BorderRadius.sm,
  },
});
