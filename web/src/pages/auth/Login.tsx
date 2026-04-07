import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'artisan') navigate('/dashboard/worker');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard/customer');
    } catch {
      setError('root', { message: t('invalidCredentials') });
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('loginTitle')}</h2>
      <p className="text-gray-500 text-sm mb-8">{t('loginSub')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}
        <Input label={t('emailLabel')} type="email" placeholder={t('emailPlaceholder')} error={errors.email?.message} {...register('email')} />
        <Input label={t('passwordLabel')} type="password" placeholder={t('passwordPlaceholder')} error={errors.password?.message} {...register('password')} />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">{t('forgotPassword')}</Link>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">{t('loginBtn')}</Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {t('noAccount')}{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">{t('signUp')}</Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-6 border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Comptes démo / Demo accounts</p>
        {[
          { label: 'Client', email: 'client@test.com' },
          { label: 'Artisan', email: 'artisan@test.com' },
          { label: 'Admin', email: 'admin@test.com' },
        ].map(({ label, email }) => (
          <div key={email} className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">{label}</span>
            <span className="text-gray-400 font-mono">{email} / password123</span>
          </div>
        ))}
      </div>
    </AuthLayout>
  );
}
