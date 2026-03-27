import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Briefcase } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { JobRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLang } from '../../context/LangContext';
import { useJobs } from '../../hooks/useJobs';
import { formatDate, formatCurrency } from '../../lib/utils';
import type { RequestStatus } from '../../types';

export function CustomerJobs() {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');

  const { data: jobs = [], isLoading, isError, refetch } = useJobs(
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

  const visible = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CustomerLayout>
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
          {isError ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-red-600 mb-3">Failed to load jobs</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <JobRowSkeleton key={i} />)
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t('noJobsFound')}
              description={t('noJobsSub')}
            />
          ) : (
            visible.map((job) => {
              const s = statusMap[job.status];
              return (
                <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.category} · {formatDate(job.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {job.budget && (
                      <span className="text-sm font-medium text-gray-700 hidden sm:block">{formatCurrency(job.budget)}</span>
                    )}
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </CustomerLayout>
  );
}
