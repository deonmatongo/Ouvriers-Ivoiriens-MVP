import { useState } from 'react';
import { Send } from 'lucide-react';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { useAuth } from '../../context/AuthContext';

const conversations = [
  {
    id: '1', name: 'Konan Électricité', lastMessage: 'Je serai chez vous demain à 9h.', time: '14:22', unread: 2,
    avatar: 'K',
  },
  {
    id: '2', name: 'Yao Plomberie', lastMessage: 'Le devis a été envoyé.', time: 'Hier', unread: 0,
    avatar: 'Y',
  },
];

const messages = [
  { id: 'm1', from: 'other', text: 'Bonjour, j\'ai bien reçu votre demande.', time: '13:45' },
  { id: 'm2', from: 'me', text: 'Merci, pouvez-vous venir cette semaine ?', time: '13:47' },
  { id: 'm3', from: 'other', text: 'Oui, je serai disponible jeudi.', time: '13:50' },
  { id: 'm4', from: 'other', text: 'Je serai chez vous demain à 9h.', time: '14:22' },
];

export function Messages() {
  const [active, setActive] = useState(conversations[0]);
  const [input, setInput] = useState('');
  useAuth();

  return (
    <CustomerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <input
              placeholder="Rechercher..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  active.id === c.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                    {c.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {active.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{active.name}</p>
              <p className="text-xs text-green-500">En ligne</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    m.from === 'me'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.from === 'me' ? 'text-primary-200' : 'text-gray-400'}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setInput(''); }}
              placeholder="Écrivez un message..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={() => setInput('')}
              className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
