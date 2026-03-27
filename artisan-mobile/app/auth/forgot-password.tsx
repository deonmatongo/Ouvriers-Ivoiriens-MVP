import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useLang } from '../../context/LangContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../lib/api';
import { colors, spacing, font, radius } from '../../lib/theme';

export default function ForgotPassword() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try { await authApi.forgotPassword(email); } catch { /* silent */ }
    finally { setLoading(false); setSent(true); }
  };

  if (sent) {
    return (
      <View style={styles.center}>
        <Text style={styles.bigIcon}>✉️</Text>
        <Text style={styles.title}>{t('emailSentTitle')}</Text>
        <Text style={styles.sub}>{t('emailSentSub')}</Text>
        <Link href="/auth/login" style={styles.backLink}>
          <Text style={styles.link}>{t('backToLogin')}</Text>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('forgotTitle')}</Text>
      <Text style={styles.sub}>{t('forgotSub')}</Text>
      <View style={styles.form}>
        <Input label={t('emailLabel')} placeholder={t('emailPlaceholder')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button label={t('sendLink')} onPress={handleSend} loading={loading} size="lg" />
      </View>
      <Link href="/auth/login" style={styles.backLinkRow}>
        <Text style={styles.link}>{t('backToLogin')}</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl * 2, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg },
  bigIcon: { fontSize: 56 },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.base, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  form: { gap: spacing.md },
  backLink: { marginTop: spacing.xl },
  backLinkRow: { marginTop: spacing.xl, alignSelf: 'center' },
  link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
