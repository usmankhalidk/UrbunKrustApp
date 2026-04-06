import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccessMsg(response.message);
        setIsSubmitted(true);
      } else {
        setErrorMsg(response.message);
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
          <Button 
            title="" 
            variant="ghost" 
            icon={<ArrowLeft strokeWidth={3} color={colors.text} size={moderateScale(24)} />}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />

          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
            {!isSubmitted && (
              <Text style={[styles.subtitle, { color: colors.subtext }]}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            )}
          </View>

          {isSubmitted && (
            <View style={[styles.messageContainer, { backgroundColor: '#10B98115', borderColor: '#10B981' }]}>
              <CheckCircle2 color="#059669" size={moderateScale(32)} style={{ marginBottom: verticalScale(12) }} />
              <Text style={[styles.messageText, { color: '#059669' }]}>
                {successMsg || "Check your email for reset instructions."}
              </Text>
            </View>
          )}

          {errorMsg && !isSubmitted ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
              <AlertCircle color={colors.error} size={moderateScale(20)} style={{ marginRight: scale(8) }} />
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
            </View>
          ) : null}

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
                loading={isLoading}
                style={[styles.resetButton, { shadowColor: colors.primary }]}
              />
            </View>
          ) : (
            <View style={styles.successContainer}>
              <Button 
                title="Back to Login" 
                onPress={() => navigation.goBack()}
                style={[styles.resetButton, { shadowColor: colors.primary }]}
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
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
  },
  formContainer: {
    width: '100%',
  },
  resetButton: {
    width: '100%',
    marginTop: verticalScale(16),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  messageContainer: {
    width: '100%',
    padding: moderateScale(24),
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
    marginBottom: verticalScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: moderateScale(24),
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
  successContainer: {
    width: '100%',
    marginTop: verticalScale(20),
  }
});
