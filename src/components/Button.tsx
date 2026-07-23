import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'lime' | 'orange' | 'red' | 'blue' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const VARIANT_BG: Record<NonNullable<Props['variant']>, string> = {
  lime: Colors.accentLime,
  orange: Colors.accentOrange,
  red: Colors.accentRed,
  blue: Colors.accentBlue,
  outline: 'transparent',
};

export function Button({ label, onPress, variant = 'lime', disabled, loading, style }: Props) {
  const bg = disabled ? '#3A3D43' : VARIANT_BG[variant];
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: bg },
        isOutline && styles.outline,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.text : Colors.background} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: disabled ? Colors.textMuted : isOutline ? Colors.text : Colors.background },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 4,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    fontFamily: Fonts.display,
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
