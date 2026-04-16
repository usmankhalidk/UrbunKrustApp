import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export const useResponsiveLayout = () => {
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const width = windowDimensions.width;
  const height = windowDimensions.height;

  // Industry standard tablet breakpoint (iPad mini is 768px wide in portrait)
  const isTablet = width >= 768;
  const isLandscape = width > height;

  return {
    width,
    height,
    isTablet,
    isLandscape,
  };
};
