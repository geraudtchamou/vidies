import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  style,
  onPress,
}: CardProps) {
  const { colors, radius, shadows, spacing } = useTheme();

  const baseStyles: ViewStyle = {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    elevated: {
      ...shadows.md,
    },
    outlined: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
  };

  const Container = onPress ? require('react-native').TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[baseStyles, variantStyles[variant], style]}
    >
      {children}
    </Container>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  const { typography, colors, spacing } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={[styles.title, { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold as any, color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: spacing.xs }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  const { spacing } = useTheme();

  return (
    <View style={[{ marginTop: spacing.sm }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    lineHeight: 28,
  },
  subtitle: {
    lineHeight: 20,
  },
  action: {
    marginLeft: 8,
  },
});
