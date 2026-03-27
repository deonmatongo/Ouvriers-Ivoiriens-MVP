import { Briefcase, Clock, CheckCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency } from '../../lib/utils';

// Placeholder data — will be replaced with API calls
const stats = [
  { label: 'Demandes actives', value: '3', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'En attente de devis', value: '2', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Travaux terminés', value: '8', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
];

const recentJobs = [
  {
    id: '1', title: 'Réparation fuite d\'eau', category: 'Plomberie',
    status: 'in_progress', createdAt: '2025-03-20', budget: 50000,
  },
  {
    id: '2', title: 'Installation prise électrique', category: 'Électricité',
    status: 'quoted', createdAt: '2025-03-18', budget: 30000,
  },
  {
    id: '3', title: 'Peinture salon', category: 'Peinture',
    status: 'requested', createdAt: '2025-03-15', budget: 80000,
  },
];

const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  requested: { label: 'Publié', variant: 'default' },
  quoted:    { label: 'Devis reçu', variant: 'warning' },
  accepted:  { label: 'Accepté', variant: 'info' },
  in_progress: { label: 'En cours', variant: 'info' },
  completed: { label: 'Terminé', variant: 'success' },
};

export function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Voici un résumé de vos demandes</p>
        </div>
        <Link to="/post-job">
          <Button>
            <PlusCircle size={16} />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
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
          <h2 className="font-semibold text-gray-900">Demandes récentes</h2>
          <Link to="/dashboard/customer/jobs" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
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
                  <p className="text-xs text-gray-500 mt-0.5">{job.category} · {formatDate(job.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {formatCurrency(job.budget)}
                  </span>
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
