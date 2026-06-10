import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RotationScreen from '../screens/RotationScreen';
import AlertsScreen from '../screens/AlertsScreen';
import PlayerScreen from '../screens/PlayerScreen';
import {theme} from '../src/theme';

export type RootTabParamList = {
  Rotation: undefined;
  Player: undefined;
  Alerts: undefined;
};

// Single source of truth for tab -> icon mapping (DRY).
const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  Rotation: 'map',
  Player: 'person',
  Alerts: 'notifications',
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '700'},
        tabBarIcon: ({color, size}) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}>
      <Tab.Screen name="Rotation" component={RotationScreen} />
      <Tab.Screen name="Player" component={PlayerScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
    </Tab.Navigator>
  );
}
