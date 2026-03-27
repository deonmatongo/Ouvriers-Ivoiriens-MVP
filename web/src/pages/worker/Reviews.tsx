import { Star, MessageCircle } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLang } from '../../context/LangContext';
import { useMyReviews } from '../../hooks/useReviews';
import { formatDate } from '../../lib/utils';

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export function WorkerReviews() {
  const { t } = useLang();
  const { data: reviews = [], isLoading } = useMyReviews();

  const avg = reviews.length > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;

  return (
    <WorkerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('workerReviewsTitle')}</h1>

      {/* Summary */}
      {isLoading ? (
        <Card className="mb-6">
          <CardBody className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <div className="flex-1 space-y-3">
              {[5, 4, 3, 2, 1].map((s) => <Skeleton key={s} className="h-2 w-full rounded-full" />)}
            </div>
          </CardBody>
        </Card>
      ) : reviews.length > 0 ? (
        <Card className="mb-6">
          <CardBody className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</p>
              <Stars value={Math.round(avg)} />
              <p className="text-xs text-gray-500 mt-1">{reviews.length} {t('reviewCount')}</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-4 text-right">{star}</span>
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full ml-12" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <EmptyState
            icon={MessageCircle}
            title={t('workerReviewsTitle')}
            description="Reviews from completed jobs will appear here"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                      {r.client?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.client?.name ?? '—'}</p>
                      <p className="text-xs text-gray-500">{r.request?.title ?? '—'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Stars value={r.rating} />
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-2 pl-12">{r.comment}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
}
