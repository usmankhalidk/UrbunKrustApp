import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, User } from 'lucide-react-native';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CreateOrderScreen } from '../screens/main/CreateOrderScreen';
import { useTheme } from '../theme/ThemeContext';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useCartStore } from '../store/useCartStore';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  const { colors } = useTheme();
  const { isTablet } = useResponsiveLayout();
  const cartItemCount = useCartStore(state => state.items.length);

  const tabBarHeight = isTablet ? moderateScale(64) : moderateScale(60);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: isTablet ? moderateScale(12) : moderateScale(10),
          paddingTop: isTablet ? moderateScale(10) : moderateScale(8),
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(isTablet ? 11 : 10),
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={isTablet ? size + 2 : size} />,
          tabBarLabel: 'Orders'
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CreateOrderScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <ShoppingBag color={color} size={isTablet ? size + 2 : size} />
              {cartItemCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
          tabBarLabel: 'POS'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={isTablet ? size + 2 : size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: moderateScale(9),
    fontWeight: '900',
  },
});
