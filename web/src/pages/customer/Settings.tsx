import { useState } from 'react';
import { Bell, Globe, Lock, Shield, Trash2, ChevronRight, Moon } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        checked ? 'bg-primary-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  toggle,
  onToggle,
  onClick,
}: {
  label: string;
  description?: string;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3.5 ${onClick ? 'cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {onToggle !== undefined && toggle !== undefined ? (
        <Toggle checked={toggle} onChange={onToggle} />
      ) : onClick ? (
        <ChevronRight size={16} className="text-gray-400" />
      ) : null}
    </div>
  );
}

export function CustomerSettings() {
  const { logout } = useAuth();
  const { locale, toggle: toggleLang } = useLang();
  const toast = useToast();
  const navigate = useNavigate();

  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;

  const [notifJobs, setNotifJobs]     = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);
  const [darkMode, setDarkMode]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [savingPw, setSavingPw]     = useState(false);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return;
    if (newPw !== confirmPw) {
      toast.error(t('Les mots de passe ne correspondent pas', 'Passwords do not match'));
      return;
    }
    setSavingPw(true);
    await new Promise(r => setTimeout(r, 700));
    setSavingPw(false);
    setShowPasswordModal(false);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    toast.success(t('Mot de passe mis à jour !', 'Password updated!'));
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    logout();
    navigate('/');
  };

  return (
    <CustomerLayout>
      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {t('Changer le mot de passe', 'Change password')}
            </h3>
            <div className="space-y-4 mb-6">
              {[
                { label: t('Mot de passe actuel', 'Current password'), val: currentPw, set: setCurrentPw },
                { label: t('Nouveau mot de passe', 'New password'),    val: newPw,     set: setNewPw },
                { label: t('Confirmer', 'Confirm new password'),        val: confirmPw, set: setConfirmPw },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={e => set(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1">
                {t('Annuler', 'Cancel')}
              </Button>
              <Button onClick={handleChangePassword} loading={savingPw} className="flex-1">
                {t('Enregistrer', 'Save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {t('Supprimer le compte', 'Delete account')}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {t(
                'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
                'This action is permanent. All your data will be deleted and cannot be recovered.',
              )}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
                {t('Annuler', 'Cancel')}
              </Button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('Supprimer', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('Paramètres', 'Settings')}
        </h1>

        {/* Notifications */}
        <Card className="mb-5">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-900">{t('Notifications', 'Notifications')}</h2>
          </div>
          <CardBody className="divide-y divide-gray-100 py-0">
            <SettingRow
              label={t('Nouvelles missions', 'New job updates')}
              description={t('Devis reçus, statuts de mission', 'Quotes received, job status changes')}
              toggle={notifJobs}
              onToggle={setNotifJobs}
            />
            <SettingRow
              label={t('Messages', 'Messages')}
              description={t('Nouveaux messages des artisans', 'New messages from artisans')}
              toggle={notifMessages}
              onToggle={setNotifMessages}
            />
            <SettingRow
              label={t('Promotions', 'Promotions')}
              description={t('Offres et actualités de la plateforme', 'Platform offers and news')}
              toggle={notifPromos}
              onToggle={setNotifPromos}
            />
          </CardBody>
        </Card>

        {/* Appearance */}
        <Card className="mb-5">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Moon size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-900">{t('Apparence', 'Appearance')}</h2>
          </div>
          <CardBody className="divide-y divide-gray-100 py-0">
            <SettingRow
              label={t('Mode sombre', 'Dark mode')}
              description={t('Bientôt disponible', 'Coming soon')}
              toggle={darkMode}
              onToggle={v => { setDarkMode(v); toast.success(t('Bientôt disponible !', 'Coming soon!')); }}
            />
            <SettingRow
              label={t('Langue', 'Language')}
              description={locale === 'fr' ? 'Français' : 'English'}
              onClick={toggleLang}
            />
          </CardBody>
        </Card>

        {/* Security */}
        <Card className="mb-5">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Shield size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-900">{t('Sécurité', 'Security')}</h2>
          </div>
          <CardBody className="divide-y divide-gray-100 py-0">
            <SettingRow
              label={t('Changer le mot de passe', 'Change password')}
              description={t('Mettre à jour vos identifiants', 'Update your login credentials')}
              onClick={() => setShowPasswordModal(true)}
            />
            <SettingRow
              label={t('Vérification en deux étapes', 'Two-step verification')}
              description={t('Bientôt disponible', 'Coming soon')}
              onClick={() => toast.success(t('Bientôt disponible !', 'Coming soon!'))}
            />
          </CardBody>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-100">
          <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
            <Lock size={16} className="text-red-400" />
            <h2 className="font-semibold text-red-700">{t('Zone dangereuse', 'Danger zone')}</h2>
          </div>
          <CardBody>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('Supprimer mon compte', 'Delete my account')}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('Action irréversible — toutes vos données seront perdues', 'Permanent action — all your data will be lost')}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 size={13} />
                {t('Supprimer', 'Delete')}
              </button>
            </div>
          </CardBody>
        </Card>

        {/* App version */}
        <p className="text-center text-xs text-gray-400 mt-6">
          {t('Version', 'Version')} 1.0.0 · Ouvriers Ivoiriens
        </p>
      </div>
    </CustomerLayout>
  );
}
