import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';

function HeaderBrandTitle({ screenTitle }: { screenTitle?: string }) {
  return (
    <View style={styles.headerBrandContainer}>
      <Image
        source={require('../../assets/krishisetu-logo.png')}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      <View style={styles.headerTextCol}>
        <Text style={styles.headerBrandName}>Krishi Setu</Text>
        {screenTitle ? <Text style={styles.headerScreenName}>{screenTitle}</Text> : null}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2B3A67', // Monsoon Indigo header
        },
        headerTintColor: '#F7F1E8', // Warm Ivory text
        tabBarActiveTintColor: '#C1502E', // Terracotta Clay active tab
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8A63A', // Turmeric Gold border accent
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          headerTitle: () => <HeaderBrandTitle screenTitle={t('dashboard.title')} />,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="disease"
        options={{
          title: t('tabs.disease'),
          headerTitle: () => <HeaderBrandTitle screenTitle={t('disease.title')} />,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔬</Text>,
        }}
      />
      <Tabs.Screen
        name="advisory"
        options={{
          title: t('tabs.advisory'),
          headerTitle: () => <HeaderBrandTitle screenTitle={t('advisory.title')} />,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧪</Text>,
        }}
      />
      <Tabs.Screen
        name="mandi"
        options={{
          title: t('tabs.mandi'),
          headerTitle: () => <HeaderBrandTitle screenTitle={t('mandi.title')} />,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          headerTitle: () => <HeaderBrandTitle screenTitle={t('profile.title')} />,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTextCol: {
    flexDirection: 'column',
  },
  headerBrandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7F1E8',
    letterSpacing: 0.3,
  },
  headerScreenName: {
    fontSize: 11,
    color: '#E8A63A',
    fontWeight: '600',
  },
});
