import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Calendar, MessageSquare, Briefcase, Coins, X } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';

interface MockJob {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  budget?: number;
  posted_at: string;
  client: { id: string; name: string };
}

const MOCK_JOBS: MockJob[] = [
  {
    id: 'j1',
    title: "Réparation fuite d'eau sous évier",
    category: 'Plomberie',
    description: "Fuite importante sous l'évier de la cuisine. Le joint semble usé. Intervention urgente souhaitée cette semaine.",
    location: 'Cocody Riviera 3, Abidjan',
    budget: 50000,
    posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    client: { id: 'c1', name: 'Marie Ouédraogo' },
  },
  {
    id: 'j2',
    title: 'Installation tableau électrique neuf',
    category: 'Électricité',
    description: "Remplacement d'un ancien tableau électrique par un modèle actuel avec disjoncteurs différentiels. Appartement de 80m².",
    location: 'Plateau, Abidjan',
    budget: 120000,
    posted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    client: { id: 'c2', name: 'Koffi Yao' },
  },
  {
    id: 'j3',
    title: 'Fabrication meuble TV sur mesure',
    category: 'Menuiserie',
    description: "Meuble TV encastré avec rangements fermés. Dimensions : 2m40 de large, 60cm de hauteur. Bois teinte noyer.",
    location: 'Yopougon Selmer, Abidjan',
    budget: 180000,
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: 'c3', name: 'Aïssatou Diallo' },
  },
  {
    id: 'j4',
    title: 'Peinture salon + chambres (3 pièces)',
    category: 'Peinture',
    description: "Appartement neuf à peindre avant emménagement. Murs et plafonds. Surface totale environ 120m². Fourniture de la peinture possible.",
    location: 'Marcory Zone 4, Abidjan',
    budget: 250000,
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: 'c4', name: 'Jean-Claude Brou' },
  },
  {
    id: 'j5',
    title: 'Climatisation bureau (3 splits)',
    category: 'Climatisation',
    description: "Installation de 3 climatiseurs splits dans un bureau de 60m². Câblage électrique dédié inclus. Marque non imposée.",
    location: 'Zone industrielle de Vridi, Abidjan',
    budget: 600000,
    posted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    client: { id: 'c5', name: 'Société Tracom SARL' },
  },
  {
    id: 'j6',
    title: 'Carrelage terrasse 40m²',
    category: 'Maçonnerie',
    description: "Pose de carrelage extérieur antidérapant sur terrasse de 40m². Fourniture des carreaux par le client. Chape si nécessaire.",
    location: 'Angré Château, Abidjan',
    budget: 150000,
    posted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    client: { id: 'c6', name: 'Amara Koné' },
  },
  {
    id: 'j7',
    title: 'Portail coulissant soudé sur mesure',
    category: 'Soudure',
    description: "Fabrication et pose d'un portail coulissant en fer forgé. Ouverture 4 mètres. Moteur électrique souhaité.",
    location: 'Bingerville, Abidjan',
    posted_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    client: { id: 'c7', name: 'Gnagna Touré' },
  },
  {
    id: 'j8',
    title: 'Dépannage électrique urgent',
    category: 'Électricité',
    description: "Panne totale de courant dans la maison. Disjoncteur général saute en permanence. Intervention dans la journée si possible.",
    location: 'Abobo Sogefia, Abidjan',
    posted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    client: { id: 'c8', name: 'Rokia Sanogo' },
  },
];

const CATEGORIES = ['Électricité', 'Plomberie', 'Menuiserie', 'Peinture', 'Maçonnerie', 'Climatisation', 'Soudure'];

function timeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (locale === 'fr') {
    if (days > 0) return `il y a ${days}j`;
    if (hours > 0) return `il y a ${hours}h`;
    return `il y a ${mins}min`;
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}min ago`;
}

const CONTACT_COST = 1;

function InsufficientModal({ onClose, onBuy, locale }: { onClose: () => void; onBuy: () => void; locale: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900">
              {locale === 'fr' ? 'Crédits insuffisants' : 'Insufficient credits'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {locale === 'fr'
            ? `Vous avez besoin d'au moins ${CONTACT_COST} crédit pour contacter un client. Achetez des crédits pour continuer.`
            : `You need at least ${CONTACT_COST} credit to contact a client. Buy credits to continue.`
          }
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {locale === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button onClick={onBuy} className="flex-1">
            {locale === 'fr' ? 'Acheter des crédits' : 'Buy credits'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BrowseJobs() {
  const { t, locale } = useLang();
  const navigate = useNavigate();
  const { balance, deduct } = useTokens();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = MOCK_JOBS.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    const matchCat = !category || j.category === category;
    return matchSearch && matchCat;
  });

  const handleContact = (job: MockJob) => {
    if (balance < CONTACT_COST) {
      setShowModal(true);
      return;
    }
    const ok = deduct(CONTACT_COST, `Contact client — ${job.title}`);
    if (!ok) { setShowModal(true); return; }
    navigate('/dashboard/worker/messages', {
      state: {
        pendingContact: { id: job.client.id, name: job.client.name },
        jobTitle: job.title,
      },
    });
  };

  return (
    <WorkerLayout>
      {showModal && (
        <InsufficientModal
          locale={locale}
          onClose={() => setShowModal(false)}
          onBuy={() => navigate('/dashboard/worker/credits')}
        />
      )}

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('browseJobsTitle')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('browseJobsSub')}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${balance > 0 ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-600'}`}>
          <Coins size={16} />
          {balance} {t('creditsUnit')}
          {balance === 0 && (
            <button onClick={() => navigate('/dashboard/worker/credits')} className="ml-1 underline text-xs font-normal">
              {t('buyCreditsNow')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">{t('allCategories')}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} {locale === 'fr' ? 'offres' : 'listings'}</span>
      </div>

      {/* Job cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t('noJobsFound')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('noJobsSub')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">{job.title}</h3>
                    <Badge variant="info">{job.category}</Badge>
                  </div>

                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{job.description}</p>

                  <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      {timeAgo(job.posted_at, locale)}
                    </span>
                    {job.budget && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign size={13} className="text-gray-400" />
                        {t('budgetLabel2')} : <span className="font-semibold text-gray-700">{formatCurrency(job.budget)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                      {job.client.name[0]}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{job.client.name}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleContact(job)}
                    className="flex items-center gap-1.5 whitespace-nowrap"
                    variant={balance < CONTACT_COST ? 'outline' : 'primary'}
                  >
                    <MessageSquare size={14} />
                    {t('contactClient')}
                    <span className="ml-1 flex items-center gap-0.5 text-xs opacity-75">
                      <Coins size={11} />1
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
}
