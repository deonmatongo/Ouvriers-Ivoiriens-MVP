import { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Download, Coins, TrendingUp, RefreshCw, Banknote } from 'lucide-react';

type TxType = 'credit_purchase' | 'request_accept' | 'contact_fee' | 'refund';
type TxStatus = 'completed' | 'pending' | 'failed';
type UserRole = 'client' | 'artisan';

interface Transaction {
  id: number;
  type: TxType;
  userId: number;
  userName: string;
  userRole: UserRole;
  amount: number;
  tokens: number;
  date: string;
  status: TxStatus;
}

const TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'credit_purchase', userId: 1, userName: 'Adjoua Konan', userRole: 'client', amount: 25000, tokens: 50, date: '30 mars 2026', status: 'completed' },
  { id: 2, type: 'contact_fee', userId: 2, userName: 'Konan N\'Guessan', userRole: 'artisan', amount: 1000, tokens: 2, date: '30 mars 2026', status: 'completed' },
  { id: 3, type: 'request_accept', userId: 3, userName: 'Marie-Claire Touré', userRole: 'client', amount: 12500, tokens: 25, date: '29 mars 2026', status: 'completed' },
  { id: 4, type: 'credit_purchase', userId: 4, userName: 'Moussa Bakayoko', userRole: 'artisan', amount: 50000, tokens: 100, date: '29 mars 2026', status: 'completed' },
  { id: 5, type: 'refund', userId: 5, userName: 'Fatou Camara', userRole: 'client', amount: -5000, tokens: -10, date: '28 mars 2026', status: 'completed' },
  { id: 6, type: 'contact_fee', userId: 6, userName: 'Drissa Fofana', userRole: 'artisan', amount: 500, tokens: 1, date: '28 mars 2026', status: 'completed' },
  { id: 7, type: 'credit_purchase', userId: 7, userName: 'Aminata Coulibaly', userRole: 'client', amount: 25000, tokens: 50, date: '27 mars 2026', status: 'pending' },
  { id: 8, type: 'request_accept', userId: 8, userName: 'Lacina Kouyaté', userRole: 'artisan', amount: 6250, tokens: 12, date: '27 mars 2026', status: 'failed' },
  { id: 9, type: 'credit_purchase', userId: 9, userName: 'Cécile Atta', userRole: 'client', amount: 12500, tokens: 25, date: '26 mars 2026', status: 'completed' },
  { id: 10, type: 'contact_fee', userId: 10, userName: 'Yao Brice', userRole: 'artisan', amount: 1000, tokens: 2, date: '26 mars 2026', status: 'completed' },
  { id: 11, type: 'refund', userId: 11, userName: 'Akissi Bamba', userRole: 'client', amount: -2500, tokens: -5, date: '25 mars 2026', status: 'completed' },
  { id: 12, type: 'credit_purchase', userId: 12, userName: 'Seydou Traoré', userRole: 'artisan', amount: 50000, tokens: 100, date: '25 mars 2026', status: 'completed' },
  { id: 13, type: 'request_accept', userId: 13, userName: 'Nathalie Séka', userRole: 'client', amount: 12500, tokens: 25, date: '24 mars 2026', status: 'completed' },
  { id: 14, type: 'contact_fee', userId: 14, userName: 'Konan N\'Guessan', userRole: 'artisan', amount: 500, tokens: 1, date: '24 mars 2026', status: 'completed' },
  { id: 15, type: 'credit_purchase', userId: 15, userName: 'Ramatou Diabaté', userRole: 'client', amount: 25000, tokens: 50, date: '23 mars 2026', status: 'pending' },
  { id: 16, type: 'refund', userId: 16, userName: 'Ibrahim Diallo', userRole: 'artisan', amount: -5000, tokens: -10, date: '23 mars 2026', status: 'failed' },
  { id: 17, type: 'credit_purchase', userId: 17, userName: 'Moussa Bakayoko', userRole: 'artisan', amount: 100000, tokens: 200, date: '22 mars 2026', status: 'completed' },
  { id: 18, type: 'contact_fee', userId: 18, userName: 'Bamba Lacina', userRole: 'artisan', amount: 1000, tokens: 2, date: '22 mars 2026', status: 'completed' },
  { id: 19, type: 'request_accept', userId: 19, userName: 'Adjoua Konan', userRole: 'client', amount: 6250, tokens: 12, date: '21 mars 2026', status: 'completed' },
  { id: 20, type: 'credit_purchase', userId: 20, userName: 'Fatou Camara', userRole: 'client', amount: 12500, tokens: 25, date: '21 mars 2026', status: 'completed' },
];

const typeLabel = (t: TxType) => {
  const map: Record<TxType, string> = {
    credit_purchase: 'Achat crédits',
    request_accept: 'Acceptation demande',
    contact_fee: 'Frais contact',
    refund: 'Remboursement',
  };
  return map[t];
};

const typeVariant = (t: TxType): 'success' | 'info' | 'warning' | 'danger' => {
  const map: Record<TxType, 'success' | 'info' | 'warning' | 'danger'> = {
    credit_purchase: 'success',
    request_accept: 'info',
    contact_fee: 'warning',
    refund: 'danger',
  };
  return map[t];
};

const statusVariant = (s: TxStatus): 'success' | 'warning' | 'danger' => {
  if (s === 'completed') return 'success';
  if (s === 'pending') return 'warning';
  return 'danger';
};

const statusLabel = (s: TxStatus) => {
  if (s === 'completed') return 'Complété';
  if (s === 'pending') return 'En attente';
  return 'Échoué';
};

const fmt = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

export function AdminTransactions() {
  const toast = useToast();
  const [typeFilter, setTypeFilter] = useState<'all' | TxType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return TRANSACTIONS;
    return TRANSACTIONS.filter((t) => t.type === typeFilter);
  }, [typeFilter]);

  const totalRevenue = TRANSACTIONS.filter((t) => t.type === 'credit_purchase' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const tokensSold = TRANSACTIONS.filter((t) => t.type === 'credit_purchase' && t.status === 'completed').reduce((s, t) => s + t.tokens, 0);
  const tokensSpent = TRANSACTIONS.filter((t) => t.type === 'contact_fee' && t.status === 'completed').reduce((s, t) => s + t.tokens, 0);
  const totalRefunds = Math.abs(TRANSACTIONS.filter((t) => t.type === 'refund' && t.status === 'completed').reduce((s, t) => s + t.amount, 0));

  const totals = filtered.reduce(
    (acc, t) => ({ amount: acc.amount + t.amount, tokens: acc.tokens + t.tokens }),
    { amount: 0, tokens: 0 }
  );

  const typeTabs: { key: 'all' | TxType; label: string }[] = [
    { key: 'all', label: 'Tout' },
    { key: 'credit_purchase', label: 'Achats' },
    { key: 'contact_fee', label: 'Frais' },
    { key: 'refund', label: 'Remboursements' },
  ];

  const summaryCards = [
    { label: 'Revenus totaux', value: fmt(totalRevenue), icon: Banknote, color: 'bg-green-100 text-green-600' },
    { label: 'Tokens vendus', value: tokensSold.toString(), icon: Coins, color: 'bg-blue-100 text-blue-600' },
    { label: 'Tokens dépensés', value: tokensSpent.toString(), icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
    { label: 'Remboursements', value: fmt(totalRefunds), icon: RefreshCw, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">{TRANSACTIONS.length} transactions au total</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Export démarré — le fichier sera prêt dans quelques instants.')}
          >
            <Download size={14} className="mr-1.5" />
            Exporter CSV
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((sc) => {
            const Icon = sc.icon;
            return (
              <Card key={sc.label}>
                <CardBody className="flex items-center gap-3 py-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{sc.label}</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{sc.value}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <div className="px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex gap-1 flex-wrap">
              {typeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTypeFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    typeFilter === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <span className="text-xs text-gray-500">Du</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-500">au</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tokens</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-500 text-xs">{tx.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {tx.userName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800">{tx.userName}</p>
                          <Badge variant={tx.userRole === 'artisan' ? 'primary' : 'info'} className="text-[10px] px-1.5 py-0">
                            {tx.userRole === 'artisan' ? 'Artisan' : 'Client'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={typeVariant(tx.type)}>{typeLabel(tx.type)}</Badge>
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                      {tx.amount < 0 ? '-' : ''}{Math.abs(tx.amount).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-medium ${tx.tokens < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                      {tx.tokens > 0 ? '+' : ''}{tx.tokens}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(tx.status)}>{statusLabel(tx.status)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-6 py-3 text-xs font-bold text-gray-700" colSpan={3}>
                    Total ({filtered.length} transactions)
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-bold ${totals.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {totals.amount.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-bold ${totals.tokens < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {totals.tokens > 0 ? '+' : ''}{totals.tokens}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
