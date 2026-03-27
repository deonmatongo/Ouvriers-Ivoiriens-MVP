import { useState } from 'react';
import { Coins, CheckCircle, Zap, TrendingUp, Info, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { useLang } from '../../context/LangContext';
import { useTokens } from '../../context/TokenContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';

interface Package {
  id: string;
  tokens: number;
  price: number;
  label_fr: string;
  label_en: string;
  badge_fr?: string;
  badge_en?: string;
}

const PACKAGES: Package[] = [
  { id: 'starter',  tokens: 10,  price: 1000,  label_fr: 'Démarrage',  label_en: 'Starter' },
  { id: 'pro',      tokens: 50,  price: 4500,  label_fr: 'Pro',        label_en: 'Pro',       badge_fr: 'Populaire', badge_en: 'Popular' },
  { id: 'business', tokens: 100, price: 8000,  label_fr: 'Business',   label_en: 'Business',  badge_fr: 'Meilleure valeur', badge_en: 'Best value' },
];

const PAYMENT_METHODS = [
  { id: 'orange', label: 'Orange Money', color: 'bg-orange-500' },
  { id: 'mtn',    label: 'MTN Mobile Money', color: 'bg-yellow-400' },
  { id: 'wave',   label: 'Wave', color: 'bg-blue-500' },
];

export function Credits() {
  const { t, locale } = useLang();
  const { balance, transactions, addTokens } = useTokens();
  const toast = useToast();

  const [selectedPkg, setSelectedPkg] = useState<Package>(PACKAGES[1]);
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0]);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = async () => {
    if (!phone.trim()) { toast.error(t('yourPhone')); return; }
    setPaying(true);
    // Simulate payment gateway (CinetPay / mobile money) — 2s delay
    await new Promise((r) => setTimeout(r, 2000));
    addTokens(selectedPkg.tokens, `${locale === 'fr' ? 'Achat' : 'Purchase'} — ${selectedPkg.label_fr} (${payMethod.label})`);
    setPaying(false);
    setPaid(true);
  };

  const handleAnother = () => { setPaid(false); setPhone(''); };

  return (
    <WorkerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('creditsTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('creditsSub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Balance + How it works + History */}
        <div className="space-y-4">
          {/* Balance card */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
            <p className="text-sm text-primary-200 mb-1">{t('currentBalance')}</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold">{balance}</span>
              <span className="text-primary-200 mb-1">{t('creditsUnit')}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-primary-200 text-xs">
              <Coins size={14} />
              <span>{balance === 0
                ? (locale === 'fr' ? 'Achetez des crédits pour commencer' : 'Buy credits to get started')
                : (locale === 'fr' ? `Vous pouvez contacter ${balance} client(s)` : `You can contact ${balance} client(s)`)
              }</span>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">{t('howCreditsWork')}</p>
            </div>
            <ul className="space-y-2 text-xs text-blue-700">
              <li className="flex items-start gap-2"><Zap size={12} className="mt-0.5 flex-shrink-0" />{t('creditRule1')}</li>
              <li className="flex items-start gap-2"><TrendingUp size={12} className="mt-0.5 flex-shrink-0" />{t('creditRule2')}</li>
              <li className="flex items-start gap-2"><Info size={12} className="mt-0.5 flex-shrink-0" />{t('creditRule3')}</li>
            </ul>
          </div>

          {/* Transaction history */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">{t('transactionHistory')}</p>
            {transactions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">{t('noTransactions')}</p>
            ) : (
              <ul className="space-y-2">
                {transactions.slice(0, 8).map((txn) => (
                  <li key={txn.id} className="flex items-center gap-3">
                    {txn.type === 'credit'
                      ? <ArrowUpCircle size={16} className="text-green-500 flex-shrink-0" />
                      : <ArrowDownCircle size={16} className="text-red-400 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate">{txn.reason}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(txn.created_at).toLocaleDateString(locale === 'fr' ? 'fr-CI' : 'en-GB')}
                      </p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{txn.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Buy flow */}
        <div className="lg:col-span-2">
          {paid ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('paymentSuccess')}</h2>
              <p className="text-gray-500 text-sm mb-1">
                <span className="text-2xl font-bold text-primary-600">{selectedPkg.tokens}</span>{' '}
                {t('paymentSuccessSub')}
              </p>
              <p className="text-gray-400 text-xs mb-8">
                {locale === 'fr' ? 'Nouveau solde :' : 'New balance:'} <strong>{balance}</strong> {t('creditsUnit')}
              </p>
              <Button variant="outline" onClick={handleAnother}>
                {locale === 'fr' ? 'Acheter d\'autres crédits' : 'Buy more credits'}
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              {/* Step 1: Package */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  1. {t('choosePackage')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACKAGES.map((pkg) => {
                    const badge = locale === 'fr' ? pkg.badge_fr : pkg.badge_en;
                    const label = locale === 'fr' ? pkg.label_fr : pkg.label_en;
                    const selected = selectedPkg.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPkg(pkg)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {badge && (
                          <span className="absolute -top-2.5 left-3 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {badge}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                        <p className="text-2xl font-bold text-gray-900">{pkg.tokens}</p>
                        <p className="text-xs text-gray-400">{t('creditsUnit')}</p>
                        <p className="mt-2 text-sm font-semibold text-primary-600">{formatCurrency(pkg.price)}</p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(Math.round(pkg.price / pkg.tokens))} / {locale === 'fr' ? 'crédit' : 'credit'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Payment method */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  2. {t('payWith')}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPayMethod(pm)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        payMethod.id === pm.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${pm.color}`} />
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Phone + pay */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  3. {t('yourPhone')}
                </p>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('yourPhonePlaceholder')}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button loading={paying} onClick={handlePay} className="whitespace-nowrap">
                    {t('payNow')} — {formatCurrency(selectedPkg.price)}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {locale === 'fr'
                    ? `Vous recevrez une invitation de paiement sur ce numéro via ${payMethod.label}.`
                    : `You will receive a payment prompt on this number via ${payMethod.label}.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkerLayout>
  );
}
