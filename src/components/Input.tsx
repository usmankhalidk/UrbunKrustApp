import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword,
  leftIcon,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [secureText, setSecureText] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.inputBackground },
          isFocused && { ...styles.inputFocused, borderColor: colors.primary, backgroundColor: colors.surface },
          error && { ...styles.inputError, borderColor: colors.error },
          style,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.subtext}
          secureTextEntry={secureText}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureText(!secureText)}
            activeOpacity={0.7}
          >
            {secureText ? (
              <EyeOff color={colors.subtext} size={moderateScale(20)} />
            ) : (
              <Eye color={colors.subtext} size={moderateScale(20)} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: verticalScale(6),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: moderateScale(12),
    height: verticalScale(45),
    paddingHorizontal: scale(12),
  },
  inputFocused: {
    // Colors handled in component
  },
  inputError: {
    // Colors handled in component
  },
  leftIconContainer: {
    marginRight: scale(8),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    height: '100%',
  },
  eyeIcon: {
    paddingLeft: scale(8),
  },
  errorText: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
  },
});
