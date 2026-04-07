import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, Briefcase, ChevronDown, ChevronUp, CheckCircle, X, Star, Play, Flag, Clock, MessageSquare } from 'lucide-react';
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
import { useCreateReview } from '../../hooks/useReviews';
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
  artisan_id?: string;
  artisan_name?: string;
  quotes: MockQuote[];
}

const INITIAL_MOCK_JOBS: MockJobEntry[] = [
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
    status: 'in_progress', artisan_id: 'a4', artisan_name: 'Adjoua Peinture',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    quotes: [],
  },
  {
    id: 'mj4', title: 'Fabrication meuble TV sur mesure', category: 'Menuiserie',
    status: 'completed', artisan_id: 'a3', artisan_name: 'Ibrahim Menuiserie',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(), budget: 180000,
    quotes: [],
  },
];

const AGREEMENT_COST = 5;
const STEPS: RequestStatus[] = ['requested', 'quoted', 'accepted', 'in_progress', 'completed'];
const STEP_LABELS_FR = ['Publié', 'Devis', 'Accepté', 'En cours', 'Terminé'];
const STEP_LABELS_EN = ['Posted', 'Quoted', 'Accepted', 'In Progress', 'Done'];

// ── Star rating input ──────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={36}
            className={`transition-colors ${n <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Review modal ──────────────────────────────────────────────────────────
function ReviewModal({
  job, onClose, onSubmit, locale,
}: {
  job: MockJobEntry; onClose: () => void; onSubmit: (rating: number, comment: string) => void; locale: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels: Record<number, string> = {
    1: locale === 'fr' ? 'Très décevant' : 'Very disappointing',
    2: locale === 'fr' ? 'Décevant' : 'Disappointing',
    3: locale === 'fr' ? 'Correct' : 'OK',
    4: locale === 'fr' ? 'Bon travail' : 'Good work',
    5: locale === 'fr' ? 'Excellent !' : 'Excellent!',
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onSubmit(rating, comment);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {locale === 'fr' ? 'Votre avis' : 'Leave a review'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{job.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Artisan info */}
        {job.artisan_name && (
          <div className="flex items-center gap-3 mb-5 bg-gray-50 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
              {job.artisan_name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{job.artisan_name}</p>
              <p className="text-xs text-gray-500">{job.category}</p>
            </div>
          </div>
        )}

        {/* Stars */}
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {locale === 'fr' ? 'Notez la prestation' : 'Rate the work'}
          </p>
          <StarInput value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="text-sm font-semibold text-yellow-600 mt-2">{ratingLabels[rating]}</p>
          )}
        </div>

        {/* Comment */}
        <div className="mt-4 mb-5">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            {locale === 'fr' ? 'Commentaire (optionnel)' : 'Comment (optional)'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={locale === 'fr' ? 'Décrivez votre expérience...' : 'Describe your experience...'}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            loading={submitting}
            className="flex-1"
          >
            {locale === 'fr' ? "Publier l'avis" : 'Submit review'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Agreement modal ───────────────────────────────────────────────────────
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
            {locale === 'fr' ? "Confirmer l'accord" : 'Confirm Agreement'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
          <p className="text-gray-500 text-xs mb-1">{locale === 'fr' ? 'Mission' : 'Job'}</p>
          <p className="font-medium text-gray-900">{jobTitle}</p>
          <p className="text-gray-500 text-xs mt-2 mb-1">{locale === 'fr' ? 'Artisan sélectionné' : 'Selected artisan'}</p>
          <p className="font-medium text-gray-900">{quote.artisan_name}</p>
          <p className="text-primary-600 font-bold mt-1">{formatCurrency(quote.price)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <p className="font-semibold mb-1">{locale === 'fr' ? '⚡ Commission plateforme' : '⚡ Platform fee'}</p>
          <p>
            {locale === 'fr'
              ? `En confirmant cet accord, ${AGREEMENT_COST} crédits seront déduits du compte de ${quote.artisan_name}.`
              : `By confirming, ${AGREEMENT_COST} credits will be deducted from ${quote.artisan_name}'s account.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">{locale === 'fr' ? 'Annuler' : 'Cancel'}</Button>
          <Button onClick={onConfirm} className="flex-1">{locale === 'fr' ? "Confirmer l'accord" : 'Confirm Agreement'}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Job progress stepper ──────────────────────────────────────────────────
function JobStepper({ status, locale }: { status: RequestStatus; locale: string }) {
  const currentIdx = STEPS.indexOf(status);
  const labels = locale === 'fr' ? STEP_LABELS_FR : STEP_LABELS_EN;
  return (
    <div className="flex items-center w-full my-3 px-1">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? 'bg-primary-600 text-white' : active ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[9px] font-medium leading-none whitespace-nowrap ${
                done || active ? 'text-primary-600' : 'text-gray-300'
              }`}>
                {labels[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-3.5 rounded ${done ? 'bg-primary-600' : 'bg-gray-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CustomerJobs() {
  const { t, locale } = useLang();
  const { deductForArtisan } = useTokens();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | RequestStatus>(() => {
    const param = searchParams.get('status');
    const valid: Array<'all' | RequestStatus> = ['all', 'requested', 'quoted', 'accepted', 'in_progress', 'completed'];
    // map 'active' (dashboard shorthand) → 'in_progress'
    if (param === 'active') return 'in_progress';
    return valid.includes(param as 'all' | RequestStatus) ? (param as 'all' | RequestStatus) : 'all';
  });

  useEffect(() => {
    const param = searchParams.get('status');
    const valid: Array<'all' | RequestStatus> = ['all', 'requested', 'quoted', 'accepted', 'in_progress', 'completed'];
    if (param === 'active') { setFilter('in_progress'); return; }
    if (valid.includes(param as 'all' | RequestStatus)) setFilter(param as 'all' | RequestStatus);
  }, [searchParams]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [jobs, setJobs] = useState<MockJobEntry[]>(INITIAL_MOCK_JOBS);
  const [acceptedQuotes, setAcceptedQuotes] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState<{ job: MockJobEntry; quote: MockQuote } | null>(null);
  const [reviewModal, setReviewModal] = useState<MockJobEntry | null>(null);
  const [reviewedJobs, setReviewedJobs] = useState<Set<string>>(
    () => new Set(INITIAL_MOCK_JOBS.filter(j => !!localStorage.getItem(`reviewed_${j.id}`)).map(j => j.id))
  );
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const createReview = useCreateReview();

  // Try real API jobs too
  const { data: _apiJobs = [], isLoading } = useJobs(filter !== 'all' ? { status: filter } : undefined);

  const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
    requested:   { label: t('statusRequested'),  variant: 'default' },
    quoted:      { label: t('statusQuoted'),     variant: 'warning' },
    accepted:    { label: t('statusAccepted'),   variant: 'info' },
    in_progress: { label: t('statusInProgress'), variant: 'info' },
    completed:   { label: t('statusCompleted'),  variant: 'success' },
  };

  const filters = [
    { key: 'all', label: locale === 'fr' ? 'Tous' : 'All' },
    { key: 'requested', label: locale === 'fr' ? 'Publiés' : 'Posted' },
    { key: 'quoted', label: locale === 'fr' ? 'Devis reçus' : 'Quoted' },
    { key: 'in_progress', label: locale === 'fr' ? 'En cours' : 'In progress' },
    { key: 'completed', label: locale === 'fr' ? 'Terminés' : 'Completed' },
  ] as const;

  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || j.status === filter;
    return matchSearch && matchFilter;
  });

  const updateStatus = (jobId: string, status: RequestStatus) => {
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status } : j));
  };

  const handleAcceptQuote = (job: MockJobEntry, quote: MockQuote) => {
    setConfirmModal({ job, quote });
  };

  const handleConfirmAgreement = () => {
    if (!confirmModal) return;
    const { job, quote } = confirmModal;
    deductForArtisan(quote.artisan_id, AGREEMENT_COST, locale === 'fr' ? `Commission accord — ${job.title}` : `Agreement fee — ${job.title}`);
    updateStatus(job.id, 'accepted');
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, artisan_id: quote.artisan_id, artisan_name: quote.artisan_name } : j));
    setAcceptedQuotes((prev) => ({ ...prev, [job.id]: quote.id }));
    setExpanded(null);
    setConfirmModal(null);
    toast.success(locale === 'fr' ? `Accord confirmé avec ${quote.artisan_name} !` : `Agreement confirmed with ${quote.artisan_name}!`);
  };

  const handleMarkInProgress = async (job: MockJobEntry) => {
    setUpdatingStatus(job.id);
    await new Promise((r) => setTimeout(r, 500));
    updateStatus(job.id, 'in_progress');
    setUpdatingStatus(null);
    toast.success(locale === 'fr' ? 'Travaux démarrés !' : 'Work started!');
  };

  const handleMarkComplete = async (job: MockJobEntry) => {
    setUpdatingStatus(job.id);
    await new Promise((r) => setTimeout(r, 600));
    updateStatus(job.id, 'completed');
    setUpdatingStatus(null);
    toast.success(locale === 'fr' ? 'Travaux marqués comme terminés !' : 'Work marked as complete!');
    // Auto-open review modal
    setTimeout(() => {
      setReviewModal({ ...job, status: 'completed' });
    }, 400);
  };

  const handleSubmitReview = async (job: MockJobEntry, rating: number, comment: string) => {
    try {
      await createReview.mutateAsync({
        client_id: 'mock-client-1',
        artisan_id: job.artisan_id ?? 'mock-artisan-1',
        request_id: job.id,
        rating,
        comment,
      });
      localStorage.setItem(`reviewed_${job.id}`, '1');
      setReviewedJobs((prev) => new Set([...prev, job.id]));
      setReviewModal(null);
      toast.success(locale === 'fr' ? 'Merci pour votre avis !' : 'Thank you for your review!');
    } catch {
      toast.error(locale === 'fr' ? "Erreur lors de l'envoi" : 'Failed to submit review');
    }
  };

  const pendingReviews = jobs.filter(j => j.status === 'completed' && !reviewedJobs.has(j.id)).length;

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
      {reviewModal && (
        <ReviewModal
          job={reviewModal}
          locale={locale}
          onClose={() => setReviewModal(null)}
          onSubmit={(rating, comment) => handleSubmitReview(reviewModal, rating, comment)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('myJobs')}</h1>
          {pendingReviews > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-0.5 flex items-center gap-1.5">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {locale === 'fr'
                ? `${pendingReviews} travail${pendingReviews > 1 ? 'x' : ''} en attente d'un avis`
                : `${pendingReviews} job${pendingReviews > 1 ? 's' : ''} awaiting review`}
            </p>
          )}
        </div>
        <Link to="/post-job"><Button><PlusCircle size={16} />{t('navNewJob')}</Button></Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
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
              {key !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({jobs.filter(j => j.status === key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Job cards */}
      {isLoading && jobs.length === 0 ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="mb-3"><div className="p-4"><JobRowSkeleton /></div></Card>
        ))
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Briefcase} title={t('noJobsFound')} description={t('noJobsSub')} />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const s = statusMap[job.status];
            const isExpanded = expanded === job.id;
            const accepted = acceptedQuotes[job.id];
            const isUpdating = updatingStatus === job.id;
            const hasReview = reviewedJobs.has(job.id);

            return (
              <Card key={job.id} className={`overflow-hidden transition-shadow hover:shadow-md ${
                job.status === 'completed' && !hasReview ? 'ring-2 ring-amber-300 ring-offset-1' : ''
              }`}>
                <div className="p-5">
                  {/* Job header */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant={s.variant}>{s.label}</Badge>
                        {job.status === 'completed' && !hasReview && (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            {locale === 'fr' ? 'Avis attendu' : 'Review needed'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {job.category}
                        {job.artisan_name && ` · ${job.artisan_name}`}
                        {job.budget && ` · ${formatCurrency(job.budget)}`}
                        {' · '}{formatDate(job.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Progress stepper */}
                  <JobStepper status={job.status} locale={locale} />

                  {/* Status-specific action area */}
                  <div className="mt-2">

                    {/* REQUESTED: waiting */}
                    {job.status === 'requested' && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2.5">
                        <Clock size={14} className="text-gray-400 flex-shrink-0" />
                        <span>{locale === 'fr' ? 'En attente de devis des artisans...' : 'Waiting for artisan quotes...'}</span>
                      </div>
                    )}

                    {/* QUOTED: quote comparison */}
                    {job.status === 'quoted' && !accepted && (
                      <div>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : job.id)}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 font-medium hover:bg-amber-100 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Star size={14} className="text-amber-500" />
                            {locale === 'fr' ? `${job.quotes.length} devis reçus — Choisir un artisan` : `${job.quotes.length} quotes received — Choose an artisan`}
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {job.quotes.map((q) => (
                              <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                                      {q.artisan_name[0]}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{q.artisan_name}</span>
                                    <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                                      <Star size={11} className="fill-yellow-400" />{q.rating}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 italic">"{q.message}"</p>
                                  <p className="text-base font-bold text-primary-700 mt-1">{formatCurrency(q.price)}</p>
                                </div>
                                <Button size="sm" onClick={() => handleAcceptQuote(job, q)} className="flex-shrink-0">
                                  {locale === 'fr' ? 'Choisir' : 'Select'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACCEPTED: confirm start */}
                    {job.status === 'accepted' && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700">
                          <span className="font-medium">{locale === 'fr' ? 'Accord confirmé' : 'Agreement confirmed'}</span>
                          {job.artisan_name && (
                            <span className="text-blue-600"> · {job.artisan_name}</span>
                          )}
                          <span className="ml-1 text-xs text-blue-500">
                            {locale === 'fr' ? '— En attente du démarrage' : '— Waiting to start'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          loading={isUpdating}
                          onClick={() => handleMarkInProgress(job)}
                          className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                        >
                          <Play size={13} />
                          {locale === 'fr' ? 'Démarrer les travaux' : 'Start work'}
                        </Button>
                      </div>
                    )}

                    {/* IN PROGRESS: mark complete */}
                    {job.status === 'in_progress' && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                          <span>{locale === 'fr' ? 'Travaux en cours' : 'Work in progress'}</span>
                          {job.artisan_name && <span className="text-blue-600 font-medium">· {job.artisan_name}</span>}
                        </div>
                        <Button
                          size="sm"
                          loading={isUpdating}
                          onClick={() => handleMarkComplete(job)}
                          className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 bg-green-600 hover:bg-green-700"
                        >
                          <Flag size={13} />
                          {locale === 'fr' ? 'Marquer comme terminé' : 'Mark as complete'}
                        </Button>
                      </div>
                    )}

                    {/* COMPLETED */}
                    {job.status === 'completed' && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          <span className="font-medium">{locale === 'fr' ? 'Travaux terminés' : 'Work completed'}</span>
                          {job.artisan_name && <span className="text-green-600">· {job.artisan_name}</span>}
                        </div>
                        {hasReview ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs font-medium text-yellow-700 flex-shrink-0">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            {locale === 'fr' ? 'Avis publié' : 'Review submitted'}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setReviewModal(job)}
                            className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 bg-amber-500 hover:bg-amber-600"
                          >
                            <Star size={13} className="fill-white" />
                            {locale === 'fr' ? 'Laisser un avis' : 'Leave a review'}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Message artisan shortcut for active jobs */}
                    {['accepted', 'in_progress'].includes(job.status) && job.artisan_id && (
                      <button
                        onClick={() => navigate('/messages', { state: { pendingContact: { id: job.artisan_id, name: job.artisan_name }, convStatus: 'active' } })}
                        className="mt-2 flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <MessageSquare size={12} />
                        {locale === 'fr' ? `Contacter ${job.artisan_name}` : `Message ${job.artisan_name}`}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </CustomerLayout>
  );
}
