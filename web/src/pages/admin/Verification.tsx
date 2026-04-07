import { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Download, ChevronDown, ChevronUp, MapPin, Calendar, Hash, FileText, IdCard } from 'lucide-react';

type VerifStatus = 'pending' | 'approved' | 'rejected';

interface Document {
  name: string;
  type: string;
}

interface VerificationRequest {
  id: number;
  artisanName: string;
  category: string;
  location: string;
  submitted_at: string;
  status: VerifStatus;
  documents: Document[];
  selfie_url: string;
  id_number: string;
}

const INITIAL_REQUESTS: VerificationRequest[] = [
  { id: 1, artisanName: 'Konan Électricité', category: 'Électricité', location: 'Abidjan, Cocody', submitted_at: '28 mars 2026', status: 'pending', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Attestation de formation CEB', type: 'trade' }, { name: 'Justificatif de domicile', type: 'address' }], selfie_url: '🤳', id_number: 'CI-2890-4521' },
  { id: 2, artisanName: 'Drissa Plomberie', category: 'Plomberie', location: 'Bouaké', submitted_at: '27 mars 2026', status: 'pending', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Certificat de qualification', type: 'trade' }], selfie_url: '🤳', id_number: 'CI-3012-9834' },
  { id: 3, artisanName: 'Bamba Menuiserie', category: 'Menuiserie', location: 'Yamoussoukro', submitted_at: '26 mars 2026', status: 'approved', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Diplôme CAP Menuiserie', type: 'trade' }, { name: 'Extrait de casier judiciaire', type: 'legal' }], selfie_url: '🤳', id_number: 'CI-1745-6630' },
  { id: 4, artisanName: 'Seydou Peinture', category: 'Peinture', location: 'San Pedro', submitted_at: '25 mars 2026', status: 'rejected', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }], selfie_url: '🤳', id_number: 'CI-4402-1178' },
  { id: 5, artisanName: 'Lacina Maçonnerie', category: 'Maçonnerie', location: 'Daloa', submitted_at: '24 mars 2026', status: 'pending', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Attestation patronale', type: 'trade' }, { name: 'Justificatif de domicile', type: 'address' }], selfie_url: '🤳', id_number: 'CI-5519-3377' },
  { id: 6, artisanName: 'Yao Climatisation', category: 'Climatisation', location: 'Abidjan, Plateau', submitted_at: '23 mars 2026', status: 'approved', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Certification Climatisation', type: 'trade' }], selfie_url: '🤳', id_number: 'CI-6680-2214' },
  { id: 7, artisanName: 'Moussa Carrelage', category: 'Carrelage', location: 'Korhogo', submitted_at: '22 mars 2026', status: 'pending', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Attestation d\'expérience', type: 'trade' }], selfie_url: '🤳', id_number: 'CI-7723-8891' },
  { id: 8, artisanName: 'Atta Soudure', category: 'Soudure', location: 'Man', submitted_at: '21 mars 2026', status: 'rejected', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Certificat de soudage', type: 'trade' }], selfie_url: '🤳', id_number: 'CI-8801-5566' },
  { id: 9, artisanName: 'Cissé Jardinage', category: 'Jardinage', location: 'Abidjan, Yopougon', submitted_at: '20 mars 2026', status: 'pending', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }], selfie_url: '🤳', id_number: 'CI-9245-7712' },
  { id: 10, artisanName: 'Diabaté Toiture', category: 'Toiture', location: 'Gagnoa', submitted_at: '19 mars 2026', status: 'approved', documents: [{ name: 'Carte nationale d\'identité', type: 'id' }, { name: 'Brevet professionnel', type: 'trade' }, { name: 'Justificatif de domicile', type: 'address' }], selfie_url: '🤳', id_number: 'CI-1003-4490' },
];

const docIcon = (type: string) => {
  if (type === 'id') return <IdCard size={13} className="text-blue-500" />;
  return <FileText size={13} className="text-gray-400" />;
};

const categoryVariant = (cat: string): 'primary' | 'info' | 'warning' | 'default' => {
  const map: Record<string, 'primary' | 'info' | 'warning' | 'default'> = {
    'Électricité': 'warning',
    'Plomberie': 'info',
    'Menuiserie': 'default',
    'Peinture': 'primary',
    'Maçonnerie': 'default',
  };
  return map[cat] ?? 'default';
};

export function AdminVerification() {
  const toast = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>(INITIAL_REQUESTS);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<number | null>(null);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const filtered = requests.filter((r) => r.status === tab);

  const handleApprove = (id: number) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
    toast.success('Artisan approuvé avec succès.');
    setExpanded(null);
  };

  const handleReject = (id: number) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
    toast.error('Artisan rejeté.');
    setShowRejectInput(null);
    setExpanded(null);
  };

  const tabs = [
    { key: 'pending' as const, label: 'En attente', count: pendingCount },
    { key: 'approved' as const, label: 'Approuvés', count: null },
    { key: 'rejected' as const, label: 'Rejetés', count: null },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vérification des artisans</h2>
          <p className="text-sm text-gray-500 mt-1">Examinez et approuvez les demandes d'identité</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
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
              {t.count !== null && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">Aucune demande dans cette catégorie</div>
          )}
          {filtered.map((req) => (
            <Card key={req.id}>
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Left: Avatar + info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {req.artisanName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{req.artisanName}</h3>
                        <Badge variant={categoryVariant(req.category)}>{req.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin size={12} />{req.location}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} />Soumis le {req.submitted_at}</span>
                        <span className="flex items-center gap-1"><Hash size={12} />{req.id_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Documents */}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Documents ({req.documents.length})</p>
                    <div className="space-y-1">
                      {req.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1.5">
                          <span className="flex items-center gap-1.5">{docIcon(doc.type)} {doc.name}</span>
                          <button className="text-gray-400 hover:text-primary-600 transition-colors" title="Télécharger">
                            <Download size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {req.status === 'pending' && (
                      <>
                        <Button variant="primary" size="sm" onClick={() => handleApprove(req.id)}>
                          Approuver
                        </Button>
                        {showRejectInput === req.id ? (
                          <div className="flex flex-col gap-1 w-48">
                            <textarea
                              rows={2}
                              placeholder="Motif du rejet..."
                              value={rejectNotes[req.id] ?? ''}
                              onChange={(e) => setRejectNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                              className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleReject(req.id)}
                                className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => setShowRejectInput(null)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="danger" size="sm" onClick={() => setShowRejectInput(req.id)}>
                            Rejeter
                          </Button>
                        )}
                      </>
                    )}
                    {req.status === 'approved' && <Badge variant="success">Approuvé</Badge>}
                    {req.status === 'rejected' && <Badge variant="danger">Rejeté</Badge>}

                    <button
                      onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 mt-1"
                    >
                      {expanded === req.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {expanded === req.id ? 'Masquer' : 'Voir détails'}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {expanded === req.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Selfie de vérification</p>
                      <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl border border-gray-200">
                        {req.selfie_url}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Numéro ID: {req.id_number}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Notes internes</p>
                      <textarea
                        rows={4}
                        placeholder="Ajouter une note sur cette vérification..."
                        value={notes[req.id] ?? ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
