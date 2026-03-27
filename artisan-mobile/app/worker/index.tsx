import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { colors, spacing, font, radius } from '../../lib/theme';
import { formatDate } from '../../lib/utils';

const MOCK_STATS = { activeJobs: 2, rating: 4.8, totalJobs: 23 };

const MOCK_RECENT_WORK = [
  { id: 'w1', title: 'Installation tableau électrique', client: 'Marie Ouédraogo', status: 'in_progress', date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'w2', title: 'Remplacement prises défectueuses', client: 'Koffi Yao', status: 'completed', date: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'w3', title: 'Installation climatiseur', client: 'Adjoua Bamba', status: 'completed', date: new Date(Date.now() - 10 * 86400000).toISOString() },
];

const PROFILE_COMPLETENESS = 65;

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const { t, locale, toggle } = useLang();
  const router = useRouter();
  const [available, setAvailable] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {t('greeting')}, {user?.name?.split(' ')[0]}
            </Text>
            <Text style={styles.sub}>{t('workerDashSub')}</Text>
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
          <StatCard
            label={t('statCurrentJobs')}
            value={MOCK_STATS.activeJobs}
            icon="flash"
            color={colors.primary}
          />
          <StatCard
            label={t('statRating')}
            value={`${MOCK_STATS.rating} ★`}
            icon="star"
            color={colors.warning}
          />
          <StatCard
            label={t('statTotalJobs')}
            value={MOCK_STATS.totalJobs}
            icon="checkmark-circle"
            color={colors.success}
          />
        </View>

        {/* Availability toggle */}
        <TouchableOpacity
          style={[styles.availabilityRow, available ? styles.availableOn : styles.availableOff]}
          onPress={() => setAvailable((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={[styles.toggleDot, available ? styles.dotOn : styles.dotOff]} />
          <Text style={[styles.availabilityText, available ? styles.availTextOn : styles.availTextOff]}>
            {available ? t('available') : t('unavailable')}
          </Text>
          <Ionicons
            name={available ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={available ? colors.success : colors.textMuted}
            style={styles.availIcon}
          />
        </TouchableOpacity>

        {/* Profile completeness */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardHeader}>
            <Text style={styles.sectionTitle}>{t('profileCompleteness')}</Text>
            <Text style={styles.profilePct}>{PROFILE_COMPLETENESS}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${PROFILE_COMPLETENESS}%` }]} />
          </View>
          <Text style={styles.profileHint}>
            {PROFILE_COMPLETENESS < 100
              ? 'Complétez votre profil pour plus de visibilité.'
              : 'Profil complet !'}
          </Text>
        </View>

        {/* Recent work */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentWork')}</Text>
            <TouchableOpacity onPress={() => router.push('/worker/reviews')}>
              <Text style={styles.viewAll}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.workList}>
            {MOCK_RECENT_WORK.map((job) => (
              <View key={job.id} style={styles.workRow}>
                <View style={styles.workLeft}>
                  <Text style={styles.workTitle} numberOfLines={1}>{job.title}</Text>
                  <Text style={styles.workClient}>{job.client} · {formatDate(job.date)}</Text>
                </View>
                <Badge
                  label={job.status === 'in_progress' ? (locale === 'fr' ? 'En cours' : 'In Progress') : (locale === 'fr' ? 'Terminé' : 'Completed')}
                  variant={job.status === 'in_progress' ? 'info' : 'success'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Quick action */}
        <Button
          label={locale === 'fr' ? 'Voir les offres clients' : 'Browse Client Jobs'}
          onPress={() => router.push('/worker/browse')}
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greeting: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  langText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    borderLeftWidth: 3,
    gap: 2,
    alignItems: 'center',
  },
  statValue: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },

  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  availableOn: { backgroundColor: colors.successBg, borderColor: colors.success },
  availableOff: { backgroundColor: colors.bg, borderColor: colors.border },
  toggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotOn: { backgroundColor: colors.success },
  dotOff: { backgroundColor: colors.textLight },
  availabilityText: { flex: 1, fontSize: 14, fontWeight: '700' },
  availTextOn: { color: colors.success },
  availTextOff: { color: colors.textMuted },
  availIcon: { marginLeft: 'auto' },

  profileCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profilePct: { fontSize: font.md, fontWeight: '800', color: colors.primary },
  progressBg: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  profileHint: { fontSize: 12, color: colors.textMuted },

  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  viewAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  workList: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  workRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  workLeft: { flex: 1, marginRight: spacing.sm },
  workTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  workClient: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  cta: { marginBottom: spacing.lg },
});
