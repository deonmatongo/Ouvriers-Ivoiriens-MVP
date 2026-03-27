import { useState } from 'react';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useMyProfile, useUpsertProfile } from '../../hooks/useArtisanProfile';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';

// Services are stored as structured strings in the profile skills array
// Format: "name::description::price"
// Replace with a dedicated /artisans/services endpoint in Phase 2 backend

interface ParsedService {
  id: string;
  name: string;
  description: string;
  price: number;
}

function parseServices(skills: string[]): ParsedService[] {
  return skills
    .filter((s) => s.includes('::'))
    .map((s, i) => {
      const [name, description, price] = s.split('::');
      return { id: String(i), name, description, price: Number(price) || 0 };
    });
}

function serializeServices(services: ParsedService[]): string[] {
  return services.map((s) => `${s.name}::${s.description}::${s.price}`);
}

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export function WorkerServices() {
  const { t } = useLang();
  const toast = useToast();
  const { data: profile, isLoading } = useMyProfile();
  const upsert = useUpsertProfile();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ParsedService | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', price: '' },
  });

  const services = parseServices(profile?.skills ?? []);
  const otherSkills = (profile?.skills ?? []).filter((s) => !s.includes('::'));

  const saveServices = async (updated: ParsedService[]) => {
    const allSkills = [...otherSkills, ...serializeServices(updated)];
    await upsert.mutateAsync({ skills: allSkills });
  };

  const onSubmit = async (data: FormData) => {
    try {
      let updated: ParsedService[];
      if (editing) {
        updated = services.map((s) =>
          s.id === editing.id ? { ...s, name: data.name, description: data.description || '', price: Number(data.price) } : s
        );
      } else {
        updated = [...services, { id: Date.now().toString(), name: data.name, description: data.description || '', price: Number(data.price) }];
      }
      await saveServices(updated);
      toast.success(editing ? (t('saveChanges')) : t('addService'));
      reset(); setShowForm(false); setEditing(null);
    } catch {
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (s: ParsedService) => {
    setEditing(s);
    reset({ name: s.name, description: s.description, price: String(s.price) });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await saveServices(services.filter((s) => s.id !== id));
      toast.success('Service removed');
    } catch {
      toast.error('Failed to remove service');
    }
  };

  const handleCancel = () => { setShowForm(false); setEditing(null); reset(); };

  return (
    <WorkerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('workerServicesTitle')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('workerServicesSub')}</p>
        </div>
        <Button onClick={() => { setEditing(null); reset(); setShowForm(true); }}>
          <Plus size={16} />{t('addService')}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-4 border-primary-200">
          <CardBody>
            <h3 className="font-semibold text-gray-900 mb-4">{editing ? t('saveChanges') : t('newService')}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label={t('serviceNameLabel')} placeholder={t('serviceNamePlaceholder')} error={errors.name?.message} {...register('name')} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{t('serviceDescLabel')}</label>
                <textarea rows={2} placeholder={t('serviceDescPlaceholder')}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  {...register('description')} />
              </div>
              <Input label={t('servicePriceLabel')} type="number" placeholder="15000" error={errors.price?.message} {...register('price')} />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">{t('cancel')}</Button>
                <Button type="submit" loading={isSubmitting} className="flex-1">{t('save')}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}><CardBody className="flex items-center gap-4"><Skeleton className="flex-1 h-10" /></CardBody></Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wrench}
            title={t('noServices')}
            description={t('noServicesSub')}
            action={{ label: t('addService'), onClick: () => setShowForm(true) }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardBody className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                  {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-primary-600">{formatCurrency(s.price)}</span>
                  <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
}
