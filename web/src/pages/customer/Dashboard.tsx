import { Briefcase, Clock, CheckCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCardSkeleton, JobRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useJobs, useJobStats } from '../../hooks/useJobs';
import { formatDate, formatCurrency } from '../../lib/utils';

export function CustomerDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const { active, pending, completed, isLoading: statsLoading } = useJobStats();
  const { data: jobs = [], isLoading: jobsLoading } = useJobs({ limit: 5 });

  const stats = [
    { label: t('statActiveJobs'),    value: active,    icon: Briefcase,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: t('statPendingQuotes'), value: pending,   icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: t('statCompleted'),     value: completed, icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50' },
  ];

  const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
    requested:   { label: t('statusRequested'),  variant: 'default' },
    quoted:      { label: t('statusQuoted'),     variant: 'warning' },
    accepted:    { label: t('statusAccepted'),   variant: 'info' },
    in_progress: { label: t('statusInProgress'), variant: 'info' },
    completed:   { label: t('statusCompleted'),  variant: 'success' },
  };

  const recentJobs = jobs.slice(0, 5);

  return (
    <CustomerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('greeting')}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('dashboardSub')}</p>
        </div>
        <Link to="/post-job">
          <Button><PlusCircle size={16} />{t('navNewJob')}</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardBody className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${bg}`}><Icon size={20} className={color} /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
      </div>

      {/* Recent jobs */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('recentJobs')}</h2>
          <Link to="/dashboard/customer/jobs" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {jobsLoading
            ? Array.from({ length: 3 }).map((_, i) => <JobRowSkeleton key={i} />)
            : recentJobs.length === 0
            ? (
                <EmptyState
                  icon={Briefcase}
                  title={t('noJobsFound')}
                  description={t('noJobsSub')}
                  action={{ label: t('navNewJob'), onClick: () => {} }}
                />
              )
            : recentJobs.map((job) => {
                const s = statusMap[job.status];
                return (
                  <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{job.category} · {formatDate(job.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {job.budget && (
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">
                          {formatCurrency(job.budget)}
                        </span>
                      )}
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                  </div>
                );
              })}
        </div>
      </Card>
    </CustomerLayout>
  );
}
