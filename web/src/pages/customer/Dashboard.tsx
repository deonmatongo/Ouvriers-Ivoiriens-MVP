import { Briefcase, Clock, CheckCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { formatDate, formatCurrency } from '../../lib/utils';

const recentJobs = [
  { id: '1', title: 'Réparation fuite d\'eau', titleEn: 'Water leak repair', category: 'Plomberie', status: 'in_progress', createdAt: '2025-03-20', budget: 50000 },
  { id: '2', title: 'Installation prise électrique', titleEn: 'Electrical socket installation', category: 'Électricité', status: 'quoted', createdAt: '2025-03-18', budget: 30000 },
  { id: '3', title: 'Peinture salon', titleEn: 'Living room painting', category: 'Peinture', status: 'requested', createdAt: '2025-03-15', budget: 80000 },
];

export function CustomerDashboard() {
  const { user } = useAuth();
  const { t, locale } = useLang();

  const stats = [
    { label: t('statActiveJobs'),    value: '3', icon: Briefcase, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: t('statPendingQuotes'), value: '2', icon: Clock,     color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: t('statCompleted'),     value: '8', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
    requested:   { label: t('statusRequested'),   variant: 'default' },
    quoted:      { label: t('statusQuoted'),      variant: 'warning' },
    accepted:    { label: t('statusAccepted'),    variant: 'info' },
    in_progress: { label: t('statusInProgress'), variant: 'info' },
    completed:   { label: t('statusCompleted'),  variant: 'success' },
  };

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
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

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('recentJobs')}</h2>
          <Link to="/dashboard/customer/jobs" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentJobs.map((job) => {
            const s = statusMap[job.status];
            return (
              <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {locale === 'en' ? job.titleEn : job.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{job.category} · {formatDate(job.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{formatCurrency(job.budget)}</span>
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
