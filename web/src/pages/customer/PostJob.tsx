import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const categories = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Peinture',
  'Maçonnerie', 'Climatisation', 'Soudure', 'Autre',
];

const schema = z.object({
  title: z.string().min(5, 'Minimum 5 caractères'),
  category: z.string().min(1, 'Choisissez une catégorie'),
  description: z.string().min(20, 'Minimum 20 caractères'),
  location_address: z.string().min(3, 'Adresse requise'),
  budget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function PostJob() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: '' },
  });

  const onSubmit = async (_data: FormData) => {
    // Future: await api.post('/jobs', { ...data, budget: data.budget ? Number(data.budget) : undefined })
    await new Promise((r) => setTimeout(r, 800));
    navigate('/dashboard/customer/jobs');
  };

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
          <p className="text-gray-500 text-sm mt-1">Décrivez votre besoin et recevez des devis d'artisans</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Détails de la demande</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Titre de la demande"
                placeholder="Ex: Réparation fuite d'eau sous évier"
                error={errors.title?.message}
                {...register('title')}
              />

              <Select
                label="Catégorie"
                error={errors.category?.message}
                options={[
                  { value: '', label: 'Choisir une catégorie...' },
                  ...categories.map((c) => ({ value: c, label: c })),
                ]}
                {...register('category')}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  placeholder="Décrivez le problème en détail, l'urgence, les matériaux éventuels..."
                  className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                    errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>

              <Input
                label="Adresse / Localisation"
                placeholder="Ex: Cocody Riviera 3, Abidjan"
                error={errors.location_address?.message}
                {...register('location_address')}
              />

              <Input
                label="Budget estimé (FCFA, optionnel)"
                type="number"
                placeholder="Ex: 50000"
                {...register('budget')}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" loading={isSubmitting} className="flex-1">
                  Publier la demande
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </CustomerLayout>
  );
}
