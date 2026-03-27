import { Briefcase, Star, DollarSign, TrendingUp, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency } from '../../lib/utils';

const stats = [
  { label: 'Travaux en cours', value: '2', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Note moyenne', value: '4.8', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Revenus ce mois', value: formatCurrency(185000), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Total travaux', value: '34', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const recentJobs = [
  { id: '1', title: 'Réparation fuite d\'eau', client: 'Marie Ouédraogo', status: 'in_progress', date: '2025-03-20', amount: 50000 },
  { id: '2', title: 'Installation prise', client: 'Jean Bamba', status: 'quoted', date: '2025-03-19', amount: 30000 },
  { id: '3', title: 'Peinture salon', client: 'Aïcha Koné', status: 'completed', date: '2025-03-10', amount: 80000 },
];

const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  quoted:      { label: 'Devis envoyé', variant: 'warning' },
  accepted:    { label: 'Accepté', variant: 'info' },
  in_progress: { label: 'En cours', variant: 'info' },
  completed:   { label: 'Terminé', variant: 'success' },
};

export function WorkerDashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState(true);

  return (
    <WorkerLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Bienvenue sur votre espace artisan</p>
        </div>
        <button
          onClick={() => setAvailable((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            available
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-gray-200 bg-gray-100 text-gray-600'
          }`}
        >
          {available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {available ? 'Disponible' : 'Indisponible'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardBody className="flex flex-col gap-3">
              <div className={`p-2.5 rounded-xl ${bg} w-fit`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Profile completeness */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">Complétude du profil</p>
            <span className="text-sm font-bold text-primary-600">72%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: '72%' }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ajoutez votre bio et vos certifications pour apparaître en tête des résultats
          </p>
        </CardBody>
      </Card>

      {/* Recent jobs */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Travaux récents</h2>
          <Link to="/dashboard/worker/services" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentJobs.map((job) => {
            const s = statusMap[job.status];
            return (
              <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{job.client} · {formatDate(job.date)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {formatCurrency(job.amount)}
                  </span>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </WorkerLayout>
  );
}
