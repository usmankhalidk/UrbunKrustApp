export type ThemeColors = {
  background: string;
  primary: string;
  secondary: string;
  surface: string;
  text: string;
  subtext: string;
  inputBackground: string;
  border: string;
  error: string;
  transparent: string;
};

export const colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#FFFFFF',
    primary: '#EA8633', // Exact orange from the reference UI
    secondary: '#FFC107', // Keeping a complementary yellow
    surface: '#FFFFFF',
    text: '#111111', // Almost black for headings
    subtext: '#6B7280', // Muted gray for subtitles
    inputBackground: '#F9FAFB', // Very light gray for light mode inputs
    border: '#E5E7EB', // Light border for inputs
    error: '#EF4444',
    transparent: 'transparent',
  },
  dark: {
    background: '#0B0D11', // Very deep gray/blue background from reference
    primary: '#EA8633', // The orange accent remains the same
    secondary: '#FFC107',
    surface: '#12141A', // Slightly elevated surface color
    text: '#FFFFFF', // White text
    subtext: '#9CA3AF', // Muted gray for dark mode subtitles
    inputBackground: '#16181F', // Dark input background
    border: '#272A35', // Visible dark mode borders
    error: '#EF4444',
    transparent: 'transparent',
  },
};
