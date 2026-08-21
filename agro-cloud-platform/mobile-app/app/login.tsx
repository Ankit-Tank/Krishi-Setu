import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
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
            <SegmentedButtons
              value={lang}
              onValueChange={handleLanguageChange}
              buttons={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिंदी' },
                { value: 'mr', label: 'मराठी' },
              ]}
            />
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
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#2E7D32',
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
