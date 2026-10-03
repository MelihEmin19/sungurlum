import React, { useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { Colors, Fonts, FontSizes, BorderRadius } from '@/constants/theme';
import SpringButton from '@/components/ui/SpringButton';

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export default function SuccessModal({ visible, title = "Başarılı!", message = "İşlem başarıyla tamamlandı.", onClose }: SuccessModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      checkScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 120 }));
    } else {
      scale.value = 0;
      opacity.value = 0;
      checkScale.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={[{ 
          backgroundColor: Colors.surface, 
          width: '85%', 
          borderRadius: BorderRadius.xl, 
          padding: 24, 
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10
        }, containerStyle]}>
          
          <Animated.View style={[{ 
            width: 80, 
            height: 80, 
            borderRadius: 40, 
            backgroundColor: Colors.success, 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 20
          }, checkStyle]}>
            <Icon name="check" size={40} color="#FFF" />
          </Animated.View>

          <Text style={{ fontSize: FontSizes.xl, ...Fonts.extraBold, color: Colors.text, marginBottom: 8, textAlign: 'center' }}>{title}</Text>
          <Text style={{ fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>{message}</Text>

          <SpringButton 
            style={{ backgroundColor: Colors.primary, width: '100%', height: 48, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' }}
            onPress={onClose}
          >
            <Text style={{ color: '#FFF', ...Fonts.bold, fontSize: FontSizes.md }}>Devam Et</Text>
          </SpringButton>
        </Animated.View>
      </View>
    </Modal>
  );
}
