import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Users, Wrench, FileText, TrendingUp, TrendingDown,
  ShieldCheck, AlertTriangle, Ban, Coins,
} from 'lucide-react';

const kpis = [
  {
    label: 'Total Utilisateurs',
    labelEn: 'Total Users',
    value: '1 247',
    trend: '+8.2%',
    positive: true,
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Artisans Actifs',
    labelEn: 'Active Artisans',
    value: '342',
    trend: '+5.1%',
    positive: true,
    icon: Wrench,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    label: 'Demandes ce mois',
    labelEn: 'Requests This Month',
    value: '891',
    trend: '+12.4%',
    positive: true,
    icon: FileText,
    color: 'bg-green-100 text-green-600',
  },
  {
    label: 'Revenus Plateforme',
    labelEn: 'Platform Revenue',
    value: '2 340 000 FCFA',
    trend: '-2.3%',
    positive: false,
    icon: Coins,
    color: 'bg-purple-100 text-purple-600',
  },
];

const quickStats = [
  { label: 'Vérifications en attente', labelEn: 'Pending Verifications', value: 12, icon: ShieldCheck, color: 'text-yellow-600 bg-yellow-50' },
  { label: 'Litiges ouverts', labelEn: 'Open Disputes', value: 4, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  { label: 'Comptes suspendus', labelEn: 'Suspended Accounts', value: 7, icon: Ban, color: 'text-gray-600 bg-gray-100' },
  { label: 'Tokens émis aujourd\'hui', labelEn: 'Tokens Issued Today', value: 156, icon: Coins, color: 'text-primary-600 bg-primary-50' },
];

const activityFeed = [
  { id: 1, text: 'Konan Électricité vérifié', dot: 'bg-green-500', time: 'Il y a 5 min' },
  { id: 2, text: 'Nouveau litige: Marie vs Ibrahim', dot: 'bg-red-500', time: 'Il y a 12 min' },
  { id: 3, text: 'Yao Brice suspendu', dot: 'bg-orange-500', time: 'Il y a 27 min' },
  { id: 4, text: 'Paiement reçu 5 000 FCFA', dot: 'bg-blue-500', time: 'Il y a 34 min' },
  { id: 5, text: 'Nouveau utilisateur: Adjoua Cissé', dot: 'bg-green-400', time: 'Il y a 45 min' },
  { id: 6, text: 'Plombier Diallo approuvé', dot: 'bg-green-500', time: 'Il y a 1h 02' },
  { id: 7, text: 'Demande #447 clôturée', dot: 'bg-gray-400', time: 'Il y a 1h 18' },
  { id: 8, text: 'Remboursement 2 500 FCFA traité', dot: 'bg-purple-500', time: 'Il y a 2h' },
];

const recentRegistrations = [
  { id: 1, name: 'Adjoua Konan', email: 'adjoua@example.com', role: 'client', location: 'Abidjan', joined: '30 mars 2026', status: 'active' },
  { id: 2, name: 'Brice Yao Kouassi', email: 'brice.yao@example.com', role: 'artisan', location: 'Bouaké', joined: '29 mars 2026', status: 'pending' },
  { id: 3, name: 'Marie-Claire Touré', email: 'marie.toure@example.com', role: 'client', location: 'Yamoussoukro', joined: '29 mars 2026', status: 'active' },
  { id: 4, name: 'Ibrahim Diallo', email: 'ibrahim.d@example.com', role: 'artisan', location: 'San Pedro', joined: '28 mars 2026', status: 'suspended' },
  { id: 5, name: 'Fatou Camara', email: 'fatou.c@example.com', role: 'client', location: 'Daloa', joined: '28 mars 2026', status: 'active' },
];

const statusVariant = (status: string) => {
  if (status === 'active') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'suspended') return 'danger';
  return 'default';
};

export function AdminOverview() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vue d'ensemble</h2>
          <p className="text-sm text-gray-500 mt-1">Tableau de bord administrateur — données en temps réel</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardBody className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${kpi.positive ? 'text-green-600' : 'text-red-500'}`}>
                      {kpi.positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {kpi.trend} vs mois dernier
                    </div>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
                    <Icon size={22} />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Registrations — 70% */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-800">Inscriptions récentes</h3>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Localisation</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inscrit le</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentRegistrations.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-xs">{u.name}</p>
                              <p className="text-gray-400 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === 'artisan' ? 'primary' : 'info'}>
                            {u.role === 'artisan' ? 'Artisan' : 'Client'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{u.location}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.joined}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(u.status)}>
                            {u.status === 'active' ? 'Actif' : u.status === 'pending' ? 'En attente' : 'Suspendu'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardBody className="flex flex-col items-center text-center gap-2 py-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                      <span className="text-xs text-gray-500 leading-tight">{stat.label}</span>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Activity Feed — 30% */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-800">Activité récente</h3>
              </CardHeader>
              <CardBody className="py-2">
                <ol className="relative space-y-0">
                  {activityFeed.map((item, idx) => (
                    <li key={item.id} className="flex gap-3 pb-4 relative">
                      {idx < activityFeed.length - 1 && (
                        <div className="absolute left-2 top-5 bottom-0 w-px bg-gray-100" />
                      )}
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 z-10 ${item.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-snug">{item.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
