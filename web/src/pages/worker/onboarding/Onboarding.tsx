import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, Wrench, Image } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';

const steps = [
  { label: 'Profil de base', icon: User },
  { label: 'Compétences', icon: Wrench },
  { label: 'Tarifs', icon: CheckCircle },
  { label: 'Portfolio', icon: Image },
];

const categories = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Peinture',
  'Maçonnerie', 'Climatisation', 'Soudure', 'Autre',
];

// --- Step components ---

function Step1({ data, setData }: { data: Record<string, string>; setData: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-4">
      <Input
        label="Téléphone"
        type="tel"
        placeholder="+225 07 00 00 00 00"
        value={data.phone || ''}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
      />
      <Input
        label="Localisation"
        placeholder="Ex: Cocody, Abidjan"
        value={data.location || ''}
        onChange={(e) => setData({ ...data, location: e.target.value })}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          rows={3}
          value={data.bio || ''}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          placeholder="Décrivez votre parcours et vos spécialités..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>
    </div>
  );
}

function Step2({ data, setData }: { data: Record<string, string>; setData: (d: Record<string, string>) => void }) {
  const [skills, setSkills] = useState<string[]>((data.skills || '').split(',').filter(Boolean));
  const [input, setInput] = useState('');

  const addSkill = () => {
    if (!input.trim()) return;
    const updated = [...skills, input.trim()];
    setSkills(updated);
    setData({ ...data, skills: updated.join(',') });
    setInput('');
  };

  const removeSkill = (s: string) => {
    const updated = skills.filter((x) => x !== s);
    setSkills(updated);
    setData({ ...data, skills: updated.join(',') });
  };

  return (
    <div className="space-y-4">
      <Select
        label="Catégorie principale"
        value={data.category || ''}
        onChange={(e) => setData({ ...data, category: e.target.value })}
        options={[{ value: '', label: 'Choisir...' }, ...categories.map((c) => ({ value: c, label: c }))]}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Compétences</label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Ex: Plomberie sanitaire"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button type="button" variant="secondary" onClick={addSkill}>Ajouter</Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                {s}
                <button onClick={() => removeSkill(s)} className="ml-1 text-primary-400 hover:text-primary-700">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Input
        label="Années d'expérience"
        type="number"
        placeholder="5"
        value={data.experience_years || ''}
        onChange={(e) => setData({ ...data, experience_years: e.target.value })}
      />
    </div>
  );
}

function Step3({ data, setData }: { data: Record<string, string>; setData: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-4">
      <Input
        label="Tarif horaire (FCFA)"
        type="number"
        placeholder="5000"
        value={data.hourly_rate || ''}
        onChange={(e) => setData({ ...data, hourly_rate: e.target.value })}
      />
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">Conseil</p>
        <p>Le tarif moyen pour votre catégorie est de 4 000 – 8 000 FCFA/heure. Un tarif compétitif vous aidera à obtenir vos premières missions.</p>
      </div>
    </div>
  );
}

function Step4() {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
        <Image size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">Cliquez pour uploader des photos</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 5 Mo par photo · Jusqu'à 10 photos</p>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Des photos de vos réalisations augmentent vos chances d'être sélectionné.
      </p>
    </div>
  );
}

// --- Main component ---

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const isLast = step === steps.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setSubmitting(true);
      // Future: await api.post('/artisans/profile', data)
      await new Promise((r) => setTimeout(r, 800));
      navigate('/dashboard/worker');
      return;
    }
    setStep((s) => s + 1);
  };

  const stepContent = [
    <Step1 data={data} setData={setData} />,
    <Step2 data={data} setData={setData} />,
    <Step3 data={data} setData={setData} />,
    <Step4 />,
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">OI</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">Ouvriers Ivoiriens</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((_s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {done ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-10 transition-colors ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              Étape {step + 1} sur {steps.length} — {steps[step].label}
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {stepContent[step]}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                  Retour
                </Button>
              )}
              <Button onClick={handleNext} loading={submitting} className="flex-1">
                {isLast ? 'Terminer l\'inscription' : 'Continuer'}
              </Button>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4">
          Votre profil sera examiné par notre équipe avant d'être mis en ligne.
        </p>
      </div>
    </div>
  );
}
