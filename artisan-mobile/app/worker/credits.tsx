import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';
import { formatDate } from '../../lib/utils';

interface Package {
  id: string;
  name: string;
  tokens: number;
  price: number;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning';
}

const PACKAGES: Package[] = [
  { id: 'starter', name: 'Starter', tokens: 10, price: 1000 },
  { id: 'pro', name: 'Pro', tokens: 50, price: 4500, badge: 'Populaire', badgeVariant: 'primary' },
  { id: 'business', name: 'Business', tokens: 100, price: 8000, badge: 'Meilleure valeur', badgeVariant: 'success' },
];

const PAYMENT_METHODS = ['Orange Money', 'MTN Mobile Money', 'Wave'];

const HOW_IT_WORKS = [
  { icon: 'chatbubble-outline', text: 'Contacter un client = 1 crédit débité' },
  { icon: 'handshake-outline', text: 'Accord confirmé = 5 crédits débités de l\'artisan' },
  { icon: 'refresh-outline', text: 'Les crédits ne expirent jamais' },
];

export default function WorkerCredits() {
  const { t } = useLang();
  const { balance, transactions, addTokens } = useTokens();

  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastAdded, setLastAdded] = useState(0);

  const handlePay = async () => {
    if (!selectedPkg || !selectedPayment || !phone.trim()) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    const reason = `Achat ${selectedPkg.name}: ${selectedPkg.tokens} crédits via ${selectedPayment}`;
    await addTokens(selectedPkg.tokens, reason);
    setLastAdded(selectedPkg.tokens);
    setProcessing(false);
    setSuccess(true);
  };

  const handleReset = () => {
    setSuccess(false);
    setSelectedPkg(null);
    setSelectedPayment(null);
    setPhone('');
    setLastAdded(0);
  };

  const canPay = !!selectedPkg && !!selectedPayment && phone.trim().length >= 8 && !processing;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('creditsTitle')}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('currentBalance')}</Text>
          <Text style={styles.balanceAmount}>{balance}</Text>
          <Text style={styles.balanceUnit}>{t('creditsUnit')}</Text>
        </View>

        {/* Success view */}
        {success && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.successTitle}>{t('paymentSuccess')}</Text>
            <Text style={styles.successSub}>{lastAdded} {t('paymentSuccessSub')}</Text>
            <Button label="Continuer" onPress={handleReset} size="sm" style={styles.continueBtn} />
          </View>
        )}

        {!success && (
          <>
            {/* How it works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('howCreditsWork')}</Text>
              <View style={styles.rulesCard}>
                {HOW_IT_WORKS.map((rule, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <View style={styles.ruleIcon}>
                      <Ionicons name={rule.icon as any} size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.ruleText}>{rule.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Package selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('choosePackage')}</Text>
              <View style={styles.packageList}>
                {PACKAGES.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[styles.packageCard, selectedPkg?.id === pkg.id && styles.packageCardActive]}
                    onPress={() => setSelectedPkg(pkg)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.packageTop}>
                      <View style={styles.packageLeft}>
                        <View style={styles.radioCircle}>
                          {selectedPkg?.id === pkg.id && <View style={styles.radioDot} />}
                        </View>
                        <View>
                          <Text style={styles.packageName}>{pkg.name}</Text>
                          <Text style={styles.packageTokens}>{pkg.tokens} crédits</Text>
                        </View>
                      </View>
                      <View style={styles.packageRight}>
                        {pkg.badge && (
                          <Badge label={pkg.badge} variant={pkg.badgeVariant ?? 'primary'} />
                        )}
                        <Text style={styles.packagePrice}>{pkg.price.toLocaleString('fr-CI')} FCFA</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('payWith')}</Text>
              <View style={styles.paymentList}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[styles.paymentChip, selectedPayment === method && styles.paymentChipActive]}
                    onPress={() => setSelectedPayment(method)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={16}
                      color={selectedPayment === method ? '#fff' : colors.textMuted}
                    />
                    <Text style={[styles.paymentChipText, selectedPayment === method && styles.paymentChipTextActive]}>
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Phone input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('yourPhone')}</Text>
              <View style={styles.phoneInput}>
                <Ionicons name="call-outline" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.phoneField}
                  placeholder={t('yourPhonePlaceholder')}
                  placeholderTextColor={colors.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Pay button */}
            {processing ? (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.processingText}>Traitement en cours...</Text>
              </View>
            ) : (
              <Button
                label={`${t('payNow')}${selectedPkg ? ` — ${selectedPkg.price.toLocaleString('fr-CI')} FCFA` : ''}`}
                onPress={handlePay}
                disabled={!canPay}
                size="lg"
              />
            )}
          </>
        )}

        {/* Transaction history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('transactionHistory')}</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyTxn}>
              <Ionicons name="receipt-outline" size={36} color={colors.border} />
              <Text style={styles.emptyTxnText}>{t('noTransactions')}</Text>
            </View>
          ) : (
            <View style={styles.txnList}>
              {transactions.map((txn) => (
                <View key={txn.id} style={styles.txnRow}>
                  <View style={styles.txnLeft}>
                    <View style={[styles.txnIcon, { backgroundColor: txn.type === 'credit' ? colors.successBg : colors.errorBg }]}>
                      <Ionicons
                        name={txn.type === 'credit' ? 'add-circle-outline' : 'remove-circle-outline'}
                        size={16}
                        color={txn.type === 'credit' ? colors.success : colors.error}
                      />
                    </View>
                    <View>
                      <Text style={styles.txnReason} numberOfLines={1}>{txn.reason}</Text>
                      <Text style={styles.txnDate}>{formatDate(txn.created_at)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.txnAmount, { color: txn.type === 'credit' ? colors.success : colors.error }]}>
                    {txn.type === 'credit' ? '+' : '-'}{txn.amount}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },

  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 4,
  },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  balanceAmount: { fontSize: 56, fontWeight: '900', color: '#fff', lineHeight: 64 },
  balanceUnit: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  successCard: {
    backgroundColor: colors.successBg,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successTitle: { fontSize: font.lg, fontWeight: '800', color: colors.success },
  successSub: { fontSize: 14, color: colors.success },
  continueBtn: { marginTop: spacing.sm },

  section: { gap: spacing.sm },
  sectionTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },

  rulesCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  ruleIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 },

  packageList: { gap: spacing.sm },
  packageCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
  },
  packageCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  packageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  packageLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  packageName: { fontSize: 15, fontWeight: '700', color: colors.text },
  packageTokens: { fontSize: 12, color: colors.textMuted },
  packageRight: { alignItems: 'flex-end', gap: 4 },
  packagePrice: { fontSize: 15, fontWeight: '800', color: colors.primary },

  paymentList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  paymentChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  paymentChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  paymentChipTextActive: { color: '#fff' },

  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  phoneField: { flex: 1, fontSize: 15, color: colors.text },

  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
  },
  processingText: { fontSize: 14, color: colors.primary, fontWeight: '600' },

  emptyTxn: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTxnText: { fontSize: 14, color: colors.textMuted },

  txnList: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  txnLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  txnIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnReason: { fontSize: 13, fontWeight: '600', color: colors.text, maxWidth: 200 },
  txnDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: '800' },
});
