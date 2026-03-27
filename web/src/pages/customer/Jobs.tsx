import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';

const allJobs = [
  { id: '1', title: 'Réparation fuite d\'eau', category: 'Plomberie', status: 'in_progress', createdAt: '2025-03-20', budget: 50000 },
  { id: '2', title: 'Installation prise électrique', category: 'Électricité', status: 'quoted', createdAt: '2025-03-18', budget: 30000 },
  { id: '3', title: 'Peinture salon', category: 'Peinture', status: 'requested', createdAt: '2025-03-15', budget: 80000 },
  { id: '4', title: 'Pose carrelage cuisine', category: 'Maçonnerie', status: 'completed', createdAt: '2025-02-28', budget: 120000 },
  { id: '5', title: 'Réparation climatiseur', category: 'Électricité', status: 'completed', createdAt: '2025-02-10', budget: 25000 },
];

const statusMap: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  requested:   { label: 'Publié', variant: 'default' },
  quoted:      { label: 'Devis reçu', variant: 'warning' },
  accepted:    { label: 'Accepté', variant: 'info' },
  in_progress: { label: 'En cours', variant: 'info' },
  completed:   { label: 'Terminé', variant: 'success' },
};

const filters = ['Tous', 'requested', 'quoted', 'in_progress', 'completed'];
const filterLabels: Record<string, string> = {
  Tous: 'Tous', requested: 'Publiés', quoted: 'Devis reçus',
  in_progress: 'En cours', completed: 'Terminés',
};

export function CustomerJobs() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');

  const filtered = allJobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Tous' || j.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <CustomerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
        <Link to="/post-job">
          <Button><PlusCircle size={16} /> Nouvelle demande</Button>
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="font-medium">Aucune demande trouvée</p>
              <p className="text-sm mt-1">Modifiez vos filtres ou créez une nouvelle demande</p>
            </div>
          ) : (
            filtered.map((job) => {
              const s = statusMap[job.status];
              return (
                <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
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
            })
          )}
        </div>
      </Card>
    </CustomerLayout>
  );
}
