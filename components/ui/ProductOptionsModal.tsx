import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpringButton from '@/components/ui/SpringButton';
import { Icon } from '@/components/ui/Icon';
import { Colors, Spacing, FontSizes, Fonts, BorderRadius } from '@/constants/theme';
import { Product, ProductOption } from '@/services/products';
import { SelectedOption } from '@/stores/cartStore';

interface ProductOptionsModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedOptions: SelectedOption[], totalPrice: number) => void;
}

export default function ProductOptionsModal({ visible, product, onClose, onAddToCart }: ProductOptionsModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    if (visible && product) {
      setSelectedChoices({});
    }
  }, [visible, product]);

  if (!product) return null;

  const handleSelectChoice = (optionTitle: string, choiceName: string, allowMultiple: boolean) => {
    setSelectedChoices(prev => {
      const currentSelections = prev[optionTitle] || [];
      if (allowMultiple) {
        if (currentSelections.includes(choiceName)) {
          return { ...prev, [optionTitle]: currentSelections.filter(c => c !== choiceName) };
        } else {
          return { ...prev, [optionTitle]: [...currentSelections, choiceName] };
        }
      } else {
        // Radio logic
        if (currentSelections.includes(choiceName)) {
            return { ...prev, [optionTitle]: [] };
        }
        return { ...prev, [optionTitle]: [choiceName] };
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    if (!product.options) return total;
    
    product.options.forEach(opt => {
      const selected = selectedChoices[opt.title] || [];
      selected.forEach(selName => {
        const choice = opt.choices.find(c => c.name === selName);
        if (choice) {
          total += choice.priceOffset;
        }
      });
    });
    return total;
  };

  const handleConfirm = () => {
    // Validate required options
    if (product.options) {
      for (const opt of product.options) {
        if (opt.isRequired && (!selectedChoices[opt.title] || selectedChoices[opt.title].length === 0)) {
          Alert.alert('Zorunlu Seçim', `Lütfen "${opt.title}" için seçim yapınız.`);
          return;
        }
      }
    }

    // Format selected options
    const finalOptions: SelectedOption[] = [];
    if (product.options) {
      product.options.forEach(opt => {
        const selected = selectedChoices[opt.title] || [];
        selected.forEach(selName => {
          const choice = opt.choices.find(c => c.name === selName);
          if (choice) {
            finalOptions.push({
              optionTitle: opt.title,
              choiceName: choice.name,
              priceOffset: choice.priceOffset,
            });
          }
        });
      });
    }

    onAddToCart(product, finalOptions, calculateTotalPrice());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: Colors.background, 
          borderTopLeftRadius: BorderRadius.xl, 
          borderTopRightRadius: BorderRadius.xl,
          maxHeight: '80%',
          paddingBottom: insets.bottom || Spacing.lg
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSizes.lg, ...Fonts.extraBold, color: Colors.text }}>{product.name}</Text>
              <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 }}>₺{product.price} (Taban Fiyat)</Text>
            </View>
            <SpringButton style={{ width: 40, height: 40, backgroundColor: Colors.surface, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }} onPress={onClose}>
              <Icon name="x" size={24} color={Colors.text} />
            </SpringButton>
          </View>

          {/* Options List */}
          <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
            {product.options && product.options.map((option, idx) => {
               const selections = selectedChoices[option.title] || [];
               return (
                 <View key={idx} style={{ marginBottom: Spacing.xl }}>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                     <Text style={{ fontSize: FontSizes.md, ...Fonts.bold, color: Colors.text }}>
                       {option.title}
                       {option.isRequired && <Text style={{ color: Colors.error }}> *</Text>}
                     </Text>
                     <Text style={{ fontSize: FontSizes.xs, color: Colors.textTertiary }}>
                       {option.allowMultiple ? 'Çoklu Seçim' : 'Tek Seçim'}
                     </Text>
                   </View>
                   
                   <View style={{ marginTop: Spacing.sm }}>
                     {option.choices.map((choice, cIdx) => {
                       const isSelected = selections.includes(choice.name);
                       return (
                         <SpringButton
                           key={cIdx}
                           style={{
                             flexDirection: 'row',
                             alignItems: 'center',
                             justifyContent: 'space-between',
                             paddingVertical: Spacing.md,
                             borderBottomWidth: 1,
                             borderBottomColor: Colors.borderLight
                           }}
                           onPress={() => handleSelectChoice(option.title, choice.name, option.allowMultiple)}
                         >
                           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                             {option.allowMultiple ? (
                               <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: isSelected ? Colors.primary : Colors.border, backgroundColor: isSelected ? Colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md }}>
                                 {isSelected && <Icon name="check" size={16} color="#FFF" />}
                               </View>
                             ) : (
                               <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: isSelected ? Colors.primary : Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md }}>
                                 {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary }} />}
                               </View>
                             )}
                             <Text style={{ fontSize: FontSizes.sm, ...Fonts.medium, color: Colors.text }}>{choice.name}</Text>
                           </View>
                           {choice.priceOffset > 0 && (
                             <Text style={{ fontSize: FontSizes.sm, ...Fonts.bold, color: Colors.textSecondary }}>+₺{choice.priceOffset}</Text>
                           )}
                         </SpringButton>
                       );
                     })}
                   </View>
                 </View>
               );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={{ padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.borderLight }}>
            <SpringButton 
              style={{ backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.xl, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, alignItems: 'center' }}
              onPress={handleConfirm}
            >
              <Text style={{ color: '#FFF', fontSize: FontSizes.md, ...Fonts.bold }}>Sepete Ekle</Text>
              <Text style={{ color: '#FFF', fontSize: FontSizes.lg, ...Fonts.extraBold }}>₺{calculateTotalPrice()}</Text>
            </SpringButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}
