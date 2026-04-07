import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
// Mock auth API for demo — replace with real authApi when backend is live
const authApi = {
  sendOTP: async (_phone: string) => { await new Promise((r) => setTimeout(r, 800)); },
  verifyOTP: async (_phone: string, _code: string) => {
    await new Promise((r) => setTimeout(r, 800));
    // Accept any 6-digit code for demo
  },
};

export function VerifyPhone() {
  const { user } = useAuth();
  const { locale } = useLang();
  const toast = useToast();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSend = async () => {
    if (!phone) return;
    setSending(true);
    try {
      await authApi.sendOTP(phone);
      setStep('code');
      toast.success(locale === 'fr' ? 'Code envoyé par SMS' : 'Code sent by SMS');
    } catch {
      toast.error(locale === 'fr' ? 'Erreur lors de l\'envoi du code' : 'Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) return;
    setVerifying(true);
    try {
      await authApi.verifyOTP(phone, code);
      toast.success(locale === 'fr' ? 'Numéro vérifié avec succès' : 'Phone number verified');
      navigate(user?.role === 'artisan' ? '/dashboard/worker' : '/dashboard/customer');
    } catch {
      toast.error(locale === 'fr' ? 'Code invalide ou expiré' : 'Invalid or expired code');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        {locale === 'fr' ? 'Vérification du téléphone' : 'Phone verification'}
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        {step === 'phone'
          ? (locale === 'fr' ? 'Entrez votre numéro pour recevoir un code.' : 'Enter your number to receive a code.')
          : (locale === 'fr' ? `Code envoyé au ${phone}` : `Code sent to ${phone}`)}
      </p>

      {step === 'phone' ? (
        <div className="space-y-4">
          <Input
            label={locale === 'fr' ? 'Numéro de téléphone' : 'Phone number'}
            type="tel"
            placeholder="+225 07 00 00 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button size="lg" className="w-full" loading={sending} onClick={handleSend}>
            {locale === 'fr' ? 'Envoyer le code' : 'Send code'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label={locale === 'fr' ? 'Code à 6 chiffres' : '6-digit code'}
            type="text"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <Button size="lg" className="w-full" loading={verifying} onClick={handleVerify}>
            {locale === 'fr' ? 'Vérifier' : 'Verify'}
          </Button>
          <button
            onClick={() => { setStep('phone'); setCode(''); }}
            className="w-full text-center text-sm text-primary-600 hover:underline"
          >
            {locale === 'fr' ? 'Changer de numéro' : 'Change number'}
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full text-center text-sm text-gray-500 hover:underline disabled:opacity-50"
          >
            {locale === 'fr' ? 'Renvoyer le code' : 'Resend code'}
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
