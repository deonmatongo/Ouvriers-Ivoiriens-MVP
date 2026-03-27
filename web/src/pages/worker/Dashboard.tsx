import { Briefcase, Star, DollarSign, TrendingUp, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCardSkeleton, JobRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useMyProfile, useUpdateAvailability } from '../../hooks/useArtisanProfile';
import { useJobs } from '../../hooks/useJobs';
import { formatDate, formatCurrency } from '../../lib/utils';

export function WorkerDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const toast = useToast();

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs({ limit: 5 });
  const updateAvailability = useUpdateAvailability();

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

  // Compute profile completeness
  const fields = ['category', 'bio', 'hourly_rate', 'experience_years', 'skills'] as const;
  const filled = profile ? fields.filter((f) => {
    const v = profile[f];
    return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length : 0;
  const completeness = profile ? Math.round((filled / fields.length) * 100) : 0;

  return (
    <WorkerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('greeting')}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('workerDashSub')}</p>
        </div>
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
