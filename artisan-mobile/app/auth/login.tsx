import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';

export default function Login() {
  const { login } = useAuth();
  const { t, locale, toggle } = useLang();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext sets user → index.tsx redirects
    } catch {
      Alert.alert(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Lang toggle */}
        <TouchableOpacity onPress={toggle} style={styles.langBtn}>
          <Text style={styles.langText}>{locale === 'fr' ? 'EN' : 'FR'}</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>OI</Text>
          </View>
          <Text style={styles.appName}>Ouvriers Ivoiriens</Text>
        </View>

        <Text style={styles.title}>{t('loginTitle')}</Text>
        <Text style={styles.sub}>{t('loginSub')}</Text>

        <View style={styles.form}>
          <Input
            label={t('emailLabel')}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label={t('passwordLabel')}
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotLink}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <Button label={t('loginBtn')} onPress={handleLogin} loading={loading} size="lg" />
        </View>

        {/* Mock hint */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>Demo: client@test.com / password123</Text>
          <Text style={styles.hintText}>Demo: artisan@test.com / password123</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('noAccount')} </Text>
          <Link href="/auth/register">
            <Text style={styles.link}>{t('signUp')}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center', backgroundColor: colors.bg },
  langBtn: { position: 'absolute', top: spacing.lg, right: spacing.lg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  langText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: spacing.xl },
  logoCircle: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  appName: { fontSize: 18, fontWeight: '700', color: colors.text },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text, textAlign: 'center' },
  sub: { fontSize: font.base, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.xl },
  form: { gap: spacing.md },
  forgotLink: { textAlign: 'right', color: colors.primary, fontSize: 13, fontWeight: '500' },
  hint: { marginTop: spacing.lg, padding: spacing.sm, backgroundColor: colors.primaryLight, borderRadius: radius.sm, gap: 2 },
  hintText: { fontSize: 11, color: colors.primaryText, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl, flexWrap: 'wrap' },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
