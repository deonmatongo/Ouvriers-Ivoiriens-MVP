import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Clock, MessageSquare, Briefcase } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { useLang } from '../../context/LangContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface MockArtisan {
  id: string;
  name: string;
  category: string;
  location: string;
  hourly_rate: number;
  rating: number;
  review_count: number;
  experience_years: number;
  bio: string;
  skills: string[];
  available: boolean;
}

const MOCK_ARTISANS: MockArtisan[] = [
  {
    id: 'a1', name: 'Konan Électricité', category: 'Électricité',
    location: 'Cocody, Abidjan', hourly_rate: 4500, rating: 4.8, review_count: 47,
    experience_years: 8, available: true,
    bio: 'Électricien certifié avec 8 ans d\'expérience. Spécialisé en installation et dépannage résidentiel.',
    skills: ['Installation tableau', 'Dépannage', 'Climatisation'],
  },
  {
    id: 'a2', name: 'Fatou Plomberie', category: 'Plomberie',
    location: 'Plateau, Abidjan', hourly_rate: 3800, rating: 4.6, review_count: 32,
    experience_years: 5, available: true,
    bio: 'Plombière expérimentée, intervention rapide dans tout Abidjan.',
    skills: ['Fuite d\'eau', 'Débouchage', 'Sanitaire'],
  },
  {
    id: 'a3', name: 'Ibrahim Menuiserie', category: 'Menuiserie',
    location: 'Yopougon, Abidjan', hourly_rate: 5000, rating: 4.9, review_count: 68,
    experience_years: 12, available: false,
    bio: 'Menuisier artisan passionné. Fabrication sur mesure et pose de parquet.',
    skills: ['Meubles sur mesure', 'Parquet', 'Portes & fenêtres'],
  },
  {
    id: 'a4', name: 'Adjoua Peinture', category: 'Peinture',
    location: 'Marcory, Abidjan', hourly_rate: 3500, rating: 4.5, review_count: 21,
    experience_years: 4, available: true,
    bio: 'Peintre décoratrice. Enduit, peinture intérieure et extérieure, finitions soignées.',
    skills: ['Peinture intérieure', 'Enduit', 'Décoration'],
  },
  {
    id: 'a5', name: 'Kouassi Maçonnerie', category: 'Maçonnerie',
    location: 'Abobo, Abidjan', hourly_rate: 6000, rating: 4.7, review_count: 53,
    experience_years: 15, available: true,
    bio: 'Maçon qualifié, construction et rénovation. Travaux de gros œuvre et finitions.',
    skills: ['Carrelage', 'Gros œuvre', 'Rénovation'],
  },
  {
    id: 'a6', name: 'Ama Climatisation', category: 'Climatisation',
    location: 'Cocody, Abidjan', hourly_rate: 8000, rating: 4.8, review_count: 29,
    experience_years: 6, available: true,
    bio: 'Technicienne en climatisation, installation, maintenance et dépannage toutes marques.',
    skills: ['Installation', 'Maintenance', 'Dépannage'],
  },
  {
    id: 'a7', name: 'Seydou Soudure', category: 'Soudure',
    location: 'Treichville, Abidjan', hourly_rate: 5500, rating: 4.4, review_count: 18,
    experience_years: 9, available: true,
    bio: 'Soudeur professionnel. Portails, grilles de sécurité, structures métalliques.',
    skills: ['Portails', 'Grilles', 'Structures métalliques'],
  },
  {
    id: 'a8', name: 'Amara Carrelage', category: 'Maçonnerie',
    location: 'Angré, Abidjan', hourly_rate: 4000, rating: 4.6, review_count: 41,
    experience_years: 7, available: false,
    bio: 'Spécialiste carrelage et faïence, sols et murs. Travail soigné et rapide.',
    skills: ['Carrelage', 'Faïence', 'Joints'],
  },
];

const CATEGORIES = ['Électricité', 'Plomberie', 'Menuiserie', 'Peinture', 'Maçonnerie', 'Climatisation', 'Soudure'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={14} className="text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-semibold text-gray-900">{rating}</span>
    </div>
  );
}

export function BrowseArtisans() {
  const { t, locale } = useLang();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = MOCK_ARTISANS.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.location.toLowerCase().includes(q);
    const matchCat = !category || a.category === category;
    const matchAvail = !availableOnly || a.available;
    return matchSearch && matchCat && matchAvail;
  });

  const handleContact = (artisan: MockArtisan) => {
    // Client-initiated inbound request: conversation starts locked until artisan accepts (−5 credits)
    navigate('/messages', {
      state: {
        pendingContact: { id: artisan.id, name: artisan.name },
        convStatus: 'pending_acceptance',
      },
    });
  };

  return (
    <CustomerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('browseArtisansTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('browseArtisansSub')}</p>
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
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          {locale === 'fr' ? 'Disponibles uniquement' : 'Available only'}
        </label>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} {locale === 'fr' ? 'résultats' : 'results'}</span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t('noJobsFound')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('noJobsSub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((artisan) => (
            <div key={artisan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {/* Card header */}
              <div
                className="p-5 border-b border-gray-100 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/artisans/${artisan.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                  {artisan.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate hover:text-primary-600 transition-colors">{artisan.name}</h3>
                    <Badge variant={artisan.available ? 'success' : 'default'} className="flex-shrink-0">
                      {artisan.available ? t('available') : t('unavailable')}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary-600 font-medium mt-0.5">{artisan.category}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <StarRating rating={artisan.rating} />
                    <span className="text-xs text-gray-400">({artisan.review_count} {t('reviewsLabel')})</span>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 flex-1 space-y-3">
                <p className="text-sm text-gray-500 line-clamp-2">{artisan.bio}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400" />
                    {artisan.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    {artisan.experience_years} {locale === 'fr' ? 'ans' : 'yrs'} {t('experienceLabel')}
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {artisan.skills.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              {/* Card footer */}
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {artisan.hourly_rate.toLocaleString('fr-CI')}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">FCFA{t('perHour')}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleContact(artisan)}
                  className="flex items-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  {t('contactArtisan')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
