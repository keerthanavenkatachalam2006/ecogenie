import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme/colors';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RoomsScreen from './src/screens/RoomsScreen';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import AppliancesScreen from './src/screens/AppliancesScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Bottom Tab Navigator ──
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.bgCard, borderBottomColor: colors.border, borderBottomWidth: 1 },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Rooms: focused ? 'grid' : 'grid-outline',
            Appliances: focused ? 'flash' : 'flash-outline',
            Analytics: focused ? 'bar-chart' : 'bar-chart-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '⚡ ECOGENIE', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Rooms" component={RoomsScreen} options={{ title: '🏠 Rooms' }} />
      <Tab.Screen name="Appliances" component={AppliancesScreen} options={{ title: '⚡ Appliances' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: '📊 Analytics' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '👤 Profile' }} />
    </Tab.Navigator>
  );
}

// ── Root Navigator ──
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.green} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // App screens
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="RoomDetail"
            component={RoomDetailScreen}
            options={({ route }) => ({
              headerShown: true,
              title: route.params?.room?.roomName || 'Room',
              headerStyle: { backgroundColor: colors.bgCard },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { fontWeight: '700' },
            })}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: true,
              title: '🔔 Notifications',
              headerStyle: { backgroundColor: colors.bgCard },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── App Root ──
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.bg} />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
