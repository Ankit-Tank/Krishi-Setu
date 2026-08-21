import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2B3A67', // Monsoon Indigo header
        },
        headerTintColor: '#F7F1E8', // Warm Ivory text
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
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
          headerTitle: '🌾 ' + t('appName') + ' | ' + t('dashboard.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="disease"
        options={{
          title: t('tabs.disease'),
          headerTitle: '🩺 ' + t('disease.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔬</Text>,
        }}
      />
      <Tabs.Screen
        name="advisory"
        options={{
          title: t('tabs.advisory'),
          headerTitle: '🌱 ' + t('advisory.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧪</Text>,
        }}
      />
      <Tabs.Screen
        name="mandi"
        options={{
          title: t('tabs.mandi'),
          headerTitle: '📈 ' + t('mandi.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          headerTitle: '👨‍🌾 ' + t('profile.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
