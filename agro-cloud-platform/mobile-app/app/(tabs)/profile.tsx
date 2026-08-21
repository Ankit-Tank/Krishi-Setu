import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Card,
  Text,
  Title,
  Button,
  TextInput,
  Chip,
  SegmentedButtons,
  Switch,
  Divider,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { IdentityService, AgroApiService, FarmerIdentity, formatFriendlyErrorMessage } from '../../src/services/api';
import { SampleFarm } from '../../src/data/sampleFarms';
import { SampleFarmState } from '../../src/services/sampleFarmState';
import SampleFarmsModal from '../../src/components/SampleFarmsModal';

const COMMON_CROPS = ['Wheat', 'Rice', 'Cotton', 'Maize', 'Sugarcane', 'Mustard'];

const IRRIGATION_OPTIONS = [
  { value: 'borewell', label: 'Borewell 🚰' },
  { value: 'canal', label: 'Canal 🌊' },
  { value: 'rainfed', label: 'Rainfed 🌧️' },
  { value: 'other', label: 'Other 🔄' },
];

const SEASON_OPTIONS = [
  { value: 'Kharif', label: 'Kharif' },
  { value: 'Rabi', label: 'Rabi' },
  { value: 'both', label: 'Both' },
];

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [identity, setIdentity] = useState<FarmerIdentity | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sampleModalVisible, setSampleModalVisible] = useState(false);
  const [activeSampleFarmId, setActiveSampleFarmId] = useState<string | null>(null);

  // Editable Form Fields
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [farmName, setFarmName] = useState('');
  const [cropType, setCropType] = useState('Wheat');
  const [areaAcres, setAreaAcres] = useState('5.0');
  const [irrigationSource, setIrrigationSource] = useState('borewell');
  const [preferredSeason, setPreferredSeason] = useState('both');

  // App Settings Fields
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      const saved = await IdentityService.getSavedIdentity();
      if (saved) {
        setIdentity(saved);
        setFarmerName(saved.farmer_name || '');
        setPhone(saved.phone || '');
        setRegion(saved.region || '');
        setExperienceYears(saved.experience_years !== undefined ? String(saved.experience_years) : '5');
        setFarmName(saved.farm_name || '');
        setCropType(saved.crop_type || 'Wheat');
        setAreaAcres(saved.area_acres !== undefined ? String(saved.area_acres) : '5.0');
        setIrrigationSource(saved.irrigation_source || 'borewell');
        setPreferredSeason(saved.preferred_season || 'both');
      }

      const activeSampleId = await SampleFarmState.getActiveSampleFarmId();
      setActiveSampleFarmId(activeSampleId);
    } catch (err) {
      console.warn('Error loading identity in Profile:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    i18n.changeLanguage(val);
  };

  const handleSaveProfile = async () => {
    setErrorMessage('');
    setSaveSuccess(false);

    if (!farmerName.trim()) {
      setErrorMessage('Please enter farmer name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!region.trim()) {
      setErrorMessage('Please enter your village/region.');
      return;
    }
    if (!farmName.trim()) {
      setErrorMessage('Please enter farm plot name.');
      return;
    }
    if (!areaAcres.trim() || isNaN(Number(areaAcres)) || Number(areaAcres) <= 0) {
      setErrorMessage('Please enter a valid farm area in acres.');
      return;
    }

    setSaving(true);

    try {
      const expNum = Math.max(0, parseInt(experienceYears, 10) || 0);
      const acresNum = Number(areaAcres) || 1.0;

      // 1. Update Backend if IDs exist
      if (identity?.farmer_id) {
        await AgroApiService.updateFarmer(identity.farmer_id, {
          name: farmerName.trim(),
          phone: phone.trim(),
          region: region.trim(),
          experience_years: expNum,
          preferred_language: language,
        }).catch((e) => console.warn('Non-blocking backend farmer update error:', e));
      }

      if (identity?.farm_id) {
        await AgroApiService.updateFarm(identity.farm_id, {
          name: farmName.trim(),
          crop_type: cropType,
          area_acres: acresNum,
          irrigation_source: irrigationSource,
          preferred_season: preferredSeason,
        }).catch((e) => console.warn('Non-blocking backend farm update error:', e));
      }

      // 2. Persist in Local Identity
      const updatedIdentity: FarmerIdentity = {
        farmer_id: identity?.farmer_id || 1,
        farm_id: identity?.farm_id || 1,
        farmer_name: farmerName.trim(),
        phone: phone.trim(),
        farm_name: farmName.trim(),
        crop_type: cropType,
        area_acres: acresNum,
        region: region.trim(),
        irrigation_source: irrigationSource,
        experience_years: expNum,
        preferred_season: preferredSeason,
      };

      await IdentityService.saveIdentity(updatedIdentity);
      setIdentity(updatedIdentity);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving profile changes:', err);
      setErrorMessage(formatFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSampleFarm = async (farm: SampleFarm) => {
    await SampleFarmState.setActiveSampleFarmId(farm.id);
    setActiveSampleFarmId(farm.id);
    router.push('/(tabs)');
  };

  const handleExitSampleMode = async () => {
    await SampleFarmState.clearSampleFarmMode();
    setActiveSampleFarmId(null);
  };

  const handleResetData = async () => {
    try {
      await IdentityService.clearIdentity();
      await SampleFarmState.clearSampleFarmMode();
    } catch (e) {
      console.warn('Error clearing identity:', e);
    }
    router.replace('/onboarding');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'KS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 12, color: '#2E7D32', fontWeight: 'bold' }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* 1. CENTERED HERO AVATAR & QUICK BIO */}
      <Card style={styles.heroCard}>
        <Card.Content style={styles.heroCardContent}>
          <View style={styles.avatarWrapper}>
            <Avatar.Text
              size={76}
              label={getInitials(identity?.farmer_name || farmerName)}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.avatarBadge}>
              <Text style={{ fontSize: 13 }}>🌾</Text>
            </View>
          </View>

          <Title style={styles.heroName}>{identity?.farmer_name || farmerName || 'Registered Farmer'}</Title>
          <Text style={styles.heroSubtitle}>
            📱 +91 {identity?.phone || phone || 'N/A'} • 📍 {identity?.region || region || 'India'}
          </Text>

          <View style={styles.heroBadgesRow}>
            <Chip icon="leaf" style={styles.heroChip} textStyle={styles.heroChipText}>
              {cropType} ({areaAcres} Ac)
            </Chip>
            <Chip icon="water" style={styles.heroChip} textStyle={styles.heroChipText}>
              {irrigationSource.toUpperCase()}
            </Chip>
            <Chip icon="calendar" style={styles.heroChip} textStyle={styles.heroChipText}>
              {preferredSeason.toUpperCase()}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* FEEDBACK BANNERS */}
      {saveSuccess && (
        <Card style={styles.successCard}>
          <Card.Content style={styles.feedbackCardContent}>
            <Text style={styles.successText}>✅ Profile and farm details updated successfully!</Text>
          </Card.Content>
        </Card>
      )}

      {errorMessage ? (
        <Card style={styles.errorCard}>
          <Card.Content style={styles.feedbackCardContent}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </Card.Content>
        </Card>
      ) : null}

      {/* 2. SECTION 1: FARMER & FARM INFORMATION */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBox}>
              <Text style={{ fontSize: 18 }}>👨‍🌾</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Title style={styles.sectionTitle}>Farmer & Farm Information</Title>
              <Text style={styles.sectionSubtitle}>Edit your personal identity and agricultural plot configuration</Text>
            </View>
          </View>

          <Divider style={styles.sectionDivider} />

          {/* Sub-Group: Farmer Identity */}
          <Text style={styles.subGroupTitle}>Farmer Personal Details</Text>

          <TextInput
            label="Full Name *"
            value={farmerName}
            onChangeText={setFarmerName}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Mobile Phone (10 digits) *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
          />

          <View style={styles.twoColumnRow}>
            <TextInput
              label="Region / Village *"
              value={region}
              onChangeText={setRegion}
              mode="outlined"
              style={[styles.input, { flex: 1, marginRight: 6 }]}
              left={<TextInput.Icon icon="map-marker" />}
            />
            <TextInput
              label="Exp. (Years) *"
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="number-pad"
              maxLength={2}
              mode="outlined"
              style={[styles.input, { width: 110 }]}
              left={<TextInput.Icon icon="clock-outline" />}
            />
          </View>

          {/* Sub-Group: Farm Plot Details */}
          <Text style={[styles.subGroupTitle, { marginTop: 14 }]}>Farm Plot Details</Text>

          <TextInput
            label="Farm / Plot Name *"
            value={farmName}
            onChangeText={setFarmName}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="home-variant" />}
          />

          <Text style={styles.chipFieldLabel}>Primary Crop Type *</Text>
          <View style={styles.chipSelectorRow}>
            {COMMON_CROPS.map((crop) => {
              const isSelected = cropType.toLowerCase() === crop.toLowerCase();
              return (
                <Chip
                  key={crop}
                  selected={isSelected}
                  onPress={() => setCropType(crop)}
                  style={[styles.selectorChip, isSelected ? styles.selectorChipActive : styles.selectorChipInactive]}
                  textStyle={isSelected ? styles.selectorChipTextActive : styles.selectorChipTextInactive}
                  mode="outlined"
                >
                  {crop}
                </Chip>
              );
            })}
          </View>

          <TextInput
            label="Plot Area in Acres *"
            value={areaAcres}
            onChangeText={setAreaAcres}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="ruler-square" />}
          />

          <Text style={styles.chipFieldLabel}>Irrigation Source *</Text>
          <View style={styles.chipSelectorRow}>
            {IRRIGATION_OPTIONS.map((item) => {
              const isSelected = irrigationSource.toLowerCase() === item.value.toLowerCase();
              return (
                <Chip
                  key={item.value}
                  selected={isSelected}
                  onPress={() => setIrrigationSource(item.value)}
                  style={[styles.selectorChip, isSelected ? styles.selectorChipActive : styles.selectorChipInactive]}
                  textStyle={isSelected ? styles.selectorChipTextActive : styles.selectorChipTextInactive}
                  mode="outlined"
                >
                  {item.label}
                </Chip>
              );
            })}
          </View>

          <Text style={styles.chipFieldLabel}>Crop Season Preference *</Text>
          <SegmentedButtons
            value={preferredSeason}
            onValueChange={setPreferredSeason}
            buttons={SEASON_OPTIONS}
            style={styles.segmentedButtons}
          />

          {/* Save Button */}
          <Button
            mode="contained"
            icon="content-save-check"
            onPress={handleSaveProfile}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
          >
            Save Profile Changes
          </Button>
        </Card.Content>
      </Card>

      {/* 3. SECTION 2: APP SETTINGS */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBox}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Title style={styles.sectionTitle}>App Settings</Title>
              <Text style={styles.sectionSubtitle}>Language, notifications & sample farms simulation</Text>
            </View>
          </View>

          <Divider style={styles.sectionDivider} />

          {/* Language Selector */}
          <Text style={styles.settingItemTitle}>🌐 Preferred Language / भाषा चुनें</Text>
          <SegmentedButtons
            value={language}
            onValueChange={handleLanguageChange}
            buttons={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिंदी' },
              { value: 'te', label: 'తెలుగు' },
              { value: 'mr', label: 'मराठी' },
            ]}
            style={styles.segmentedButtons}
          />

          {/* Notification Preferences */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>🔔 Advisory & Disease Alerts</Text>
              <Text style={styles.switchSubtitle}>Receive timely alerts for urgent irrigation & leaf diseases</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color="#2E7D32"
            />
          </View>

          <Divider style={{ marginVertical: 14 }} />

          {/* Activity & Scan History */}
          <Text style={styles.settingItemTitle}>📜 Activity & Disease Scan History</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            View your complete chronological log of AI leaf diagnoses, images, and advisory prescriptions.
          </Text>
          <Button
            mode="contained"
            icon="history"
            onPress={() => router.push('/history')}
            style={{ marginBottom: 14, borderRadius: 10, backgroundColor: '#4527A0' }}
          >
            Open My History Timeline
          </Button>

          <Divider style={{ marginVertical: 14 }} />

          {/* Real Sample Farms Option */}
          <Text style={styles.settingItemTitle}>🧪 Simulated Farms Explorer</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            Explore 12 real crop scenarios with simulated telemetry (Nitrogen deficiency, Drought, Blight risk, Acidic soil, etc.)
          </Text>
          <Button
            mode="contained-tonal"
            icon="compass"
            onPress={() => setSampleModalVisible(true)}
            style={{ marginBottom: 14, borderRadius: 10 }}
          >
            {activeSampleFarmId ? "Explore Sample Farms (Active: Scenario Selected)" : "Browse 12 Sample Farms"}
          </Button>

          <Divider style={{ marginVertical: 14 }} />

          {/* App Version & Diagnostics Info */}
          <View style={styles.versionBox}>
            <View style={styles.versionRow}>
              <Text style={styles.versionTitle}>🌱 Krishi Setu Platform</Text>
              <Chip style={styles.versionChip} textStyle={{ fontSize: 10, color: '#1B5E20' }}>v1.0.0</Chip>
            </View>
            <Text style={styles.versionDesc}>Precision Advisory & Mandi Linkage (Offline-First Ready)</Text>
            <Text style={styles.versionMeta}>
              Farmer #{identity?.farmer_id || 1} • Farm Plot #{identity?.farm_id || 1} • Local Cache Active
            </Text>
          </View>

          {/* Reset Data Button */}
          <Button
            mode="outlined"
            icon="delete-restore"
            onPress={handleResetData}
            textColor="#D32F2F"
            style={styles.resetButton}
            contentStyle={styles.buttonContent}
          >
            Reset My Data / Re-run Onboarding
          </Button>
        </Card.Content>
      </Card>

      {/* SAMPLE FARMS MODAL */}
      <SampleFarmsModal
        visible={sampleModalVisible}
        onDismiss={() => setSampleModalVisible(false)}
        onSelectSampleFarm={handleSelectSampleFarm}
        onSelectRealFarm={handleExitSampleMode}
        activeSampleFarmId={activeSampleFarmId}
        realIdentity={identity}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F4',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F4',
  },
  // Centered Hero
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E7E0',
  },
  heroCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#2E7D32',
    elevation: 4,
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  heroChip: {
    backgroundColor: '#E8F5E9',
    height: 30,
  },
  heroChipText: {
    fontSize: 11,
    color: '#1B5E20',
    fontWeight: '600',
  },

  // Feedback banners
  successCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#66BB6A',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 14,
  },
  feedbackCardContent: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  successText: {
    color: '#1B5E20',
    fontWeight: 'bold',
    fontSize: 13,
  },
  errorText: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8EFE8',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
    lineHeight: 22,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  sectionDivider: {
    marginVertical: 14,
    backgroundColor: '#E8EFE8',
  },
  subGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  chipFieldLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
    marginTop: 4,
  },
  chipSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectorChip: {
    borderRadius: 18,
  },
  selectorChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  selectorChipInactive: {
    backgroundColor: '#F4F7F4',
    borderColor: '#D0D8D0',
  },
  selectorChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectorChipTextInactive: {
    color: '#444444',
    fontSize: 12,
  },
  segmentedButtons: {
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    marginTop: 6,
  },
  buttonContent: {
    paddingVertical: 6,
  },

  // Settings Section
  settingItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  versionBox: {
    backgroundColor: '#F9FAF9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 14,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  versionChip: {
    backgroundColor: '#E8F5E9',
    height: 22,
  },
  versionDesc: {
    fontSize: 12,
    color: '#555555',
    marginTop: 3,
  },
  versionMeta: {
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },
  resetButton: {
    borderColor: '#D32F2F',
    borderRadius: 10,
  },
});
