import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Mail, Lock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        await login({ user: response.data.user, accessToken: response.data.accessToken });
      } else {
        setErrorMsg(response.message || 'Login failed');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Network error occurred. Pls try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.innerContent}
        >
          <View style={styles.headerContainer}>
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>🍽️</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>Sign in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail color={colors.subtext} size={moderateScale(20)} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock color={colors.subtext} size={moderateScale(20)} />}
            />

            <View style={styles.forgotPasswordContainer}>
              <Button
                title="Forgot Password?"
                variant="ghost"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordButton}
                textStyle={[styles.forgotPasswordText, { color: colors.primary }]}
              />
            </View>

            {errorMsg ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
                <AlertCircle color={colors.error} size={moderateScale(20)} style={{ marginRight: scale(8) }} />
                <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
              </View>
            ) : null}

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={[styles.loginButton, { shadowColor: colors.primary }]}
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  logoPlaceholder: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  logoText: {
    fontSize: moderateScale(40),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(15),
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: verticalScale(12),
  },
  forgotPasswordButton: {
    height: undefined,
    paddingHorizontal: 0,
  },
  forgotPasswordText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  errorContainer: {
    width: '100%',
    flexDirection: 'row',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginBottom: verticalScale(20),
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(40),
  },
  footerText: {
    fontSize: moderateScale(14),
  },
  signupButton: {
    height: undefined,
    paddingHorizontal: 0,
  },
  signupText: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
});
