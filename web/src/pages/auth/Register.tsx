import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { User, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(['client', 'artisan']),
});
type FormData = z.infer<typeof schema>;

export function Register() {
  const { register: authRegister } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [role, setRole] = useState<'client' | 'artisan'>('client');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' },
  });

  const selectRole = (r: 'client' | 'artisan') => { setRole(r); setValue('role', r); };

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister(data);
      if (data.role === 'artisan') navigate('/dashboard/worker');
      else navigate('/dashboard/customer');
    } catch {
      setError('root', { message: t('genericError') });
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('registerTitle')}</h2>
      <p className="text-gray-500 text-sm mb-6">{t('registerSub')}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {([
          { value: 'client' as const, icon: User, label: t('clientLabel'), sub: t('clientSub') },
          { value: 'artisan' as const, icon: Wrench, label: t('artisanLabel'), sub: t('artisanSub') },
        ]).map(({ value, icon: Icon, label, sub }) => (
          <button
            key={value}
            type="button"
            onClick={() => selectRole(value)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
              role === value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Icon size={24} className={role === value ? 'text-primary-600' : 'text-gray-400'} />
            <div className="text-center">
              <p className={`text-sm font-semibold ${role === value ? 'text-primary-700' : 'text-gray-700'}`}>{label}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}
        <Input label={t('nameLabel')} placeholder={t('namePlaceholder')} error={errors.name?.message} {...register('name')} />
        <Input label={t('emailLabel')} type="email" placeholder={t('emailPlaceholder')} error={errors.email?.message} {...register('email')} />
        <Input label={t('phoneLabel')} type="tel" placeholder={t('phonePlaceholder')} {...register('phone')} />
        <Input label={t('passwordMinLabel')} type="password" placeholder={t('passwordMinPlaceholder')} error={errors.password?.message} {...register('password')} />

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">{t('registerBtn')}</Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {t('alreadyAccount')}{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">{t('signIn')}</Link>
      </p>
    </AuthLayout>
  );
}
