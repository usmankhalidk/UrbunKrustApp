import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Animated, StyleSheet, ImageProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props extends ImageProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export const ImageWithSkeleton: React.FC<Props> = ({ style, containerStyle, ...props }) => {
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const { colors } = useTheme();

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (loading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.stopAnimation();
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [loading, pulseAnim]);

  return (
    <View style={[{ overflow: 'hidden' }, containerStyle, style]}>
      <Image
        {...props}
        style={[StyleSheet.absoluteFill, style]}
        onLoad={() => setLoading(false)}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.border, opacity: pulseAnim },
          ]}
        />
      )}
    </View>
  );
};
