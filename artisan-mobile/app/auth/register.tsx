import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';

type Role = 'client' | 'artisan';

export default function Register() {
  const { register } = useAuth();
  const { t, locale, toggle } = useLang();

  const [role, setRole] = useState<Role>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) { Alert.alert(t('genericError'), 'Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register({ name, email, password, role, phone: phone || undefined });
    } catch (e: any) {
      Alert.alert(t('genericError'), e?.response?.data?.message ?? t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ r, labelKey, subKey }: { r: Role; labelKey: 'clientLabel' | 'artisanLabel'; subKey: 'clientSub' | 'artisanSub' }) => (
    <TouchableOpacity
      onPress={() => setRole(r)}
      style={[styles.roleCard, role === r && styles.roleCardActive]}
    >
      <Text style={[styles.roleLabel, role === r && styles.roleLabelActive]}>{t(labelKey)}</Text>
      <Text style={[styles.roleSub, role === r && styles.roleSubActive]}>{t(subKey)}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={toggle} style={styles.langBtn}>
          <Text style={styles.langText}>{locale === 'fr' ? 'EN' : 'FR'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('registerTitle')}</Text>
        <Text style={styles.sub}>{t('registerSub')}</Text>

        {/* Role selection */}
        <View style={styles.roleRow}>
          <RoleCard r="client" labelKey="clientLabel" subKey="clientSub" />
          <RoleCard r="artisan" labelKey="artisanLabel" subKey="artisanSub" />
        </View>

        <View style={styles.form}>
          <Input label={t('nameLabel')} placeholder={t('namePlaceholder')} value={name} onChangeText={setName} />
          <Input label={t('emailLabel')} placeholder={t('emailPlaceholder')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label={t('phoneLabel')} placeholder={t('phonePlaceholder')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label={t('passwordMinLabel')} placeholder={t('passwordMinPlaceholder')} value={password} onChangeText={setPassword} secureTextEntry />
          <Button label={t('registerBtn')} onPress={handleRegister} loading={loading} size="lg" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('alreadyAccount')} </Text>
          <Link href="/auth/login">
            <Text style={styles.link}>{t('signIn')}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.bg, paddingTop: spacing.xl * 2 },
  langBtn: { position: 'absolute', top: spacing.lg, right: spacing.lg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  langText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.base, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleCard: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
  roleCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleLabel: { fontWeight: '700', fontSize: 15, color: colors.text },
  roleLabelActive: { color: colors.primaryDark },
  roleSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  roleSubActive: { color: colors.primaryText },
  form: { gap: spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl, flexWrap: 'wrap' },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
