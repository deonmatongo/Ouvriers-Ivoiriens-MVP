import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { authApi } from '../../lib/apiService';

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { t } = useLang();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
    } catch {
      // Silently succeed to prevent email enumeration
    } finally {
      setSent(true);
      toast.info(t('emailSentTitle'));
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center py-8">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('emailSentTitle')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t('emailSentSub')}</p>
          <Link to="/login" className="text-primary-600 font-medium hover:underline text-sm">{t('backToLogin')}</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('forgotTitle')}</h2>
      <p className="text-gray-500 text-sm mb-8">{t('forgotSub')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('emailLabel')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">{t('sendLink')}</Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        <Link to="/login" className="text-primary-600 hover:underline">{t('backToLogin')}</Link>
      </p>
    </AuthLayout>
  );
}
