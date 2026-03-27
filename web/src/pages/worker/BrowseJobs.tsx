import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Calendar, MessageSquare, Briefcase } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { useLang } from '../../context/LangContext';
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

export function BrowseJobs() {
  const { t, locale } = useLang();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = MOCK_JOBS.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    const matchCat = !category || j.category === category;
    return matchSearch && matchCat;
  });

  const handleContact = (job: MockJob) => {
    navigate('/dashboard/worker/messages', {
      state: {
        pendingContact: { id: job.client.id, name: job.client.name },
        jobTitle: job.title,
      },
    });
  };

  return (
    <WorkerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('browseJobsTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('browseJobsSub')}</p>
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
                  >
                    <MessageSquare size={14} />
                    {t('contactClient')}
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
