import { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Search, Phone, PhoneOff, ChevronLeft, ChevronRight } from 'lucide-react';

type Role = 'client' | 'artisan';
type Status = 'active' | 'suspended' | 'pending';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  location: string;
  joined_at: string;
  status: Status;
  phone_verified: boolean;
  jobs_count: number;
}

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Adjoua Konan', email: 'adjoua@example.com', role: 'client', location: 'Abidjan', joined_at: '12 jan 2026', status: 'active', phone_verified: true, jobs_count: 5 },
  { id: 2, name: 'Brice Yao Kouassi', email: 'brice.yao@example.com', role: 'artisan', location: 'Bouaké', joined_at: '15 jan 2026', status: 'pending', phone_verified: false, jobs_count: 0 },
  { id: 3, name: 'Marie-Claire Touré', email: 'marie.toure@example.com', role: 'client', location: 'Yamoussoukro', joined_at: '18 jan 2026', status: 'active', phone_verified: true, jobs_count: 3 },
  { id: 4, name: 'Ibrahim Diallo', email: 'ibrahim.d@example.com', role: 'artisan', location: 'San Pedro', joined_at: '20 jan 2026', status: 'suspended', phone_verified: true, jobs_count: 12 },
  { id: 5, name: 'Fatou Camara', email: 'fatou.c@example.com', role: 'client', location: 'Daloa', joined_at: '22 jan 2026', status: 'active', phone_verified: false, jobs_count: 1 },
  { id: 6, name: 'Konan N\'Guessan', email: 'konan.ng@example.com', role: 'artisan', location: 'Abidjan', joined_at: '25 jan 2026', status: 'active', phone_verified: true, jobs_count: 28 },
  { id: 7, name: 'Aminata Coulibaly', email: 'aminata.c@example.com', role: 'client', location: 'Korhogo', joined_at: '01 fév 2026', status: 'active', phone_verified: true, jobs_count: 7 },
  { id: 8, name: 'Seydou Traoré', email: 'seydou.t@example.com', role: 'artisan', location: 'Bouaké', joined_at: '03 fév 2026', status: 'pending', phone_verified: false, jobs_count: 0 },
  { id: 9, name: 'Cécile Atta', email: 'cecile.a@example.com', role: 'client', location: 'Abidjan', joined_at: '05 fév 2026', status: 'suspended', phone_verified: true, jobs_count: 2 },
  { id: 10, name: 'Moussa Bakayoko', email: 'moussa.b@example.com', role: 'artisan', location: 'Man', joined_at: '08 fév 2026', status: 'active', phone_verified: true, jobs_count: 41 },
  { id: 11, name: 'Akissi Bamba', email: 'akissi.b@example.com', role: 'client', location: 'Gagnoa', joined_at: '10 fév 2026', status: 'active', phone_verified: false, jobs_count: 4 },
  { id: 12, name: 'Drissa Fofana', email: 'drissa.f@example.com', role: 'artisan', location: 'Abidjan', joined_at: '14 fév 2026', status: 'active', phone_verified: true, jobs_count: 19 },
  { id: 13, name: 'Nathalie Séka', email: 'nathalie.s@example.com', role: 'client', location: 'Divo', joined_at: '17 fév 2026', status: 'active', phone_verified: true, jobs_count: 0 },
  { id: 14, name: 'Lacina Kouyaté', email: 'lacina.k@example.com', role: 'artisan', location: 'Daloa', joined_at: '20 fév 2026', status: 'suspended', phone_verified: false, jobs_count: 6 },
  { id: 15, name: 'Ramatou Diabaté', email: 'ramatou.d@example.com', role: 'client', location: 'Abidjan', joined_at: '01 mars 2026', status: 'pending', phone_verified: false, jobs_count: 0 },
];

const PAGE_SIZE = 10;

const statusVariant = (s: Status) => {
  if (s === 'active') return 'success';
  if (s === 'pending') return 'warning';
  return 'danger';
};

const statusLabel = (s: Status) => {
  if (s === 'active') return 'Actif';
  if (s === 'pending') return 'En attente';
  return 'Suspendu';
};

export function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = (id: number, newStatus: Status) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
  };

  const handleActivate = (u: User) => {
    if (!window.confirm(`Activer le compte de ${u.name} ?`)) return;
    updateStatus(u.id, 'active');
    toast.success(`${u.name} a été activé.`);
  };

  const handleSuspend = (u: User) => {
    if (!window.confirm(`Suspendre le compte de ${u.name} ?`)) return;
    updateStatus(u.id, 'suspended');
    toast.error(`${u.name} a été suspendu.`);
  };

  const handleDelete = (u: User) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${u.name} ? Cette action est irréversible.`)) return;
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    toast.error(`Compte de ${u.name} supprimé.`);
  };

  const roleTabs: { key: 'all' | Role; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'client', label: 'Clients' },
    { key: 'artisan', label: 'Artisans' },
  ];

  const statusOptions: { key: 'all' | Status; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'active', label: 'Actif' },
    { key: 'suspended', label: 'Suspendu' },
    { key: 'pending', label: 'En attente' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h2>
          <p className="text-sm text-gray-500 mt-1">{users.length} utilisateurs au total</p>
        </div>

        {/* Filters */}
        <Card>
          <div className="px-4 py-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as 'all' | Status); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {statusOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="px-4 pb-3 flex gap-1 border-t border-gray-100 pt-3">
            {roleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setRoleFilter(tab.key); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  roleFilter === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Localisation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inscrit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jobs</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Tél.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
                {paginated.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === 'artisan' ? 'primary' : 'info'}>
                        {u.role === 'artisan' ? 'Artisan' : 'Client'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{u.location}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.joined_at}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium text-xs">{u.jobs_count}</td>
                    <td className="px-4 py-3 text-center">
                      {u.phone_verified ? (
                        <Phone size={14} className="inline text-green-500" />
                      ) : (
                        <PhoneOff size={14} className="inline text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(u.status)}>{statusLabel(u.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(u.status === 'suspended' || u.status === 'pending') && (
                          <button
                            onClick={() => handleActivate(u)}
                            className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            Activer
                          </button>
                        )}
                        {u.status === 'active' && (
                          <button
                            onClick={() => handleSuspend(u)}
                            className="px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                          >
                            Suspendre
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(u)}
                          className="px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filtered.length === 0
                ? '0 résultat'
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs text-gray-600">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
