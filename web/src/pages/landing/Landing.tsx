import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import {
  Zap, Shield, MessageSquare, Star, Wifi, Globe,
  ArrowRight, ChevronRight,
  Droplets, Wrench, TreePine, Paintbrush, Hammer, Wind, Flame, MoreHorizontal,
} from 'lucide-react';

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const { t, locale, toggle } = useLang();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">OI</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Ouvriers Ivoiriens</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t('landingNav_howItWorks')}</a>
          <a href="#categories" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t('landingNav_categories')}</a>
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t('landingNav_features')}</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {locale === 'fr' ? 'EN' : 'FR'}
          </button>
          <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            {t('landingNav_login')}
          </Link>
          <Link
            to="/register"
            className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('landingNav_register')}
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { t } = useLang();

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 via-white to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary-100">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            {t('landingHero_badge')}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            {t('landingHero_title1')}{' '}
            <span className="text-primary-600 relative">
              {t('landingHero_title2')}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8.5C60 3 120 2 180 5S260 10 298 8.5" stroke="#f98a08" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{' '}
            {t('landingHero_title3')}
          </h1>

          <p className="text-xl text-gray-500 mb-8 max-w-2xl leading-relaxed">
            {t('landingHero_sub')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors text-base shadow-lg shadow-primary-200"
            >
              {t('landingHero_ctaClient')}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-base border border-gray-200"
            >
              {t('landingHero_ctaArtisan')}
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Trust signal */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['M', 'A', 'K', 'F'].map((l, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: ['#f98a08', '#dd6603', '#b74607', '#94360d'][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-gray-500">{t('landingHero_trust')}</p>
          </div>
        </div>

        {/* Hero image / mockup */}
        <div className="absolute right-0 top-0 bottom-0 hidden xl:flex items-center">
          <div className="w-[420px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Mock app header */}
            <div className="bg-primary-600 px-6 py-5">
              <p className="text-white/70 text-xs mb-1">Ouvriers Ivoiriens</p>
              <p className="text-white font-semibold">Bonjour, Marie 👋</p>
            </div>
            {/* Mock job cards */}
            <div className="p-4 space-y-3">
              {[
                { title: 'Réparation fuite d\'eau', cat: 'Plomberie', status: 'En cours', color: 'bg-blue-100 text-blue-700', price: '45 000 XOF' },
                { title: 'Installation électrique', cat: 'Électricité', status: 'Devis reçu', color: 'bg-yellow-100 text-yellow-700', price: '80 000 XOF' },
                { title: 'Peinture salon', cat: 'Peinture', status: 'Terminé', color: 'bg-green-100 text-green-700', price: '120 000 XOF' },
              ].map((job, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{job.cat}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.color}`}>{job.status}</span>
                    <span className="text-xs font-semibold text-gray-700">{job.price}</span>
                  </div>
                </div>
              ))}
              <div className="bg-primary-600 rounded-xl p-4 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary-200">Nouvelle demande</p>
                  <p className="font-semibold text-sm mt-0.5">+ Publier un travail</p>
                </div>
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const { t } = useLang();

  const stats = [
    { value: '1 200+', label: t('landingStats_artisans') },
    { value: '8 400+', label: t('landingStats_jobs') },
    { value: '14',     label: t('landingStats_cities') },
    { value: '4.8 / 5', label: t('landingStats_rating') },
  ];

  return (
    <section className="py-14 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold text-white mb-1">{value}</p>
              <p className="text-primary-200 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const { t } = useLang();

  const steps = [
    { num: '01', title: t('landingHow_step1_title'), desc: t('landingHow_step1_desc'), icon: '📋' },
    { num: '02', title: t('landingHow_step2_title'), desc: t('landingHow_step2_desc'), icon: '💬' },
    { num: '03', title: t('landingHow_step3_title'), desc: t('landingHow_step3_desc'), icon: '✅' },
  ];

  return (
    <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {t('landingHow_badge')}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{t('landingHow_title')}</h2>
          <p className="text-gray-500 text-lg">{t('landingHow_sub')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-primary-100 z-0" />

          {steps.map(({ num, title, desc, icon }, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-5">
                {icon}
              </div>
              <div className="absolute top-6 right-6 text-5xl font-black text-gray-50 select-none">{num}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function Categories() {
  const { t, locale } = useLang();

  const cats = [
    { icon: Droplets, label: locale === 'fr' ? 'Plomberie' : 'Plumbing', color: 'bg-blue-50 text-blue-600' },
    { icon: Zap, label: locale === 'fr' ? 'Électricité' : 'Electrical', color: 'bg-yellow-50 text-yellow-600' },
    { icon: TreePine, label: locale === 'fr' ? 'Menuiserie' : 'Carpentry', color: 'bg-green-50 text-green-700' },
    { icon: Paintbrush, label: locale === 'fr' ? 'Peinture' : 'Painting', color: 'bg-pink-50 text-pink-600' },
    { icon: Hammer, label: locale === 'fr' ? 'Maçonnerie' : 'Masonry', color: 'bg-stone-50 text-stone-600' },
    { icon: Wind, label: locale === 'fr' ? 'Climatisation' : 'HVAC', color: 'bg-cyan-50 text-cyan-600' },
    { icon: Flame, label: locale === 'fr' ? 'Soudure' : 'Welding', color: 'bg-orange-50 text-orange-600' },
    { icon: MoreHorizontal, label: locale === 'fr' ? 'Autre' : 'Other', color: 'bg-gray-50 text-gray-600' },
  ];

  return (
    <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {t('landingCat_badge')}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{t('landingCat_title')}</h2>
          <p className="text-gray-500 text-lg">{t('landingCat_sub')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {cats.map(({ icon: Icon, label, color }) => (
            <Link
              key={label}
              to="/register"
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all bg-white"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const { t } = useLang();

  const features = [
    { icon: Shield,       title: t('landingFeatures_1_title'), desc: t('landingFeatures_1_desc'), color: 'bg-blue-50 text-blue-600' },
    { icon: Wrench,       title: t('landingFeatures_2_title'), desc: t('landingFeatures_2_desc'), color: 'bg-green-50 text-green-600' },
    { icon: MessageSquare,title: t('landingFeatures_3_title'), desc: t('landingFeatures_3_desc'), color: 'bg-purple-50 text-purple-600' },
    { icon: Star,         title: t('landingFeatures_4_title'), desc: t('landingFeatures_4_desc'), color: 'bg-yellow-50 text-yellow-600' },
    { icon: Wifi,         title: t('landingFeatures_5_title'), desc: t('landingFeatures_5_desc'), color: 'bg-cyan-50 text-cyan-600' },
    { icon: Globe,        title: t('landingFeatures_6_title'), desc: t('landingFeatures_6_desc'), color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {t('landingFeatures_badge')}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{t('landingFeatures_title')}</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t('landingFeatures_sub')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Category Reviews ──────────────────────────────────────────────────────────

const CATEGORY_REVIEWS = [
  { id: 1, category: 'Électricité', clientName: 'Konan Marius', location: 'Cocody', artisanName: 'Konan Électricité', rating: 5, text_fr: 'J\'ai trouvé un électricien en moins de 10 minutes. Tableau refait proprement, prix transparent. Je recommande vraiment.', text_en: 'Found an electrician in under 10 minutes. Panel redone cleanly, transparent pricing. Highly recommend.' },
  { id: 2, category: 'Plomberie', clientName: 'Adjoua Florence', location: 'Yopougon', artisanName: 'Fatou Plomberie', rating: 5, text_fr: 'La fuite était réparée en 2 heures. Intervention rapide, sans dégâts. Très professionnel.', text_en: 'The leak was fixed in 2 hours. Quick response, no mess. Very professional.' },
  { id: 3, category: 'Menuiserie', clientName: 'Yao Brice', location: 'Plateau', artisanName: 'Ibrahim Menuiserie', rating: 5, text_fr: 'Mes meubles sur mesure sont magnifiques. Ibrahim a compris exactement ce que je voulais. Travail soigné.', text_en: 'My custom furniture is beautiful. Ibrahim understood exactly what I wanted. Neat work.' },
  { id: 4, category: 'Peinture', clientName: 'Awa Diallo', location: 'Marcory', artisanName: 'Adjoua Peinture', rating: 5, text_fr: 'Peinture du salon terminée en une journée. Rendu impeccable, propre et bien fini. Très satisfaite.', text_en: 'Living room painted in one day. Impeccable, clean, and well-finished result. Very satisfied.' },
  { id: 5, category: 'Maçonnerie', clientName: 'Gbané Seydou', location: 'Abobo', artisanName: 'Kouassi Maçonnerie', rating: 5, text_fr: 'Carrelage de toute la maison, travail parfait. Kouassi est sérieux et ponctuel. Je le recommande sans hésiter.', text_en: 'Tiled the whole house, perfect work. Kouassi is serious and punctual. I recommend without hesitation.' },
  { id: 6, category: 'Climatisation', clientName: 'Tanon Marie', location: 'Cocody', artisanName: 'Ama Climatisation', rating: 5, text_fr: 'Installation du climatiseur faite proprement. Ama explique bien et le SAV est réactif. Top.', text_en: 'AC unit installed cleanly. Ama explains well and after-sales service is responsive. Top.' },
  { id: 7, category: 'Électricité', clientName: 'Koffi Théodore', location: 'Treichville', artisanName: 'Konan Électricité', rating: 4, text_fr: 'Dépannage électrique résolu rapidement. Bon rapport qualité/prix. Reviendra en cas de besoin.', text_en: 'Electrical fault resolved quickly. Good value for money. Will come back if needed.' },
  { id: 8, category: 'Plomberie', clientName: 'Bamba Sali', location: 'Angré', artisanName: 'Fatou Plomberie', rating: 5, text_fr: 'Débouchage et remplacement des tuyaux. Résultat nickel. Fatou est efficace et honnête sur les prix.', text_en: 'Unblocking and pipe replacement. Spotless result. Fatou is efficient and honest about pricing.' },
  { id: 9, category: 'Menuiserie', clientName: 'Coulibaly N\'Golo', location: 'Yopougon', artisanName: 'Ibrahim Menuiserie', rating: 5, text_fr: 'Pose de parquet dans 3 pièces. Résultat superbe. Ibrahim respecte les délais annoncés.', text_en: 'Parquet flooring in 3 rooms. Superb result. Ibrahim keeps to announced deadlines.' },
  { id: 10, category: 'Peinture', clientName: 'Kouamé Roselyne', location: 'Cocody', artisanName: 'Adjoua Peinture', rating: 5, text_fr: 'Décoration complète du bureau. Adjoua a des idées créatives et un travail soigné. Très content.', text_en: 'Full office decoration. Adjoua has creative ideas and neat work. Very happy.' },
  { id: 11, category: 'Maçonnerie', clientName: 'Touré Ibrahim', location: 'Abobo', artisanName: 'Kouassi Maçonnerie', rating: 4, text_fr: 'Renovation salle de bain complète. Délai un peu long mais résultat à la hauteur. Bonne expérience.', text_en: 'Full bathroom renovation. Took a bit long but result is up to par. Good experience.' },
  { id: 12, category: 'Climatisation', clientName: 'Dembélé Fatou', location: 'Plateau', artisanName: 'Ama Climatisation', rating: 5, text_fr: 'Maintenance annuelle et recharge. Ama connait très bien son métier. Prix compétitif.', text_en: 'Annual maintenance and recharge. Ama knows the trade very well. Competitive price.' },
];

const REVIEW_CATEGORIES = ['Électricité', 'Plomberie', 'Menuiserie', 'Peinture', 'Maçonnerie', 'Climatisation'];

function CategoryReviews() {
  const { t, locale } = useLang();
  const [activeTab, setActiveTab] = useState('');

  const filtered = activeTab ? CATEGORY_REVIEWS.filter((r) => r.category === activeTab) : CATEGORY_REVIEWS;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {t('landingReviews_badge')}
          </span>
          <h2 className="text-4xl font-bold text-gray-900">{t('landingReviews_title')}</h2>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveTab('')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!activeTab ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
          >
            {t('landingReviews_all')}
          </button>
          {REVIEW_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat === activeTab ? '' : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full flex-shrink-0">{review.category}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">"{locale === 'fr' ? review.text_fr : review.text_en}"</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                    {review.clientName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.clientName}</p>
                    <p className="text-xs text-gray-400">{review.location}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-right">{t('landingReviews_artisanLabel')}<br /><span className="text-gray-600 font-medium">{review.artisanName}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  const { t } = useLang();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-700 rounded-full translate-x-1/2 translate-y-1/2 opacity-50" />
      </div>
      <div className="max-w-3xl mx-auto text-center relative">
        <h2 className="text-4xl font-bold text-white mb-4">{t('landingCTA_title')}</h2>
        <p className="text-primary-100 text-lg mb-10">{t('landingCTA_sub')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors text-base"
          >
            {t('landingCTA_client')} <ArrowRight size={18} />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-800 transition-colors text-base border border-primary-500"
          >
            {t('landingCTA_artisan')} <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-gray-900 text-gray-400 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">OI</span>
              </div>
              <span className="font-bold text-white text-lg">Ouvriers Ivoiriens</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">{t('landingFooter_desc')}</p>
            <div className="flex gap-2 mt-5">
              {['🇨🇮', '🇬🇧'].map((flag) => (
                <span key={flag} className="text-xl">{flag}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('landingFooter_links')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">{t('landingCTA_client')}</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">{t('landingCTA_artisan')}</Link></li>
              <li><a href="#how" className="hover:text-white transition-colors">{t('landingNav_howItWorks')}</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">{t('landingNav_login')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t('landingFooter_legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">{t('landingFooter_about')}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{t('landingFooter_contact')}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{t('landingFooter_faq')}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{t('landingFooter_terms')}</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">{t('landingFooter_privacy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2025 Ouvriers Ivoiriens. {t('landingFooter_rights')}</p>
          <div className="flex gap-3">
            {[
              { icon: '🔧', label: 'GET IT ON Google Play' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg text-xs text-gray-300">
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Categories />
      <Features />
      <CategoryReviews />
      <CTA />
      <Footer />
    </div>
  );
}
