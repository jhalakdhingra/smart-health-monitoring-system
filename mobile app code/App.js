// ====================================================
// MAIN APP FILE - Health Monitor with Modern Design
// ====================================================
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, TrendingUp, Bell } from 'lucide-react-native';
import HomeScreen from './src/screens/HomeScreen';
import GraphScreen from './src/screens/GraphScreen';
import AlertsScreen from './src/screens/AlertsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1e40af',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.3,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tab.Screen
          name="Graphs"
          component={GraphScreen}
          options={{
            tabBarLabel: 'Trends',
            tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tab.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{
            tabBarLabel: 'Alerts',
            tabBarIcon: ({ color, size }) => <Bell size={size} color={color} strokeWidth={2.5} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
