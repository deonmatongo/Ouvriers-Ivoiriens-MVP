import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { colors, spacing, font, radius } from '../../lib/theme';
import { formatCurrency, formatDate } from '../../lib/utils';

const MOCK_STATS = { active: 2, pending: 1, completed: 4 };

const MOCK_JOBS = [
  { id: 'j1', title: "Réparation fuite d'eau", category: 'Plomberie', status: 'quoted', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), budget: 50000 },
  { id: 'j2', title: 'Installation tableau électrique', category: 'Électricité', status: 'in_progress', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'j3', title: 'Peinture salon', category: 'Peinture', status: 'completed', created_at: new Date(Date.now() - 14 * 86400000).toISOString(), budget: 150000 },
];

const STATUS_CONFIG: Record<string, { label_fr: string; label_en: string; variant: 'default' | 'warning' | 'info' | 'success' }> = {
  requested:   { label_fr: 'Publié',     label_en: 'Posted',      variant: 'default' },
  quoted:      { label_fr: 'Devis reçu', label_en: 'Quoted',      variant: 'warning' },
  accepted:    { label_fr: 'Accepté',    label_en: 'Accepted',    variant: 'info' },
  in_progress: { label_fr: 'En cours',   label_en: 'In progress', variant: 'info' },
  completed:   { label_fr: 'Terminé',    label_en: 'Completed',   variant: 'success' },
};

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const { t, locale, toggle } = useLang();
  const router = useRouter();

  const handleLogout = async () => { await logout(); router.replace('/auth/login'); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('greeting')}, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.sub}>{t('dashboardSub')}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggle} style={styles.langBtn}>
            <Text style={styles.langText}>{locale === 'fr' ? 'EN' : 'FR'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label={t('statActiveJobs')} value={MOCK_STATS.active} icon="flash" color={colors.primary} />
        <StatCard label={t('statPendingQuotes')} value={MOCK_STATS.pending} icon="time" color={colors.warning} />
        <StatCard label={t('statCompleted')} value={MOCK_STATS.completed} icon="checkmark-circle" color={colors.success} />
      </View>

      {/* Recent jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recentJobs')}</Text>
          <TouchableOpacity onPress={() => router.push('/client/jobs')}>
            <Text style={styles.viewAll}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {MOCK_JOBS.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={40} color={colors.border} />
            <Text style={styles.emptyTitle}>{t('noJobs')}</Text>
            <Text style={styles.emptySub}>{t('noJobsSub')}</Text>
            <Button label={t('postFirstJob')} onPress={() => router.push('/client/post-job')} size="sm" style={{ marginTop: spacing.md }} />
          </View>
        ) : (
          <View style={styles.jobList}>
            {MOCK_JOBS.map((job) => {
              const sc = STATUS_CONFIG[job.status];
              return (
                <TouchableOpacity key={job.id} style={styles.jobRow} onPress={() => router.push('/client/jobs')}>
                  <View style={styles.jobLeft}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                    <Text style={styles.jobMeta}>{job.category} · {formatDate(job.created_at)}</Text>
                  </View>
                  <View style={styles.jobRight}>
                    {job.budget && <Text style={styles.jobBudget}>{formatCurrency(job.budget)}</Text>}
                    <Badge label={locale === 'fr' ? sc.label_fr : sc.label_en} variant={sc.variant} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Quick CTA */}
      <Button label={t('navNewJob')} onPress={() => router.push('/client/post-job')} style={styles.cta} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: 56, gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greeting: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  langText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm + 4, borderLeftWidth: 3, gap: 2, alignItems: 'center' },
  statValue: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  viewAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  jobList: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' },
  jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  jobLeft: { flex: 1, marginRight: spacing.sm },
  jobTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  jobMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  jobRight: { alignItems: 'flex-end', gap: 4 },
  jobBudget: { fontSize: 12, fontWeight: '600', color: colors.text },
  empty: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.card, borderRadius: radius.md, gap: spacing.sm },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  cta: { marginBottom: spacing.lg },
});
