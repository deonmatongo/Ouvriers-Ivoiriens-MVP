import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors, spacing, font, radius } from '../../lib/theme';
import { formatCurrency, formatDate, initials } from '../../lib/utils';

interface Quote {
  id: string;
  artisan_id: string;
  artisan_name: string;
  price: number;
  message: string;
  rating: number;
}

interface Job {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  budget?: number;
  quotes: Quote[];
}

const MOCK_JOBS: Job[] = [
  {
    id: 'mj1',
    title: "Réparation fuite d'eau sous évier",
    category: 'Plomberie',
    status: 'quoted',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    budget: 50000,
    quotes: [
      {
        id: 'q1',
        artisan_id: 'a2',
        artisan_name: 'Fatou Plomberie',
        price: 45000,
        message: 'Je peux intervenir demain matin.',
        rating: 4.6,
      },
      {
        id: 'q2',
        artisan_id: 'a5',
        artisan_name: 'Kouassi Maçonnerie',
        price: 38000,
        message: "Disponible aujourd'hui après 14h.",
        rating: 4.7,
      },
    ],
  },
  {
    id: 'mj2',
    title: 'Installation tableau électrique',
    category: 'Électricité',
    status: 'requested',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    budget: 120000,
    quotes: [],
  },
  {
    id: 'mj3',
    title: 'Peinture salon + 2 chambres',
    category: 'Peinture',
    status: 'in_progress',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    quotes: [],
  },
  {
    id: 'mj4',
    title: 'Fabrication meuble TV',
    category: 'Menuiserie',
    status: 'completed',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    budget: 180000,
    quotes: [],
  },
];

const STATUS_CONFIG: Record<string, { label_fr: string; label_en: string; variant: 'default' | 'warning' | 'info' | 'success' | 'primary' | 'error' }> = {
  requested:   { label_fr: 'Publié',      label_en: 'Posted',      variant: 'default' },
  quoted:      { label_fr: 'Devis reçu',  label_en: 'Quoted',      variant: 'warning' },
  accepted:    { label_fr: 'Accepté',     label_en: 'Accepted',    variant: 'primary' },
  in_progress: { label_fr: 'En cours',    label_en: 'In progress', variant: 'info' },
  completed:   { label_fr: 'Terminé',     label_en: 'Completed',   variant: 'success' },
};

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color={colors.warning}
        />
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function ClientJobs() {
  const { t, locale } = useLang();
  const { deductForArtisan } = useTokens();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({});
  const [acceptedQuotes, setAcceptedQuotes] = useState<Record<string, string>>({});

  const getStatus = (job: Job) => jobStatuses[job.id] ?? job.status;

  const handleAccept = (job: Job, quote: Quote) => {
    Alert.alert(
      t('agreementTitle'),
      `${t('agreementSub')}\n\n${quote.artisan_name} — ${formatCurrency(quote.price)}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('agreementConfirm'),
          onPress: async () => {
            const reason = `Accord accepté pour: ${job.title}`;
            await deductForArtisan(quote.artisan_id, 5, reason);
            setJobStatuses((prev) => ({ ...prev, [job.id]: 'accepted' }));
            setAcceptedQuotes((prev) => ({ ...prev, [job.id]: quote.id }));
            setExpandedId(null);
            Alert.alert(t('agreementSuccess'), `${quote.artisan_name} a été notifié.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myJobs')}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {MOCK_JOBS.map((job) => {
          const status = getStatus(job);
          const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG['requested'];
          const isExpanded = expandedId === job.id;
          const hasQuotes = job.quotes.length > 0 && status === 'quoted';

          return (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobRow}>
                <View style={styles.jobLeft}>
                  <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                  <Text style={styles.jobMeta}>
                    {job.category} · {formatDate(job.created_at)}
                  </Text>
                  {job.budget && (
                    <Text style={styles.jobBudget}>{formatCurrency(job.budget)}</Text>
                  )}
                </View>
                <View style={styles.jobRight}>
                  <Badge
                    label={locale === 'fr' ? sc.label_fr : sc.label_en}
                    variant={sc.variant}
                  />
                </View>
              </View>

              {hasQuotes && (
                <TouchableOpacity
                  style={styles.viewQuotesBtn}
                  onPress={() => setExpandedId(isExpanded ? null : job.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.viewQuotesBtnText}>
                    {isExpanded ? t('hideQuotes') : `${t('viewQuotes')} (${job.quotes.length})`}
                  </Text>
                </TouchableOpacity>
              )}

              {isExpanded && (
                <View style={styles.quotesSection}>
                  {job.quotes.map((quote) => (
                    <View key={quote.id} style={styles.quoteCard}>
                      <View style={styles.quoteHeader}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>{initials(quote.artisan_name)}</Text>
                        </View>
                        <View style={styles.quoteInfo}>
                          <Text style={styles.quoteName}>{quote.artisan_name}</Text>
                          <StarRow rating={quote.rating} />
                        </View>
                        <Text style={styles.quotePrice}>{formatCurrency(quote.price)}</Text>
                      </View>
                      <Text style={styles.quoteMessage}>{quote.message}</Text>
                      <Button
                        label={t('acceptQuote')}
                        onPress={() => handleAccept(job, quote)}
                        size="sm"
                        style={styles.acceptBtn}
                      />
                    </View>
                  ))}
                </View>
              )}

              {!hasQuotes && job.status === 'quoted' && job.quotes.length === 0 && (
                <Text style={styles.noQuotes}>{t('noQuotes')}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },

  jobCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobRow: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  jobLeft: { flex: 1, marginRight: spacing.sm },
  jobTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  jobMeta: { fontSize: 12, color: colors.textMuted },
  jobBudget: { fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 4 },
  jobRight: { alignItems: 'flex-end' },

  viewQuotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.primaryLight,
  },
  viewQuotesBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  quotesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  quoteCard: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  quoteHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  quoteInfo: { flex: 1 },
  quoteName: { fontSize: 14, fontWeight: '700', color: colors.text },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  ratingText: { fontSize: 11, color: colors.textMuted, marginLeft: 4 },
  quotePrice: { fontSize: 15, fontWeight: '800', color: colors.primary },
  quoteMessage: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  acceptBtn: { alignSelf: 'flex-end' },
  noQuotes: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
