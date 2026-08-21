import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Image, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
  Appbar,
  Banner,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  AgroApiService,
  IdentityService,
  FarmerIdentity,
  FarmerHistoryResponse,
  HistoryItem,
  API_BASE_URL,
  formatFriendlyErrorMessage,
} from '../src/services/api';

export default function HistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [identity, setIdentity] = useState<FarmerIdentity | null>(null);
  const [historyData, setHistoryData] = useState<FarmerHistoryResponse | null>(null);
  const [timeline, setTimeline] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'leaf_scan' | 'advisory'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const saved = await IdentityService.getSavedIdentity();
      if (!saved) {
        router.replace('/onboarding');
        return;
      }
      setIdentity(saved);

      const res = await AgroApiService.getFarmerHistory(saved.farmer_id);
      setHistoryData(res.data);
      setTimeline(res.data.timeline || []);
      setIsOffline(res.isOffline);
    } catch (err: any) {
      console.warn('Error loading farmer history:', err);
      setErrorMessage(formatFriendlyErrorMessage(err));
      setIsOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const filteredTimeline = timeline.filter((item) => {
    if (filterType === 'all') return true;
    return item.item_type === filterType;
  });

  const getAdvisoryBadge = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'disease':
        return { label: 'DISEASE ALERT', bg: '#FFEBEE', text: '#C62828', icon: '🔴' };
      case 'irrigation':
        return { label: 'IRRIGATION PRESCRIPTION', bg: '#E3F2FD', text: '#1565C0', icon: '💧' };
      case 'npk':
        return { label: 'NPK ADVISORY', bg: '#E8F5E9', text: '#2E7D32', icon: '🧪' };
      default:
        return { label: 'AGRONOMIC ADVISORY', bg: '#FFF3E0', text: '#E65100', icon: '📢' };
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return ts;
    }
  };

  const getImageUri = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <View style={styles.container}>
      {/* Appbar Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#F7F1E8" onPress={() => router.back()} />
        <Appbar.Content
          title="📜 My Farm History"
          subtitle={identity ? `${identity.farmer_name} • ${identity.farm_name}` : 'Past Scans & Advisories'}
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />
        <Appbar.Action icon="refresh" color="#F7F1E8" onPress={loadHistory} />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
      >
        {/* Offline Banner */}
        {isOffline && (
          <Banner
            visible={true}
            icon="wifi-off"
            style={styles.offlineBanner}
            actions={[{ label: 'Retry', onPress: loadHistory }]}
          >
            <Text style={styles.bannerText}>⚡ Offline Mode — Showing cached history</Text>
          </Banner>
        )}

        {/* Error Notice */}
        {errorMessage ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {/* Hero Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Activity Timeline Overview</Title>
            <Text style={styles.statsSubtitle}>
              Chronological log of all AI disease diagnoses & precision prescriptions
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statNumber}>{historyData?.total_items ?? timeline.length}</Text>
                <Text style={styles.statLabel}>Total Events</Text>
              </View>

              <View style={[styles.statPill, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.statNumber, { color: '#2E7D32' }]}>
                  {historyData?.leaf_scans_count ?? timeline.filter(t => t.item_type === 'leaf_scan').length}
                </Text>
                <Text style={styles.statLabel}>🌿 Leaf Scans</Text>
              </View>

              <View style={[styles.statPill, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.statNumber, { color: '#E65100' }]}>
                  {historyData?.advisories_count ?? timeline.filter(t => t.item_type === 'advisory').length}
                </Text>
                <Text style={styles.statLabel}>📢 Advisories</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <Chip
            selected={filterType === 'all'}
            onPress={() => setFilterType('all')}
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            textStyle={filterType === 'all' ? styles.filterChipTextActive : styles.filterChipText}
          >
            All Events ({timeline.length})
          </Chip>
          <Chip
            selected={filterType === 'leaf_scan'}
            onPress={() => setFilterType('leaf_scan')}
            style={[styles.filterChip, filterType === 'leaf_scan' && styles.filterChipActive]}
            textStyle={filterType === 'leaf_scan' ? styles.filterChipTextActive : styles.filterChipText}
          >
            🌿 Leaf Scans ({historyData?.leaf_scans_count ?? timeline.filter(t => t.item_type === 'leaf_scan').length})
          </Chip>
          <Chip
            selected={filterType === 'advisory'}
            onPress={() => setFilterType('advisory')}
            style={[styles.filterChip, filterType === 'advisory' && styles.filterChipActive]}
            textStyle={filterType === 'advisory' ? styles.filterChipTextActive : styles.filterChipText}
          >
            📢 Advisories ({historyData?.advisories_count ?? timeline.filter(t => t.item_type === 'advisory').length})
          </Chip>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Fetching your activity history...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredTimeline.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={{ fontSize: 44, marginBottom: 8 }}>🌱</Text>
              <Title style={styles.emptyTitle}>No History Records Yet</Title>
              <Paragraph style={styles.emptyDesc}>
                Whenever you diagnose a crop leaf in Crop Doctor or receive automated soil telemetry advisories, they will be logged here in chronological order.
              </Paragraph>
              <Button
                mode="contained"
                icon="camera"
                onPress={() => router.push('/(tabs)/disease')}
                style={styles.actionBtn}
              >
                Scan a Crop Leaf Now
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Timeline Items (Newest First) */}
        {!loading &&
          filteredTimeline.map((item, index) => {
            const isLeafScan = item.item_type === 'leaf_scan';
            const badge = getAdvisoryBadge(item.advisory_type);

            return (
              <Card key={item.id || index} style={styles.timelineCard}>
                <Card.Content>
                  {/* Top Meta Header */}
                  <View style={styles.itemHeaderRow}>
                    <View style={styles.badgeGroup}>
                      {isLeafScan ? (
                        <Chip
                          icon="microscope"
                          style={styles.leafScanChip}
                          textStyle={styles.leafScanChipText}
                        >
                          LEAF SCAN DIAGNOSIS
                        </Chip>
                      ) : (
                        <Chip
                          style={[styles.advisoryTypeChip, { backgroundColor: badge.bg }]}
                          textStyle={{ color: badge.text, fontSize: 10, fontWeight: 'bold' }}
                        >
                          {badge.label}
                        </Chip>
                      )}

                      <Chip style={styles.farmPill} textStyle={{ fontSize: 10, color: '#555' }}>
                        🌾 {item.farm_name} ({item.crop_type})
                      </Chip>
                    </View>

                    <Text style={styles.timeText}>🕒 {formatTimestamp(item.timestamp)}</Text>
                  </View>

                  <Divider style={{ marginVertical: 10 }} />

                  {/* Leaf Scan Body */}
                  {isLeafScan ? (
                    <View style={styles.leafScanBody}>
                      {item.image_url ? (
                        <Image
                          source={{ uri: getImageUri(item.image_url)! }}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.thumbnailPlaceholder}>
                          <Text style={{ fontSize: 24 }}>🍃</Text>
                        </View>
                      )}

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Title style={styles.diseaseName}>
                          {item.predicted_disease || item.title}
                        </Title>

                        {item.confidence_score !== undefined && (
                          <Chip
                            style={styles.confidenceChip}
                            textStyle={{ fontSize: 10, color: '#1B5E20', fontWeight: 'bold' }}
                          >
                            Confidence: {Math.round(item.confidence_score * 100)}%
                          </Chip>
                        )}

                        <Text style={styles.advisoryMessage}>
                          {item.advisory_text || item.message}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    /* Advisory Record Body */
                    <View style={styles.advisoryBody}>
                      <Title style={styles.advisoryTitle}>{item.title}</Title>
                      <Paragraph style={styles.advisoryContent}>{item.message}</Paragraph>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F4',
  },
  header: {
    backgroundColor: '#2B3A67', // Monsoon Indigo header
    elevation: 4,
  },
  headerTitle: {
    color: '#F7F1E8',
    fontWeight: 'bold',
    fontSize: 17,
  },
  headerSubtitle: {
    color: '#E8A63A',
    fontSize: 11,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  offlineBanner: {
    backgroundColor: '#FFF3E0',
    marginBottom: 12,
    borderRadius: 10,
  },
  bannerText: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8E2',
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: '#F1F8E9',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  statLabel: {
    fontSize: 11,
    color: '#555555',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D8D0',
    borderWidth: 1,
    height: 32,
  },
  filterChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterChipText: {
    fontSize: 11.5,
    color: '#444444',
  },
  filterChipTextActive: {
    fontSize: 11.5,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  actionBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8EFE8',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  leafScanChip: {
    backgroundColor: '#E8F5E9',
    height: 24,
  },
  leafScanChipText: {
    color: '#1B5E20',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  advisoryTypeChip: {
    height: 24,
  },
  farmPill: {
    backgroundColor: '#F5F5F5',
    height: 24,
  },
  timeText: {
    fontSize: 11,
    color: '#888888',
  },
  leafScanBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diseaseName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C62828',
    lineHeight: 20,
  },
  confidenceChip: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 6,
    height: 22,
  },
  advisoryMessage: {
    fontSize: 12.5,
    color: '#333333',
    lineHeight: 17,
  },
  advisoryBody: {
    marginTop: 2,
  },
  advisoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  advisoryContent: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
});
