// Sungurlum Premium Design System — Midnight + Turquoise

export const Colors = {
  // --- MARKA RENKLERİ ---
  primary: '#0097A7',        // Turkuaz — Ana marka rengi
  primaryDark: '#006064',
  primaryLight: '#00B8D4',
  primaryGradientStart: '#0097A7',
  primaryGradientEnd: '#006064',

  // Midnight tonu (koyu vurgular, başlıklar)
  secondary: '#151827',       // Midnight
  secondaryDark: '#0D0F1A',
  secondaryLight: '#1E2235',

  accent: '#0097A7',         // Aksiyon rengi = Marka
  accentLight: '#E0F7FA',    // Açık turkuaz ton

  // --- MODÜL RENKLERİ ---
  food: '#FF8A3D',           // Yemek modülü — Turuncu
  foodLight: '#FFF0E6',
  foodDark: '#E67530',

  marketGreen: '#35B978',    // Market modülü — Yeşil
  marketGreenLight: '#E6F7EF',
  marketGreenDark: '#2A9D68',

  // --- ARKA PLANLAR ---
  background: '#F7F7FA',     // Çok açık gri
  surface: '#FFFFFF',        // Kart beyazı
  surfaceElevated: '#FFFFFF',

  // --- YAZI RENKLERİ ---
  text: '#171925',           // Ana yazı
  textSecondary: '#777A8A',  // İkincil yazı
  textTertiary: '#A0A3B1',   // Üçüncül / placeholder
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // --- KENARLIKLLAR ---
  border: '#E5E7EB',
  borderLight: '#EDEDF0',
  divider: '#EDEDF0',

  // --- DURUM RENKLERİ ---
  success: '#35B978',
  successLight: '#E6F7EF',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0097A7',
  infoLight: '#E0F7FA',

  star: '#F59E0B',           // Yıldız ratingleri
  favorite: '#EF4444',       // Favori kalp

  overlay: 'rgba(21, 24, 39, 0.4)', // Midnight overlay
  shimmer: '#EDEDF0',

  // Tab bar
  tabBarBackground: 'rgba(255, 255, 255, 0.95)',
  tabBarActive: '#0097A7',   // Turkuaz — aktif tab
  tabBarInactive: '#A0A3B1',
};

export const Fonts = {
  regular: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  medium: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontWeight: '500' as const,
    letterSpacing: -0.3,
  },
  semiBold: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: -0.4,
  },
  bold: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  extraBold: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontWeight: '800' as const,
    letterSpacing: -0.8,
  },
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  hero: 48,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
};

export const BorderRadius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  full: 9999,
};

// Crisp, clean shadows (less blur, slightly more opacity)
export const Shadows = {
  sm: {
    shadowColor: '#151827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#151827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#151827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#151827',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
};
