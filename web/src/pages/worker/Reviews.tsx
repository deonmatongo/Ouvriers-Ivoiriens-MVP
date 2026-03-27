import { Star } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { formatDate } from '../../lib/utils';

const reviews = [
  { id: '1', client: 'Marie O.', rating: 5, comment: 'Excellent travail, très professionnel et ponctuel.', date: '2025-03-15', job: 'Réparation fuite d\'eau' },
  { id: '2', client: 'Jean B.', rating: 4, comment: 'Bon travail, quelques retards mais résultat satisfaisant.', date: '2025-03-01', job: 'Installation prise' },
  { id: '3', client: 'Aïcha K.', rating: 5, comment: 'Je recommande vivement, très soigné.', date: '2025-02-18', job: 'Peinture salon' },
];

const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export function WorkerReviews() {
  return (
    <WorkerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Avis reçus</h1>

      {/* Summary */}
      <Card className="mb-6">
        <CardBody className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            <Stars value={Math.round(avgRating)} />
            <p className="text-xs text-gray-500 mt-1">{reviews.length} avis</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = (count / reviews.length) * 100;
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

      {/* Review list */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                    {r.client[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.client}</p>
                    <p className="text-xs text-gray-500">{r.job}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <Stars value={r.rating} />
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.date)}</p>
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 mt-2 pl-12">{r.comment}</p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </WorkerLayout>
  );
}
