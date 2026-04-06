import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { 
  LogOut, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Users, 
  UtensilsCrossed, 
  ClipboardList, 
  TrendingUp,
  AlertCircle
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { posService, PosProfile } from '../../services/posService';

export const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<PosProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await posService.getProfile();
      if (res.success) {
        setProfile(res.data);
      } else {
        setError(res.message || 'Failed to load profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <AlertCircle color={colors.border} size={moderateScale(48)} style={{ marginBottom: verticalScale(16) }} />
        <Text style={[styles.errorText, { color: colors.subtext }]}>{error || 'Could not load profile'}</Text>
        <Button title="Try Again" onPress={fetchProfile} style={{ marginTop: verticalScale(20), width: scale(150) }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── HEADER & COVER ── */}
        <View style={styles.headerArea}>
          <View style={[styles.coverPhoto, { backgroundColor: colors.primary + '20' }]} />
          
          <View style={styles.avatarContainer}>
            {profile.logo ? (
              <Image source={{ uri: profile.logo }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.avatarInitials, { color: colors.primary }]}>{profile.abbriviation}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── RESTAURANT INFO ── */}
        <View style={styles.restaurantInfo}>
          <Text style={[styles.restaurantName, { color: colors.text }]}>{profile.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: profile.isActive ? '#10B98122' : '#EF444422' }]}>
            <View style={[styles.statusDot, { backgroundColor: profile.isActive ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.statusText, { color: profile.isActive ? '#10B981' : '#EF4444' }]}>
              {profile.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
            {/* Stats Cards */}
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#3B82F611' }]}>
                <ClipboardList color="#3B82F6" size={18} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile._count.orders}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Orders</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#8B5CF611' }]}>
                <UtensilsCrossed color="#8B5CF6" size={18} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile._count.menuCategories}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Categories</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#F59E0B11' }]}>
                <Users color="#F59E0B" size={18} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile._count.users}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Staff</Text>
            </View>
        </View>

        {/* ── DETAILS SECTION ── */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Details</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            <View style={[styles.detailRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <Mail color={colors.subtext} size={moderateScale(18)} />
              <View style={styles.detailTextWrap}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Email Address</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{profile.email}</Text>
              </View>
            </View>

            <View style={[styles.detailRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <Phone color={colors.subtext} size={moderateScale(18)} />
              <View style={styles.detailTextWrap}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Phone Number</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{profile.phone}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MapPin color={colors.subtext} size={moderateScale(18)} />
              <View style={styles.detailTextWrap}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Location</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{profile.address}, {profile.city}, {profile.state} {profile.zipCode}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* ── SUBSCRIPTION PLAN ── */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Subscription</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            <View style={[styles.detailRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <TrendingUp color={colors.subtext} size={moderateScale(18)} />
              <View style={styles.detailTextWrap}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Current Plan</Text>
                <Text style={[styles.detailValue, { color: colors.text, fontWeight: '700' }]}>{profile.plan}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <CreditCard color={colors.subtext} size={moderateScale(18)} />
              <View style={styles.detailTextWrap}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Status</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{profile.subscriptionStatus}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* ── USER INFO (CURRENT LOGGED IN) ── */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Account</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <User color={colors.subtext} size={moderateScale(18)} />
              <View style={styles.detailTextWrap}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Logged in as</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{user?.fullName || 'Staff Member'}</Text>
                <Text style={[styles.detailSubValue, { color: colors.subtext }]}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Button 
            title="Sign Out" 
            onPress={handleLogout}
            icon={<LogOut color="#FFF" size={moderateScale(18)} />}
            style={styles.logoutButton}
          />
          <Text style={[styles.versionText, { color: colors.subtext }]}>POS Version 1.0.0</Text>
        </View>
        
        <View style={{ height: verticalScale(40) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: moderateScale(14), textAlign: 'center', fontWeight: '500' },
  
  headerArea: {
    alignItems: 'center',
    marginBottom: verticalScale(45),
  },
  coverPhoto: {
    width: '100%',
    height: verticalScale(120),
  },
  avatarContainer: {
    position: 'absolute',
    bottom: verticalScale(-40),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarImage: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
  },
  avatarPlaceholder: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: moderateScale(28),
    fontWeight: '900',
  },

  restaurantInfo: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  restaurantName: {
    fontSize: moderateScale(22),
    fontWeight: '900',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    gap: scale(10),
    marginBottom: verticalScale(24),
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(10),
    alignItems: 'center',
  },
  statIconWrap: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: verticalScale(2),
  },
  statLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },

  sectionContainer: {
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginLeft: scale(4),
    marginBottom: verticalScale(8),
  },
  card: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  detailTextWrap: {
    marginLeft: scale(14),
    flex: 1,
  },
  detailLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  detailValue: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  detailSubValue: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },

  footer: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(10),
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(10),
  },
  versionText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
});
