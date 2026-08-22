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
import { Colors, Spacing, BorderRadius, Typography, Shadows, CommonStyles } from '../src/theme/theme';

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
        return { label: 'DISEASE ALERT', bg: Colors.status.critical.bg, text: Colors.status.critical.text, icon: '🔴' };
      case 'irrigation':
        return { label: 'IRRIGATION PRESCRIPTION', bg: Colors.status.info.bg, text: Colors.status.info.text, icon: '💧' };
      case 'npk':
        return { label: 'NPK ADVISORY', bg: Colors.status.healthy.bg, text: Colors.status.healthy.text, icon: '🧪' };
      default:
        return { label: 'AGRONOMIC ADVISORY', bg: Colors.status.warning.bg, text: Colors.status.warning.text, icon: '📢' };
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

        {/* Vertical Timeline Items (Newest First) */}
        {!loading && (
          <View style={styles.timelineContainer}>
            {filteredTimeline.map((item, index) => {
              const isLeafScan = item.item_type === 'leaf_scan';
              const badge = getAdvisoryBadge(item.advisory_type);

              let nodeIcon = isLeafScan ? '🔬' : badge.icon;
              let nodeBg = isLeafScan ? Colors.primaryTint : badge.bg;
              let nodeBorder = isLeafScan ? Colors.primary : badge.text;

              if (isLeafScan && item.predicted_disease) {
                if (item.predicted_disease.toLowerCase().includes('healthy')) {
                  nodeIcon = '🌿';
                  nodeBg = Colors.status.healthy.bg;
                  nodeBorder = Colors.status.healthy.main;
                } else {
                  nodeIcon = '🔬';
                  nodeBg = Colors.status.critical.bg;
                  nodeBorder = Colors.status.critical.main;
                }
              }

              const isFirst = index === 0;
              const isLast = index === filteredTimeline.length - 1;

              return (
                <View key={item.id || index} style={styles.timelineRow}>
                  {/* Left Column: Connected Vertical Spine & Node */}
                  <View style={styles.spineColumn}>
                    <View style={[styles.spineLineTop, isFirst && styles.spineLineHidden]} />
                    <View style={[styles.timelineNodeCircle, { backgroundColor: nodeBg, borderColor: nodeBorder }]}>
                      <Text style={styles.timelineNodeIcon}>{nodeIcon}</Text>
                    </View>
                    <View style={[styles.spineLineBottom, isLast && styles.spineLineHidden]} />
                  </View>

                  {/* Right Column: Date Pill & Content Card */}
                  <View style={styles.timelineContentColumn}>
                    {/* Timestamp & Farm Meta Header */}
                    <View style={styles.timelineItemMeta}>
                      <Text style={styles.timelineTimestampText}>🕒 {formatTimestamp(item.timestamp)}</Text>
                      <Chip style={styles.farmPill} textStyle={styles.farmPillText}>
                        🌾 {item.farm_name} ({item.crop_type})
                      </Chip>
                    </View>

                    {/* Entry Content Card */}
                    <Card style={[styles.timelineCard, { borderLeftColor: nodeBorder }]}>
                      <Card.Content style={styles.timelineCardContent}>
                        {/* Type Badge Row */}
                        <View style={styles.itemBadgeRow}>
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
                              textStyle={{ color: badge.text, fontSize: 10, fontWeight: '700' }}
                            >
                              {badge.label}
                            </Chip>
                          )}
                        </View>

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

                            <View style={{ flex: 1, marginLeft: Spacing.sm + 2 }}>
                              <Title style={styles.diseaseName}>
                                {item.predicted_disease || item.title}
                              </Title>

                              {item.confidence_score !== undefined && (
                                <Chip
                                  style={styles.confidenceChip}
                                  textStyle={{ fontSize: 10, color: Colors.primaryDark, fontWeight: '700' }}
                                >
                                  Confidence: {Math.round(item.confidence_score * 100)}%
                                </Chip>
                              )}

                              <Text style={styles.advisoryMessage}>
                                💡 {item.advisory_text || item.message}
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
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screenContainer,
  },
  header: {
    backgroundColor: Colors.primaryDark,
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  headerSubtitle: {
    color: Colors.accent,
    fontSize: 11,
  },
  scrollContainer: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: Colors.status.warning.bg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.warning.border,
  },
  bannerText: {
    color: Colors.status.warning.text,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: Colors.status.critical.bg,
    borderColor: Colors.status.critical.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.status.critical.text,
    fontSize: 12.5,
    fontWeight: '700',
  },
  content: {
    ...CommonStyles.screenContent,
  },
  statsCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.lg,
  },
  statsCardContent: {
    padding: Spacing.md + 2,
  },
  statsTitle: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
  },
  statsSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  filterChip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderDark,
    borderWidth: 1,
    height: 32,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    fontSize: 11.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm + 2,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    ...CommonStyles.card,
    paddingVertical: Spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    ...Typography.screenTitle,
    color: Colors.primaryDark,
    marginBottom: Spacing.xs + 2,
  },
  emptyDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },

  // Connected Vertical Timeline Styles
  timelineContainer: {
    paddingVertical: Spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.md,
  },
  spineColumn: {
    width: 38,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  spineLineTop: {
    width: 2,
    flex: 0.12,
    backgroundColor: Colors.borderDark,
  },
  spineLineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderDark,
  },
  spineLineHidden: {
    opacity: 0,
  },
  timelineNodeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    ...Shadows.subtle,
    zIndex: 2,
  },
  timelineNodeIcon: {
    fontSize: 16,
  },
  timelineContentColumn: {
    flex: 1,
  },
  timelineItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xxs,
  },
  timelineTimestampText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  farmPill: {
    backgroundColor: Colors.surfaceSubtle,
    height: 22,
  },
  farmPillText: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timelineCard: {
    ...CommonStyles.card,
    borderLeftWidth: 4,
  },
  timelineCardContent: {
    padding: Spacing.md,
  },
  itemBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  leafScanChip: {
    backgroundColor: Colors.primaryTint,
    height: 24,
  },
  leafScanChipText: {
    color: Colors.primaryDark,
    fontSize: 9.5,
    fontWeight: '700',
  },
  advisoryTypeChip: {
    height: 24,
  },
  leafScanBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diseaseName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.status.critical.main,
    lineHeight: 20,
  },
  confidenceChip: {
    backgroundColor: Colors.primaryTint,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs + 2,
    height: 22,
  },
  advisoryMessage: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  advisoryBody: {
    marginTop: Spacing.xxs,
  },
  advisoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: Spacing.xs,
  },
  advisoryContent: {
    ...Typography.body,
    lineHeight: 18,
  },
});
