import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Mail, Lock } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Navigate to Dashboard upon clicking login
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.innerContent}
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>🍽️</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
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
                textStyle={styles.forgotPasswordText}
              />
            </View>

            <Button 
              title="Sign In" 
              onPress={handleLogin}
              style={styles.loginButton}
            />
          </View>
          
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Button 
              title="Sign Up" 
              variant="ghost" 
              onPress={() => {}} 
              style={styles.signupButton}
              textStyle={styles.signupText}
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
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
    color: colors.text,
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: colors.subtext,
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: verticalScale(24),
  },
  forgotPasswordButton: {
    height: undefined,
    paddingHorizontal: 0,
  },
  forgotPasswordText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    shadowColor: colors.primary,
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
    color: colors.text,
    fontSize: moderateScale(14),
  },
  signupButton: {
    height: undefined,
    paddingHorizontal: 0,
  },
  signupText: {
    fontSize: moderateScale(14),
    color: colors.secondary,
    fontWeight: 'bold',
  },
});
