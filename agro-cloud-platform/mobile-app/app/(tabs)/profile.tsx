import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, Text, Title, Paragraph, Button, RadioButton, Divider, Avatar, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { IdentityService, FarmerIdentity } from '../../src/services/api';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [identity, setIdentity] = useState<FarmerIdentity | null>(null);
  const [language, setLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    loadIdentity();
  }, []);

  const loadIdentity = async () => {
    try {
      const saved = await IdentityService.getSavedIdentity();
      setIdentity(saved);
    } catch (e) {
      console.warn('Error loading identity in Profile:', e);
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleResetData = async () => {
    try {
      await IdentityService.clearIdentity();
    } catch (e) {
      console.warn('Error resetting identity:', e);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.profileRow}>
            <Avatar.Text
              size={56}
              label={getInitials(identity?.farmer_name)}
              style={{ backgroundColor: '#2E7D32' }}
            />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Title style={styles.name}>{identity?.farmer_name || 'Farmer'}</Title>
              <Paragraph style={styles.subText}>
                📱 +91 {identity?.phone || 'N/A'} | 📍 {identity?.region || 'Punjab'}
              </Paragraph>
              <Paragraph style={styles.subText}>
                🌾 {identity?.farm_name || 'My Farm Plot'} ({identity?.crop_type || 'Wheat'}, {identity?.area_acres || 0} Acres)
              </Paragraph>
            </View>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          {/* Farmer & Farm Meta Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagItem}>
              <Text style={styles.tagLabel}>💧 Irrigation:</Text>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                {identity?.irrigation_source ? identity.irrigation_source.toUpperCase() : 'BOREWELL'}
              </Chip>
            </View>

            <View style={styles.tagItem}>
              <Text style={styles.tagLabel}>⏳ Experience:</Text>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                {identity?.experience_years !== undefined ? `${identity.experience_years} Years` : '5 Years'}
              </Chip>
            </View>

            <View style={styles.tagItem}>
              <Text style={styles.tagLabel}>🌦️ Season:</Text>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                {identity?.preferred_season ? identity.preferred_season.toUpperCase() : 'BOTH'}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Multilingual Selector */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🌐 {t('profile.selectLanguage')}</Title>
          
          <RadioButton.Group onValueChange={changeLanguage} value={language}>
            <View style={styles.radioRow}>
              <RadioButton value="en" color="#2E7D32" />
              <Text style={styles.radioLabel}>English</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="hi" color="#2E7D32" />
              <Text style={styles.radioLabel}>हिंदी (Hindi)</Text>
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

      {/* System & Reset Option */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>⚙️ Settings & Device Data</Title>
          <Paragraph style={styles.cacheText}>
            ✅ Local Storage: Device Identity Saved in `@agro_farmer_identity`
          </Paragraph>
          <Paragraph style={styles.infoText}>
            Farmer ID: #{identity?.farmer_id || 'N/A'} | Farm ID: #{identity?.farm_id || 'N/A'}
          </Paragraph>

          <Divider style={{ marginVertical: 12 }} />

          <Button
            mode="outlined"
            onPress={handleResetData}
            icon="refresh"
            textColor="#D32F2F"
            style={{ borderColor: '#D32F2F', borderRadius: 8 }}
          >
            Reset My Data / Re-run Onboarding
          </Button>
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  chip: {
    backgroundColor: '#E8F5E9',
    height: 28,
  },
  chipText: {
    fontSize: 11,
    color: '#1B5E20',
    fontWeight: 'bold',
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
