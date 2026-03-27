import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
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
  title: z.string().min(5),
  category: z.string().min(1),
  description: z.string().min(20),
  location_address: z.string().min(3),
  budget: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function PostJob() {
  const navigate = useNavigate();
  const { t, locale } = useLang();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: '' },
  });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 800));
    navigate('/dashboard/customer/jobs');
  };

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('postJobTitle')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('postJobSub')}</p>
        </div>

        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">{t('jobDetailsTitle')}</h2></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label={t('jobTitleLabel')} placeholder={t('jobTitlePlaceholder')} error={errors.title?.message} {...register('title')} />

              <Select
                label={t('categoryLabel')}
                error={errors.category?.message}
                options={[
                  { value: '', label: t('categoryPlaceholder') },
                  ...categories.map((c) => ({ value: c.fr, label: locale === 'en' ? c.en : c.fr })),
                ]}
                {...register('category')}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{t('descriptionLabel')}</label>
                <textarea
                  rows={4}
                  placeholder={t('descriptionPlaceholder')}
                  className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
              </div>

              <Input label={t('locationLabel')} placeholder={t('locationPlaceholder')} error={errors.location_address?.message} {...register('location_address')} />
              <Input label={t('budgetLabel')} type="number" placeholder={t('budgetPlaceholder')} {...register('budget')} />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">{t('cancel')}</Button>
                <Button type="submit" loading={isSubmitting} className="flex-1">{t('publish')}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </CustomerLayout>
  );
}
