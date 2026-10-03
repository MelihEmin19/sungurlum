import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS !== 'web';

// Tüm haptic feedback devre dışı — daha sonra ince ayar yapılacak
export const hapticLight = () => {};
export const hapticMedium = () => {};
export const hapticHeavy = () => {};
export const hapticSuccess = () => {};
export const hapticError = () => {};
export const hapticWarning = () => {};

