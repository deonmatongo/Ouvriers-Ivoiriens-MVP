import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

const initial: Service[] = [
  { id: '1', name: 'Réparation fuite', description: 'Détection et réparation de fuites d\'eau', price: 15000 },
  { id: '2', name: 'Installation robinet', description: 'Pose et remplacement de robinetterie', price: 10000 },
];

export function WorkerServices() {
  const [services, setServices] = useState<Service[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = () => {
    if (!name || !price) return;
    setServices((s) => [...s, { id: Date.now().toString(), name, description: desc, price: Number(price) }]);
    setName(''); setDesc(''); setPrice('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => setServices((s) => s.filter((x) => x.id !== id));

  return (
    <WorkerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes services</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les prestations que vous proposez</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Ajouter un service
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="mb-4 border-primary-200">
          <CardBody className="space-y-4">
            <h3 className="font-semibold text-gray-900">Nouveau service</h3>
            <Input label="Nom du service" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Réparation fuite d'eau" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Décrivez brièvement la prestation..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <Input label="Prix (FCFA)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Annuler</Button>
              <Button onClick={handleAdd} className="flex-1">Enregistrer</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Service list */}
      <div className="space-y-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardBody className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-primary-600">{formatCurrency(s.price)}</span>
                <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </CardBody>
          </Card>
        ))}

        {services.length === 0 && (
          <Card>
            <CardBody className="text-center py-8 text-gray-500">
              <p className="font-medium">Aucun service ajouté</p>
              <p className="text-sm mt-1">Ajoutez vos prestations pour recevoir des demandes</p>
            </CardBody>
          </Card>
        )}
      </div>
    </WorkerLayout>
  );
}
