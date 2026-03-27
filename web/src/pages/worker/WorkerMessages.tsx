import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../components/ui/Toast';
import { useConversations, useThread, useSendMessage } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';
import type { Conversation } from '../../types';

interface PendingContact {
  id: string;
  name: string;
}

function buildPendingConversation(contact: PendingContact, jobTitle?: string): Conversation {
  const now = new Date().toISOString();
  const rid = `pending-${contact.id}`;
  return {
    request_id: rid,
    user: { id: contact.id, name: contact.name, email: '', phone_verified: false, role: 'client', created_at: now },
    last_message: { id: '', sender_id: '', receiver_id: '', request_id: rid, content: jobTitle ? `Re: ${jobTitle}` : '...', is_read: true, sent_at: now },
    unread_count: 0,
  };
}

export function WorkerMessages() {
  const { t } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const pendingContact: PendingContact | undefined = location.state?.pendingContact;
  const jobTitle: string | undefined = location.state?.jobTitle;

  const { data: apiConversations = [], isLoading: convLoading } = useConversations();

  const allConversations: Conversation[] = pendingContact
    ? [buildPendingConversation(pendingContact, jobTitle), ...apiConversations]
    : apiConversations;

  const [active, setActive] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const isPending = active?.request_id.startsWith('pending-');
  const { data: messages = [], isLoading: msgLoading } = useThread(isPending ? '' : (active?.request_id ?? ''));
  const sendMessage = useSendMessage();

  // Auto-select pending or first conversation
  useEffect(() => {
    if (allConversations.length > 0 && !active) {
      setActive(allConversations[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !active) return;
    const content = input.trim();
    setInput('');

    if (isPending) {
      // When backend is live, this will create a real thread; for now just clear input
      toast.info('Message ready to send once backend is connected');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        receiver_id: active.user.id,
        request_id: active.request_id,
        content,
      });
    } catch {
      toast.error('Failed to send message');
      setInput(content);
    }
  };

  return (
    <WorkerLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('navWorkerMessages')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <input
              placeholder={t('searchPlaceholder')}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-3 items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))
            ) : allConversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">{t('noConversations')}</div>
            ) : (
              allConversations.map((c) => (
                <button
                  key={c.request_id}
                  onClick={() => setActive(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active?.request_id === c.request_id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                    {c.user.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.user.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(c.last_message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 truncate">{c.last_message.content}</p>
                      {c.unread_count > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t('noConversationsSub')}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {active.user.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{active.user.name}</p>
                {isPending && jobTitle ? (
                  <p className="text-xs text-primary-500">{t('startConversation')} • {jobTitle}</p>
                ) : (
                  <p className="text-xs text-green-500">{t('online')}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {isPending ? (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">{t('typeFirstMessage')}</p>
                </div>
              ) : msgLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                  </div>
                ))
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        <p>{m.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={t('messagePlaceholder')}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </WorkerLayout>
  );
}
