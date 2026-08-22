import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  ProgressBar,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AgroApiService, IdentityService, formatFriendlyErrorMessage } from '../src/services/api';
import { LocationService } from '../src/services/location';
import { Colors, Spacing, BorderRadius, Typography, Shadows, CommonStyles } from '../src/theme/theme';

const COMMON_CROPS = ['Wheat', 'Rice', 'Cotton', 'Maize', 'Sugarcane', 'Mustard'];

const IRRIGATION_SOURCES = [
  { value: 'borewell', label: 'Borewell 🚰' },
  { value: 'canal', label: 'Canal 🌊' },
  { value: 'rainfed', label: 'Rainfed 🌧️' },
  { value: 'other', label: 'Other 🔄' },
];

const SEASONS = [
  { value: 'Kharif', label: 'Kharif' },
  { value: 'Rabi', label: 'Rabi' },
  { value: 'both', label: 'Both' },
];

const STEP_TITLES = [
  'Personal Details',
  'Farm Plot Info',
  'Farming Practices',
  'Review & Confirm',
];

const STEP_ICONS = ['👨‍🌾', '🌾', '🚜', '✅'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // Wizard Navigation State
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Farmer Identity
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');

  // Step 2: Farm Plot Details
  const [farmName, setFarmName] = useState('');
  const [areaAcres, setAreaAcres] = useState('5.0');
  const [cropType, setCropType] = useState('Wheat');

  // Step 3: Farming Details
  const [irrigationSource, setIrrigationSource] = useState<string>('borewell');
  const [experienceYears, setExperienceYears] = useState('5');
  const [preferredSeason, setPreferredSeason] = useState<string>('both');

  // Device GPS Location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  // Async & Error Handling
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto detect GPS on mounting
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = async () => {
    setLocating(true);
    setLocationStatus('Detecting GPS location...');
    try {
      const loc = await LocationService.getCurrentLocation();
      if (loc.permissionGranted && loc.latitude && loc.longitude) {
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
        const parts = [loc.cityName, loc.regionName].filter(Boolean);
        if (parts.length > 0) {
          const detectedRegion = parts.join(', ');
          setRegion((prev) => (prev.trim() ? prev : detectedRegion));
          setLocationStatus(
            `📍 GPS: ${detectedRegion} (${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°)`
          );
        } else {
          setLocationStatus(
            `📍 GPS: ${loc.latitude.toFixed(2)}°N, ${loc.longitude.toFixed(2)}°E`
          );
        }
      } else if (loc.error) {
        setLocationStatus(loc.error);
      }
    } catch (e) {
      console.warn('GPS detection failed:', e);
      setLocationStatus('GPS detection skipped. Default coordinates will be used.');
    } finally {
      setLocating(false);
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    setErrorMsg('');
    if (!farmerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return false;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return false;
    }
    if (!region.trim()) {
      setErrorMsg('Please enter your village, district, or region name.');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    setErrorMsg('');
    if (!farmName.trim()) {
      setErrorMsg('Please enter your farm or plot name.');
      return false;
    }
    if (!areaAcres.trim() || isNaN(Number(areaAcres)) || Number(areaAcres) <= 0) {
      setErrorMsg('Please enter a valid farm plot area in acres (e.g. 5.0).');
      return false;
    }
    if (!cropType) {
      setErrorMsg('Please select your primary crop type.');
      return false;
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    setErrorMsg('');
    if (
      experienceYears.trim() === '' ||
      isNaN(Number(experienceYears)) ||
      Number(experienceYears) < 0
    ) {
      setErrorMsg('Please enter a valid farming experience in years (e.g. 5).');
      return false;
    }
    if (!irrigationSource) {
      setErrorMsg('Please select your primary irrigation source.');
      return false;
    }
    if (!preferredSeason) {
      setErrorMsg('Please select your preferred crop season.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Step 4: Final Confirm & Submit
  const handleSubmitOnboarding = async () => {
    setErrorMsg('');

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Create Farmer Record in Backend
      const farmer = await AgroApiService.createFarmer({
        name: farmerName.trim(),
        phone: phone.trim(),
        preferred_language: i18n.language || 'en',
        region: region.trim(),
        experience_years: Math.max(0, parseInt(experienceYears, 10) || 0),
      });

      // 2. Create Farm Record with device GPS coordinates under Farmer ID
      const farm = await AgroApiService.createFarm({
        farmer_id: farmer.id,
        name: farmName.trim(),
        crop_type: cropType,
        area_acres: Number(areaAcres),
        latitude: latitude || 30.901,
        longitude: longitude || 75.8573,
        irrigation_source: irrigationSource,
        preferred_season: preferredSeason,
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
        irrigation_source: irrigationSource,
        experience_years: Math.max(0, parseInt(experienceYears, 10) || 0),
        preferred_season: preferredSeason,
      });

      // 4. Navigate into Main App Tabs
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setErrorMsg(formatFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const progressFraction = currentStep / 4;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* Header Branding */}
          <View style={styles.headerSection}>
            <View style={styles.logoRow}>
              <Image
                source={require('../assets/krishisetu-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerTitles}>
                <Text style={styles.title}>🌱 Krishi Setu</Text>
                <Text style={styles.subtitle}>Farmer Onboarding Wizard</Text>
              </View>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.stepInfoRow}>
                <Text style={styles.stepIndicatorText}>
                  {STEP_ICONS[currentStep - 1]} Step {currentStep} of 4: {STEP_TITLES[currentStep - 1]}
                </Text>
                <Text style={styles.stepPercentText}>{Math.round(progressFraction * 100)}%</Text>
              </View>

              <ProgressBar
                progress={progressFraction}
                color={Colors.primary}
                style={styles.progressBar}
              />

              {/* Step Pills */}
              <View style={styles.stepPillsRow}>
                {[1, 2, 3, 4].map((step) => {
                  const isActive = currentStep === step;
                  const isCompleted = currentStep > step;
                  return (
                    <TouchableOpacity
                      key={step}
                      onPress={() => {
                        // Allow clicking back to earlier steps
                        if (step < currentStep) setCurrentStep(step);
                      }}
                      style={[
                        styles.stepDot,
                        isActive
                          ? styles.stepDotActive
                          : isCompleted
                          ? styles.stepDotCompleted
                          : styles.stepDotPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepDotText,
                          isActive || isCompleted
                            ? styles.stepDotTextActive
                            : styles.stepDotTextPending,
                        ]}
                      >
                        {isCompleted ? '✓' : step}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Validation / Connection Error Banner */}
          {errorMsg ? (
            <Card style={styles.errorCard}>
              <Card.Content style={styles.errorCardContent}>
                <View style={styles.errorHeaderRow}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorTitle}>Please Check Details</Text>
                </View>
                <Text style={styles.errorDescription}>{errorMsg}</Text>
              </Card.Content>
            </Card>
          ) : null}

          {/* STEP 1: PERSONAL INFO */}
          {currentStep === 1 && (
            <View style={styles.stepBody}>
              <Text style={styles.stepHeading}>👨‍🌾 Step 1: Farmer Personal Information</Text>
              <Text style={styles.stepInstruction}>
                Enter your name, mobile number, and local village to customize your agronomic alerts.
              </Text>

              <TextInput
                label="Full Name *"
                placeholder="e.g. Ramesh Patel / Gurpreet Singh"
                value={farmerName}
                onChangeText={setFarmerName}
                mode="outlined"
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                left={<TextInput.Icon icon="account" />}
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
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
              />

              {/* GPS Location Auto-Detection Row */}
              <View style={styles.gpsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.gpsStatusText}>
                    {locating
                      ? '📡 Locating device GPS...'
                      : locationStatus || '📍 Auto-detects your farm location'}
                  </Text>
                </View>
                <Button
                  mode="text"
                  icon="crosshairs-gps"
                  onPress={handleDetectLocation}
                  loading={locating}
                  disabled={locating}
                  compact
                  textColor={Colors.primary}
                  labelStyle={{ fontSize: 12, fontWeight: '700' }}
                >
                  Detect GPS
                </Button>
              </View>

              <TextInput
                label="Village / Tehsil / Region Name *"
                placeholder="e.g. Ludhiana, Punjab / Khanna, Fatehgarh"
                value={region}
                onChangeText={setRegion}
                mode="outlined"
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                left={<TextInput.Icon icon="map-marker" />}
              />
            </View>
          )}

          {/* STEP 2: FARM INFO */}
          {currentStep === 2 && (
            <View style={styles.stepBody}>
              <Text style={styles.stepHeading}>🌾 Step 2: Farm Plot Details</Text>
              <Text style={styles.stepInstruction}>
                Provide your plot name, area, and primary crop to calibrate precision advisory models.
              </Text>

              <TextInput
                label="Farm / Plot Name *"
                placeholder="e.g. Khanna Wheat Plot A / North Canal Field"
                value={farmName}
                onChangeText={setFarmName}
                mode="outlined"
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                left={<TextInput.Icon icon="home-variant" />}
              />

              <TextInput
                label="Plot Area in Acres *"
                placeholder="e.g. 5.0"
                value={areaAcres}
                onChangeText={setAreaAcres}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                left={<TextInput.Icon icon="ruler-square" />}
              />

              <Text style={styles.fieldLabel}>Select Primary Crop *</Text>
              <View style={styles.chipRow}>
                {COMMON_CROPS.map((crop) => {
                  const isSelected = cropType === crop;
                  return (
                    <Chip
                      key={crop}
                      selected={isSelected}
                      onPress={() => setCropType(crop)}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      textStyle={{
                        color: isSelected ? '#FFFFFF' : Colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {crop}
                    </Chip>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 3: FARMING DETAILS */}
          {currentStep === 3 && (
            <View style={styles.stepBody}>
              <Text style={styles.stepHeading}>🚜 Step 3: Farming Practices & Experience</Text>
              <Text style={styles.stepInstruction}>
                Configure your irrigation source and season preference for accurate soil prescriptions.
              </Text>

              <TextInput
                label="Farming Experience (in Years) *"
                placeholder="e.g. 5 or 12"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                left={<TextInput.Icon icon="clock-outline" />}
              />

              <Text style={styles.fieldLabel}>Irrigation Source *</Text>
              <View style={styles.chipRow}>
                {IRRIGATION_SOURCES.map((source) => {
                  const isSelected = irrigationSource === source.value;
                  return (
                    <Chip
                      key={source.value}
                      selected={isSelected}
                      onPress={() => setIrrigationSource(source.value)}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      textStyle={{
                        color: isSelected ? '#FFFFFF' : Colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {source.label}
                    </Chip>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Crop Season Preference *</Text>
              <View style={styles.chipRow}>
                {SEASONS.map((season) => {
                  const isSelected = preferredSeason === season.value;
                  return (
                    <Chip
                      key={season.value}
                      selected={isSelected}
                      onPress={() => setPreferredSeason(season.value)}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                      textStyle={{
                        color: isSelected ? '#FFFFFF' : Colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {season.label}
                    </Chip>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <View style={styles.stepBody}>
              <Text style={styles.stepHeading}>✅ Step 4: Review Your Information</Text>
              <Text style={styles.stepInstruction}>
                Please confirm your details below. You can go back to any step to make corrections.
              </Text>

              {/* Review Card 1: Farmer Identity */}
              <View style={styles.reviewSection}>
                <View style={styles.reviewSectionHeader}>
                  <Text style={styles.reviewSectionTitle}>👨‍🌾 Farmer Identity</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(1)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Full Name:</Text>
                  <Text style={styles.reviewValue}>{farmerName || '—'}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Mobile Phone:</Text>
                  <Text style={styles.reviewValue}>+91 {phone || '—'}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Region / Village:</Text>
                  <Text style={styles.reviewValue}>{region || '—'}</Text>
                </View>
              </View>

              {/* Review Card 2: Farm Plot */}
              <View style={styles.reviewSection}>
                <View style={styles.reviewSectionHeader}>
                  <Text style={styles.reviewSectionTitle}>🌾 Farm Plot Setup</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(2)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Plot Name:</Text>
                  <Text style={styles.reviewValue}>{farmName || '—'}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Primary Crop:</Text>
                  <Text style={styles.reviewValue}>{cropType}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Plot Area:</Text>
                  <Text style={styles.reviewValue}>{areaAcres} Acres</Text>
                </View>
              </View>

              {/* Review Card 3: Practices */}
              <View style={styles.reviewSection}>
                <View style={styles.reviewSectionHeader}>
                  <Text style={styles.reviewSectionTitle}>🚜 Practices & Experience</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(3)}>
                    <Text style={styles.editLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Irrigation Source:</Text>
                  <Text style={styles.reviewValue}>{irrigationSource.toUpperCase()}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Experience:</Text>
                  <Text style={styles.reviewValue}>{experienceYears} Years</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Crop Season:</Text>
                  <Text style={styles.reviewValue}>{preferredSeason.toUpperCase()}</Text>
                </View>
              </View>

              {/* GPS Confirmation Notice */}
              <View style={styles.gpsSummaryBox}>
                <Text style={styles.gpsSummaryText}>
                  📍 Location: {latitude && longitude ? `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E` : 'Auto-detected region default coordinates'}
                </Text>
              </View>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Wizard Navigation Footer */}
          <View style={styles.navigationRow}>
            {currentStep > 1 ? (
              <Button
                mode="outlined"
                icon="arrow-left"
                onPress={handleBack}
                disabled={loading}
                style={styles.backBtn}
                textColor={Colors.textPrimary}
              >
                Back
              </Button>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {currentStep < 4 ? (
              <Button
                mode="contained"
                icon="arrow-right"
                contentStyle={{ flexDirection: 'row-reverse' }}
                onPress={handleNext}
                style={styles.nextBtn}
                buttonColor={Colors.primary}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                icon="check-circle"
                onPress={handleSubmitOnboarding}
                loading={loading}
                disabled={loading}
                style={styles.confirmBtn}
                buttonColor={Colors.primary}
              >
                Confirm & Start
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.screenPadding,
    paddingVertical: Spacing.xxl,
  },
  card: {
    ...CommonStyles.card,
    borderRadius: BorderRadius.xxl,
    ...Shadows.floating,
  },
  cardContent: {
    padding: Spacing.lg,
  },
  headerSection: {
    marginBottom: Spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    ...Typography.screenTitle,
    color: Colors.primaryDark,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepIndicatorText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  stepPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  stepPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  stepDotPending: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderDark,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepDotTextPending: {
    color: Colors.textMuted,
  },
  errorCard: {
    backgroundColor: Colors.status.critical.bg,
    borderColor: Colors.status.critical.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorCardContent: {
    padding: Spacing.md,
  },
  errorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  errorTitle: {
    fontWeight: '700',
    color: Colors.status.critical.text,
    fontSize: 13,
  },
  errorDescription: {
    ...Typography.bodySmall,
    color: Colors.status.critical.text,
    lineHeight: 18,
  },
  stepBody: {
    marginVertical: Spacing.xs,
  },
  stepHeading: {
    ...Typography.sectionHeader,
    color: Colors.primaryDark,
    marginBottom: Spacing.xxs,
  },
  stepInstruction: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
    marginTop: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    borderRadius: BorderRadius.xxl,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryTint,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.status.healthy.border,
  },
  gpsStatusText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  reviewSection: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm + 2,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  editLink: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  reviewLabel: {
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  reviewValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gpsSummaryBox: {
    backgroundColor: Colors.primaryTint,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.status.healthy.border,
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  gpsSummaryText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  divider: {
    marginVertical: Spacing.lg,
    backgroundColor: Colors.border,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    flex: 1,
    borderColor: Colors.borderDark,
    borderRadius: BorderRadius.md,
  },
  nextBtn: {
    flex: 1,
    borderRadius: BorderRadius.md,
  },
  confirmBtn: {
    flex: 1.3,
    borderRadius: BorderRadius.md,
  },
});
