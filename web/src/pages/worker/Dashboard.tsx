import { useState } from 'react';
import { Briefcase, Star, DollarSign, TrendingUp, ToggleLeft, ToggleRight, MessageSquare, CheckCircle, XCircle, MapPin, Coins, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCardSkeleton, JobRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useTokens } from '../../context/TokenContext';
import { useMyProfile, useUpdateAvailability } from '../../hooks/useArtisanProfile';
import { useJobs } from '../../hooks/useJobs';
import { formatDate, formatCurrency } from '../../lib/utils';

const ACCEPT_COST = 5;

interface IncomingRequest {
  id: string;
  clientName: string;
  clientId: string;
  jobTitle: string;
  category: string;
  location: string;
  budget?: number;
  message: string;
  received_at: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface MockMessage {
  id: string;
  clientName: string;
  clientId: string;
  lastMsg: string;
  time: string;
  unread: number;
}

const MOCK_REQUESTS: IncomingRequest[] = [
  {
    id: 'r1', clientId: 'c1', clientName: 'Marie Konan',
    jobTitle: 'Réparation tableau électrique', category: 'Électricité',
    location: 'Cocody, Abidjan', budget: 35000,
    message: 'Bonjour, mon tableau disjoncte souvent. Pouvez-vous passer cette semaine ?',
    received_at: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'pending',
  },
  {
    id: 'r2', clientId: 'c2', clientName: 'Yao Thierry',
    jobTitle: 'Installation prise extérieure', category: 'Électricité',
    location: 'Plateau, Abidjan', budget: 15000,
    message: 'J\'ai besoin d\'une prise étanche pour ma terrasse, urgent si possible.',
    received_at: new Date(Date.now() - 5 * 3600000).toISOString(), status: 'pending',
  },
  {
    id: 'r3', clientId: 'c3', clientName: 'Adjoua Bamba',
    jobTitle: 'Mise aux normes installation', category: 'Électricité',
    location: 'Marcory, Abidjan',
    message: 'Appartement à mettre aux normes avant location, devis souhaité.',
    received_at: new Date(Date.now() - 24 * 3600000).toISOString(), status: 'pending',
  },
];

const MOCK_MESSAGES: MockMessage[] = [
  { id: 'm1', clientId: 'c4', clientName: 'Koffi Brice', lastMsg: 'Merci, à demain 9h alors.', time: '10:32', unread: 0 },
  { id: 'm2', clientId: 'c5', clientName: 'Fatou Diallo', lastMsg: 'Quel est votre tarif pour le dépannage ?', time: '09:14', unread: 2 },
  { id: 'm3', clientId: 'c6', clientName: 'Ibrahim Sanogo', lastMsg: 'Travail terminé, merci beaucoup !', time: 'Hier', unread: 0 },
];

export function WorkerDashboard() {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const toast = useToast();
  const navigate = useNavigate();
  const { balance } = useTokens();

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs({ limit: 5 });
  const updateAvailability = useUpdateAvailability();

  const [requests, setRequests] = useState<IncomingRequest[]>(MOCK_REQUESTS);

  const handleToggleAvailability = async () => {
    const next = !(profile?.is_available ?? true);
    try {
      await updateAvailability.mutateAsync(next);
      toast.success(next ? t('available') : t('unavailable'));
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const isAvailable = profile?.is_available ?? true;
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  // Accept navigates to messages with showAgreement=true — credits deducted only when artisan
  // formally accepts inside the chat (prevents informal chat agreements without credit deduction)
  const handleAccept = (req: IncomingRequest) => {
    if (balance < ACCEPT_COST) {
      toast.error(locale === 'fr'
        ? `Crédits insuffisants. Il faut ${ACCEPT_COST} crédits pour accepter une demande.`
        : `Insufficient credits. You need ${ACCEPT_COST} credits to accept a request.`
      );
      return;
    }
    setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: 'accepted' } : r));
    navigate('/dashboard/worker/messages', {
      state: {
        pendingContact: { id: req.clientId, name: req.clientName },
        jobTitle: req.jobTitle,
        showAgreement: true,
      },
    });
  };

  const handleDecline = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'declined' } : r));
    toast.info(locale === 'fr' ? 'Demande refusée' : 'Request declined');
  };

  const stats = [
    { label: t('statCurrentJobs'),   value: jobs.filter((j) => j.status === 'in_progress').length, icon: Briefcase,  color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: t('statRating'),        value: profile?.rating_avg?.toFixed(1) ?? '—',                icon: Star,       color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: t('statMonthEarnings'), value: '—',                                                    icon: DollarSign, color: 'text-green-600',  bg: 'bg-green-50' },
    { label: t('statTotalJobs'),     value: profile?.total_jobs ?? '—',                             icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
    quoted:      { label: t('statusQuoteSent'), variant: 'warning' },
    accepted:    { label: t('statusAccepted'),  variant: 'info' },
    in_progress: { label: t('statusInProgress'), variant: 'info' },
    completed:   { label: t('statusCompleted'), variant: 'success' },
  };

  const fields = ['category', 'bio', 'hourly_rate', 'experience_years', 'skills'] as const;
  const filled = profile ? fields.filter((f) => {
    const v = profile[f];
    return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length : 0;
  const completeness = profile ? Math.round((filled / fields.length) * 100) : 0;

  return (
    <WorkerLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('greeting')}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('workerDashSub')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Credit balance chip */}
          <Link
            to="/dashboard/worker/credits"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${balance > 0 ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            <Coins size={16} />
            {balance} {t('creditsUnit')}
            {balance === 0 && <AlertCircle size={14} />}
          </Link>
          <button
            onClick={handleToggleAvailability}
            disabled={updateAvailability.isPending || profileLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60 ${
              isAvailable ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-600'
            }`}
          >
            {isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {isAvailable ? t('available') : t('unavailable')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {profileLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardBody className="flex flex-col gap-3">
                  <div className={`p-2.5 rounded-xl ${bg} w-fit`}><Icon size={18} className={color} /></div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
      </div>

      {/* ── Incoming Requests ───────────────────────────────── */}
      <Card className="mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">
              {locale === 'fr' ? 'Demandes entrantes' : 'Incoming Requests'}
            </h2>
            {pendingRequests.length > 0 && (
              <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </div>
          {balance < ACCEPT_COST && (
            <Link to="/dashboard/worker/credits" className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700">
              <AlertCircle size={13} />
              {locale === 'fr' ? `Rechargez (${ACCEPT_COST} crédits requis)` : `Top up (${ACCEPT_COST} credits needed)`}
            </Link>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Briefcase size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{locale === 'fr' ? 'Aucune demande en attente' : 'No pending requests'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((req) => (
              <div key={req.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                      {req.clientName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{req.clientName}</p>
                        <Badge variant="default">{req.category}</Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">{req.jobTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 italic">"{req.message}"</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin size={11} />{req.location}</span>
                        {req.budget && <span className="font-medium text-gray-600">{formatCurrency(req.budget)}</span>}
                        <span className="flex items-center gap-1"><Clock size={11} />{formatDate(req.received_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleAccept(req)}
                      disabled={balance < ACCEPT_COST}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title={locale === 'fr' ? 'Ouvrir dans Messages pour confirmer l\'accord' : 'Open in Messages to confirm agreement'}
                    >
                      <CheckCircle size={13} />
                      {locale === 'fr' ? 'Répondre' : 'Reply'}
                      <span className="bg-primary-500 px-1.5 py-0.5 rounded text-[10px]">-{ACCEPT_COST}🪙</span>
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <XCircle size={13} />
                      {locale === 'fr' ? 'Refuser' : 'Decline'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Recent Messages ──────────────────────────────────── */}
      <Card className="mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">{t('navWorkerMessages')}</h2>
            {MOCK_MESSAGES.reduce((s, m) => s + m.unread, 0) > 0 && (
              <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {MOCK_MESSAGES.reduce((s, m) => s + m.unread, 0)}
              </span>
            )}
          </div>
          <Link to="/dashboard/worker/messages" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {MOCK_MESSAGES.map((msg) => (
            <button
              key={msg.id}
              onClick={() => navigate('/dashboard/worker/messages', { state: { pendingContact: { id: msg.clientId, name: msg.clientName } } })}
              className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0 relative">
                {msg.clientName[0]}
                {msg.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {msg.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${msg.unread > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.clientName}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{msg.time}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${msg.unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{msg.lastMsg}</p>
              </div>
              <MessageSquare size={15} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </Card>

      {/* Profile completeness */}
      {!profileLoading && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">{t('profileCompleteness')}</p>
              <span className="text-sm font-bold text-primary-600">{completeness}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${completeness}%` }} />
            </div>
            {completeness < 100 && (
              <p className="text-xs text-gray-500 mt-2">{t('profileCompletenessSub')}</p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Recent jobs */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('recentWork')}</h2>
          <Link to="/dashboard/worker/services" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {jobsLoading
            ? Array.from({ length: 3 }).map((_, i) => <JobRowSkeleton key={i} />)
            : jobs.length === 0
            ? <EmptyState icon={Briefcase} title="No jobs yet" description="Jobs assigned to you will appear here" />
            : jobs.slice(0, 5).map((job) => {
                const s = statusMap[job.status];
                return (
                  <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{job.client?.name ?? '—'} · {formatDate(job.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {job.budget && <span className="text-sm font-medium text-gray-700 hidden sm:block">{formatCurrency(job.budget)}</span>}
                      {s && <Badge variant={s.variant}>{s.label}</Badge>}
                    </div>
                  </div>
                );
              })}
        </div>
      </Card>
    </WorkerLayout>
  );
}
