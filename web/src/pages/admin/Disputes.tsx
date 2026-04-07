import { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Calendar, Briefcase, ArrowRight } from 'lucide-react';

type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
type Priority = 'high' | 'medium' | 'low';

interface Dispute {
  id: number;
  clientName: string;
  clientId: number;
  artisanName: string;
  artisanId: number;
  jobTitle: string;
  amount: number;
  category: string;
  created_at: string;
  status: DisputeStatus;
  priority: Priority;
  description: string;
  resolution?: string;
}

const INITIAL_DISPUTES: Dispute[] = [
  { id: 1, clientName: 'Marie-Claire Touré', clientId: 3, artisanName: 'Ibrahim Diallo', artisanId: 4, jobTitle: 'Installation électrique salon', amount: 85000, category: 'Électricité', created_at: '28 mars 2026', status: 'open', priority: 'high', description: 'Le travail réalisé ne correspond pas au devis initial. Des fils sont laissés apparents et l\'installation présente des risques de court-circuit.' },
  { id: 2, clientName: 'Aminata Coulibaly', clientId: 7, artisanName: 'Seydou Traoré', artisanId: 8, jobTitle: 'Plomberie cuisine', amount: 45000, category: 'Plomberie', created_at: '26 mars 2026', status: 'investigating', priority: 'medium', description: 'Fuite d\'eau détectée 3 jours après l\'intervention. L\'artisan refuse de revenir sans supplément.' },
  { id: 3, clientName: 'Cécile Atta', clientId: 9, artisanName: 'Bamba Lacina', artisanId: 14, jobTitle: 'Rénovation salle de bain', amount: 120000, category: 'Maçonnerie', created_at: '24 mars 2026', status: 'open', priority: 'high', description: 'Travaux non terminés, artisan injoignable depuis 5 jours après avoir encaissé 60% du montant.' },
  { id: 4, clientName: 'Fatou Camara', clientId: 5, artisanName: 'Moussa Bakayoko', artisanId: 10, jobTitle: 'Peinture appartement', amount: 35000, category: 'Peinture', created_at: '22 mars 2026', status: 'resolved', priority: 'low', description: 'Couleur appliquée différente de celle commandée.', resolution: 'Artisan revenu refaire la peinture avec la bonne couleur. Client satisfait.' },
  { id: 5, clientName: 'Nathalie Séka', clientId: 13, artisanName: 'Konan N\'Guessan', artisanId: 6, jobTitle: 'Pose de carrelage', amount: 75000, category: 'Carrelage', created_at: '20 mars 2026', status: 'dismissed', priority: 'low', description: 'Client mécontent de la durée des travaux, bien que conforme au devis.', resolution: 'Litige non fondé — délais respectés selon contrat signé.' },
  { id: 6, clientName: 'Adjoua Konan', clientId: 1, artisanName: 'Drissa Fofana', artisanId: 12, jobTitle: 'Menuiserie portes', amount: 95000, category: 'Menuiserie', created_at: '18 mars 2026', status: 'investigating', priority: 'medium', description: 'Les portes installées ne ferment pas correctement. Mesures incorrectes selon le client.' },
  { id: 7, clientName: 'Akissi Bamba', clientId: 11, artisanName: 'Yao Climatisation', artisanId: 99, jobTitle: 'Installation climatiseur', amount: 150000, category: 'Climatisation', created_at: '15 mars 2026', status: 'open', priority: 'high', description: 'Climatiseur installé sans raccordement correct. Unité extérieure non fixée, risque de chute.' },
  { id: 8, clientName: 'Ramatou Diabaté', clientId: 15, artisanName: 'Lacina Kouyaté', artisanId: 14, jobTitle: 'Jardinage et aménagement', amount: 20000, category: 'Jardinage', created_at: '10 mars 2026', status: 'resolved', priority: 'low', description: 'Plantes abîmées lors de l\'intervention.', resolution: 'Remboursement partiel de 8 000 FCFA accordé. Litige clôturé.' },
];

const priorityVariant = (p: Priority): 'danger' | 'warning' | 'default' => {
  if (p === 'high') return 'danger';
  if (p === 'medium') return 'warning';
  return 'default';
};

const priorityLabel = (p: Priority) => {
  if (p === 'high') return 'Haute';
  if (p === 'medium') return 'Moyenne';
  return 'Basse';
};

const statusVariant = (s: DisputeStatus): 'danger' | 'warning' | 'success' | 'default' => {
  if (s === 'open') return 'danger';
  if (s === 'investigating') return 'warning';
  if (s === 'resolved') return 'success';
  return 'default';
};

const statusLabel = (s: DisputeStatus) => {
  if (s === 'open') return 'Ouvert';
  if (s === 'investigating') return 'En examen';
  if (s === 'resolved') return 'Résolu';
  return 'Classé sans suite';
};

export function AdminDisputes() {
  const toast = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [tab, setTab] = useState<'all' | DisputeStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [resolveInput, setResolveInput] = useState<number | null>(null);
  const [resolveText, setResolveText] = useState<Record<number, string>>({});

  const openCount = disputes.filter((d) => d.status === 'open').length;

  const filtered = disputes.filter((d) => {
    const matchTab = tab === 'all' || d.status === tab;
    const matchPriority = priorityFilter === 'all' || d.priority === priorityFilter;
    return matchTab && matchPriority;
  });

  const updateDispute = (id: number, update: Partial<Dispute>) => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, ...update } : d)));
  };

  const handleInvestigate = (id: number) => {
    updateDispute(id, { status: 'investigating' });
    toast.info('Litige marqué comme en cours d\'examen.');
  };

  const handleDismiss = (id: number) => {
    if (!window.confirm('Confirmer la clôture de ce litige sans suite ?')) return;
    updateDispute(id, { status: 'dismissed' });
    toast.info('Litige classé sans suite.');
  };

  const handleResolve = (id: number) => {
    const note = resolveText[id] ?? '';
    updateDispute(id, { status: 'resolved', resolution: note || 'Résolu par l\'administrateur.' });
    toast.success('Litige résolu avec succès.');
    setResolveInput(null);
  };

  const tabs: { key: 'all' | DisputeStatus; label: string; count?: number }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'open', label: 'Ouverts', count: openCount },
    { key: 'investigating', label: 'En examen' },
    { key: 'resolved', label: 'Résolus' },
  ];

  const priorityTabs: { key: 'all' | Priority; label: string }[] = [
    { key: 'all', label: 'Toutes priorités' },
    { key: 'high', label: 'Haute' },
    { key: 'medium', label: 'Moyenne' },
    { key: 'low', label: 'Basse' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des litiges</h2>
          <p className="text-sm text-gray-500 mt-1">{disputes.length} litiges au total</p>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 border-b border-gray-200 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                tab === t.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex gap-1 flex-wrap">
          {priorityTabs.map((pt) => (
            <button
              key={pt.key}
              onClick={() => setPriorityFilter(pt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                priorityFilter === pt.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>

        {/* Dispute cards */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">Aucun litige dans cette catégorie</div>
          )}
          {filtered.map((d) => (
            <Card key={d.id}>
              <CardBody>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">#{String(d.id).padStart(4, '0')}</span>
                    <Badge variant={priorityVariant(d.priority)}>Priorité {priorityLabel(d.priority)}</Badge>
                    <Badge variant={statusVariant(d.status)}>{statusLabel(d.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} />
                    {d.created_at}
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Briefcase size={14} className="text-gray-400" />
                      <h3 className="font-semibold text-gray-800 text-sm">{d.jobTitle}</h3>
                      <Badge variant="default" className="ml-1">{d.category}</Badge>
                    </div>

                    {/* Parties */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {d.clientName[0]}
                        </div>
                        <span className="text-xs text-gray-700">{d.clientName}</span>
                        <Badge variant="info" className="text-[10px] px-1 py-0">Client</Badge>
                      </div>
                      <ArrowRight size={12} className="text-gray-300" />
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                          {d.artisanName[0]}
                        </div>
                        <span className="text-xs text-gray-700">{d.artisanName}</span>
                        <Badge variant="primary" className="text-[10px] px-1 py-0">Artisan</Badge>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-1">
                      Montant en jeu: <span className="font-semibold text-gray-700">{d.amount.toLocaleString('fr-FR')} FCFA</span>
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">{d.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 items-start sm:items-end flex-shrink-0 min-w-[150px]">
                    {d.status === 'open' && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => handleInvestigate(d.id)}>
                          Examiner
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDismiss(d.id)}>
                          Classer sans suite
                        </Button>
                      </>
                    )}
                    {d.status === 'investigating' && (
                      <>
                        {resolveInput === d.id ? (
                          <div className="flex flex-col gap-1 w-full">
                            <textarea
                              rows={3}
                              placeholder="Note de résolution..."
                              value={resolveText[d.id] ?? ''}
                              onChange={(e) => setResolveText((prev) => ({ ...prev, [d.id]: e.target.value }))}
                              className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400 resize-none w-full"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleResolve(d.id)}
                                className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => setResolveInput(null)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => setResolveInput(d.id)}>
                            Résoudre
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDismiss(d.id)}>
                          Classer sans suite
                        </Button>
                      </>
                    )}
                    {(d.status === 'resolved' || d.status === 'dismissed') && d.resolution && (
                      <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 border border-gray-100 max-w-xs">
                        <p className="font-semibold text-gray-700 mb-0.5">Résolution:</p>
                        <p>{d.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
