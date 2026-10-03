import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  grid: 8, // 8px grid system
  contentWidth: width > 768 ? 768 : '100%', // For tablet support
};
