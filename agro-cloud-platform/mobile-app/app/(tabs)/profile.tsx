import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
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
import { Colors, Spacing, BorderRadius, Typography, Shadows, CommonStyles } from '../../src/theme/theme';

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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: Spacing.md, color: Colors.primary, fontWeight: '700' }}>
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
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>🌾 {cropType} ({areaAcres} Ac)</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>💧 {irrigationSource.toUpperCase()}</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>📅 {preferredSeason.toUpperCase()}</Text>
            </View>
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
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBox}>
              <Text style={{ fontSize: 18 }}>👨‍🌾</Text>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm + 2 }}>
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
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
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
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
          />

          <View style={styles.twoColumnRow}>
            <TextInput
              label="Region / Village *"
              value={region}
              onChangeText={setRegion}
              mode="outlined"
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primary}
              style={[styles.input, { flex: 1, marginRight: Spacing.xs + 2 }]}
              left={<TextInput.Icon icon="map-marker" />}
            />
            <TextInput
              label="Exp. (Years) *"
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="number-pad"
              maxLength={2}
              mode="outlined"
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primary}
              style={[styles.input, { width: 110 }]}
              left={<TextInput.Icon icon="clock-outline" />}
            />
          </View>

          {/* Sub-Group: Farm Plot Details */}
          <Text style={[styles.subGroupTitle, { marginTop: Spacing.md }]}>Farm Plot Details</Text>

          <TextInput
            label="Farm / Plot Name *"
            value={farmName}
            onChangeText={setFarmName}
            mode="outlined"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
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
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
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
            buttonColor={Colors.primary}
            contentStyle={styles.buttonContent}
          >
            Save Profile Changes
          </Button>
        </Card.Content>
      </Card>

      {/* 3. SECTION 2: APP SETTINGS */}
      <Card style={styles.sectionCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBox}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm + 2 }}>
              <Title style={styles.sectionTitle}>App Settings</Title>
              <Text style={styles.sectionSubtitle}>Language, notifications & sample farms simulation</Text>
            </View>
          </View>

          <Divider style={styles.sectionDivider} />

          {/* Language Selector */}
          <Text style={styles.settingItemTitle}>🌐 Preferred Language / भाषा चुनें</Text>
          <View style={styles.languageGrid}>
            {[
              { value: 'en', label: 'English', native: 'English' },
              { value: 'hi', label: 'हिंदी', native: 'Hindi' },
              { value: 'te', label: 'తెలుగు', native: 'Telugu' },
              { value: 'mr', label: 'मराठी', native: 'Marathi' },
            ].map((item) => {
              const isSelected = language === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.languageCard,
                    isSelected ? styles.languageCardActive : styles.languageCardInactive,
                  ]}
                  onPress={() => handleLanguageChange(item.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageTextContainer}>
                    <Text
                      style={[
                        styles.languageLabel,
                        isSelected ? styles.languageLabelActive : styles.languageLabelInactive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.languageSubLabel,
                        isSelected ? styles.languageSubLabelActive : styles.languageSubLabelInactive,
                      ]}
                    >
                      {item.native}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.languageRadioDot,
                      isSelected ? styles.languageRadioDotActive : styles.languageRadioDotInactive,
                    ]}
                  >
                    {isSelected && <View style={styles.languageRadioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Notification Preferences */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: Spacing.sm + 2 }}>
              <Text style={styles.switchTitle}>🔔 Advisory & Disease Alerts</Text>
              <Text style={styles.switchSubtitle}>Receive timely alerts for urgent irrigation & leaf diseases</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={Colors.primary}
            />
          </View>

          <Divider style={{ marginVertical: Spacing.md }} />

          {/* Activity & Scan History */}
          <Text style={styles.settingItemTitle}>📜 Activity & Disease Scan History</Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.sm }}>
            View your complete chronological log of AI leaf diagnoses, images, and advisory prescriptions.
          </Text>
          <Button
            mode="contained"
            icon="history"
            onPress={() => router.push('/history')}
            style={{ marginBottom: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: '#4527A0' }}
          >
            Open My History Timeline
          </Button>

          <Divider style={{ marginVertical: Spacing.md }} />

          {/* Real Sample Farms Option */}
          <Text style={styles.settingItemTitle}>🧪 Simulated Farms Explorer</Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.sm }}>
            Explore 12 real crop scenarios with simulated telemetry (Nitrogen deficiency, Drought, Blight risk, Acidic soil, etc.)
          </Text>
          <Button
            mode="contained-tonal"
            icon="compass"
            onPress={() => setSampleModalVisible(true)}
            style={{ marginBottom: Spacing.md, borderRadius: BorderRadius.md }}
          >
            {activeSampleFarmId ? "Simulated Farm Active • Switch Scenario" : "Browse 12 Sample Farms"}
          </Button>

          <Divider style={{ marginVertical: Spacing.md }} />

          {/* App Version & Diagnostics Info */}
          <View style={styles.versionBox}>
            <View style={styles.versionRow}>
              <Text style={styles.versionTitle}>🌱 Krishi Setu Platform</Text>
              <View style={styles.versionPill}>
                <Text style={styles.versionPillText}>v1.0.0</Text>
              </View>
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
            textColor={Colors.status.critical.main}
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
    ...CommonStyles.screenContainer,
  },
  content: {
    ...CommonStyles.screenContent,
  },
  cardContent: {
    padding: Spacing.md + 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  // Centered Hero
  heroCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.lg,
  },
  heroCardContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    backgroundColor: Colors.primary,
    ...Shadows.floating,
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: Colors.primaryTint,
    borderRadius: BorderRadius.lg,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  heroPill: {
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.xxl,
  },
  heroPillText: {
    fontSize: 11.5,
    color: Colors.primaryDark,
    fontWeight: '700',
  },

  // Feedback banners
  successCard: {
    backgroundColor: Colors.status.healthy.bg,
    borderColor: Colors.status.healthy.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorCard: {
    backgroundColor: Colors.status.critical.bg,
    borderColor: Colors.status.critical.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  feedbackCardContent: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  successText: {
    color: Colors.status.healthy.text,
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: Colors.status.critical.text,
    fontWeight: '700',
    fontSize: 13,
  },

  // Section Cards
  sectionCard: {
    ...CommonStyles.card,
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  sectionDivider: {
    marginVertical: Spacing.md,
    backgroundColor: Colors.border,
  },
  subGroupTitle: {
    ...Typography.subTitle,
    color: Colors.primary,
    marginBottom: Spacing.sm + 2,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  chipFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
    marginTop: Spacing.xs,
  },
  chipSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  selectorChip: {
    borderRadius: BorderRadius.xxl,
  },
  selectorChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectorChipInactive: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.borderDark,
  },
  selectorChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  selectorChipTextInactive: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  segmentedButtons: {
    marginBottom: Spacing.md,
  },
  saveButton: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  buttonContent: {
    paddingVertical: Spacing.xs + 2,
  },

  // Settings Section
  settingItemTitle: {
    ...Typography.subTitle,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  languageCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  languageCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  languageCardInactive: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  languageLabelActive: {
    color: Colors.primaryDark,
  },
  languageLabelInactive: {
    color: Colors.textPrimary,
  },
  languageSubLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  languageSubLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  languageSubLabelInactive: {
    color: Colors.textSecondary,
  },
  languageRadioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  languageRadioDotActive: {
    borderColor: Colors.primary,
  },
  languageRadioDotInactive: {
    borderColor: Colors.borderDark,
  },
  languageRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  switchSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  versionBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  versionPill: {
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.xs,
  },
  versionPillText: {
    fontSize: 10,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  versionDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  versionMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  resetButton: {
    borderColor: Colors.status.critical.main,
    borderRadius: BorderRadius.md,
  },
});
