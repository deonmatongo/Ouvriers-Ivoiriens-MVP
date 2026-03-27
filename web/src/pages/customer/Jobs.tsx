import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLang } from '../../context/LangContext';
import { formatDate, formatCurrency } from '../../lib/utils';

const allJobs = [
  { id: '1', title: 'Réparation fuite d\'eau', titleEn: 'Water leak repair', category: 'Plomberie', status: 'in_progress', createdAt: '2025-03-20', budget: 50000 },
  { id: '2', title: 'Installation prise électrique', titleEn: 'Electrical socket installation', category: 'Électricité', status: 'quoted', createdAt: '2025-03-18', budget: 30000 },
  { id: '3', title: 'Peinture salon', titleEn: 'Living room painting', category: 'Peinture', status: 'requested', createdAt: '2025-03-15', budget: 80000 },
  { id: '4', title: 'Pose carrelage cuisine', titleEn: 'Kitchen tiling', category: 'Maçonnerie', status: 'completed', createdAt: '2025-02-28', budget: 120000 },
  { id: '5', title: 'Réparation climatiseur', titleEn: 'AC repair', category: 'Électricité', status: 'completed', createdAt: '2025-02-10', budget: 25000 },
];

export function CustomerJobs() {
  const { t, locale } = useLang();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
    requested:   { label: t('statusRequested'),  variant: 'default' },
    quoted:      { label: t('statusQuoted'),     variant: 'warning' },
    accepted:    { label: t('statusAccepted'),   variant: 'info' },
    in_progress: { label: t('statusInProgress'), variant: 'info' },
    completed:   { label: t('statusCompleted'),  variant: 'success' },
  };

  const filters = [
    { key: 'all', label: t('filterAll') },
    { key: 'requested', label: t('filterPublished') },
    { key: 'quoted', label: t('filterQuoted') },
    { key: 'in_progress', label: t('filterInProgress') },
    { key: 'completed', label: t('filterCompleted') },
  ];

  const filtered = allJobs.filter((j) => {
    const title = locale === 'en' ? j.titleEn : j.title;
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || j.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <CustomerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('myJobs')}</h1>
        <Link to="/post-job">
          <Button><PlusCircle size={16} />{t('navNewJob')}</Button>
        </Link>
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
              onClick={() => setFilter(key)}
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
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="font-medium">{t('noJobsFound')}</p>
              <p className="text-sm mt-1">{t('noJobsSub')}</p>
            </div>
          ) : (
            filtered.map((job) => {
              const s = statusMap[job.status];
              return (
                <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{locale === 'en' ? job.titleEn : job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.category} · {formatDate(job.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{formatCurrency(job.budget)}</span>
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
