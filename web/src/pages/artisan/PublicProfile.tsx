import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Star, MessageSquare, ArrowLeft, CheckCircle, Briefcase } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { formatCurrency } from '../../lib/utils';

// Shared mock data — mirrors BrowseArtisans
const MOCK_ARTISANS = [
  {
    id: 'a1', name: 'Konan Électricité', category: 'Électricité',
    location: 'Cocody, Abidjan', hourly_rate: 4500, rating: 4.8, review_count: 47,
    experience_years: 8, available: true,
    bio: 'Électricien certifié avec 8 ans d\'expérience. Spécialisé en installation et dépannage résidentiel et commercial. Travail soigné, délais respectés.',
    skills: ['Installation tableau', 'Dépannage urgence', 'Climatisation', 'Câblage', 'Mise aux normes'],
    services: [
      { name: 'Installation tableau électrique', price: 35000 },
      { name: 'Dépannage / urgence', price: 15000 },
      { name: 'Câblage complet appartement', price: 80000 },
    ],
    reviews: [
      { id: 'rv1', client: 'Aminata K.', rating: 5, comment: 'Installation tableau électrique parfaitement réalisée. Konan est arrivé à l\'heure et a terminé en 3h.', job: 'Installation tableau électrique', date: '2025-11-10' },
      { id: 'rv2', client: 'Jean-Baptiste L.', rating: 5, comment: 'Dépannage rapide et efficace. Très professionnel.', job: 'Dépannage électrique urgent', date: '2025-10-22' },
      { id: 'rv3', client: 'Rosine D.', rating: 4, comment: 'Bon travail mais légèrement en retard. Qualité irréprochable.', job: 'Câblage appartement', date: '2025-09-15' },
    ],
  },
  {
    id: 'a2', name: 'Fatou Plomberie', category: 'Plomberie',
    location: 'Plateau, Abidjan', hourly_rate: 3800, rating: 4.6, review_count: 32,
    experience_years: 5, available: true,
    bio: 'Plombière expérimentée, intervention rapide dans tout Abidjan. Spécialiste des fuites, débouchages et installations sanitaires neuves.',
    skills: ['Fuite d\'eau', 'Débouchage', 'Sanitaire neuf', 'Chauffe-eau', 'Salle de bain'],
    services: [
      { name: 'Réparation fuite', price: 20000 },
      { name: 'Débouchage canalisation', price: 25000 },
      { name: 'Installation salle de bain', price: 120000 },
    ],
    reviews: [
      { id: 'rv4', client: 'Serge T.', rating: 5, comment: 'Fuite réparée en 1h. Prix honnête et travail impeccable.', job: 'Réparation fuite d\'eau', date: '2025-11-05' },
      { id: 'rv5', client: 'Haoua B.', rating: 5, comment: 'Excellente intervention. A détecté un problème supplémentaire et l\'a résolu sans supplément !', job: 'Débouchage', date: '2025-10-18' },
      { id: 'rv6', client: 'Marc A.', rating: 4, comment: 'Bonne prestation, je referai appel à ses services.', job: 'Installation douche', date: '2025-09-30' },
    ],
  },
  {
    id: 'a3', name: 'Ibrahim Menuiserie', category: 'Menuiserie',
    location: 'Yopougon, Abidjan', hourly_rate: 5000, rating: 4.9, review_count: 68,
    experience_years: 12, available: false,
    bio: 'Menuisier artisan passionné avec 12 ans de métier. Fabrication sur mesure, pose de parquet et menuiseries intérieures et extérieures.',
    skills: ['Meubles sur mesure', 'Parquet', 'Portes & fenêtres', 'Cuisine équipée', 'Dressing'],
    services: [
      { name: 'Meuble TV sur mesure', price: 150000 },
      { name: 'Pose parquet', price: 40000 },
      { name: 'Cuisine équipée', price: 500000 },
    ],
    reviews: [
      { id: 'rv7', client: 'Claudette M.', rating: 5, comment: 'Meuble TV magnifique, exactement comme demandé. Délai parfaitement respecté.', job: 'Meuble TV sur mesure', date: '2025-11-01' },
      { id: 'rv8', client: 'Omar S.', rating: 5, comment: 'Parquet posé impeccablement. Très beau rendu, je suis ravi.', job: 'Pose parquet salon', date: '2025-10-05' },
    ],
  },
  {
    id: 'a4', name: 'Adjoua Peinture', category: 'Peinture',
    location: 'Marcory, Abidjan', hourly_rate: 3500, rating: 4.5, review_count: 21,
    experience_years: 4, available: true,
    bio: 'Peintre décoratrice spécialisée en enduit, peinture intérieure et extérieure, avec des finitions soignées et des couleurs tendance.',
    skills: ['Peinture intérieure', 'Enduit décoratif', 'Peinture façade', 'Décoration murale'],
    services: [
      { name: 'Peinture pièce complète', price: 50000 },
      { name: 'Peinture appartement 3P', price: 180000 },
      { name: 'Enduit décoratif', price: 80000 },
    ],
    reviews: [
      { id: 'rv9', client: 'Patricia A.', rating: 5, comment: 'Appartement entièrement refait, rendu superbe ! Adjoua est très professionnelle.', job: 'Peinture appartement complet', date: '2025-10-28' },
      { id: 'rv10', client: 'Yves K.', rating: 4, comment: 'Travail minutieux et propre. Quelques retouches nécessaires mais globalement très satisfait.', job: 'Peinture salon', date: '2025-09-12' },
    ],
  },
  {
    id: 'a5', name: 'Kouassi Maçonnerie', category: 'Maçonnerie',
    location: 'Abobo, Abidjan', hourly_rate: 6000, rating: 4.7, review_count: 53,
    experience_years: 15, available: true,
    bio: 'Maçon qualifié, 15 ans d\'expérience en construction et rénovation. Gros œuvre, carrelage, rénovation de salle de bain et cuisine.',
    skills: ['Carrelage', 'Gros œuvre', 'Rénovation SDB', 'Chape', 'Enduit façade'],
    services: [
      { name: 'Pose carrelage (m²)', price: 8000 },
      { name: 'Rénovation salle de bain', price: 300000 },
      { name: 'Chape + carrelage', price: 200000 },
    ],
    reviews: [
      { id: 'rv11', client: 'Yvette N.', rating: 5, comment: 'Carrelage posé avec soin, résultat parfait ! Kouassi est très consciencieux.', job: 'Carrelage terrasse', date: '2025-11-08' },
      { id: 'rv12', client: 'Moustapha C.', rating: 5, comment: 'Rénovation salle de bain terminée dans les temps, très belle réalisation.', job: 'Rénovation SDB', date: '2025-10-15' },
    ],
  },
  {
    id: 'a6', name: 'Ama Climatisation', category: 'Climatisation',
    location: 'Cocody, Abidjan', hourly_rate: 8000, rating: 4.8, review_count: 29,
    experience_years: 6, available: true,
    bio: 'Technicienne en climatisation, installation, maintenance et dépannage toutes marques. Certifiée et outillée pour les installations résidentielles et professionnelles.',
    skills: ['Installation split', 'Maintenance préventive', 'Dépannage urgence', 'Recharge gaz'],
    services: [
      { name: 'Installation climatiseur split', price: 80000 },
      { name: 'Maintenance annuelle', price: 25000 },
      { name: 'Dépannage / urgence', price: 30000 },
    ],
    reviews: [
      { id: 'rv13', client: 'Brice F.', rating: 5, comment: 'Installation propre et rapide. Ama m\'a expliqué le fonctionnement et la maintenance.', job: 'Installation 2 splits', date: '2025-10-30' },
      { id: 'rv14', client: 'Nadia C.', rating: 5, comment: 'Intervention très professionnelle pour la maintenance. Clim fonctionne parfaitement.', job: 'Maintenance préventive', date: '2025-10-10' },
    ],
  },
];

function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function ProfileContent({ artisan, locale, t: _t, user, navigate }: {
  artisan: typeof MOCK_ARTISANS[0];
  locale: string; t: (k: string) => string;
  user: { role: string } | null;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const avg = artisan.reviews.reduce((s, r) => s + r.rating, 0) / artisan.reviews.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} />
        {locale === 'fr' ? 'Retour' : 'Back'}
      </button>

      {/* Hero card */}
      <Card className="mb-5">
        <CardBody>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl flex-shrink-0">
              {artisan.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{artisan.name}</h1>
                <Badge variant={artisan.available ? 'success' : 'default'}>
                  {artisan.available ? (locale === 'fr' ? 'Disponible' : 'Available') : (locale === 'fr' ? 'Indisponible' : 'Unavailable')}
                </Badge>
              </div>
              <p className="text-primary-600 font-semibold mb-2">{artisan.category}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><MapPin size={14} />{artisan.location}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} />{artisan.experience_years} {locale === 'fr' ? 'ans d\'exp.' : 'yrs exp.'}</span>
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <strong>{artisan.rating}</strong> ({artisan.review_count} {locale === 'fr' ? 'avis' : 'reviews'})
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(artisan.hourly_rate)}</p>
                <p className="text-xs text-gray-400">{locale === 'fr' ? 'par heure' : 'per hour'}</p>
              </div>
              {user?.role === 'client' && artisan.available && (
                <Button
                  onClick={() => navigate('/messages', { state: { pendingContact: { id: artisan.id, name: artisan.name } } })}
                  className="flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  {locale === 'fr' ? 'Contacter' : 'Contact'}
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Bio */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">{locale === 'fr' ? 'À propos' : 'About'}</h2></CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 leading-relaxed">{artisan.bio}</p>
            </CardBody>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">{locale === 'fr' ? 'Compétences' : 'Skills'}</h2></CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {artisan.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">{s}</span>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Stats */}
          <Card>
            <CardBody className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{artisan.experience_years}</p>
                <p className="text-xs text-gray-500">{locale === 'fr' ? 'Ans exp.' : 'Yrs exp.'}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-600">{artisan.rating}</p>
                <p className="text-xs text-gray-500">{locale === 'fr' ? 'Note moy.' : 'Avg rating'}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{artisan.review_count}</p>
                <p className="text-xs text-gray-500">{locale === 'fr' ? 'Avis' : 'Reviews'}</p>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-xl">
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(artisan.hourly_rate).replace('XOF', '').trim()}</p>
                <p className="text-xs text-gray-500">{locale === 'fr' ? 'FCFA/h' : 'XOF/hr'}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Services */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">{locale === 'fr' ? 'Services proposés' : 'Services offered'}</h2>
            </CardHeader>
            <CardBody className="divide-y divide-gray-100">
              {artisan.services.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{svc.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary-700">{formatCurrency(svc.price)}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{locale === 'fr' ? 'Avis clients' : 'Client reviews'}</h2>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold">{avg.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({artisan.reviews.length})</span>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {artisan.reviews.length === 0 ? (
                <EmptyState icon={Star} title={locale === 'fr' ? 'Aucun avis' : 'No reviews yet'} />
              ) : (
                artisan.reviews.map((rv) => (
                  <div key={rv.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                          {rv.client[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{rv.client}</p>
                          <p className="text-xs text-gray-400">{rv.job}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <StarRating value={rv.rating} />
                        <p className="text-xs text-gray-400 mt-0.5">{rv.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 pl-10">"{rv.comment}"</p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* CTA */}
          {user?.role === 'client' && artisan.available && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-primary-900">{locale === 'fr' ? `Prêt à contacter ${artisan.name.split(' ')[0]} ?` : `Ready to contact ${artisan.name.split(' ')[0]}?`}</p>
                <p className="text-sm text-primary-700 mt-0.5">{locale === 'fr' ? 'Démarrez une conversation directement.' : 'Start a conversation directly.'}</p>
              </div>
              <Button onClick={() => navigate('/messages', { state: { pendingContact: { id: artisan.id, name: artisan.name } } })} className="flex items-center gap-2 flex-shrink-0">
                <MessageSquare size={16} />
                {locale === 'fr' ? 'Contacter' : 'Contact'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { locale, t } = useLang();
  const navigate = useNavigate();

  const artisan = MOCK_ARTISANS.find((a) => a.id === id);

  if (!artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState icon={Briefcase} title={locale === 'fr' ? 'Artisan introuvable' : 'Artisan not found'}
          action={{ label: locale === 'fr' ? 'Retour' : 'Go back', onClick: () => navigate(-1) }} />
      </div>
    );
  }

  // Wrap in the right layout based on who's viewing
  if (user?.role === 'artisan') {
    return (
      <WorkerLayout>
        <ProfileContent artisan={artisan} locale={locale} t={t as (k: string) => string} user={user} navigate={navigate} />
      </WorkerLayout>
    );
  }

  if (user?.role === 'client') {
    return (
      <CustomerLayout>
        <ProfileContent artisan={artisan} locale={locale} t={t as (k: string) => string} user={user} navigate={navigate} />
      </CustomerLayout>
    );
  }

  // Guest (unauthenticated) — no layout wrapper
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xs">OI</span>
          </div>
          <span className="font-semibold text-gray-900">Ouvriers Ivoiriens</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
            {locale === 'fr' ? 'Connexion' : 'Sign in'}
          </Link>
          <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
            {locale === 'fr' ? 'S\'inscrire' : 'Get started'}
          </Link>
        </div>
      </div>
      <div className="p-6">
        <ProfileContent artisan={artisan} locale={locale} t={t as (k: string) => string} user={null} navigate={navigate} />
      </div>
    </div>
  );
}
