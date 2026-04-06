import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const getBackgroundStyle = () => {
    if (disabled) return { backgroundColor: colors.border };
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'outline':
        return { backgroundColor: colors.transparent, borderWidth: 1, borderColor: colors.primary };
      case 'ghost':
        return { backgroundColor: colors.transparent };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = () => {
    if (disabled) return { color: colors.subtext };
    switch (variant) {
      case 'primary':
      case 'secondary':
        return { color: isDarkVariant() ? '#FFFFFF' : colors.text }; // Ensuring visibility
      case 'outline':
      case 'ghost':
        return { color: colors.primary };
      default:
        return { color: '#FFFFFF' };
    }
  };

  const isDarkVariant = () => variant === 'primary' || variant === 'secondary';

  const textColor = getTextStyle().color;

  return (
    <TouchableOpacity
      style={[styles.container, getBackgroundStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.text, { color: textColor }, textStyle, icon ? styles.textWithIcon : null]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: verticalScale(45),
    borderRadius: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(16),
  },
  text: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  textWithIcon: {
    marginLeft: scale(8),
  },
});
