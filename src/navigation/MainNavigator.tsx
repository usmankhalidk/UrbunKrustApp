import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, User } from 'lucide-react-native';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CreateOrderScreen } from '../screens/main/CreateOrderScreen';
import { useTheme } from '../theme/ThemeContext';
import { moderateScale } from 'react-native-size-matters';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: moderateScale(60),
          paddingBottom: moderateScale(10),
          paddingTop: moderateScale(10),
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarLabel: 'Orders'
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CreateOrderScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
          tabBarLabel: 'POS'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
