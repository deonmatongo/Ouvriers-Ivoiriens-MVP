import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';

const schema = z.object({ email: z.string().email('Email invalide') });
type FormData = z.infer<typeof schema>;

export function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    // Future: call POST /auth/forgot-password
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center py-8">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email envoyé</h2>
          <p className="text-gray-500 text-sm mb-6">
            Si cette adresse est associée à un compte, vous recevrez un lien de réinitialisation.
          </p>
          <Link to="/login" className="text-primary-600 font-medium hover:underline text-sm">
            ← Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</h2>
      <p className="text-gray-500 text-sm mb-8">
        Saisissez votre email pour recevoir un lien de réinitialisation.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="vous@exemple.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Envoyer le lien
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        <Link to="/login" className="text-primary-600 hover:underline">← Retour à la connexion</Link>
      </p>
    </AuthLayout>
  );
}
