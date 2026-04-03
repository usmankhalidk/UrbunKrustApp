import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Home, Compass, User, Bell } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export const DashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning, User!</Text>
          <Text style={styles.subtitle}>What would you like to eat today?</Text>
        </View>
        <View style={styles.notificationBadge}>
          <Bell color={colors.text} size={moderateScale(24)} />
          <View style={styles.dot} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.promoBanner}>
          <Text style={styles.promoText}>Get 30% OFF</Text>
          <Text style={styles.promoSubtext}>On your first order today</Text>
        </View>

        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.categoryContainer}>
          {['Burger', 'Pizza', 'Sushi', 'Dessert'].map((item, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryIcon} />
              <Text style={styles.categoryName}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Trending Now</Text>
        <View style={styles.trendingContainer}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.trendingCard}>
              <View style={styles.cardImage} />
              <Text style={styles.cardTitle}>Delicious Meal {item}</Text>
              <Text style={styles.cardPrice}>$12.99</Text>
            </View>
          ))}
        </View>
        <View style={{ height: verticalScale(100) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
  },
  greeting: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: colors.subtext,
    marginTop: verticalScale(4),
  },
  notificationBadge: {
    position: 'relative',
    padding: moderateScale(8),
    backgroundColor: colors.surface,
    borderRadius: moderateScale(20),
  },
  dot: {
    position: 'absolute',
    top: moderateScale(8),
    right: moderateScale(10),
    width: moderateScale(8),
    height: moderateScale(8),
    backgroundColor: colors.error,
    borderRadius: moderateScale(4),
    borderWidth: 2,
    borderColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  promoBanner: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    marginVertical: verticalScale(16),
  },
  promoText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: colors.background,
  },
  promoSubtext: {
    fontSize: moderateScale(14),
    color: colors.background,
    marginTop: verticalScale(4),
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: verticalScale(16),
    marginTop: verticalScale(8),
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: colors.surface,
    marginBottom: verticalScale(8),
  },
  categoryName: {
    fontSize: moderateScale(12),
    color: colors.text,
    fontWeight: '500',
  },
  trendingContainer: {
    gap: verticalScale(16),
  },
  trendingCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    alignItems: 'center',
  },
  cardImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(12),
    backgroundColor: colors.border,
    marginRight: scale(16),
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: verticalScale(4),
  },
  cardPrice: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: colors.secondary,
  },
});
