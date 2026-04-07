import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Star, ExternalLink, Clock, Repeat, CheckSquare, DollarSign } from 'lucide-react';

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];

const userGrowth = [
  { month: 'Jan', clients: 38, artisans: 22 },
  { month: 'Fév', clients: 51, artisans: 31 },
  { month: 'Mar', clients: 44, artisans: 27 },
  { month: 'Avr', clients: 67, artisans: 41 },
  { month: 'Mai', clients: 82, artisans: 53 },
  { month: 'Jun', clients: 95, artisans: 64 },
];

const maxGrowth = Math.max(...userGrowth.map((d) => d.clients + d.artisans));

const categories = [
  { label: 'Électricité', pct: 28, color: 'bg-yellow-400' },
  { label: 'Plomberie', pct: 22, color: 'bg-blue-400' },
  { label: 'Menuiserie', pct: 18, color: 'bg-amber-600' },
  { label: 'Peinture', pct: 14, color: 'bg-green-400' },
  { label: 'Maçonnerie', pct: 10, color: 'bg-gray-400' },
  { label: 'Autres', pct: 8, color: 'bg-purple-400' },
];

const revenueData = [320000, 480000, 410000, 590000, 720000, 880000];
const maxRevenue = Math.max(...revenueData);

const topArtisans = [
  { rank: 1, name: 'Moussa Bakayoko', category: 'Électricité', jobs: 41, revenue: 1025000, rating: 4.9 },
  { rank: 2, name: 'Konan N\'Guessan', category: 'Plomberie', jobs: 28, revenue: 700000, rating: 4.7 },
  { rank: 3, name: 'Drissa Fofana', category: 'Menuiserie', jobs: 19, revenue: 475000, rating: 4.5 },
  { rank: 4, name: 'Bamba Lacina', category: 'Maçonnerie', jobs: 14, revenue: 350000, rating: 4.3 },
  { rank: 5, name: 'Diabaté Toiture', category: 'Toiture', jobs: 11, revenue: 275000, rating: 4.2 },
];

const engagementMetrics = [
  { label: 'Temps de réponse moyen', value: '4.2h', icon: Clock, color: 'bg-blue-100 text-blue-600' },
  { label: 'Taux de clients récurrents', value: '34%', icon: Repeat, color: 'bg-green-100 text-green-600' },
  { label: 'Taux d\'acceptation devis', value: '67%', icon: CheckSquare, color: 'bg-orange-100 text-orange-600' },
  { label: 'Valeur moyenne job', value: '45 000 FCFA', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
];

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        let fill = 'text-gray-200';
        if (i < full) fill = 'text-yellow-400';
        else if (i === full && partial >= 0.5) fill = 'text-yellow-300';
        return <Star key={i} size={12} className={`${fill} fill-current`} />;
      })}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
};

export function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytique</h2>
          <p className="text-sm text-gray-500 mt-1">Données de performance de la plateforme</p>
        </div>

        {/* Engagement metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {engagementMetrics.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label}>
                <CardBody className="flex items-center gap-3 py-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">{m.label}</p>
                    <p className="font-bold text-gray-900 text-base mt-0.5">{m.value}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* User Growth — horizontal bar chart */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-800">Croissance des utilisateurs (6 mois)</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Clients
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-primary-500 inline-block" /> Artisans
                </div>
              </div>
              <div className="space-y-4">
                {userGrowth.map((d) => {
                  const totalPct = ((d.clients + d.artisans) / maxGrowth) * 100;
                  const clientPct = (d.clients / (d.clients + d.artisans)) * 100;
                  return (
                    <div key={d.month} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-8 flex-shrink-0">{d.month}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full flex overflow-hidden"
                          style={{ width: `${totalPct}%` }}
                        >
                          <div className="bg-blue-400 h-full" style={{ width: `${clientPct}%` }} />
                          <div className="bg-primary-500 h-full flex-1" />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-8 text-right flex-shrink-0">
                        {d.clients + d.artisans}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Revenue Trend — vertical bar chart */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-800">Revenus mensuels (FCFA)</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-end justify-between gap-2 h-44">
                {revenueData.map((val, i) => {
                  const heightPct = (val / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {val >= 1000000
                          ? `${(val / 1000000).toFixed(1)}M`
                          : `${(val / 1000).toFixed(0)}k`}
                      </span>
                      <div className="w-full flex items-end" style={{ height: '100px' }}>
                        <div
                          className="w-full bg-primary-500 rounded-t-md hover:bg-primary-600 transition-colors"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{months[i]}</span>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Category breakdown + Top artisans */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Category breakdown — stacked bar + legend */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-800">Répartition par catégorie</h3>
            </CardHeader>
            <CardBody>
              {/* Stacked progress bar */}
              <div className="h-8 rounded-full overflow-hidden flex mb-5">
                {categories.map((c) => (
                  <div
                    key={c.label}
                    className={`${c.color} h-full`}
                    style={{ width: `${c.pct}%` }}
                    title={`${c.label}: ${c.pct}%`}
                  />
                ))}
              </div>
              {/* Legend with individual bars */}
              <div className="space-y-3">
                {categories.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${c.color}`} />
                    <span className="text-xs text-gray-600 w-24 flex-shrink-0">{c.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`${c.color} h-full rounded-full`} style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right flex-shrink-0">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Top artisans */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-800">Top 5 artisans</h3>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400">#</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400">Artisan</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Jobs</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Revenus</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400">Note</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topArtisans.map((a) => (
                    <tr key={a.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold ${
                          a.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          a.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          a.rank === 3 ? 'bg-orange-100 text-orange-600' :
                          'text-gray-400'
                        }`}>
                          {a.rank}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.category}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-700">{a.jobs}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-600">
                        {a.revenue.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-2.5">
                        <Stars rating={a.rating} />
                      </td>
                      <td className="px-4 py-2.5">
                        <button className="text-gray-300 hover:text-primary-600 transition-colors" title="Voir profil">
                          <ExternalLink size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
