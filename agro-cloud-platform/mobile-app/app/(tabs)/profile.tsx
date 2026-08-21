import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, Text, Title, Paragraph, Button, RadioButton, Divider, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'hi');

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.card}>
        <Card.Content style={styles.profileRow}>
          <Avatar.Text size={56} label="RP" style={{ backgroundColor: '#2E7D32' }} />
          <View style={{ marginLeft: 14 }}>
            <Title style={styles.name}>Ramesh Patel</Title>
            <Paragraph style={styles.subText}>📱 +91 98765 43210 | Punjab (Ludhiana)</Paragraph>
            <Paragraph style={styles.subText}>🌾 Registered Fields: 2 (Wheat, Cotton)</Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Multilingual Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🌐 {t('profile.selectLanguage')}</Title>
          
          <RadioButton.Group onValueChange={changeLanguage} value={language}>
            <View style={styles.radioRow}>
              <RadioButton value="hi" color="#2E7D32" />
              <Text style={styles.radioLabel}>हिंदी (Hindi)</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="en" color="#2E7D32" />
              <Text style={styles.radioLabel}>English</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="te" color="#2E7D32" />
              <Text style={styles.radioLabel}>తెలుగు (Telugu)</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="mr" color="#2E7D32" />
              <Text style={styles.radioLabel}>मराठी (Marathi)</Text>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Offline Caching & Connectivity Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>💾 System & Storage</Title>
          <Paragraph style={styles.cacheText}>
            ✅ {t('profile.offlineCache')}: Powered by `@react-native-async-storage/async-storage`
          </Paragraph>
          <Divider style={{ marginVertical: 10 }} />
          <Paragraph style={styles.infoText}>Cloud API Status: Connected to Agro-Cloud Engine</Paragraph>
        </Card.Content>
      </Card>
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
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  subText: {
    fontSize: 12,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 15,
    color: '#333333',
  },
  cacheText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
  },
});
