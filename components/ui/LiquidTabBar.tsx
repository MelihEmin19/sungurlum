import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight } from '@/utils/haptics';

const { width } = Dimensions.get('window');

export default function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  // Filter out tabs that should be hidden
  const visibleRoutes = state.routes.filter(route => {
    return route.name !== 'pharmacies' && route.name !== 'map';
  });

  const TAB_WIDTH = width / visibleRoutes.length;
  const CIRCLE_SIZE = 48;

  // Get index among visible routes
  const currentVisibleIndex = visibleRoutes.findIndex(r => r.key === state.routes[state.index].key);

  // Active index for animation
  const activeIndex = useDerivedValue(() => {
    return withSpring(Math.max(0, currentVisibleIndex), {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    });
  }, [currentVisibleIndex]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const translateX = activeIndex.value * TAB_WIDTH + (TAB_WIDTH - CIRCLE_SIZE) / 2;
    
    // Stretch effect when moving
    const distance = Math.abs(activeIndex.value - Math.round(activeIndex.value));
    const stretchX = interpolate(distance, [0, 0.5, 1], [1, 1.5, 1]);
    const scaleY = interpolate(distance, [0, 0.5, 1], [1, 0.8, 1]);

    return {
      transform: [
        { translateX },
        { scaleX: stretchX },
        { scaleY: scaleY }
      ],
    };
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      
      {state.routes.map((route, index) => {
        const options = descriptors[route.key].options as any;
        
        // Skip hidden tabs
        if (route.name === 'pharmacies' || route.name === 'map') return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            hapticLight();
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Determine Icon
        let iconName: any = 'home';
        if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
        if (route.name === 'categories') iconName = isFocused ? 'view-grid' : 'view-grid-outline';
        if (route.name === 'city') iconName = isFocused ? 'bank' : 'bank-outline';
        if (route.name === 'favorites') iconName = isFocused ? 'heart' : 'heart-outline';
        if (route.name === 'profile') iconName = isFocused ? 'account-circle' : 'account-circle-outline';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name={iconName} 
                size={26} 
                color={isFocused ? '#FFFFFF' : Colors.textSecondary} 
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 10,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    zIndex: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 11,
    left: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
});
