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
    setLoading(false);
  };

  const handleCreateTradeListing = async () => {
    if (!quantity || isNaN(Number(quantity))) return;
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
    } catch (err) {
      console.warn('Could not create trade listing on backend:', err);
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
    } catch (err) {
      console.warn('Trade confirmation failed:', err);
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
      />

      {/* 14-Day Price Forecast Section */}
      {forecast && (
        <Card style={styles.forecastCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title style={styles.forecastTitle}>📈 14-Day AI Price Forecast</Title>
              <Chip style={{ backgroundColor: '#E8F5E9' }}>Prophet AI</Chip>
            </View>
            <Paragraph style={styles.forecastSub}>
              {forecast.crop_name} @ {forecast.mandi_name}
            </Paragraph>

            <View style={styles.forecastBoxRow}>
              <View style={styles.forecastBox}>
                <Text style={styles.boxLabel}>Current Price</Text>
                <Title style={styles.boxValue}>INR {forecast.current_price.toFixed(0)}</Title>
              </View>
              <View style={styles.forecastBox}>
                <Text style={styles.boxLabel}>Projected Peak</Text>
                <Title style={[styles.boxValue, { color: '#2E7D32' }]}>INR {forecast.projected_max_price.toFixed(0)}</Title>
              </View>
            </View>

            <Text style={styles.recommendationText}>
              💡 {forecast.best_time_to_sell_recommendation}
            </Text>

            {/* Simulated Visual Trend Chart Bars */}
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1B5E20', marginTop: 10, marginBottom: 6 }}>
              Price Trajectory Trend (Next 14 Days):
            </Text>
            <View style={styles.barChartRow}>
              {forecast.forecast_prices.slice(0, 7).map((price, idx) => {
                const heightPct = Math.min(100, Math.max(30, ((price - 2000) / 1000) * 100));
                return (
                  <View key={idx} style={styles.barItem}>
                    <Text style={{ fontSize: 9, color: '#666' }}>d+{idx + 1}</Text>
                    <View style={[styles.barVisual, { height: heightPct }]} />
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1B5E20' }}>{Math.round(price)}</Text>
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Mandi Spot Rates List */}
      <Title style={styles.sectionHeader}>🏛️ Spot Mandi Price Feed</Title>
      {loading ? (
        <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#2E7D32" />
      ) : (
        filteredPrices.map((item) => (
          <Card key={item.id} style={styles.priceCard}>
            <Card.Content>
              <View style={styles.headerRow}>
                <View>
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
        <Card.Content>
          <Title style={styles.formHeader}>🌾 List Harvest for Sale</Title>
          <Paragraph style={styles.formSub}>
            Post your harvested crop quantity to connect directly with verified buyers and Mandis.
          </Paragraph>

          <TextInput
            label="Crop Type"
            value={cropType}
            onChangeText={setCropType}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Harvest Quantity (Quintals)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            icon="cash-register"
            onPress={handleCreateTradeListing}
            style={styles.submitBtn}
            loading={listingSubmitting}
          >
            Create Listing & Find Buyers
          </Button>
        </Card.Content>
      </Card>

      {/* Trade Confirmation Logistics Card */}
      {confirmedTrade && (
        <Card style={styles.confirmedCard}>
          <Card.Content>
            <Title style={{ color: '#1B5E20', fontSize: 18, fontWeight: 'bold' }}>
              🎉 Trade Confirmed!
            </Title>
            <Paragraph style={{ color: '#2E7D32', fontWeight: 'bold', marginVertical: 4 }}>
              Matched Buyer: {confirmedTrade.selected_buyer_name} ({confirmedTrade.mandi_name})
            </Paragraph>
            <Paragraph style={{ fontSize: 13, color: '#333' }}>
              Final Price: <Text style={{ fontWeight: 'bold', color: '#1B5E20' }}>INR {confirmedTrade.offered_price.toFixed(2)}/quintal</Text>
            </Paragraph>

            <Divider style={{ marginVertical: 10 }} />

            <Title style={{ fontSize: 14, fontWeight: 'bold', color: '#1B5E20' }}>
              🚚 Automated Logistics Channel:
            </Title>
            <Paragraph style={{ fontSize: 13, color: '#444', marginTop: 2 }}>
              • <Text style={{ fontWeight: 'bold' }}>Pickup Date:</Text> {confirmedTrade.logistics.pickup_date}
            </Paragraph>
            <Paragraph style={{ fontSize: 13, color: '#444' }}>
              • <Text style={{ fontWeight: 'bold' }}>Transporter:</Text> {confirmedTrade.logistics.transporter_name}
            </Paragraph>
            <Paragraph style={{ fontSize: 13, color: '#444' }}>
              • <Text style={{ fontWeight: 'bold' }}>Estimated Transit:</Text> {confirmedTrade.logistics.estimated_transit_hours} Hours
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Matched Buyers Results */}
      {buyerMatches.length > 0 && !confirmedTrade && (
        <View style={{ marginTop: 12 }}>
          <Title style={styles.sectionHeader}>🤝 Top 3 AI Ranked Buyer Matches</Title>
          {buyerMatches.map((match) => (
            <Card key={match.id} style={styles.matchCard}>
              <Card.Content>
                <View style={styles.headerRow}>
                  <Title style={styles.buyerName}>{match.buyer_name}</Title>
                  <Chip style={{ backgroundColor: '#E8F5E9' }}>Score: {(match.score || 95).toFixed(1)}</Chip>
                </View>

                <Paragraph style={styles.matchDetails}>
                  🏛️ {match.mandi_name} | 📍 Distance: {match.distance_km} km
                </Paragraph>
                
                <View style={styles.offeredPriceRow}>
                  <Text style={{ fontSize: 13, color: '#555' }}>Offered Price:</Text>
                  <Text style={styles.offeredPriceText}>INR {match.offered_price.toFixed(2)} / Quintal</Text>
                </View>

                {/* Explanation Box */}
                {match.explanation && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>💡 Why this match: {match.explanation}</Text>
                  </View>
                )}

                <Paragraph style={styles.logisticsNote}>
                  🚚 {match.logistics_note}
                </Paragraph>

                <Button
                  mode="contained"
                  icon="check-circle"
                  onPress={() => handleAcceptBuyer(match.id)}
                  loading={acceptingId === match.id}
                  style={styles.acceptBtn}
                >
                  Accept This Buyer
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
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
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#2E7D32',
  },
  forecastTitle: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forecastSub: {
    color: '#666666',
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  forecastBox: {
    backgroundColor: '#F1F8E9',
    padding: 10,
    borderRadius: 8,
    width: '48%',
  },
  boxLabel: {
    fontSize: 11,
    color: '#555555',
  },
  boxValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  recommendationText: {
    fontSize: 13,
    color: '#E65100',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    lineHeight: 18,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
    paddingTop: 10,
  },
  barItem: {
    alignItems: 'center',
    width: '12%',
  },
  barVisual: {
    width: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    marginVertical: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
    marginTop: 8,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
  commodityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  marketSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  spotPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderRadius: 12,
    elevation: 3,
  },
  formHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  formSub: {
    color: '#666',
    fontSize: 12,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    marginTop: 6,
    borderRadius: 8,
  },
  confirmedCard: {
    backgroundColor: '#E8F5E9',
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#388E3C',
  },
  buyerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  matchDetails: {
    fontSize: 12,
    color: '#666666',
    marginVertical: 2,
  },
  offeredPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  offeredPriceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 6,
  },
  explanationBox: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  explanationText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: 'bold',
  },
  logisticsNote: {
    fontSize: 12,
    color: '#555',
    backgroundColor: '#F5F5F5',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  acceptBtn: {
    backgroundColor: '#2E7D32',
    marginTop: 10,
    borderRadius: 8,
  },
});
