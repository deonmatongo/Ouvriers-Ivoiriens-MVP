import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

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
  category: z.string().min(1),
  hourly_rate: z.string().optional(),
  experience_years: z.string().optional(),
  location: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function WorkerProfile() {
  const { user } = useAuth();
  const { t, locale } = useLang();

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', phone: '', bio: '', category: '', hourly_rate: '', experience_years: '', location: '' },
  });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 800));
  };

  return (
    <WorkerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('workerProfileTitle')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('workerProfileSub')}</p>
        </div>

        <Card className="mb-4">
          <CardBody className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
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
                <textarea
                  rows={3}
                  placeholder={t('bioPlaceholder')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  {...register('bio')}
                />
              </div>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader><h2 className="font-semibold text-gray-900">{t('professionalInfo')}</h2></CardHeader>
            <CardBody className="space-y-4">
              <Select
                label={t('mainCategory')}
                error={errors.category?.message}
                options={[
                  { value: '', label: t('chooseDots') },
                  ...categories.map((c) => ({ value: c.fr, label: locale === 'en' ? c.en : c.fr })),
                ]}
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
