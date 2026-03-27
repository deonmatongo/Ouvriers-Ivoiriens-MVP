import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera } from 'lucide-react';
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

  const { data: profile, isLoading } = useMyProfile();
  const upsert = useUpsertProfile();
  const uploadAvatar = useUploadAvatar();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', phone: '', bio: '', category: '', hourly_rate: '', experience_years: '', location: '' },
  });

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('workerProfileTitle')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('workerProfileSub')}</p>
        </div>

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

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>{t('saveChanges')}</Button>
          </div>
        </form>
      </div>
    </WorkerLayout>
  );
}
