import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../context/LangContext';
import { colors, spacing, font, radius } from '../../lib/theme';
import { formatDate, initials } from '../../lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  client_name: string;
  created_at: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    rating: 5,
    comment: 'Excellent travail, très professionnel. Intervention rapide et propre. Je recommande vivement !',
    client_name: 'Marie Ouédraogo',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'r2',
    rating: 4,
    comment: 'Bon travail dans l\'ensemble, mais un peu en retard sur le délai prévu. Qualité du travail irréprochable.',
    client_name: 'Koffi Yao',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'r3',
    rating: 5,
    comment: 'Je recommande vivement. Très à l\'écoute, explique bien ce qu\'il fait. Prix honnête.',
    client_name: 'Aïssatou Diallo',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const RATING_BREAKDOWN: Record<number, number> = { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 };
const TOTAL_REVIEWS = MOCK_REVIEWS.length;
const AVG_RATING = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / TOTAL_REVIEWS;

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= rating ? 'star' : 'star-outline'}
          size={size}
          color={colors.warning}
        />
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>{initials(review.client_name)}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewClientName}>{review.client_name}</Text>
          <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
        </View>
        <StarRow rating={review.rating} size={14} />
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );
}

export default function WorkerReviews() {
  const { t } = useLang();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('workerReviewsTitle')}</Text>
      </View>

      <FlatList
        data={MOCK_REVIEWS}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Summary card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <Text style={styles.avgRating}>{AVG_RATING.toFixed(1)}</Text>
                <StarRow rating={Math.round(AVG_RATING)} size={20} />
                <Text style={styles.reviewCountText}>
                  {TOTAL_REVIEWS} {t('reviewCount')}
                </Text>
              </View>
              <View style={styles.summaryRight}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = RATING_BREAKDOWN[star] ?? 0;
                  const pct = TOTAL_REVIEWS > 0 ? (count / TOTAL_REVIEWS) * 100 : 0;
                  return (
                    <View key={star} style={styles.breakdownRow}>
                      <Text style={styles.breakdownStar}>{star}</Text>
                      <Ionicons name="star" size={11} color={colors.warning} />
                      <View style={styles.breakdownBarBg}>
                        <View style={[styles.breakdownBarFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.breakdownCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.listTitle}>{t('workerReviewsTitle')}</Text>
          </>
        }
        renderItem={({ item }) => <ReviewCard review={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>{t('noReviews')}</Text>
            <Text style={styles.emptySub}>{t('noReviewsSub')}</Text>
          </View>
        }
      />
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
  content: { padding: spacing.md, gap: spacing.sm },

  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 80 },
  avgRating: { fontSize: 48, fontWeight: '900', color: colors.text, lineHeight: 52 },
  starRow: { flexDirection: 'row', gap: 2 },
  reviewCountText: { fontSize: 12, color: colors.textMuted },

  summaryRight: { flex: 1, justifyContent: 'center', gap: 6 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  breakdownStar: { fontSize: 12, fontWeight: '700', color: colors.text, width: 10 },
  breakdownBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: 6,
    backgroundColor: colors.warning,
    borderRadius: radius.full,
  },
  breakdownCount: { fontSize: 12, color: colors.textMuted, width: 14, textAlign: 'right' },

  listTitle: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  reviewMeta: { flex: 1 },
  reviewClientName: { fontSize: 14, fontWeight: '700', color: colors.text },
  reviewDate: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  reviewComment: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
