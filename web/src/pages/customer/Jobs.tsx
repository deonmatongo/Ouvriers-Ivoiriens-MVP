import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Briefcase, ChevronDown, ChevronUp, CheckCircle, X, Star } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { JobRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';
import { useToast } from '../../components/ui/Toast';
import { useJobs } from '../../hooks/useJobs';
import { formatDate, formatCurrency } from '../../lib/utils';
import type { RequestStatus } from '../../types';

interface MockQuote {
  id: string;
  artisan_id: string;
  artisan_name: string;
  price: number;
  message: string;
  rating: number;
}

interface MockJobEntry {
  id: string;
  title: string;
  category: string;
  status: RequestStatus;
  created_at: string;
  budget?: number;
  quotes: MockQuote[];
}

const MOCK_JOBS: MockJobEntry[] = [
  {
    id: 'mj1', title: "Réparation fuite d'eau sous évier", category: 'Plomberie',
    status: 'quoted', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), budget: 50000,
    quotes: [
      { id: 'q1', artisan_id: 'a2', artisan_name: 'Fatou Plomberie', price: 45000, message: "Je peux intervenir demain matin. Matériaux inclus.", rating: 4.6 },
      { id: 'q2', artisan_id: 'a5', artisan_name: 'Kouassi Maçonnerie', price: 38000, message: "Disponible aujourd'hui après 14h. Tarif tout compris.", rating: 4.7 },
    ],
  },
  {
    id: 'mj2', title: 'Installation tableau électrique', category: 'Électricité',
    status: 'requested', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), budget: 120000,
    quotes: [],
  },
  {
    id: 'mj3', title: 'Peinture salon + 2 chambres', category: 'Peinture',
    status: 'in_progress', created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    quotes: [],
  },
  {
    id: 'mj4', title: 'Fabrication meuble TV sur mesure', category: 'Menuiserie',
    status: 'completed', created_at: new Date(Date.now() - 14 * 86400000).toISOString(), budget: 180000,
    quotes: [],
  },
];

const AGREEMENT_COST = 5;

function AgreementModal({
  quote, jobTitle, onConfirm, onClose, locale,
}: {
  quote: MockQuote; jobTitle: string; onConfirm: () => void; onClose: () => void; locale: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            {locale === 'fr' ? 'Confirmer l\'accord' : 'Confirm Agreement'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
          <p className="text-gray-500 text-xs mb-2">{locale === 'fr' ? 'Mission' : 'Job'}</p>
          <p className="font-medium text-gray-900">{jobTitle}</p>
          <p className="text-gray-500 text-xs mt-2 mb-1">{locale === 'fr' ? 'Artisan sélectionné' : 'Selected artisan'}</p>
          <p className="font-medium text-gray-900">{quote.artisan_name}</p>
          <p className="text-primary-600 font-bold mt-1">{formatCurrency(quote.price)}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <p className="font-semibold mb-1">
            {locale === 'fr' ? '⚡ Commission plateforme' : '⚡ Platform fee'}
          </p>
          <p>
            {locale === 'fr'
              ? `En confirmant cet accord, ${AGREEMENT_COST} crédits seront automatiquement déduits du compte de ${quote.artisan_name} au titre de la commission de mise en relation.`
              : `By confirming this agreement, ${AGREEMENT_COST} credits will be automatically deducted from ${quote.artisan_name}'s account as a platform introduction fee.`
            }
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            {locale === 'fr' ? 'Confirmer l\'accord' : 'Confirm Agreement'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CustomerJobs() {
  const { t, locale } = useLang();
  const { deductForArtisan } = useTokens();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, RequestStatus>>({});
  const [acceptedQuotes, setAcceptedQuotes] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState<{ job: MockJobEntry; quote: MockQuote } | null>(null);

  // Try real API first, fall back to mock
  const { data: apiJobs = [], isLoading, isError, refetch } = useJobs(
    filter !== 'all' ? { status: filter } : undefined
  );

  const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
    requested:   { label: t('statusRequested'),  variant: 'default' },
    quoted:      { label: t('statusQuoted'),     variant: 'warning' },
    accepted:    { label: t('statusAccepted'),   variant: 'info' },
    in_progress: { label: t('statusInProgress'), variant: 'info' },
    completed:   { label: t('statusCompleted'),  variant: 'success' },
  };

  const filters = [
    { key: 'all',         label: t('filterAll') },
    { key: 'requested',   label: t('filterPublished') },
    { key: 'quoted',      label: t('filterQuoted') },
    { key: 'in_progress', label: t('filterInProgress') },
    { key: 'completed',   label: t('filterCompleted') },
  ] as const;

  // Merge mock jobs with any status overrides
  const jobs: MockJobEntry[] = MOCK_JOBS.map((j) => ({
    ...j,
    status: (jobStatuses[j.id] as RequestStatus) ?? j.status,
  }));

  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || j.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAccept = (job: MockJobEntry, quote: MockQuote) => {
    setConfirmModal({ job, quote });
  };

  const handleConfirmAgreement = () => {
    if (!confirmModal) return;
    const { job, quote } = confirmModal;
    deductForArtisan(
      quote.artisan_id,
      AGREEMENT_COST,
      locale === 'fr'
        ? `Commission accord — ${job.title}`
        : `Agreement fee — ${job.title}`,
    );
    setJobStatuses((prev) => ({ ...prev, [job.id]: 'accepted' }));
    setAcceptedQuotes((prev) => ({ ...prev, [job.id]: quote.id }));
    setExpanded(null);
    setConfirmModal(null);
    toast.success(t('agreementSuccess'));
  };

  return (
    <CustomerLayout>
      {confirmModal && (
        <AgreementModal
          quote={confirmModal.quote}
          jobTitle={confirmModal.job.title}
          locale={locale}
          onConfirm={handleConfirmAgreement}
          onClose={() => setConfirmModal(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('myJobs')}</h1>
        <Link to="/post-job"><Button><PlusCircle size={16} />{t('navNewJob')}</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="divide-y divide-gray-100">
          {isLoading && apiJobs.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <JobRowSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState icon={Briefcase} title={t('noJobsFound')} description={t('noJobsSub')} />
          ) : (
            filtered.map((job) => {
              const s = statusMap[job.status];
              const isExpanded = expanded === job.id;
              const hasQuotes = job.quotes.length > 0 && job.status === 'quoted';
              const accepted = acceptedQuotes[job.id];

              return (
                <div key={job.id}>
                  {/* Job row */}
                  <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{job.category} · {formatDate(job.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {job.budget && (
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">{formatCurrency(job.budget)}</span>
                      )}
                      <Badge variant={s.variant}>{s.label}</Badge>
                      {hasQuotes && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : job.id)}
                          className="flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-700 ml-1"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isExpanded ? t('hideQuotes') : `${t('viewQuotes')} (${job.quotes.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded quotes */}
                  {isExpanded && (
                    <div className="px-6 pb-5 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-4 mb-3">
                        {locale === 'fr' ? `${job.quotes.length} devis reçus` : `${job.quotes.length} quotes received`}
                      </p>
                      <div className="space-y-3">
                        {job.quotes.map((q) => {
                          const isAccepted = accepted === q.id;
                          return (
                            <div key={q.id} className={`bg-white rounded-xl border p-4 flex items-start justify-between gap-4 ${isAccepted ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                    {q.artisan_name[0]}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">{q.artisan_name}</span>
                                  <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                                    <Star size={11} className="fill-yellow-400" />{q.rating}
                                  </span>
                                  {isAccepted && (
                                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                      <CheckCircle size={13} />
                                      {locale === 'fr' ? 'Accord confirmé' : 'Agreed'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">"{q.message}"</p>
                                <p className="text-base font-bold text-primary-700">{formatCurrency(q.price)}</p>
                              </div>
                              {!accepted && (
                                <Button size="sm" onClick={() => handleAccept(job, q)} className="flex-shrink-0">
                                  {t('acceptQuote')}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {isError && (
            <div className="px-6 py-4 text-center">
              <Button size="sm" variant="outline" onClick={() => refetch()}>Retry API</Button>
            </div>
          )}
        </div>
      </Card>
    </CustomerLayout>
  );
}
