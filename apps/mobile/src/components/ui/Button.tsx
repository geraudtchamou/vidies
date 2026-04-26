import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { colors, radius, spacing, typography } = useTheme();

  const baseStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingVertical: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md,
    paddingHorizontal: size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg,
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    accent: {
      backgroundColor: colors.accentTeal,
      shadowColor: colors.accentTeal,
    },
  };

  const textStyles: TextStyle = {
    fontSize: typography.sizes[size === 'sm' ? 'sm' : 'base'],
    fontWeight: typography.weights.semibold as any,
    color: variant === 'secondary' ? colors.primary : '#FFFFFF',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        baseStyles,
        variantStyles[variant],
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <Text style={[textStyles, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}
