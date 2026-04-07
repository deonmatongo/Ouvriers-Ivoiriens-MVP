import { useState } from 'react';
import { User, Phone, Mail, ShieldCheck, Camera, Save } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';

export function CustomerProfile() {
  const { user } = useAuth();
  const { locale } = useLang();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    toast.success(t('Profil mis à jour !', 'Profile updated!'));
  };

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('Mon profil', 'My profile')}
        </h1>

        {/* Avatar */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                  <Camera size={13} className="text-gray-500" />
                </button>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{t('Client', 'Customer')}</p>
                {user?.phone_verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                    <ShieldCheck size={12} />
                    {t('Téléphone vérifié', 'Phone verified')}
                  </span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Info form */}
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t('Informations personnelles', 'Personal information')}</h2>
          </div>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Nom complet', 'Full name')}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Adresse e-mail', 'Email address')}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('Numéro de téléphone', 'Phone number')}
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSave} loading={saving} className="flex items-center gap-2">
                <Save size={15} />
                {t('Enregistrer', 'Save changes')}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Account info */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t('Compte', 'Account')}</h2>
          </div>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('Identifiant', 'User ID')}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{user?.id}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('Rôle', 'Role')}</p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{user?.role}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </CustomerLayout>
  );
}
