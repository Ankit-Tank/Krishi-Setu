import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [lang, setLang] = useState(i18n.language || 'en');

  const handleLanguageChange = (value: string) => {
    setLang(value);
    i18n.changeLanguage(value);
  };

  const handleSendOtp = () => {
    if (phone.trim().length < 10) return;
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    // Demo login always succeeds
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* Brand Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/krishisetu-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text variant="headlineMedium" style={styles.title}>
            🌱 {t('appName')}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('tagline')}
          </Text>

          {/* Language Selector */}
          <View style={styles.langContainer}>
            <Text variant="labelLarge" style={styles.langLabel}>
              🌐 Select Language / भाषा चुनें:
            </Text>
            <View style={styles.languageGrid}>
              {[
                { value: 'en', label: 'English', native: 'English' },
                { value: 'hi', label: 'हिंदी', native: 'Hindi' },
                { value: 'te', label: 'తెలుగు', native: 'Telugu' },
                { value: 'mr', label: 'मराठी', native: 'Marathi' },
              ].map((item) => {
                const isSelected = lang === item.value;
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
          </View>

          {step === 'phone' ? (
            <View style={styles.formGroup}>
              <Text variant="titleMedium" style={styles.formTitle}>
                📱 Farmer Phone Login
              </Text>
              <TextInput
                label="Mobile Number (10 digits)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                mode="outlined"
                left={<TextInput.Affix text="+91 " />}
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleSendOtp}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Send OTP
              </Button>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text variant="titleMedium" style={styles.formTitle}>
                🔑 Enter 4-Digit Verification Code
              </Text>
              <Text variant="bodySmall" style={styles.otpHint}>
                Code sent to +91 {phone}. (Use any code e.g. 1234)
              </Text>
              <TextInput
                label="OTP Code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                mode="outlined"
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleVerifyOtp}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Verify & Enter Dashboard
              </Button>
              <Button
                mode="text"
                onPress={() => setStep('phone')}
                style={styles.backButton}
              >
                Change Phone Number
              </Button>
            </View>
          )}
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
    padding: 20,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  subtitle: {
    textAlign: 'center',
    color: '#388E3C',
    marginBottom: 20,
  },
  langContainer: {
    marginBottom: 24,
  },
  langLabel: {
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  languageCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  languageCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  languageCardInactive: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
  },
  languageTextContainer: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  languageLabelActive: {
    color: '#1B5E20',
  },
  languageLabelInactive: {
    color: '#333333',
  },
  languageSubLabel: {
    fontSize: 10.5,
    marginTop: 1,
  },
  languageSubLabelActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  languageSubLabelInactive: {
    color: '#757575',
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
    borderColor: '#2E7D32',
  },
  languageRadioDotInactive: {
    borderColor: '#BDBDBD',
  },
  languageRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  formGroup: {
    marginTop: 10,
  },
  formTitle: {
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  otpHint: {
    color: '#666',
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
});
