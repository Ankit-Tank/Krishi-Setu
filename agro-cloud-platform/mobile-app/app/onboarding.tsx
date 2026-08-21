import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AgroApiService, IdentityService, API_BASE_URL } from '../src/services/api';

const COMMON_CROPS = ['Wheat', 'Rice', 'Cotton', 'Maize', 'Sugarcane', 'Mustard'];

export default function OnboardingScreen() {
  const router = useRouter();

  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [cropType, setCropType] = useState('Wheat');
  const [areaAcres, setAreaAcres] = useState('5.0');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitOnboarding = async () => {
    setErrorMsg('');

    if (!farmerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!farmName.trim()) {
      setErrorMsg('Please enter your farm or plot name.');
      return;
    }
    if (!areaAcres.trim() || isNaN(Number(areaAcres)) || Number(areaAcres) <= 0) {
      setErrorMsg('Please enter a valid farm area in acres.');
      return;
    }
    if (!region.trim()) {
      setErrorMsg('Please enter your village, district, or region.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Farmer Record in Backend
      const farmer = await AgroApiService.createFarmer({
        name: farmerName.trim(),
        phone: phone.trim(),
        preferred_language: 'hi',
        region: region.trim(),
      });

      // 2. Create Farm Record under Farmer ID
      const farm = await AgroApiService.createFarm({
        farmer_id: farmer.id,
        name: farmName.trim(),
        crop_type: cropType,
        area_acres: Number(areaAcres),
      });

      // 3. Save Persistent Per-Device Identity
      await IdentityService.saveIdentity({
        farmer_id: farmer.id,
        farm_id: farm.id,
        farmer_name: farmer.name,
        phone: farmer.phone,
        farm_name: farm.name,
        crop_type: farm.crop_type,
        area_acres: farm.area_acres,
        region: farmer.region,
      });

      // 4. Navigate into Main App Tabs
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      const msg = err?.message || String(err);
      const isNetworkError = msg.includes('Network') || msg.includes('timeout') || msg.includes('Failed to fetch') || msg.includes('Aborted') || msg.includes('AbortError');
      
      if (isNetworkError) {
        setErrorMsg(`Couldn't reach the server at ${API_BASE_URL}. Please check your Wi-Fi connection, ensure your phone and computer are on the same Wi-Fi network, and that the backend server is running.`);
      } else {
        setErrorMsg(msg || 'Could not register profile. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineMedium" style={styles.title}>
            🌱 Welcome to KrishiSetu
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Register your farmer profile & farm plot details to get personalized AI agronomic advisories.
          </Text>

          {errorMsg ? (
            <Card style={styles.errorCard}>
              <Card.Content style={styles.errorCardContent}>
                <View style={styles.errorHeaderRow}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorTitle}>Server Connection Failed</Text>
                </View>
                <Text style={styles.errorDescription}>{errorMsg}</Text>
                <Button
                  mode="contained-tonal"
                  icon="refresh"
                  onPress={handleSubmitOnboarding}
                  loading={loading}
                  disabled={loading}
                  buttonColor="#FFCDD2"
                  textColor="#B71C1C"
                  style={styles.retryBtn}
                >
                  Retry Connection
                </Button>
              </Card.Content>
            </Card>
          ) : null}

          {/* Section 1: Farmer Details */}
          <Text variant="titleSmall" style={styles.sectionHeader}>
            👨‍🌾 1. Farmer Identity
          </Text>

          <TextInput
            label="Full Name *"
            placeholder="e.g. Ramesh Patel / Gurpreet Singh"
            value={farmerName}
            onChangeText={setFarmerName}
            mode="outlined"
            style={styles.input}
            outlineColor="#C8E6C9"
            activeOutlineColor="#2E7D32"
          />

          <TextInput
            label="Mobile Phone Number *"
            placeholder="10-digit mobile number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            mode="outlined"
            left={<TextInput.Affix text="+91 " />}
            style={styles.input}
            outlineColor="#C8E6C9"
            activeOutlineColor="#2E7D32"
          />

          <TextInput
            label="Village / Tehsil / Region Name *"
            placeholder="e.g. Ludhiana, Punjab / Khanna, Fatehgarh"
            value={region}
            onChangeText={setRegion}
            mode="outlined"
            style={styles.input}
            outlineColor="#C8E6C9"
            activeOutlineColor="#2E7D32"
          />

          {/* Section 2: Farm Plot Details */}
          <Text variant="titleSmall" style={styles.sectionHeader}>
            🌾 2. Farm Plot Details
          </Text>

          <TextInput
            label="Farm / Plot Name *"
            placeholder="e.g. Khanna Wheat Plot A / River Bank Field"
            value={farmName}
            onChangeText={setFarmName}
            mode="outlined"
            style={styles.input}
            outlineColor="#C8E6C9"
            activeOutlineColor="#2E7D32"
          />

          <Text style={styles.chipLabel}>Select Primary Crop Type *</Text>
          <View style={styles.chipRow}>
            {COMMON_CROPS.map((crop) => (
              <Chip
                key={crop}
                selected={cropType === crop}
                onPress={() => setCropType(crop)}
                style={[
                  styles.chip,
                  cropType === crop ? styles.chipSelected : styles.chipUnselected,
                ]}
                textStyle={{ color: cropType === crop ? '#FFFFFF' : '#2E7D32' }}
              >
                {crop}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Plot Area in Acres *"
            placeholder="e.g. 5.0"
            value={areaAcres}
            onChangeText={setAreaAcres}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            outlineColor="#C8E6C9"
            activeOutlineColor="#2E7D32"
          />

          <Button
            mode="contained"
            onPress={handleSubmitOnboarding}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            contentStyle={{ paddingVertical: 8 }}
          >
            Create Profile & Start Dashboard
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    padding: 16,
    paddingVertical: 32,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  subtitle: {
    textAlign: 'center',
    color: '#388E3C',
    marginBottom: 16,
    marginTop: 4,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorCardContent: {
    padding: 12,
  },
  errorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#C62828',
    fontSize: 14,
  },
  errorDescription: {
    fontSize: 13,
    color: '#B71C1C',
    lineHeight: 18,
    marginBottom: 10,
  },
  retryBtn: {
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 8,
  },
  sectionHeader: {
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: '#F1F8E9',
    padding: 8,
    borderRadius: 6,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 6,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#2E7D32',
  },
  chipUnselected: {
    backgroundColor: '#F1F8E9',
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    marginTop: 16,
    borderRadius: 10,
  },
});
