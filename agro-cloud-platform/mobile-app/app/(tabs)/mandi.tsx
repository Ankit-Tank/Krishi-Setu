import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, Text, Title, Paragraph, Chip, Searchbar, ActivityIndicator, Button, TextInput, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  AgroApiService,
  IdentityService,
  MandiPrice,
  PriceForecastResult,
  TradeListingResponse,
  BuyerMatchResponse,
  TradeConfirmResponse
} from '../../src/services/api';
import { Colors, Spacing, BorderRadius, Typography, Shadows, CommonStyles } from '../../src/theme/theme';

export default function MandiScreen() {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [forecast, setForecast] = useState<PriceForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Trade listing form states
  const [quantity, setQuantity] = useState('50');
  const [cropType, setCropType] = useState('Wheat');
  const [farmerId, setFarmerId] = useState(1);
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [createdListing, setCreatedListing] = useState<TradeListingResponse | null>(null);
  const [buyerMatches, setBuyerMatches] = useState<BuyerMatchResponse[]>([]);
  
  // Trade confirmation state
  const [confirmedTrade, setConfirmedTrade] = useState<TradeConfirmResponse | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const identity = await IdentityService.getSavedIdentity();
      const activeCrop = identity?.crop_type || 'Wheat';
      const activeFarmerId = identity?.farmer_id || 1;

      setCropType(activeCrop);
      setFarmerId(activeFarmerId);

      const [pricesRes, forecastRes] = await Promise.all([
        AgroApiService.getMandiPrices(),
        AgroApiService.get14DayPriceForecast(activeCrop, 'Khanna Mandi')
      ]);
      setPrices(pricesRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      console.warn('Market data fetching error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTradeListing = async () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      alert('Please enter a valid harvest quantity in quintals.');
      return;
    }
    setListingSubmitting(true);
    setConfirmedTrade(null);
    try {
      const listing = await AgroApiService.createTradeListing(
        farmerId,
        cropType,
        Number(quantity),
        new Date().toISOString().split('T')[0]
      );
      setCreatedListing(listing);

      const matches = await AgroApiService.getBuyerMatches(listing.id);
      setBuyerMatches(matches);
    } catch (err: any) {
      console.warn('Could not create trade listing on backend:', err);
      alert(err?.message || "Couldn't connect to create listing - please check your WiFi and try again.");
    } finally {
      setListingSubmitting(false);
    }
  };

  const handleAcceptBuyer = async (buyerMatchId: number) => {
    if (!createdListing) return;
    setAcceptingId(buyerMatchId);
    try {
      const confirmRes = await AgroApiService.confirmTradeListing(createdListing.id, buyerMatchId);
      setConfirmedTrade(confirmRes);
    } catch (err: any) {
      console.warn('Trade confirmation failed:', err);
      alert(err?.message || "Couldn't confirm trade - please check your WiFi and try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredPrices = prices.filter(
    (item) =>
      item.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mandi_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Searchbar
        placeholder={t('mandi.searchPlaceholder')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ color: Colors.textPrimary }}
        iconColor={Colors.primary}
      />

      {/* 14-Day Price Forecast Section */}
      {forecast && (
        <Card style={styles.forecastCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Title style={styles.forecastTitle}>{t('mandi.priceForecastTitle')}</Title>
              <View style={styles.prophetPill}>
                <Text style={styles.prophetPillText}>Prophet AI</Text>
              </View>
            </View>
            <Paragraph style={styles.forecastSub}>
              {forecast.crop_name} @ {forecast.mandi_name}
            </Paragraph>

            <View style={styles.forecastBoxRow}>
              <View style={styles.forecastBox}>
                <Text style={styles.boxLabel}>{t('mandi.currentPrice')}</Text>
                <Title style={styles.boxValue}>INR {forecast.current_price.toFixed(0)}</Title>
              </View>
              <View style={[styles.forecastBox, { backgroundColor: Colors.primaryTint }]}>
                <Text style={styles.boxLabel}>{t('mandi.projectedPeak')}</Text>
                <Title style={[styles.boxValue, { color: Colors.primary }]}>INR {forecast.projected_max_price.toFixed(0)}</Title>
              </View>
            </View>

            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationLabel}>{t('mandi.optimalSellingRec')}</Text>
              <Text style={styles.recommendationText}>
                {forecast.best_time_to_sell_recommendation}
              </Text>
            </View>

            {/* 7-Day Visual Price Trajectory Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                {t('mandi.priceTrajectoryTitle')}
              </Text>
              <View style={styles.barChartRow}>
                {(() => {
                  const prices7d = (forecast.forecast_prices || []).slice(0, 7);
                  const minPrice = prices7d.length ? Math.min(...prices7d) : 2000;
                  const maxPrice = prices7d.length ? Math.max(...prices7d) : 2400;
                  const priceRange = maxPrice - minPrice || 1;

                  return prices7d.map((price, idx) => {
                    const barHeight = Math.round(18 + ((price - minPrice) / priceRange) * 36);
                    const isPeak = price === maxPrice;
                    return (
                      <View key={idx} style={styles.barItem}>
                        <Text style={[styles.barPriceText, isPeak ? styles.barPriceTextPeak : null]}>
                          ₹{Math.round(price)}
                        </Text>
                        <View
                          style={[
                            styles.barVisual,
                            { height: barHeight },
                            isPeak ? styles.barVisualPeak : null,
                          ]}
                        />
                        <Text style={[styles.barDayText, isPeak ? styles.barDayTextPeak : null]}>
                          d+{idx + 1}
                        </Text>
                      </View>
                    );
                  });
                })()}
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Mandi Spot Rates List */}
      <Title style={styles.sectionHeader}>{t('mandi.spotPriceFeed')}</Title>
      {loading ? (
        <ActivityIndicator style={{ marginVertical: Spacing.lg }} size="large" color={Colors.primary} />
      ) : (
        filteredPrices.map((item) => (
          <Card key={item.id} style={styles.priceCard}>
            <Card.Content style={styles.priceCardContent}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Title style={styles.commodityTitle}>{item.crop_name}</Title>
                  <Paragraph style={styles.marketSubtitle}>
                    🏛️ {item.mandi_name} ({item.region})
                  </Paragraph>
                </View>
                <Title style={styles.spotPriceValue}>INR {item.price_per_quintal.toFixed(0)}/qtl</Title>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      {/* Trade Listing Form */}
      <Card style={styles.formCard}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.formHeader}>{t('mandi.listHarvestTitle')}</Title>
          <Paragraph style={styles.formSub}>
            {t('mandi.listHarvestDesc')}
          </Paragraph>

          <TextInput
            label={t('mandi.cropType')}
            value={cropType}
            onChangeText={setCropType}
            mode="outlined"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
          />
          <TextInput
            label={t('mandi.harvestQuantity')}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            mode="outlined"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
          />

          <Button
            mode="contained"
            icon="cash-register"
            onPress={handleCreateTradeListing}
            style={styles.submitBtn}
            buttonColor={Colors.primary}
            loading={listingSubmitting}
          >
            {t('mandi.createListingBtn')}
          </Button>
        </Card.Content>
      </Card>

      {/* Trade Confirmation Logistics Card */}
      {confirmedTrade && (
        <Card style={styles.confirmedCard}>
          <Card.Content style={styles.cardContent}>
            <Title style={{ color: Colors.primaryDark, fontSize: 18, fontWeight: '700' }}>
              {t('mandi.tradeConfirmed')}
            </Title>
            <Paragraph style={{ color: Colors.primary, fontWeight: '700', marginVertical: Spacing.xs }}>
              {t('mandi.matchedBuyer', {
                buyer: confirmedTrade.selected_buyer_name,
                mandi: confirmedTrade.mandi_name,
              })}
            </Paragraph>
            <Paragraph style={{ ...Typography.body, color: Colors.textPrimary }}>
              {t('mandi.finalPrice', {
                price: `INR ${confirmedTrade.offered_price.toFixed(2)}/quintal`,
              })}
            </Paragraph>

            <Divider style={{ marginVertical: Spacing.md }} />

            <Title style={{ ...Typography.subTitle, color: Colors.primaryDark }}>
              {t('mandi.automatedLogistics')}
            </Title>
            <Paragraph style={styles.logisticsPoint}>
              • <Text style={{ fontWeight: '700' }}>{t('mandi.pickupDate')}</Text> {confirmedTrade.logistics.pickup_date}
            </Paragraph>
            <Paragraph style={styles.logisticsPoint}>
              • <Text style={{ fontWeight: '700' }}>{t('mandi.transporter')}</Text> {confirmedTrade.logistics.transporter_name}
            </Paragraph>
            <Paragraph style={styles.logisticsPoint}>
              • <Text style={{ fontWeight: '700' }}>{t('mandi.estimatedTransit')}</Text> {confirmedTrade.logistics.estimated_transit_hours} {t('mandi.hours')}
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Matched Buyers Results */}
      {buyerMatches.length > 0 && !confirmedTrade && (
        <View style={{ marginTop: Spacing.md }}>
          <Title style={styles.sectionHeader}>{t('mandi.topBuyerMatches')}</Title>
          {buyerMatches.map((match, index) => {
            const isTopMatch = index === 0;
            return (
              <Card
                key={match.id}
                style={[
                  styles.matchCard,
                  isTopMatch ? styles.matchCardTop : styles.matchCardStandard,
                ]}
              >
                {isTopMatch && (
                  <View style={styles.topMatchBanner}>
                    <Text style={styles.topMatchBannerText}>{t('mandi.topMatchBanner')}</Text>
                  </View>
                )}

                <Card.Content style={styles.cardContent}>
                  {/* Buyer Name & Match Score Header */}
                  <View style={styles.headerRow}>
                    <View style={{ flex: 1, paddingRight: Spacing.sm }}>
                      <Title style={isTopMatch ? styles.topBuyerName : styles.buyerName}>
                        🏢 {match.buyer_name}
                      </Title>
                    </View>
                    <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                      {isTopMatch && (
                        <View style={styles.bestMatchChip}>
                          <Text style={styles.bestMatchChipText}>{t('mandi.bestMatch')}</Text>
                        </View>
                      )}
                      <View style={styles.scorePill}>
                        <Text style={styles.scorePillText}>
                          {t('mandi.score', { score: (match.score || 95).toFixed(1) })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Divider style={{ marginVertical: Spacing.sm }} />

                  {/* Labeled Row 1: Offered Price */}
                  <View style={styles.labeledDetailRow}>
                    <Text style={styles.detailRowLabel}>{t('mandi.offeredPrice')}</Text>
                    <Text style={isTopMatch ? styles.topOfferedPriceText : styles.offeredPriceText}>
                      INR {match.offered_price.toFixed(2)} / Quintal
                    </Text>
                  </View>

                  {/* Labeled Row 2: Distance & APMC Mandi */}
                  <View style={styles.labeledDetailRow}>
                    <Text style={styles.detailRowLabel}>{t('mandi.distanceMandi')}</Text>
                    <Text style={styles.detailRowValue}>
                      {match.distance_km} km away • {match.mandi_name}
                    </Text>
                  </View>

                  {/* Labeled Row 3: Why This Match Reasoning */}
                  {match.explanation && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle}>{t('mandi.whyThisMatch')}</Text>
                      <Text style={styles.explanationText}>{match.explanation}</Text>
                    </View>
                  )}

                  {/* Labeled Row 4: Logistics Channel */}
                  <View style={styles.logisticsRow}>
                    <Text style={styles.logisticsLabel}>{t('mandi.logisticsChannel')}</Text>
                    <Text style={styles.logisticsValue}>{match.logistics_note}</Text>
                  </View>

                  {/* Action Button */}
                  <Button
                    mode="contained"
                    icon="check-circle"
                    onPress={() => handleAcceptBuyer(match.id)}
                    loading={acceptingId === match.id}
                    disabled={acceptingId !== null}
                    style={isTopMatch ? styles.topAcceptBtn : styles.acceptBtn}
                    buttonColor={isTopMatch ? Colors.primary : Colors.primaryLight}
                    labelStyle={{ fontSize: 13, fontWeight: '700', color: isTopMatch ? '#FFFFFF' : Colors.primaryDark }}
                  >
                    {t('mandi.acceptBuyerBtn')}
                  </Button>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      )}
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
  searchBar: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  forecastCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.lg,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
  },
  forecastTitle: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
  },
  forecastSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  forecastBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  boxLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  boxValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginTop: Spacing.xxs,
  },
  recommendationBox: {
    backgroundColor: Colors.status.warning.bg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.warning.border,
    marginBottom: Spacing.sm,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B78103',
    marginBottom: 3,
  },
  recommendationText: {
    fontSize: 13,
    color: Colors.status.warning.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#F1F8E9',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 95,
    paddingHorizontal: Spacing.xxs,
  },
  barItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    height: '100%',
  },
  barPriceText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  barPriceTextPeak: {
    fontWeight: '800',
    color: '#1B5E20',
    fontSize: 9.5,
  },
  barVisual: {
    width: 14,
    backgroundColor: '#81C784',
    borderRadius: BorderRadius.xs,
    marginBottom: 4,
  },
  barVisualPeak: {
    backgroundColor: '#2E7D32',
  },
  barDayText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  barDayTextPeak: {
    fontWeight: '800',
    color: '#1B5E20',
  },
  sectionHeader: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  priceCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.sm + 2,
  },
  priceCardContent: {
    padding: Spacing.md,
  },
  commodityTitle: {
    ...Typography.cardTitle,
    color: Colors.primaryDark,
  },
  marketSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  spotPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  formCard: {
    ...CommonStyles.card,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  formHeader: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
  },
  formSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  submitBtn: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  confirmedCard: {
    backgroundColor: Colors.status.healthy.bg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.status.healthy.main,
    ...Shadows.card,
  },
  logisticsPoint: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },
  matchCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  matchCardStandard: {
    borderLeftWidth: 5,
    borderLeftColor: Colors.primaryMedium,
  },
  matchCardTop: {
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.floating,
  },
  topMatchBanner: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  topMatchBannerText: {
    color: '#FFD54F',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topBuyerName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  buyerName: {
    ...Typography.cardTitle,
    color: Colors.primaryDark,
  },
  prophetPill: {
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  prophetPillText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  bestMatchChip: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD54F',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  bestMatchChipText: {
    color: '#E65100',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  scorePill: {
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  scorePillText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  labeledDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  detailRowLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  detailRowValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  offeredPriceText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  topOfferedPriceText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  explanationBox: {
    backgroundColor: Colors.accentTint,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginVertical: Spacing.xs,
  },
  explanationTitle: {
    fontSize: 11,
    color: Colors.accentDark,
    fontWeight: '700',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 12.5,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  logisticsRow: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  logisticsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  logisticsValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  acceptBtn: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  topAcceptBtn: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    elevation: 3,
  },
});
