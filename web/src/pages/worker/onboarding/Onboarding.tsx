import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, Wrench, Image } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { useLang } from '../../../context/LangContext';
import { useToast } from '../../../components/ui/Toast';
import { useUpsertProfile } from '../../../hooks/useArtisanProfile';
import { cn } from '../../../lib/utils';

const categories = [
  { fr: 'Plomberie', en: 'Plumbing' },
  { fr: 'Électricité', en: 'Electrical' },
  { fr: 'Menuiserie', en: 'Carpentry' },
  { fr: 'Peinture', en: 'Painting' },
  { fr: 'Maçonnerie', en: 'Masonry' },
  { fr: 'Climatisation', en: 'Air Conditioning' },
  { fr: 'Soudure', en: 'Welding' },
  { fr: 'Autre', en: 'Other' },
];

function Step1({ data, setData, t }: { data: Record<string, string>; setData: (d: Record<string, string>) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Input label={t('phoneLabel')} type="tel" placeholder={t('phonePlaceholder')} value={data.phone || ''} onChange={(e) => setData({ ...data, phone: e.target.value })} />
      <Input label={t('locationLabel2')} placeholder={t('locationPlaceholder2')} value={data.location || ''} onChange={(e) => setData({ ...data, location: e.target.value })} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{t('bioLabel')}</label>
        <textarea rows={3} value={data.bio || ''} onChange={(e) => setData({ ...data, bio: e.target.value })} placeholder={t('bioPlaceholder')}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
      </div>
    </div>
  );
}

function Step2({ data, setData, t, locale }: { data: Record<string, string>; setData: (d: Record<string, string>) => void; t: (k: string) => string; locale: string }) {
  const [skills, setSkills] = useState<string[]>((data.skills || '').split(',').filter(Boolean));
  const [input, setInput] = useState('');

  const addSkill = () => {
    if (!input.trim() || skills.includes(input.trim())) return;
    const updated = [...skills, input.trim()];
    setSkills(updated);
    setData({ ...data, skills: updated.join(',') });
    setInput('');
  };

  return (
    <div className="space-y-4">
      <Select
        label={t('mainCategory')}
        value={data.category || ''}
        onChange={(e) => setData({ ...data, category: e.target.value })}
        options={[{ value: '', label: t('chooseDots') }, ...categories.map((c) => ({ value: c.fr, label: locale === 'en' ? c.en : c.fr }))]}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{t('skillsLabel')}</label>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder={t('skillsPlaceholder')}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <Button type="button" variant="secondary" onClick={addSkill}>{t('addSkill')}</Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                {s}
                <button type="button" onClick={() => { const u = skills.filter((x) => x !== s); setSkills(u); setData({ ...data, skills: u.join(',') }); }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Input label={t('experienceYears')} type="number" placeholder="5" value={data.experience_years || ''} onChange={(e) => setData({ ...data, experience_years: e.target.value })} />
    </div>
  );
}

function Step3({ data, setData, t }: { data: Record<string, string>; setData: (d: Record<string, string>) => void; t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <Input label={t('rateLabel')} type="number" placeholder={t('ratePlaceholder')} value={data.hourly_rate || ''} onChange={(e) => setData({ ...data, hourly_rate: e.target.value })} />
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">{t('rateTip')}</p>
        <p>{t('rateHint')}</p>
      </div>
    </div>
  );
}

function Step4({ t }: { t: (k: string) => string }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="space-y-4">
      <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer block">
        <Image size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">{t('uploadLabel')}</p>
        <p className="text-xs text-gray-400 mt-1">{t('uploadSub')}</p>
        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
      </label>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <span key={f.name} className="text-xs bg-gray-100 px-2 py-1 rounded">{f.name}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 text-center">{t('uploadHint')}</p>
    </div>
  );
}

export function Onboarding() {
  const { t, locale } = useLang();
  const toast = useToast();
  const navigate = useNavigate();
  const upsert = useUpsertProfile();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});

  const steps = [
    { label: t('onboardingStep1'), icon: User },
    { label: t('onboardingStep2'), icon: Wrench },
    { label: t('onboardingStep3'), icon: CheckCircle },
    { label: t('onboardingStep4'), icon: Image },
  ];

  const isLast = step === steps.length - 1;

  const handleNext = async () => {
    if (!isLast) { setStep((s) => s + 1); return; }

    try {
      await upsert.mutateAsync({
        bio: data.bio,
        category: data.category,
        hourly_rate: data.hourly_rate ? Number(data.hourly_rate) : undefined,
        experience_years: data.experience_years ? Number(data.experience_years) : undefined,
        skills: data.skills ? data.skills.split(',').filter(Boolean) : [],
      });
      toast.success(locale === 'fr' ? 'Profil créé avec succès' : 'Profile created successfully');
      navigate('/dashboard/worker');
    } catch {
      toast.error(locale === 'fr' ? 'Erreur lors de la création du profil' : 'Failed to create profile');
    }
  };

  const stepContent = [
    <Step1 data={data} setData={setData} t={t as (k: string) => string} />,
    <Step2 data={data} setData={setData} t={t as (k: string) => string} locale={locale} />,
    <Step3 data={data} setData={setData} t={t as (k: string) => string} />,
    <Step4 t={t as (k: string) => string} />,
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">OI</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">Ouvriers Ivoiriens</span>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((_s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500')}>
                  {done ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 w-10 transition-colors ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              {locale === 'en'
                ? `Step ${step + 1} of ${steps.length} — ${steps[step].label}`
                : `Étape ${step + 1} sur ${steps.length} — ${steps[step].label}`}
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {stepContent[step]}
            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">{t('back')}</Button>
              )}
              <Button onClick={handleNext} loading={upsert.isPending && isLast} className="flex-1">
                {isLast ? t('finishOnboarding') : t('continue')}
              </Button>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4">{t('onboardingFooter')}</p>
      </div>
    </div>
  );
}
