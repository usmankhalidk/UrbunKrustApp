import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReset = () => {
    setIsSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.innerContent}
        >
          <Button 
            title="" 
            variant="ghost" 
            icon={<ArrowLeft strokeWidth={3} color={colors.text} size={moderateScale(24)} />}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              {isSubmitted 
                ? "Check your email for reset instructions."
                : "Enter your email address and we'll send you a link to reset your password."}
            </Text>
          </View>

          {!isSubmitted ? (
            <View style={styles.formContainer}>
              <Input
                label="Email Address"
                placeholder="Enter your registered email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                leftIcon={<Mail color={colors.subtext} size={moderateScale(20)} />}
              />
              
              <Button 
                title="Send Reset Link" 
                onPress={handleReset}
                style={styles.resetButton}
              />
            </View>
          ) : (
            <View style={styles.successContainer}>
              <Button 
                title="Back to Login" 
                onPress={() => navigation.goBack()}
                style={styles.resetButton}
              />
            </View>
          )}

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
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    height: verticalScale(40),
    marginBottom: verticalScale(20),
  },
  headerContainer: {
    marginBottom: verticalScale(32),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: colors.subtext,
    lineHeight: moderateScale(22),
  },
  formContainer: {
    width: '100%',
  },
  resetButton: {
    width: '100%',
    marginTop: verticalScale(16),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successContainer: {
    width: '100%',
    marginTop: verticalScale(20),
  }
});
