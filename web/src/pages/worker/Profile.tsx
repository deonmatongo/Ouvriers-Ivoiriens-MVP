import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, ExternalLink, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useMyProfile, useUpsertProfile, useUploadAvatar } from '../../hooks/useArtisanProfile';

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

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  bio: z.string().max(500).optional(),
  category: z.string().optional(),
  hourly_rate: z.string().optional(),
  experience_years: z.string().optional(),
  location: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function WorkerProfile() {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const toast = useToast();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [skills, setSkills] = useState<string[]>(['Installation', 'Dépannage', 'Rénovation']);
  const [newSkill, setNewSkill] = useState('');

  const { data: profile, isLoading } = useMyProfile();
  const upsert = useUpsertProfile();
  const uploadAvatar = useUploadAvatar();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', phone: '', bio: '', category: '', hourly_rate: '', experience_years: '', location: '' },
  });

  const watchedFields = watch(['name', 'phone', 'bio', 'category', 'hourly_rate', 'experience_years', 'location']);
  const completeness = Math.round(
    ([watchedFields[0], watchedFields[1], watchedFields[2], watchedFields[3], watchedFields[4], watchedFields[5], watchedFields[6]]
      .filter(Boolean).length / 7) * 100
  );

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: user?.name || '',
        phone: user?.phone || '',
        bio: profile.bio || '',
        category: profile.category || '',
        hourly_rate: profile.hourly_rate?.toString() || '',
        experience_years: profile.experience_years?.toString() || '',
        location: '',
      });
    }
  }, [profile, user, reset]);

  const handleAddSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); }
    setNewSkill('');
  };

  const handleRemoveSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const onSubmit = async (data: FormData) => {
    try {
      await upsert.mutateAsync({
        bio: data.bio,
        category: data.category,
        hourly_rate: data.hourly_rate ? Number(data.hourly_rate) : undefined,
        experience_years: data.experience_years ? Number(data.experience_years) : undefined,
      });
      toast.success(locale === 'fr' ? 'Profil mis à jour' : 'Profile updated');
      reset(data);
    } catch {
      toast.error(locale === 'fr' ? 'Erreur lors de la mise à jour' : 'Failed to update profile');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success(locale === 'fr' ? 'Photo mise à jour' : 'Photo updated');
    } catch {
      toast.error(locale === 'fr' ? 'Erreur lors de l\'upload' : 'Upload failed');
    }
  };

  if (isLoading) {
    return (
      <WorkerLayout>
        <div className="max-w-2xl mx-auto">
          <Card><CardBody><ProfileSkeleton /></CardBody></Card>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('workerProfileTitle')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('workerProfileSub')}</p>
          </div>
          <Link
            to={`/artisans/${user?.id ?? 'me'}`}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors"
          >
            <ExternalLink size={14} />
            {t('viewPublicProfile')}
          </Link>
        </div>

        {/* Completeness bar */}
        <Card className="mb-4">
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">{t('profileCompletenessTitle')}</span>
              <span className={`text-sm font-bold ${completeness >= 80 ? 'text-green-600' : completeness >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{completeness}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 && (
              <p className="text-xs text-gray-400 mt-1.5">{t('profileCompletenessSub')}</p>
            )}
          </CardBody>
        </Card>

        {/* Avatar */}
        <Card className="mb-4">
          <CardBody className="flex items-center gap-4">
            <div className="relative">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow disabled:opacity-60"
              >
                <Camera size={14} />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {!user?.phone_verified && (
                <a href="/verify-phone" className="text-xs text-primary-600 hover:underline mt-0.5 block">
                  {locale === 'fr' ? 'Vérifier mon téléphone' : 'Verify my phone'}
                </a>
              )}
            </div>
          </CardBody>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-4">
            <CardHeader><h2 className="font-semibold text-gray-900">{t('personalInfo')}</h2></CardHeader>
            <CardBody className="space-y-4">
              <Input label={t('nameLabel')} error={errors.name?.message} {...register('name')} />
              <Input label={t('phoneLabel')} type="tel" placeholder={t('phonePlaceholder')} error={errors.phone?.message} {...register('phone')} />
              <Input label={t('locationLabel2')} placeholder={t('locationPlaceholder2')} {...register('location')} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{t('bioLabel')}</label>
                <textarea rows={3} placeholder={t('bioPlaceholder')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  {...register('bio')} />
              </div>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader><h2 className="font-semibold text-gray-900">{t('professionalInfo')}</h2></CardHeader>
            <CardBody className="space-y-4">
              <Select
                label={t('mainCategory')}
                error={errors.category?.message}
                options={[{ value: '', label: t('chooseDots') }, ...categories.map((c) => ({ value: c.fr, label: locale === 'en' ? c.en : c.fr }))]}
                {...register('category')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('hourlyRate')} type="number" placeholder="5000" {...register('hourly_rate')} />
                <Input label={t('experienceYears')} type="number" placeholder="5" {...register('experience_years')} />
              </div>
            </CardBody>
          </Card>

        {/* Skills */}
        <Card className="mb-4">
          <CardHeader><h2 className="font-semibold text-gray-900">{t('skillsLabel')}</h2></CardHeader>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full border border-primary-200">
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="text-primary-400 hover:text-primary-700 transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-gray-400">{locale === 'fr' ? 'Aucune compétence ajoutée' : 'No skills added yet'}</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder={t('skillsChipPlaceholder')}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors"
              >
                <Plus size={14} /> {t('addSkill')}
              </button>
            </div>
          </CardBody>
        </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>{t('saveChanges')}</Button>
          </div>
        </form>
      </div>
    </WorkerLayout>
  );
}
