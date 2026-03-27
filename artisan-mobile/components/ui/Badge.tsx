import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../../lib/theme';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  variant?: Variant;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  default:  { bg: colors.borderLight, text: colors.textMuted },
  success:  { bg: colors.successBg,   text: colors.success },
  warning:  { bg: colors.warningBg,   text: colors.warning },
  error:    { bg: colors.errorBg,     text: colors.error },
  info:     { bg: colors.infoBg,      text: colors.info },
  primary:  { bg: colors.primaryLight, text: colors.primaryText },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const vs = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: vs.bg }]}>
      <Text style={[styles.label, { color: vs.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  label: { fontSize: 11, fontWeight: '600' },
});
